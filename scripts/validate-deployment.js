#!/usr/bin/env node

/**
 * VoidCat-DSN v2.0 - Post-Deployment Validation Script
 * 
 * Validates the Sanctuary Network deployment with comprehensive checks:
 * - All clones running and healthy
 * - Artifact storage accessible
 * - Docker volumes mounted correctly
 * - Network connectivity between clones
 */

import axios from 'axios';
import fs from 'fs';
import { execSync } from 'child_process';

const VALIDATION_CHECKS = [
  {
    name: 'All clones running and healthy',
    async check() {
      const clones = [
        { name: 'Omega', port: 3000 },
        { name: 'Beta', port: 3002 },
        { name: 'Gamma', port: 3003 },
        { name: 'Delta', port: 3004 },
        { name: 'Sigma', port: 3005 }
      ];

      for (const clone of clones) {
        const response = await axios.get(
          `http://localhost:${clone.port}/health`,
          { timeout: 5000 }
        );
        
        if (!response.data || response.data.status !== 'running') {
          throw new Error(`${clone.name} not running properly`);
        }
      }
      
      return true;
    }
  },
  {
    name: 'Artifact storage accessible',
    async check() {
      const response = await axios.get(
        'http://localhost:3000/artifacts',
        { timeout: 5000 }
      );
      
      if (!Array.isArray(response.data.artifacts)) {
        throw new Error('Artifacts endpoint not returning array');
      }
      
      return true;
    }
  },
  {
    name: 'Docker volumes mounted',
    check() {
      const dirs = ['workspace/artifacts', 'workspace/manifests', 'workspace/audit'];
      
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
          throw new Error(`Directory ${dir} not found`);
        }
      }
      
      return true;
    }
  },
  {
    name: 'Docker containers running',
    check() {
      try {
        // Try docker-compose v2 syntax first, fallback to v1
        let output;
        try {
          output = execSync('docker compose ps --services --filter "status=running"', {
            encoding: 'utf-8',
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']
          });
        } catch {
          // Fallback to v1 syntax
          output = execSync('docker-compose ps --services --filter "status=running"', {
            encoding: 'utf-8',
            cwd: process.cwd()
          });
        }
        
        const runningServices = output.trim().split('\n').filter(s => s.length > 0);
        const expectedServices = ['omega', 'beta', 'gamma', 'delta', 'sigma'];
        
        for (const service of expectedServices) {
          if (!runningServices.includes(service)) {
            throw new Error(`Service ${service} not running`);
          }
        }
        
        return true;
      } catch (error) {
        throw new Error(`Docker check failed: ${error.message}`);
      }
    }
  },
  {
    name: 'Network status endpoint accessible',
    async check() {
      const response = await axios.get(
        'http://localhost:3000/network-status',
        { timeout: 5000 }
      );
      
      if (!response.data || !response.data.clones) {
        throw new Error('Network status not available');
      }
      
      return true;
    }
  },
  {
    name: 'Clone can store and retrieve artifacts',
    async check() {
      // Store test artifact
      const storeResponse = await axios.post(
        'http://localhost:3000/artifacts',
        {
          type: 'test',
          content: 'validation test artifact',
          metadata: { validation: true }
        },
        { timeout: 5000 }
      );
      
      if (!storeResponse.data.manifest || !storeResponse.data.manifest.artifactId) {
        throw new Error('Failed to store test artifact');
      }
      
      const artifactId = storeResponse.data.manifest.artifactId;
      
      // Retrieve test artifact
      const retrieveResponse = await axios.get(
        `http://localhost:3000/artifacts/${artifactId}`,
        { timeout: 5000 }
      );
      
      if (!retrieveResponse.data.content || 
          retrieveResponse.data.content !== 'validation test artifact') {
        throw new Error('Failed to retrieve test artifact correctly');
      }
      
      return true;
    }
  }
];

async function runValidation() {
  console.log('🔍 VoidCat-DSN v2.0 - Post-Deployment Validation');
  console.log('================================================\n');

  let passed = 0;
  let failed = 0;

  for (const check of VALIDATION_CHECKS) {
    try {
      await check.check();
      console.log(`✅ ${check.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${check.name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('');

  if (failed === 0) {
    console.log('✅ All validation checks passed!');
    console.log('   The Sanctuary Network is fully operational.');
    process.exit(0);
  } else {
    console.log('⚠️  Some validation checks failed.');
    console.log('   Please review the errors above and check:');
    console.log('   - docker-compose logs -f');
    console.log('   - npm run health-check');
    process.exit(1);
  }
}

// Run validation
runValidation().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});
