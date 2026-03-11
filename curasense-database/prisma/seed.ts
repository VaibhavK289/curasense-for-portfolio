import { PrismaClient, UserRole, UserStatus } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@curasense.com' },
    update: {},
    create: {
      email: 'admin@curasense.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create demo doctor
  const doctorPassword = await bcrypt.hash('doctor123!', 12);
  
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@curasense.com' },
    update: {},
    create: {
      email: 'doctor@curasense.com',
      passwordHash: doctorPassword,
      firstName: 'John',
      lastName: 'Smith',
      displayName: 'Dr. John Smith',
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Doctor user created: ${doctor.email}`);

  // Create demo patient
  const patientPassword = await bcrypt.hash('patient123!', 12);
  
  const patient = await prisma.user.upsert({
    where: { email: 'patient@curasense.com' },
    update: {},
    create: {
      email: 'patient@curasense.com',
      passwordHash: patientPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      displayName: 'Jane Doe',
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Patient user created: ${patient.email}`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nDemo credentials:');
  console.log('  Admin:   admin@curasense.com / admin123!');
  console.log('  Doctor:  doctor@curasense.com / doctor123!');
  console.log('  Patient: patient@curasense.com / patient123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
