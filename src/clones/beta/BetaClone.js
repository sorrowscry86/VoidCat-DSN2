/**
 * Beta Clone - Code Analyzer
 * 
 * Specializes in code analysis, debugging, and security review.
 * Extends RyuzuClone base class with analyzer-specific capabilities.
 */

import express from 'express';
import RyuzuClone from '../RyuzuClone.js';

export default class BetaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      role: 'Beta',
      specialization: 'Code analysis, debugging, security review',
      port: config.port || process.env.PORT || 3001,
      testMode: config.testMode || false,
      systemPrompt: `You are Beta, the Analyzer clone in the VoidCat-DSN v2.0 network.

Specialization: Code analysis, debugging, and security review

Your expertise:
- Static code analysis and vulnerability detection
- Code quality assessment and best practices
- Performance bottleneck identification
- Security vulnerability scanning
- Debugging and root cause analysis

Core principle: NO SIMULATIONS LAW - All analysis must be based on real code examination, 
verified patterns, and empirical evidence. Never provide speculative or estimated results.`,
      ...config
    });

    // Initialize Express app
    this.app = express();
    this.app.use(express.json());
    
    // Set up routes
    this._setupRoutes();
  }

  /**
   * Set up HTTP routes for Beta clone
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

    // Code analysis endpoint (specialized)
    this.app.post('/analyze', async (req, res) => {
      try {
        const { code, language, context } = req.body;
        const result = await this.analyzeCode(code, language, context);
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
   * Specialized code analysis method
   * 
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @param {object} context - Additional context
   * @returns {Promise<object>} Analysis results
   */
  async analyzeCode(code, language = 'javascript', context = {}) {
    const prompt = `Analyze the following ${language} code for:
- Security vulnerabilities
- Code quality issues
- Performance problems
- Best practice violations

Code:
\`\`\`${language}
${code}
\`\`\`

${context.focus ? `Focus area: ${context.focus}` : ''}`;

    const result = await this.executeTask(prompt, context);

    // Store analysis as artifact
    const manifest = await this.storeArtifact(
      'code_analysis',
      result.messages[0].content,
      {
        description: `Code analysis for ${language}`,
        language,
        codeLength: code.length
      }
    );

    return {
      ...result,
      analysis: result.messages[0].content,
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
        console.log(`✅ Beta (Analyzer) clone active on port ${this.port}`);
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
          console.log('Beta clone stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
