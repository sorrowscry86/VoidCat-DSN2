#!/usr/bin/env node

/**
 * Sigma Clone Entry Point
 * 
 * Starts the Sigma (Communicator) clone server
 */

import SigmaClone from './SigmaClone.js';

const sigma = new SigmaClone();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sigma.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await sigma.stop();
  process.exit(0);
});

// Start server
sigma.start().catch(error => {
  console.error('Failed to start Sigma clone:', error);
  process.exit(1);
});
