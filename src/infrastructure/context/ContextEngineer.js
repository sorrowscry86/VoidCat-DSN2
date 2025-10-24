/**
 * ContextEngineer - Quality-Scored Context Package Construction
 * 
 * Constructs and scores inter-clone communication packages (0-100 quality).
 * NO SIMULATIONS LAW: Real quality metrics, no estimated scores.
 * 
 * Features:
 * - Context package construction with lightweight artifact manifests
 * - Quality scoring (0-100): objectiveClarity, dataRelevance, artifactUtilization
 * - Warning threshold (40+), pass threshold (60+)
 * - Prevents context overload by using manifests instead of full artifacts
 */

export default class ContextEngineer {
  constructor() {
    // Quality thresholds
    this.WARNING_THRESHOLD = 40;
    this.PASS_THRESHOLD = 60;
    
    // Optimal objective length (5-20 words)
    this.OPTIMAL_OBJECTIVE_MIN_WORDS = 5;
    this.OPTIMAL_OBJECTIVE_MAX_WORDS = 20;
  }

  /**
   * Construct context package with quality scoring
   * NO SIMULATIONS LAW: Real quality metrics calculated from actual data
   * 
   * @param {object} options - Context package options
   * @param {string} options.objective - Task objective (5-20 words optimal)
   * @param {string} options.targetClone - Target clone name (beta, gamma, delta, sigma, omega)
   * @param {Array} options.artifactManifests - Lightweight artifact references (not full content)
   * @param {object} options.essentialData - Sanitized essential data only
   * @param {Array} options.constraints - Optional constraints
   * @returns {object} Context package with quality scores
   */
  constructContextPackage(options) {
    const {
      objective,
      targetClone,
      artifactManifests = [],
      essentialData = {},
      constraints = []
    } = options;

    // Validate required fields
    if (!objective || typeof objective !== 'string') {
      throw new Error('Objective is required and must be a string');
    }
    if (!targetClone || typeof targetClone !== 'string') {
      throw new Error('Target clone is required and must be a string');
    }

    // Calculate quality scores (NO SIMULATIONS LAW: real metrics)
    const quality = this._calculateQuality({
      objective,
      artifactManifests,
      essentialData,
      constraints
    });

    // Construct context package
    const contextPackage = {
      objective,
      targetClone,
      artifactManifests,
      essentialData,
      constraints,
      quality,
      timestamp: new Date().toISOString()
    };

    return contextPackage;
  }

  /**
   * Calculate quality scores for context package
   * NO SIMULATIONS LAW: Real calculations from actual metrics
   * 
   * @private
   * @param {object} data - Context data
   * @returns {object} Quality scores
   */
  _calculateQuality(data) {
    const { objective, artifactManifests, essentialData, constraints: _constraints } = data;

    // 1. Objective Clarity (0-100)
    const objectiveClarity = this._scoreObjectiveClarity(objective);

    // 2. Data Relevance (0-100)
    const dataRelevance = this._scoreDataRelevance(essentialData);

    // 3. Artifact Utilization (0-100)
    const artifactUtilization = this._scoreArtifactUtilization(artifactManifests);

    // Overall quality (weighted average)
    const overallQuality = Math.round(
      (objectiveClarity * 0.4) +
      (dataRelevance * 0.3) +
      (artifactUtilization * 0.3)
    );

    return {
      objectiveClarity,
      dataRelevance,
      artifactUtilization,
      overallQuality,
      meetsWarningThreshold: overallQuality >= this.WARNING_THRESHOLD,
      meetsPassThreshold: overallQuality >= this.PASS_THRESHOLD
    };
  }

  /**
   * Score objective clarity (0-100)
   * Optimal: 5-20 words, clear and specific
   * 
   * @private
   * @param {string} objective - Task objective
   * @returns {number} Clarity score 0-100
   */
  _scoreObjectiveClarity(objective) {
    if (!objective || objective.trim().length === 0) {
      return 0;
    }

    const words = objective.trim().split(/\s+/);
    const wordCount = words.length;

    let score = 50; // Base score

    // Word count scoring (optimal 5-20 words)
    if (wordCount >= this.OPTIMAL_OBJECTIVE_MIN_WORDS && 
        wordCount <= this.OPTIMAL_OBJECTIVE_MAX_WORDS) {
      score += 30; // Optimal length
    } else if (wordCount < this.OPTIMAL_OBJECTIVE_MIN_WORDS) {
      score -= (this.OPTIMAL_OBJECTIVE_MIN_WORDS - wordCount) * 5; // Too short
    } else {
      score -= (wordCount - this.OPTIMAL_OBJECTIVE_MAX_WORDS) * 2; // Too long
    }

    // Specificity scoring
    const hasAction = /\b(analyze|design|test|document|implement|debug|review|optimize)\b/i.test(objective);
    const hasTarget = /\b(code|architecture|tests|documentation|module|component|system)\b/i.test(objective);
    
    if (hasAction) score += 10;
    if (hasTarget) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Score data relevance (0-100)
   * Checks for sanitized, non-empty, relevant data
   * 
   * @private
   * @param {object} essentialData - Essential data
   * @returns {number} Relevance score 0-100
   */
  _scoreDataRelevance(essentialData) {
    if (!essentialData || typeof essentialData !== 'object') {
      return 50; // Neutral score for no data
    }

    const keys = Object.keys(essentialData);
    
    if (keys.length === 0) {
      return 50; // Neutral score for empty object
    }

    let score = 60; // Base score for having data

    // Check for null/undefined/empty values
    const validValues = keys.filter(key => {
      const value = essentialData[key];
      return value !== null && 
             value !== undefined && 
             value !== '' &&
             !(Array.isArray(value) && value.length === 0);
    });

    const validRatio = validValues.length / keys.length;
    score += validRatio * 30; // Up to 30 points for valid data

    // Bonus for structured data
    const hasStructure = validValues.some(key => {
      const value = essentialData[key];
      return typeof value === 'object' || Array.isArray(value);
    });
    
    if (hasStructure) score += 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Score artifact utilization (0-100)
   * Checks for lightweight manifests (not full content)
   * 
   * @private
   * @param {Array} artifactManifests - Artifact manifest references
   * @returns {number} Utilization score 0-100
   */
  _scoreArtifactUtilization(artifactManifests) {
    if (!Array.isArray(artifactManifests)) {
      return 0;
    }

    if (artifactManifests.length === 0) {
      return 70; // Neutral-high score for no artifacts (may not need them)
    }

    let score = 50; // Base score

    // Check if manifests are lightweight (have artifactId, type, checksum)
    const validManifests = artifactManifests.filter(m => {
      return m && 
             m.artifactId && 
             m.type && 
             m.checksum &&
             !m.content; // Should NOT have full content
    });

    const validRatio = validManifests.length / artifactManifests.length;
    score += validRatio * 40; // Up to 40 points for valid manifests

    // Bonus for using manifests (not passing full content)
    if (validRatio === 1.0) {
      score += 10; // Perfect manifest usage
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Validate context package quality
   * Throws error if quality is too low
   * 
   * @param {object} contextPackage - Context package to validate
   * @throws {Error} If quality below warning threshold
   */
  validateQuality(contextPackage) {
    if (!contextPackage || !contextPackage.quality) {
      throw new Error('Invalid context package: missing quality scores');
    }

    const { quality } = contextPackage;

    if (quality.overallQuality < this.WARNING_THRESHOLD) {
      throw new Error(
        `Context quality too low (${quality.overallQuality}/100). ` +
        `Minimum: ${this.WARNING_THRESHOLD}. ` +
        `Issues: objectiveClarity=${quality.objectiveClarity}, ` +
        `dataRelevance=${quality.dataRelevance}, ` +
        `artifactUtilization=${quality.artifactUtilization}`
      );
    }

    if (quality.overallQuality < this.PASS_THRESHOLD) {
      console.warn(
        `⚠️ Context quality below pass threshold (${quality.overallQuality}/100). ` +
        `Recommended: ${this.PASS_THRESHOLD}+`
      );
    }

    return true;
  }
}
