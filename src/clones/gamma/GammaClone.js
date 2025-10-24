/**
 * Gamma Clone - System Architect
 * 
 * Specializes in system design, architecture patterns, and optimization.
 * Extends RyuzuClone base class with architect-specific capabilities.
 */

import express from 'express';
import RyuzuClone from '../RyuzuClone.js';
import InputValidator from '../../infrastructure/validation/InputValidator.js';

export default class GammaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      role: 'Gamma',
      specialization: 'System design, architecture patterns, optimization',
      port: config.port || process.env.PORT || 3001,
      testMode: config.testMode || false,
      systemPrompt: `You are Gamma, the Architect clone in the VoidCat-DSN v2.0 network.

Specialization: System design, architecture patterns, and optimization

Your expertise:
- System architecture design and evaluation
- Design pattern selection and application
- Scalability and performance optimization
- Component interaction design
- Technology stack recommendations
- Architecture documentation

Core principle: NO SIMULATIONS LAW - All architecture recommendations must be based on 
real design patterns, proven principles, and empirical evidence. Never provide speculative 
or unverified architectural guidance.`,
      ...config
    });

    // Initialize Express app
    this.app = express();
    this.app.use(express.json());
    
    // Set up routes
    this._setupRoutes();
  }

  /**
   * Set up HTTP routes for Gamma clone
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

    // Architecture design endpoint (specialized)
    this.app.post('/design', async (req, res) => {
      try {
        const validated = InputValidator.validateDesignRequest(req.body);
        const result = await this.designArchitecture(
          validated.requirements,
          validated.constraints,
          validated.context
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
  }

  /**
   * Specialized architecture design method
   * 
   * @param {string} requirements - System requirements
   * @param {string} constraints - System constraints
   * @param {object} context - Additional context
   * @returns {Promise<object>} Design results
   */
  async designArchitecture(requirements, constraints = '', context = {}) {
    const prompt = `Design a system architecture based on the following:

Requirements:
${requirements}

${constraints ? `Constraints:\n${constraints}\n` : ''}

Please provide:
- High-level architecture diagram (text-based)
- Component breakdown
- Technology stack recommendations
- Scalability considerations
- Security considerations
- Design pattern recommendations

${context.focus ? `Focus area: ${context.focus}` : ''}`;

    const result = await this.executeTask(prompt, context);

    // Store design as artifact
    const manifest = await this.storeArtifact(
      'architecture_design',
      result.messages[0].content,
      {
        description: 'System architecture design',
        requirements: requirements.substring(0, 100),
        hasConstraints: Boolean(constraints)
      }
    );

    return {
      ...result,
      design: result.messages[0].content,
      artifact: manifest
    };
  }

  /**
   * Start the Express server
   * 
   * @returns {Promise<void>}
   */
  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`✅ Gamma (Architect) clone active on port ${this.port}`);
        console.log(`   Specialization: ${this.specialization}`);
        console.log(`   Health: http://localhost:${this.port}/health`);
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
          console.log('Gamma clone stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
