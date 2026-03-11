import "dotenv/config";

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
];

const optionalVars = [
  'JWT_REFRESH_SECRET',
  'DATABASE_URL_DIRECT',
  'NODE_ENV',
];

console.log('🔍 Validating environment variables...\n');

let hasErrors = false;

// Check required variables
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required: ${varName}`);
    hasErrors = true;
  } else {
    const value = process.env[varName]!;
    const masked = value.length > 20 
      ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
      : '***';
    console.log(`✅ ${varName}: ${masked}`);
  }
}

console.log('');

// Check optional variables
for (const varName of optionalVars) {
  if (!process.env[varName]) {
    console.log(`⚠️  Optional missing: ${varName}`);
  } else {
    console.log(`✅ ${varName}: (set)`);
  }
}

console.log('');

// Validate DATABASE_URL format
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must start with postgresql:// or postgres://');
    hasErrors = true;
  } else {
    console.log('✅ DATABASE_URL format is valid');
  }
}

// Validate JWT_SECRET length
if (process.env.JWT_SECRET) {
  if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters for security');
  } else {
    console.log('✅ JWT_SECRET length is adequate');
  }
}

console.log('');

if (hasErrors) {
  console.error('❌ Environment validation failed!');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
}
