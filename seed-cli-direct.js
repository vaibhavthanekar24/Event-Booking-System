// Direct seed script using Payload CLI
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

try {
  console.log('Starting seed process using Payload CLI...');
  
  // Run the Payload CLI seed command
  execSync('npx payload seed --file src/seed/seed.ts', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-deprecation --experimental-specifier-resolution=node --loader ts-node/esm'
    }
  });
  
  console.log('Seed completed successfully');
} catch (error) {
  console.error('Seed failed:', error);
  process.exit(1);
}