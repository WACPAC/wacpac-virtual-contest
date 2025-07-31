const { execSync } = require('child_process');

async function migrateAndStart() {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully!');
    
    console.log('Starting application...');
    require('./server.js');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAndStart(); 