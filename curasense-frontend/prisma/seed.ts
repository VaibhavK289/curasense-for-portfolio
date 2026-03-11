import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client with connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed for NeonDB...\n');

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
      role: 'ADMIN',
      status: 'ACTIVE',
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
      role: 'DOCTOR',
      status: 'ACTIVE',
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
      role: 'PATIENT',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      dateOfBirth: new Date('1990-05-15'),
      phone: '+1-555-0123',
    },
  });
  console.log(`✅ Patient user created: ${patient.email}`);

  // Create sample reports
  const report1 = await prisma.report.create({
    data: {
      userId: patient.id,
      type: 'PRESCRIPTION',
      status: 'COMPLETED',
      title: 'Blood Test Analysis - January 2026',
      summary: 'Complete blood count analysis showing normal ranges',
      content: `# Blood Test Analysis

## Patient Information
- Name: Jane Doe
- Date: January 15, 2026

## Test Results

### Complete Blood Count (CBC)
- Hemoglobin: 13.5 g/dL (Normal: 12-16 g/dL) ✓
- White Blood Cell Count: 7,200/μL (Normal: 4,500-11,000/μL) ✓
- Platelet Count: 250,000/μL (Normal: 150,000-400,000/μL) ✓

### Vitamin D Levels
- 25-OH Vitamin D: 32 ng/mL (Optimal: 30-50 ng/mL) ✓

## Recommendations
- Continue current vitamin D supplementation
- Schedule follow-up in 6 months`,
      findings: [
        'Hemoglobin levels normal',
        'White blood cell count within normal range',
        'Continue current vitamin D supplementation',
      ],
      processingTimeMs: 2500,
      confidenceScore: 0.92,
      processedAt: new Date(),
    },
  });
  console.log(`✅ Sample prescription report created: ${report1.id}`);

  const report2 = await prisma.report.create({
    data: {
      userId: patient.id,
      type: 'XRAY',
      status: 'COMPLETED',
      title: 'Chest X-Ray Analysis',
      summary: 'Clear chest X-ray, no abnormalities detected',
      content: `# Chest X-Ray Analysis Report

## Examination Details
- Date: January 14, 2026
- Type: Chest X-Ray (PA and Lateral)

## Findings

### Lungs
- **Bilateral lung fields**: Clear, no infiltrates or consolidations
- **No pleural effusion**: Costophrenic angles are sharp
- **No pneumothorax**: Lung markings extend to the periphery

### Heart
- **Cardiac silhouette**: Normal size and contour
- **No cardiomegaly**

### Bones and Soft Tissue
- **Thoracic spine**: Alignment normal
- **Ribs**: No fractures detected
- **Soft tissues**: Normal

## Impression
Normal chest radiograph. No acute cardiopulmonary disease.

## Recommendations
- Routine follow-up as clinically indicated
- No immediate action required`,
      findings: [
        'Lung fields clear bilaterally',
        'No signs of pneumonia or infiltrates',
        'Cardiac silhouette normal',
        'No acute findings',
      ],
      processingTimeMs: 3200,
      confidenceScore: 0.89,
      processedAt: new Date(),
    },
  });
  console.log(`✅ Sample X-ray report created: ${report2.id}`);

  console.log('\n✅ NeonDB seeded successfully!');
  console.log('\n📊 Database Stats:');
  console.log(`  Users: ${await prisma.user.count()}`);
  console.log(`  Reports: ${await prisma.report.count()}`);
  console.log('\n🔑 Demo credentials:');
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
