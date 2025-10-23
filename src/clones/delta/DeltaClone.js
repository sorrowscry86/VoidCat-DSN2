/**
 * Delta Clone - Quality Assurance and Testing
 * 
 * Specializes in test strategies, test generation, and QA.
 * Extends RyuzuClone base class with testing-specific capabilities.
 */

import express from 'express';
import RyuzuClone from '../RyuzuClone.js';

export default class DeltaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      role: 'Delta',
      specialization: 'Test strategies, QA, edge case identification',
      port: config.port || process.env.PORT || 3001,
      testMode: config.testMode || false,
      systemPrompt: `You are Delta, the Tester clone in the VoidCat-DSN v2.0 network.

Specialization: Testing strategies, test generation, and quality assurance

Your expertise:
- Test strategy development
- Test case generation and coverage analysis
- Edge case identification
- Integration test planning
- Performance testing strategies
- Test automation recommendations

Core principle: NO SIMULATIONS LAW - All test recommendations must be based on 
real testing methodologies, proven test patterns, and empirical coverage strategies. 
Never provide mock or simulated test results.`,
      ...config
    });

    // Initialize Express app
    this.app = express();
    this.app.use(express.json());
    
    // Set up routes
    this._setupRoutes();
  }

  /**
   * Set up HTTP routes for Delta clone
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
        const { prompt, context, sessionId } = req.body;
        const result = await this.executeTask(prompt, context, sessionId);
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          clone: this.role
        });
      }
    });

    // Test generation endpoint (specialized)
    this.app.post('/generate-tests', async (req, res) => {
      try {
        const { code, testFramework, context } = req.body;
        const result = await this.generateTests(code, testFramework, context);
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
   * Specialized test generation method
   * 
   * @param {string} code - Code to generate tests for
   * @param {string} testFramework - Test framework (mocha, jest, etc.)
   * @param {object} context - Additional context
   * @returns {Promise<object>} Test generation results
   */
  async generateTests(code, testFramework = 'mocha', context = {}) {
    const prompt = `Generate comprehensive tests for the following code using ${testFramework}:

\`\`\`
${code}
\`\`\`

Please provide:
- Unit tests covering all functions/methods
- Edge case tests
- Error handling tests
- Integration test scenarios (if applicable)
- Test coverage recommendations

${context.focus ? `Focus area: ${context.focus}` : ''}`;

    const result = await this.executeTask(prompt, context);

    // Store tests as artifact
    const manifest = await this.storeArtifact(
      'test_suite',
      result.messages[0].content,
      {
        description: `Test suite for ${testFramework}`,
        framework: testFramework,
        codeLength: code.length
      }
    );

    return {
      ...result,
      tests: result.messages[0].content,
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
        console.log(`✅ Delta (Tester) clone active on port ${this.port}`);
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
          console.log('Delta clone stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
