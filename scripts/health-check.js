#!/usr/bin/env node

/**
 * Health Check Script for VoidCat-DSN v2.0
 * 
 * Checks health status of all clones and reports results.
 * Exit code 0 = all healthy, 1 = some unhealthy
 */

import axios from 'axios';

const CLONES = [
  { name: 'Omega (Coordinator)', port: 3000 },
  { name: 'Beta (Analyzer)', port: 3002 },
  { name: 'Gamma (Architect)', port: 3003 },
  { name: 'Delta (Tester)', port: 3004 },
  { name: 'Sigma (Communicator)', port: 3005 }
];

const TIMEOUT = 5000; // 5 seconds

async function checkCloneHealth(clone) {
  try {
    const response = await axios.get(
      `http://localhost:${clone.port}/health`,
      { timeout: TIMEOUT }
    );
    
    return {
      name: clone.name,
      port: clone.port,
      healthy: true,
      status: response.data.status,
      uptime: response.data.metrics?.uptime || 0,
      tasksProcessed: response.data.metrics?.tasksProcessed || 0,
      successRate: response.data.metrics?.successRate || 0
    };
  } catch (error) {
    return {
      name: clone.name,
      port: clone.port,
      healthy: false,
      error: error.code === 'ECONNREFUSED' 
        ? 'Not running' 
        : error.message
    };
  }
}

async function main() {
  console.log('🏥 VoidCat-DSN v2.0 - Health Check');
  console.log('='.repeat(60));
  console.log('');

  const results = await Promise.all(
    CLONES.map(clone => checkCloneHealth(clone))
  );

  let allHealthy = true;

  results.forEach(result => {
    const status = result.healthy ? '✅' : '❌';
    console.log(`${status} ${result.name} (Port ${result.port})`);
    
    if (result.healthy) {
      console.log(`   Status: ${result.status}`);
      console.log(`   Uptime: ${result.uptime}s`);
      console.log(`   Tasks Processed: ${result.tasksProcessed}`);
      console.log(`   Success Rate: ${result.successRate}%`);
    } else {
      console.log(`   Error: ${result.error}`);
      allHealthy = false;
    }
    console.log('');
  });

  console.log('='.repeat(60));
  
  if (allHealthy) {
    console.log('✅ All clones are healthy!');
    process.exit(0);
  } else {
    console.log('❌ Some clones are unhealthy');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});
