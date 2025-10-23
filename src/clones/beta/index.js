#!/usr/bin/env node

/**
 * Beta Clone Entry Point
 * 
 * Starts the Beta (Analyzer) clone server
 */

import BetaClone from './BetaClone.js';

const beta = new BetaClone();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await beta.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await beta.stop();
  process.exit(0);
});

// Start server
beta.start().catch(error => {
  console.error('Failed to start Beta clone:', error);
  process.exit(1);
});
