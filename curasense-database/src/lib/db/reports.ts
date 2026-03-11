import prisma from "../prisma";
import { Report, ReportType, ReportStatus, FileType, Prisma } from "@/generated/prisma";

// ============================================
// TYPES
// ============================================

export interface CreateReportInput {
  userId: string;
  title: string;
  description?: string;
  type: ReportType;
  originalFileName?: string;
  fileType?: FileType;
  fileSizeBytes?: number;
  fileUrl?: string;
  fileHash?: string;
}

export interface UpdateReportInput {
  title?: string;
  description?: string;
  summary?: string;
  content?: string;
  findings?: string[];
  confidenceScore?: number;
  processingTimeMs?: number;
  aiModelVersion?: string;
  status?: ReportStatus;
  errorMessage?: string;
  errorCode?: string;
}

export interface ReportFilters {
  userId?: string;
  type?: ReportType;
  status?: ReportStatus;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// REPORT OPERATIONS
// ============================================

export async function createReport(input: CreateReportInput): Promise<Report> {
  const report = await prisma.report.create({
    data: {
      userId: input.userId,
      title: input.title,
      description: input.description,
      type: input.type,
      status: ReportStatus.PENDING,
      originalFileName: input.originalFileName,
      fileType: input.fileType,
      fileSizeBytes: input.fileSizeBytes,
      fileUrl: input.fileUrl,
      fileHash: input.fileHash,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: "REPORT_CREATE",
      resource: "Report",
      resourceId: report.id,
      details: { type: input.type },
    },
  });

  return report;
}

export async function getReportById(
  reportId: string,
  userId?: string
): Promise<Report | null> {
  const where: Prisma.ReportWhereInput = {
    id: reportId,
    deletedAt: null,
  };

  if (userId) {
    where.userId = userId;
  }

  return prisma.report.findFirst({ where });
}

export async function getReportsByUser(
  userId: string,
  filters?: ReportFilters,
  pagination?: PaginationOptions
): Promise<PaginatedResult<Report>> {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ReportWhereInput = {
    userId,
    deletedAt: null,
  };

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.fromDate || filters?.toDate) {
    where.createdAt = {};
    if (filters.fromDate) {
      where.createdAt.gte = filters.fromDate;
    }
    if (filters.toDate) {
      where.createdAt.lte = filters.toDate;
    }
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { summary: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ReportOrderByWithRelationInput = {
    [pagination?.sortBy ?? "createdAt"]: pagination?.sortOrder ?? "desc",
  };

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + reports.length < total,
    },
  };
}

export async function updateReport(
  reportId: string,
  userId: string,
  input: UpdateReportInput
): Promise<Report> {
  const report = await prisma.report.update({
    where: { id: reportId, userId },
    data: {
      ...input,
      processedAt: input.status === ReportStatus.COMPLETED ? new Date() : undefined,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId,
      action: "REPORT_UPDATE",
      resource: "Report",
      resourceId: reportId,
      details: { status: input.status },
    },
  });

  return report;
}

export async function markReportCompleted(
  reportId: string,
  userId: string,
  result: {
    summary: string;
    content: string;
    findings: string[];
    confidenceScore: number;
    processingTimeMs: number;
    aiModelVersion?: string;
  }
): Promise<Report> {
  return updateReport(reportId, userId, {
    ...result,
    status: ReportStatus.COMPLETED,
  });
}

export async function markReportFailed(
  reportId: string,
  userId: string,
  error: {
    message: string;
    code?: string;
  }
): Promise<Report> {
  // Get current retry count
  const current = await prisma.report.findUnique({
    where: { id: reportId },
    select: { retryCount: true },
  });

  return prisma.report.update({
    where: { id: reportId, userId },
    data: {
      status: ReportStatus.FAILED,
      errorMessage: error.message,
      errorCode: error.code,
      retryCount: (current?.retryCount ?? 0) + 1,
    },
  });
}

export async function deleteReport(
  reportId: string,
  userId: string,
  hardDelete = false
): Promise<void> {
  if (hardDelete) {
    await prisma.report.delete({
      where: { id: reportId, userId },
    });
  } else {
    await prisma.report.update({
      where: { id: reportId, userId },
      data: { deletedAt: new Date() },
    });
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId,
      action: hardDelete ? "REPORT_DELETE_HARD" : "REPORT_DELETE_SOFT",
      resource: "Report",
      resourceId: reportId,
    },
  });
}

export async function archiveReport(
  reportId: string,
  userId: string
): Promise<Report> {
  return prisma.report.update({
    where: { id: reportId, userId },
    data: {
      status: ReportStatus.ARCHIVED,
      archivedAt: new Date(),
    },
  });
}

// ============================================
// ANALYTICS QUERIES
// ============================================

export async function getReportStats(userId: string) {
  const [
    totalReports,
    reportsByType,
    reportsByStatus,
    avgMetrics,
    recentFindings,
  ] = await Promise.all([
    // Total count
    prisma.report.count({
      where: { userId, deletedAt: null },
    }),

    // Count by type
    prisma.report.groupBy({
      by: ["type"],
      where: { userId, deletedAt: null },
      _count: { id: true },
    }),

    // Count by status
    prisma.report.groupBy({
      by: ["status"],
      where: { userId, deletedAt: null },
      _count: { id: true },
    }),

    // Average metrics for completed reports
    prisma.report.aggregate({
      where: {
        userId,
        status: ReportStatus.COMPLETED,
        deletedAt: null,
      },
      _avg: {
        confidenceScore: true,
        processingTimeMs: true,
      },
    }),

    // Get all findings from last 30 days
    prisma.report.findMany({
      where: {
        userId,
        status: ReportStatus.COMPLETED,
        deletedAt: null,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { findings: true },
    }),
  ]);

  // Aggregate findings frequency
  const findingsFrequency: Record<string, number> = {};
  recentFindings.forEach((report) => {
    report.findings.forEach((finding) => {
      findingsFrequency[finding] = (findingsFrequency[finding] || 0) + 1;
    });
  });

  return {
    totalReports,
    reportsByType: Object.fromEntries(
      reportsByType.map((r) => [r.type, r._count.id])
    ),
    reportsByStatus: Object.fromEntries(
      reportsByStatus.map((r) => [r.status, r._count.id])
    ),
    averageConfidence: avgMetrics._avg.confidenceScore ?? 0,
    averageProcessingTime: avgMetrics._avg.processingTimeMs ?? 0,
    findingsFrequency,
  };
}

export async function getDailyUsage(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const reports = await prisma.report.findMany({
    where: {
      userId,
      deletedAt: null,
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by date
  const dailyMap: Record<string, number> = {};
  
  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dailyMap[date.toISOString().split("T")[0]] = 0;
  }

  // Count reports per day
  reports.forEach((report) => {
    const date = report.createdAt.toISOString().split("T")[0];
    if (dailyMap[date] !== undefined) {
      dailyMap[date]++;
    }
  });

  return Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
}

// ============================================
// DEDUPLICATION
// ============================================

export async function findDuplicateReport(
  userId: string,
  fileHash: string
): Promise<Report | null> {
  return prisma.report.findFirst({
    where: {
      userId,
      fileHash,
      deletedAt: null,
    },
  });
}
