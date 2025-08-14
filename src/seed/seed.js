#!/usr/bin/env node

// This is a JavaScript wrapper to run the TypeScript seed file
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the TypeScript file
const seedTsPath = resolve(__dirname, 'seed.ts');

// Run ts-node with the TypeScript file
const tsNode = spawn('npx', ['ts-node', '--transpile-only', seedTsPath], {
  stdio: 'inherit',
  shell: true,
});

tsNode.on('close', (code) => {
  process.exit(code);
});