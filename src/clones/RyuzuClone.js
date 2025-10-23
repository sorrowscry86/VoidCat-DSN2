/**
 * RyuzuClone - Base Class for All Specialized Clones
 * 
 * Provides shared infrastructure for all 5 specialized AI clones.
 * NO SIMULATIONS LAW: Inherits IntegrityMonitor, EvidenceCollector, AutoGenClient.
 * 
 * Features:
 * - Automatic integration with all Phase 0 and Phase 1 components
 * - HTTP endpoint scaffolding (health, task execution, artifacts)
 * - Evidence collection for all operations
 * - Context package validation
 * - Shared AI execution methods
 */

import IntegrityMonitor from '../infrastructure/integrity/IntegrityMonitor.js';
import EvidenceCollector from '../infrastructure/evidence/EvidenceCollector.js';
import AutoGenClient from '../infrastructure/autogen/AutoGenClient.js';
import ArtifactManager from '../infrastructure/artifacts/ArtifactManager.js';
import ContextEngineer from '../infrastructure/context/ContextEngineer.js';

export default class RyuzuClone {
  constructor(config = {}) {
    // Clone identity
    this.role = config.role || 'Unknown';
    this.specialization = config.specialization || 'General purpose';
    this.port = config.port || process.env.PORT || 3001;
    this.systemPrompt = config.systemPrompt || this._getDefaultSystemPrompt();
    
    // Phase 0 components (Integrity-First Foundation)
    this.integrityMonitor = new IntegrityMonitor();
    this.evidenceCollector = new EvidenceCollector();
    
    // Determine test mode and API key
    const testMode = config.testMode || false;
    const apiKey = testMode ? 'test-key' : process.env.ANTHROPIC_API_KEY;
    
    this.autoGenClient = new AutoGenClient({
      apiKey,
      testMode
    });
    
    // Phase 1 components (Core Infrastructure)
    this.artifactManager = new ArtifactManager(
      config.artifactDir || '/tmp/sanctuary-workspace/artifacts'
    );
    this.contextEngineer = new ContextEngineer();
    
    // Metrics tracking
    this.metrics = {
      startTime: new Date().toISOString(),
      tasksProcessed: 0,
      totalExecutionTime: 0,
      averageResponseTime: 0,
      errors: 0
    };
  }

  /**
   * Get default system prompt for clone
   * Override in specialized clones
   * 
   * @private
   * @returns {string} System prompt
   */
  _getDefaultSystemPrompt() {
    return `You are ${this.role}, a specialized AI clone in the VoidCat-DSN v2.0 network.
Specialization: ${this.specialization}
Core principle: NO SIMULATIONS LAW - All outputs must be 100% real, verifiable, and audit-traceable.`;
  }

  /**
   * Execute AI task with automatic evidence collection
   * NO SIMULATIONS LAW: Real AI execution via AutoGenClient
   * 
   * @param {string} prompt - Task prompt
   * @param {object} context - Optional context data
   * @param {string} sessionId - Session ID for tracking
   * @returns {Promise<object>} Response with messages and evidence
   */
  async executeTask(prompt, context = {}, sessionId = null) {
    const startTime = Date.now();
    const taskId = sessionId || `task-${Date.now()}`;

    try {
      // Validate request (IntegrityMonitor)
      const validation = this.integrityMonitor.verifyRequest({ prompt, sessionId: taskId });
      if (!validation.valid) {
        throw new Error(validation.errors.join('; '));
      }

      // Enhance prompt with system prompt and context
      const enhancedPrompt = this._enhancePrompt(prompt, context);

      // Execute real AI query (NO SIMULATIONS LAW)
      const response = await this.autoGenClient.query({
        model: 'claude-3-5-sonnet-20241022',
        prompt: enhancedPrompt,
        stream: false
      });

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Transform response into messages format
      const messages = [
        {
          role: 'assistant',
          content: response.content
        }
      ];

      // Record evidence
      this.evidenceCollector.record({
        taskId,
        operation: 'task_execution',
        execution: 'real',
        clone: this.role,
        executionTime,
        autoGenModel: response.metadata.model,
        promptLength: prompt.length,
        responseLength: response.content.length
      });

      // Update metrics
      this._updateMetrics(executionTime, false);

      return {
        success: true,
        messages,
        sessionId: taskId,
        clone: this.role,
        executionTime,
        evidence: this.evidenceCollector.getLastRecord()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Record failure evidence
      this.evidenceCollector.record({
        taskId,
        operation: 'task_execution',
        execution: 'failed',
        clone: this.role,
        executionTime,
        error: error.message
      });

      // Update metrics
      this._updateMetrics(executionTime, true);

      throw error;
    }
  }

  /**
   * Enhance prompt with system prompt and context
   * 
   * @private
   * @param {string} prompt - User prompt
   * @param {object} context - Context data
   * @returns {string} Enhanced prompt
   */
  _enhancePrompt(prompt, context = {}) {
    let enhanced = this.systemPrompt + '\n\n';

    // Add context if provided
    if (Object.keys(context).length > 0) {
      enhanced += 'Context:\n';
      for (const [key, value] of Object.entries(context)) {
        enhanced += `- ${key}: ${JSON.stringify(value)}\n`;
      }
      enhanced += '\n';
    }

    enhanced += `Task: ${prompt}`;

    return enhanced;
  }

  /**
   * Update clone metrics
   * 
   * @private
   * @param {number} executionTime - Execution time in ms
   * @param {boolean} isError - Whether task failed
   */
  _updateMetrics(executionTime, isError) {
    this.metrics.tasksProcessed++;
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageResponseTime = Math.round(
      this.metrics.totalExecutionTime / this.metrics.tasksProcessed
    );

    if (isError) {
      this.metrics.errors++;
    }
  }

  /**
   * Get clone health status
   * Used for HTTP /health endpoint
   * 
   * @returns {object} Health status
   */
  getHealthStatus() {
    return {
      status: 'active',
      role: this.role,
      specialization: this.specialization,
      timestamp: new Date().toISOString(),
      integrity: {
        autoGenConnected: this.autoGenClient.isConnected(),
        evidenceCollectorActive: this.evidenceCollector.isActive(),
        artifactManagerInitialized: this.artifactManager.isInitialized()
      },
      metrics: {
        uptime: this._getUptime(),
        tasksProcessed: this.metrics.tasksProcessed,
        averageResponseTime: this.metrics.averageResponseTime,
        errors: this.metrics.errors,
        successRate: this._calculateSuccessRate()
      }
    };
  }

  /**
   * Get uptime in seconds
   * 
   * @private
   * @returns {number} Uptime in seconds
   */
  _getUptime() {
    const start = new Date(this.metrics.startTime);
    const now = new Date();
    return Math.floor((now - start) / 1000);
  }

  /**
   * Calculate success rate
   * 
   * @private
   * @returns {number} Success rate percentage
   */
  _calculateSuccessRate() {
    if (this.metrics.tasksProcessed === 0) {
      return 100;
    }
    const successful = this.metrics.tasksProcessed - this.metrics.errors;
    return Math.round((successful / this.metrics.tasksProcessed) * 100);
  }

  /**
   * Store task result as artifact
   * 
   * @param {string} type - Artifact type
   * @param {string} content - Artifact content
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Artifact manifest
   */
  async storeArtifact(type, content, metadata = {}) {
    const manifest = this.artifactManager.storeArtifact(type, content, {
      ...metadata,
      clone: this.role,
      timestamp: new Date().toISOString()
    });

    // Record evidence
    this.evidenceCollector.record({
      operation: 'artifact_stored',
      artifactId: manifest.artifactId,
      type,
      checksum: manifest.checksum,
      size: manifest.size
    });

    return manifest;
  }

  /**
   * Retrieve artifact with automatic integrity verification
   * 
   * @param {string} artifactId - Artifact ID
   * @param {object} options - Retrieval options
   * @returns {Promise<object>} Artifact with manifest
   */
  async retrieveArtifact(artifactId, options = {}) {
    const result = this.artifactManager.retrieveArtifact(artifactId, options);

    // Record evidence
    this.evidenceCollector.record({
      operation: 'artifact_retrieved',
      artifactId,
      checksumVerified: true,
      manifestOnly: options.manifestOnly || false
    });

    return result;
  }

  /**
   * Validate context package quality
   * Throws if quality too low
   * 
   * @param {object} contextPackage - Context package to validate
   * @returns {boolean} Validation result
   */
  validateContextQuality(contextPackage) {
    return this.contextEngineer.validateQuality(contextPackage);
  }
}
