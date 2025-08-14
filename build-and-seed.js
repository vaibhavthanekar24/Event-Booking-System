// Build and seed script
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  console.log('Building TypeScript files...');
  
  // Create a temporary tsconfig for building
  const tsconfig = {
    extends: './tsconfig.json',
    compilerOptions: {
      outDir: './dist',
      noEmit: false,
      module: 'NodeNext',
      moduleResolution: 'NodeNext'
    },
    include: [
      'src/**/*.ts',
      'src/**/*.tsx'
    ]
  };
  
  // Write temporary tsconfig
  fs.writeFileSync(
    path.join(__dirname, 'tsconfig.build.json'),
    JSON.stringify(tsconfig, null, 2)
  );
  
  // Run TypeScript compiler
  execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit' });
  
  console.log('TypeScript build completed');
  
  // Create a seed script that uses the compiled JavaScript
  const seedScript = `
  // Generated seed script
  import dotenv from 'dotenv';
  import payload from 'payload';
  
  // Load environment variables
  dotenv.config();
  
  async function seed() {
    try {
      console.log('Starting seed process...');
      
      // Initialize payload with the compiled config
      await payload.init({
        secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
        mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1/event-booking-system',
        configPath: './dist/payload.config.js'
      });
      
      console.log('Payload initialized successfully');
      
      // Create tenants
      console.log('Creating tenants...');
      const tenant1 = await payload.create({
        collection: 'tenants',
        data: {
          name: 'TechConf Inc.',
        },
      });
  
      const tenant2 = await payload.create({
        collection: 'tenants',
        data: {
          name: 'MusicFest LLC',
        },
      });
  
      // Create admin users
      console.log('Creating admin users...');
      const admin1 = await payload.create({
        collection: 'users',
        data: {
          email: 'admin1@techconf.com',
          name: 'Admin TechConf',
          password: 'password123',
          role: 'admin',
          tenant: tenant1.id,
        },
      });
  
      const admin2 = await payload.create({
        collection: 'users',
        data: {
          email: 'admin2@musicfest.com',
          name: 'Admin MusicFest',
          password: 'password123',
          role: 'admin',
          tenant: tenant2.id,
        },
      });
  
      console.log('Seed completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Seed failed:', error);
      process.exit(1);
    }
  }
  
  seed();
  `;
  
  // Write the seed script
  fs.writeFileSync(
    path.join(distDir, 'seed.js'),
    seedScript
  );
  
  console.log('Running seed script...');
  execSync('node dist/seed.js', { stdio: 'inherit' });
  
  // Clean up
  fs.unlinkSync(path.join(__dirname, 'tsconfig.build.json'));
  
} catch (error) {
  console.error('Build and seed failed:', error);
  process.exit(1);
}