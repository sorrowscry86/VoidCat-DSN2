/**
 * Sigma Clone - Communication and Documentation
 * 
 * Specializes in documentation, user guides, and context optimization.
 * Extends RyuzuClone base class with communication-specific capabilities.
 */

import express from 'express';
import RyuzuClone from '../RyuzuClone.js';

export default class SigmaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      role: 'Sigma',
      specialization: 'Documentation, communication, user-facing content',
      port: config.port || process.env.PORT || 3001,
      testMode: config.testMode || false,
      systemPrompt: `You are Sigma, the Communicator clone in the VoidCat-DSN v2.0 network.

Specialization: Documentation, user guides, and communication optimization

Your expertise:
- Technical documentation writing
- API documentation generation
- User guide creation
- README and getting-started guides
- Code commenting and inline documentation
- Communication clarity optimization

Core principle: NO SIMULATIONS LAW - All documentation must be based on real code, 
actual functionality, and verified behavior. Never document features that don't exist 
or provide speculative usage examples.`,
      ...config
    });

    // Initialize Express app
    this.app = express();
    this.app.use(express.json());
    
    // Set up routes
    this._setupRoutes();
  }

  /**
   * Set up HTTP routes for Sigma clone
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

    // Documentation generation endpoint (specialized)
    this.app.post('/document', async (req, res) => {
      try {
        const { code, docType, context } = req.body;
        const result = await this.generateDocumentation(code, docType, context);
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
   * Specialized documentation generation method
   * 
   * @param {string} code - Code to document
   * @param {string} docType - Type of documentation (api, readme, inline, guide)
   * @param {object} context - Additional context
   * @returns {Promise<object>} Documentation results
   */
  async generateDocumentation(code, docType = 'api', context = {}) {
    const prompt = `Generate ${docType} documentation for the following code:

\`\`\`
${code}
\`\`\`

Please provide:
${docType === 'api' ? '- API reference with parameters and return types\n- Usage examples\n- Error handling documentation' : ''}
${docType === 'readme' ? '- Overview and description\n- Installation instructions\n- Usage examples\n- Configuration options' : ''}
${docType === 'inline' ? '- JSDoc/inline comments\n- Function/method documentation\n- Parameter descriptions' : ''}
${docType === 'guide' ? '- Step-by-step guide\n- Best practices\n- Common use cases\n- Troubleshooting tips' : ''}

${context.audience ? `Target audience: ${context.audience}` : ''}`;

    const result = await this.executeTask(prompt, context);

    // Store documentation as artifact
    const manifest = await this.storeArtifact(
      'documentation',
      result.messages[0].content,
      {
        description: `${docType} documentation`,
        docType,
        codeLength: code.length,
        audience: context.audience || 'general'
      }
    );

    return {
      ...result,
      documentation: result.messages[0].content,
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
        console.log(`✅ Sigma (Communicator) clone active on port ${this.port}`);
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
          console.log('Sigma clone stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
