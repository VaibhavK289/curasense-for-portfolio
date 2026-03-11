import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { User, UserRole, UserStatus } from "@/generated/prisma";

// ============================================
// CONFIGURATION
// ============================================

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const REFRESH_TOKEN_EXPIRES_IN = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

// ============================================
// TYPES
// ============================================

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
}

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// PASSWORD UTILITIES
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// JWT UTILITIES
// ============================================

export function generateAccessToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyAccessToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomUUID() + crypto.randomUUID();
}

// ============================================
// USER OPERATIONS
// ============================================

export async function createUser(input: RegisterInput): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: `${input.firstName} ${input.lastName}`,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE, // In production, set to PENDING_VERIFICATION
    },
  });
}

export async function authenticateUser(
  input: LoginInput
): Promise<{ user: User; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new Error(
      `Account locked. Try again after ${user.lockedUntil.toISOString()}`
    );
  }

  // Check if account is active
  if (user.status !== UserStatus.ACTIVE) {
    throw new Error(`Account is ${user.status.toLowerCase()}`);
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    // Increment failed login count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: { increment: 1 },
        // Lock account after 5 failed attempts for 15 minutes
        lockedUntil:
          user.failedLoginCount >= 4
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null,
      },
    });
    throw new Error("Invalid email or password");
  }

  // Reset failed login count on successful login
  const refreshToken = generateRefreshToken();
  
  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN),
    },
  });

  // Update user last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: input.ipAddress,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      resource: "Session",
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthTokens | null> {
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  // Update session last active
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  const newAccessToken = generateAccessToken({
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
  });

  return {
    accessToken: newAccessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60,
  };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await prisma.session.delete({
    where: { token: refreshToken },
  });
}

export async function logoutAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id, deletedAt: null },
  });
}

export async function updateUserProfile(
  userId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    displayName: string;
    phone: string;
    avatarUrl: string;
    preferences: Record<string, unknown>;
  }>
): Promise<User> {
  const displayName = data.firstName && data.lastName 
    ? `${data.firstName} ${data.lastName}` 
    : data.displayName;
    
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      displayName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      preferences: data.preferences as object | undefined,
    },
  });
}
