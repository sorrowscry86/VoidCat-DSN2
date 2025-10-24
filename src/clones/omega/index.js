#!/usr/bin/env node

/**
 * Omega Clone Entry Point
 * 
 * Starts the Omega (Coordinator) clone server
 */

import OmegaClone from './OmegaClone.js';

const omega = new OmegaClone();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await omega.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await omega.stop();
  process.exit(0);
});

// Start server
omega.start().catch(error => {
  console.error('Failed to start Omega clone:', error);
  process.exit(1);
});
