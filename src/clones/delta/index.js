#!/usr/bin/env node

/**
 * Delta Clone Entry Point
 * 
 * Starts the Delta (Tester) clone server
 */

import DeltaClone from './DeltaClone.js';

const delta = new DeltaClone();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await delta.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await delta.stop();
  process.exit(0);
});

// Start server
delta.start().catch(error => {
  console.error('Failed to start Delta clone:', error);
  process.exit(1);
});
