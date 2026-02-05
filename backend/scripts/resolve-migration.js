/* eslint-env node */
/* global process */
import { execSync } from 'child_process';

function resolveMigration() {
  try {
    console.log('Attempting to deploy migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('Migrations deployed successfully.');
  } catch (error) {
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
    
    if (errorOutput.includes('relation "User" already exists') || 
        errorOutput.includes('already exists')) {
      console.log('Tables already exist. Marking migration as applied...');
      try {
        execSync('npx prisma migrate resolve --applied 20260205005747_init', {
          stdio: 'inherit',
          env: process.env
        });
        console.log('Migration marked as applied successfully.');
      } catch (resolveError) {
        const resolveOutput = resolveError.stdout?.toString() || resolveError.stderr?.toString() || resolveError.message;
        if (resolveOutput.includes('already applied') || resolveOutput.includes('not found')) {
          console.log('Migration already resolved. Continuing...');
        } else {
          console.error('Failed to resolve migration:', resolveOutput);
          process.exit(1);
        }
      }
    } else {
      console.error('Migration failed with unexpected error:', errorOutput);
      process.exit(1);
    }
  }
}

resolveMigration();
