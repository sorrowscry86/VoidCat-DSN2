/**
 * Omega Clone - Coordinator
 * 
 * Orchestrates multi-clone workflows, task delegation, and network monitoring.
 * Extends RyuzuClone base class with coordinator-specific capabilities.
 */

import express from 'express';
import axios from 'axios';
import RyuzuClone from '../RyuzuClone.js';
import InputValidator from '../../infrastructure/validation/InputValidator.js';

export default class OmegaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      role: 'Omega',
      specialization: 'Task orchestration, multi-clone coordination, network monitoring',
      port: config.port || process.env.PORT || 3001,
      testMode: config.testMode || false,
      systemPrompt: `You are Omega, the Coordinator clone in the VoidCat-DSN v2.0 network.

Specialization: Task orchestration, multi-clone coordination, and network monitoring

Your expertise:
- Task delegation and routing to specialized clones
- Multi-clone workflow orchestration
- Context package construction and quality optimization
- Network health monitoring
- Task dependency management
- Clone performance optimization

Core principle: NO SIMULATIONS LAW - All orchestration decisions must be based on 
real clone capabilities, verified health status, and empirical performance metrics. 
Never simulate or estimate task completion.`,
      ...config
    });

    // Clone registry with configurable ports and hostnames
    this.cloneRegistry = {
      beta: {
        port: process.env.BETA_PORT || 3002,
        host: process.env.BETA_HOST || 'localhost', // Use 'ryuzu-beta-sanctuary' in Docker
        specialization: 'Code analysis, debugging, security'
      },
      gamma: {
        port: process.env.GAMMA_PORT || 3003,
        host: process.env.GAMMA_HOST || 'localhost',
        specialization: 'System design, architecture'
      },
      delta: {
        port: process.env.DELTA_PORT || 3004,
        host: process.env.DELTA_HOST || 'localhost',
        specialization: 'Testing, QA'
      },
      sigma: {
        port: process.env.SIGMA_PORT || 3005,
        host: process.env.SIGMA_HOST || 'localhost',
        specialization: 'Documentation, communication'
      }
    };

    // Initialize Express app
    this.app = express();
    this.app.use(express.json());
    
    // Set up routes
    this._setupRoutes();
  }

  /**
   * Set up HTTP routes for Omega clone
   * @private
   */
  _setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json(this.getHealthStatus());
    });

    // Task execution endpoint
    this.app.post('/task', async (req, res) => {
      try {
        const validated = InputValidator.validateTaskRequest(req.body);
        const result = await this.executeTask(validated.prompt, validated.context, validated.sessionId);
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          clone: this.role
        });
      }
    });

    // Multi-clone orchestration endpoint (specialized)
    this.app.post('/orchestrate', async (req, res) => {
      try {
        const validated = InputValidator.validateOrchestrateRequest(req.body);
        const result = await this.orchestrate(
          validated.objective,
          validated.targetClone,
          validated.artifactManifests,
          validated.essentialData,
          validated.sessionId
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Network status endpoint
    this.app.get('/network-status', async (req, res) => {
      try {
        const status = await this.getNetworkStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Delegate task endpoint
    this.app.post('/delegate', async (req, res) => {
      try {
        const validated = InputValidator.validateDelegateRequest(req.body);
        const result = await this.delegateTask(
          validated.targetClone,
          validated.prompt,
          validated.context,
          validated.sessionId
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Artifact storage endpoint
    this.app.post('/artifacts', async (req, res) => {
      try {
        const { type, content, metadata } = req.body;
        const manifest = await this.storeArtifact(type, content, metadata);
        res.status(201).json({ success: true, manifest });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Artifact retrieval endpoint
    this.app.get('/artifacts/:id', async (req, res) => {
      try {
        const manifestOnly = req.query.manifestOnly === 'true';
        const result = await this.retrieveArtifact(
          req.params.id,
          { manifestOnly }
        );
        res.json(result);
      } catch (error) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      }
    });

    // List all artifacts endpoint
    this.app.get('/artifacts', async (req, res) => {
      try {
        const artifacts = this.artifactManager.listArtifacts();
        res.json({ success: true, artifacts });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Audit log endpoint
    this.app.get('/audit', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 10;
        const auditLog = this.evidenceCollector.getAuditLog(limit);
        res.json({ success: true, auditLog, clone: this.role });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Orchestrate multi-clone workflow with context engineering
   * 
   * @param {string} objective - Task objective
   * @param {string} targetClone - Target clone name (beta, gamma, delta, sigma)
   * @param {Array} artifactManifests - Lightweight artifact references
   * @param {object} essentialData - Essential context data
   * @param {string} sessionId - Session ID
   * @returns {Promise<object>} Orchestration result
   */
  async orchestrate(objective, targetClone, artifactManifests = [], essentialData = {}, sessionId = null) {
    const startTime = Date.now();
    const taskId = sessionId || `orchestration-${Date.now()}`;

    try {
      // Construct high-quality context package
      const contextPackage = this.contextEngineer.constructContextPackage({
        objective,
        targetClone,
        artifactManifests,
        essentialData
      });

      // Validate context quality
      this.validateContextQuality(contextPackage);

      // Delegate to target clone
      const result = await this.delegateTask(
        targetClone,
        objective,
        contextPackage,
        taskId
      );

      const duration = Date.now() - startTime;

      // Record evidence
      this.evidenceCollector.record({
        taskId,
        operation: 'orchestration',
        execution: 'real',
        targetClone,
        contextQuality: contextPackage.quality.overallQuality,
        duration
      });

      return {
        success: true,
        result,
        contextQuality: contextPackage.quality,
        orchestration: {
          taskId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      // Record failure evidence
      this.evidenceCollector.record({
        taskId,
        operation: 'orchestration',
        execution: 'failed',
        targetClone,
        duration,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Delegate task to specific clone
   * 
   * @param {string} targetClone - Clone name (beta, gamma, delta, sigma)
   * @param {string} prompt - Task prompt
   * @param {object} context - Task context
   * @param {string} sessionId - Session ID
   * @returns {Promise<object>} Delegation result
   */
  async delegateTask(targetClone, prompt, context = {}, sessionId = null) {
    if (!this.cloneRegistry[targetClone]) {
      throw new Error(`Unknown clone: ${targetClone}`);
    }

    const cloneInfo = this.cloneRegistry[targetClone];
    // Use internal port 3001 for Docker, external port for host
    const clonePort = process.env.NODE_ENV === 'production' ? 3001 : cloneInfo.port;
    const cloneUrl = `http://${cloneInfo.host}:${clonePort}/task`;

    try {
      const response = await axios.post(cloneUrl, {
        prompt,
        context,
        sessionId: sessionId || `delegated-${Date.now()}`
      }, {
        timeout: 30000 // 30 second timeout
      });

      return response.data;

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Clone ${targetClone} is not running on port ${clonePort}`);
      }
      throw new Error(`Failed to delegate to ${targetClone}: ${error.message}`);
    }
  }

  /**
   * Get network status of all clones
   * 
   * @returns {Promise<object>} Network status
   */
  async getNetworkStatus() {
    const status = {
      coordinator: this.getHealthStatus(),
      clones: {}
    };

    // Check each clone's health
    for (const [cloneName, cloneInfo] of Object.entries(this.cloneRegistry)) {
      try {
        const clonePort = process.env.NODE_ENV === 'production' ? 3001 : cloneInfo.port;
        const response = await axios.get(
          `http://${cloneInfo.host}:${clonePort}/health`,
          { timeout: 5000 }
        );
        status.clones[cloneName] = {
          ...response.data,
          reachable: true
        };
      } catch (error) {
        status.clones[cloneName] = {
          status: 'unreachable',
          role: cloneName,
          reachable: false,
          error: error.code === 'ECONNREFUSED' ? 'Not running' : error.message
        };
      }
    }

    return status;
  }

  /**
   * Register or update clone in registry
   * Useful for dynamic clone discovery
   * 
   * @param {string} cloneName - Clone name
   * @param {number} port - Clone port
   * @param {string} specialization - Clone specialization
   */
  registerClone(cloneName, port, specialization) {
    this.cloneRegistry[cloneName] = { port, specialization };
  }

  /**
   * Start the Express server
   * 
   * @returns {Promise<void>}
   */
  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`✅ Omega (Coordinator) clone active on port ${this.port}`);
        console.log(`   Specialization: ${this.specialization}`);
        console.log(`   Health: http://localhost:${this.port}/health`);
        console.log(`   Network: http://localhost:${this.port}/network-status`);
        resolve();
      });
    });
  }

  /**
   * Stop the Express server
   * 
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Omega clone stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
