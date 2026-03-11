import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testConnection() {
  console.log('🧪 Testing NeonDB connection...\n');

  try {
    // Test 1: Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    console.log(`✅ Users in database (${users.length}):`);
    users.forEach(user => {
      console.log(`   - ${user.displayName} (${user.email}) - ${user.role}`);
    });

    // Test 2: Get all reports
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });
    console.log(`\n✅ Reports in database (${reports.length}):`);
    reports.forEach(report => {
      console.log(`   - ${report.title}`);
      console.log(`     Type: ${report.type} | Status: ${report.status}`);
      console.log(`     Confidence: ${(report.confidenceScore! * 100).toFixed(0)}%`);
      console.log(`     Findings: ${report.findings.length} items`);
    });

    // Test 3: Get patient with reports
    const patientWithReports = await prisma.user.findFirst({
      where: { role: 'PATIENT' },
      include: {
        reports: true,
      },
    });
    console.log(`\n✅ Patient ${patientWithReports?.displayName} has ${patientWithReports?.reports.length} reports`);

    console.log('\n✨ NeonDB connection test successful!');
    console.log('\n📝 You can now:');
    console.log('   1. Login at http://localhost:3000/login with any demo account');
    console.log('   2. View reports in the History section');
    console.log('   3. Create new analyses');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testConnection();
