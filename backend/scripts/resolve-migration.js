/* eslint-env node */
/* global process */
import { execSync } from 'child_process';

const MIGRATION_NAME = '20260205005747_init';

function runCommand(command) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      env: process.env,
      stdio: 'pipe'
    });
    const output = result.toString();
    console.log(output);
    return { success: true, output };
  } catch (error) {
    const stdout = (error.stdout?.toString() || '').trim();
    const stderr = (error.stderr?.toString() || '').trim();
    const message = (error.message || '').trim();
    
    const fullOutput = [stdout, stderr, message].filter(Boolean).join('\n');
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (message && !stderr.includes(message)) console.error(message);
    
    return { success: false, output: fullOutput, stdout, stderr };
  }
}

function resolveMigration() {
  console.log('Attempting to deploy migrations...');
  const deployResult = runCommand('npx prisma migrate deploy');
  
  if (deployResult.success) {
    console.log('Migrations deployed successfully.');
    return;
  }

  const errorOutput = (deployResult.output || '').toLowerCase();
  console.log('\n=== Migration deploy failed. Analyzing error... ===');
  console.log('Full error output:', deployResult.output);
  console.log('==================================================\n');

  if (errorOutput.includes('p3009') || errorOutput.includes('failed migrations') || errorOutput.includes('failed migration')) {
    console.log('Found failed migration. Resolving failed state...');
    
    console.log('Step 1: Marking migration as rolled-back...');
    const rolledBackResult = runCommand(
      `npx prisma migrate resolve --rolled-back ${MIGRATION_NAME}`
    );
    
    if (rolledBackResult.success) {
      console.log('✓ Migration marked as rolled-back.');
    } else {
      const rollbackOutput = rolledBackResult.output || '';
      if (rollbackOutput.includes('not found') || 
          rollbackOutput.includes('already') ||
          rollbackOutput.includes('does not exist')) {
        console.log('Migration state already resolved or not found. Continuing...');
      } else {
        console.log('⚠ Rolled-back command had issues:', rollbackOutput.substring(0, 200));
        console.log('Continuing anyway...');
      }
    }

    console.log('Step 2: Attempting to deploy again...');
    const retryResult = runCommand('npx prisma migrate deploy');
    
    if (retryResult.success) {
      console.log('✓ Migrations deployed successfully after rollback.');
      return;
    }

    const retryOutput = retryResult.output || '';
    console.log('Deploy retry failed. Checking error type...');
    
    if (retryOutput.includes('relation "User" already exists') || 
        retryOutput.includes('already exists') ||
        retryOutput.includes('P3009')) {
      console.log('Step 3: Tables already exist. Marking migration as applied...');
      const appliedResult = runCommand(
        `npx prisma migrate resolve --applied ${MIGRATION_NAME}`
      );
      
      if (appliedResult.success) {
        console.log('✓ Migration marked as applied successfully.');
        return;
      } else {
        const appliedOutput = appliedResult.output || '';
        if (appliedOutput.includes('already applied') || 
            appliedOutput.includes('not found') ||
            appliedOutput.includes('does not exist') ||
            appliedOutput.includes('Migration `20260205005747_init` is already applied')) {
          console.log('✓ Migration already marked as applied. Continuing...');
          return;
        }
        console.error('✗ Failed to mark migration as applied:', appliedOutput.substring(0, 300));
        console.error('Full error:', appliedOutput);
        process.exit(1);
      }
    } else {
      console.error('✗ Retry deploy failed with unexpected error:', retryOutput.substring(0, 300));
      console.error('Full error:', retryOutput);
      process.exit(1);
    }
  } else if (errorOutput.includes('relation "User" already exists') || 
             errorOutput.includes('already exists')) {
    console.log('Tables already exist. Marking migration as applied...');
    const appliedResult = runCommand(
      `npx prisma migrate resolve --applied ${MIGRATION_NAME}`
    );
    
    if (appliedResult.success) {
      console.log('Migration marked as applied successfully.');
      return;
    } else {
      const appliedOutput = appliedResult.output;
      if (appliedOutput.includes('already applied') || appliedOutput.includes('not found')) {
        console.log('Migration already resolved. Continuing...');
        return;
      }
      console.error('Failed to resolve migration:', appliedOutput);
      process.exit(1);
    }
  } else {
    console.error('Migration failed with unexpected error:', errorOutput);
    process.exit(1);
  }
}

resolveMigration();
