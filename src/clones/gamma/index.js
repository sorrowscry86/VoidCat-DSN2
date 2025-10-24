#!/usr/bin/env node

/**
 * Gamma Clone Entry Point
 * 
 * Starts the Gamma (Architect) clone server
 */

import GammaClone from './GammaClone.js';

const gamma = new GammaClone();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await gamma.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await gamma.stop();
  process.exit(0);
});

// Start server
gamma.start().catch(error => {
  console.error('Failed to start Gamma clone:', error);
  process.exit(1);
});
