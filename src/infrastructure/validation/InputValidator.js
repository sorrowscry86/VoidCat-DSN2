/**
 * Input Validation Utilities
 * 
 * Provides validation functions for clone endpoint inputs to prevent
 * injection attacks, DoS via large payloads, and invalid data processing.
 * 
 * Enforces NO SIMULATIONS LAW by ensuring real, valid inputs only.
 */

export class InputValidator {
  /**
   * Validate and sanitize a text input
   * 
   * @param {any} value - Value to validate
   * @param {object} options - Validation options
   * @param {string} options.fieldName - Name of the field (for error messages)
   * @param {boolean} options.required - Whether field is required
   * @param {number} options.maxLength - Maximum length (default: 50000)
   * @param {number} options.minLength - Minimum length (default: 0)
   * @returns {string} Validated string
   * @throws {Error} If validation fails
   */
  static validateString(value, options = {}) {
    const {
      fieldName = 'Field',
      required = true,
      maxLength = 50000,
      minLength = 0
    } = options;

    // Check required
    if (required && (value === undefined || value === null || value === '')) {
      throw new Error(`${fieldName} is required`);
    }

    // Allow empty if not required
    if (!required && (value === undefined || value === null || value === '')) {
      return '';
    }

    // Type check
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    // Length checks
    if (value.length < minLength) {
      throw new Error(`${fieldName} must be at least ${minLength} characters`);
    }

    if (value.length > maxLength) {
      throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
    }

    return value;
  }

  /**
   * Validate an object input
   * 
   * @param {any} value - Value to validate
   * @param {object} options - Validation options
   * @param {string} options.fieldName - Name of the field
   * @param {boolean} options.required - Whether field is required
   * @returns {object} Validated object
   * @throws {Error} If validation fails
   */
  static validateObject(value, options = {}) {
    const {
      fieldName = 'Field',
      required = true
    } = options;

    // Check required
    if (required && (value === undefined || value === null)) {
      throw new Error(`${fieldName} is required`);
    }

    // Allow empty if not required
    if (!required && (value === undefined || value === null)) {
      return {};
    }

    // Type check
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`${fieldName} must be an object`);
    }

    return value;
  }

  /**
   * Validate request body for /design endpoint (Gamma)
   * 
   * @param {object} body - Request body
   * @returns {object} Validated body
   * @throws {Error} If validation fails
   */
  static validateDesignRequest(body) {
    return {
      requirements: this.validateString(body.requirements, {
        fieldName: 'Requirements',
        required: true,
        minLength: 10,
        maxLength: 10000
      }),
      constraints: this.validateString(body.constraints, {
        fieldName: 'Constraints',
        required: false,
        maxLength: 5000
      }),
      context: this.validateObject(body.context, {
        fieldName: 'Context',
        required: false
      })
    };
  }

  /**
   * Validate request body for /generate-tests endpoint (Delta)
   * 
   * @param {object} body - Request body
   * @returns {object} Validated body
   * @throws {Error} If validation fails
   */
  static validateGenerateTestsRequest(body) {
    return {
      code: this.validateString(body.code, {
        fieldName: 'Code',
        required: true,
        minLength: 10,
        maxLength: 20000
      }),
      framework: this.validateString(body.framework, {
        fieldName: 'Framework',
        required: false,
        maxLength: 50
      }),
      context: this.validateObject(body.context, {
        fieldName: 'Context',
        required: false
      })
    };
  }

  /**
   * Validate request body for /document endpoint (Sigma)
   * 
   * @param {object} body - Request body
   * @returns {object} Validated body
   * @throws {Error} If validation fails
   */
  static validateDocumentRequest(body) {
    return {
      content: this.validateString(body.content, {
        fieldName: 'Content',
        required: true,
        minLength: 10,
        maxLength: 20000
      }),
      type: this.validateString(body.type, {
        fieldName: 'Type',
        required: false,
        maxLength: 50
      }),
      context: this.validateObject(body.context, {
        fieldName: 'Context',
        required: false
      })
    };
  }

  /**
   * Validate request body for /task endpoint (all clones)
   * 
   * @param {object} body - Request body
   * @returns {object} Validated body
   * @throws {Error} If validation fails
   */
  static validateTaskRequest(body) {
    return {
      prompt: this.validateString(body.prompt, {
        fieldName: 'Prompt',
        required: true,
        minLength: 1,
        maxLength: 20000
      }),
      context: this.validateObject(body.context, {
        fieldName: 'Context',
        required: false
      }),
      sessionId: body.sessionId ? this.validateString(body.sessionId, {
        fieldName: 'SessionId',
        required: false,
        maxLength: 200
      }) : undefined
    };
  }

  /**
   * Validate request body for /orchestrate endpoint (Omega)
   * 
   * @param {object} body - Request body
   * @returns {object} Validated body
   * @throws {Error} If validation fails
   */
  static validateOrchestrateRequest(body) {
    return {
      objective: this.validateString(body.objective, {
        fieldName: 'Objective',
        required: true,
        minLength: 5,
        maxLength: 5000
      }),
      targetClone: this.validateString(body.targetClone, {
        fieldName: 'TargetClone',
        required: true,
        maxLength: 50
      }),
      artifactManifests: Array.isArray(body.artifactManifests) ? body.artifactManifests : [],
      essentialData: this.validateObject(body.essentialData, {
        fieldName: 'EssentialData',
        required: false
      }),
      sessionId: body.sessionId ? this.validateString(body.sessionId, {
        fieldName: 'SessionId',
        required: false,
        maxLength: 200
      }) : undefined
    };
  }

  /**
   * Validate request body for /delegate endpoint (Omega)
   * 
   * @param {object} body - Request body
   * @returns {object} Validated body
   * @throws {Error} If validation fails
   */
  static validateDelegateRequest(body) {
    return {
      targetClone: this.validateString(body.targetClone, {
        fieldName: 'TargetClone',
        required: true,
        maxLength: 50
      }),
      prompt: this.validateString(body.prompt, {
        fieldName: 'Prompt',
        required: true,
        minLength: 1,
        maxLength: 20000
      }),
      context: this.validateObject(body.context, {
        fieldName: 'Context',
        required: false
      }),
      sessionId: body.sessionId ? this.validateString(body.sessionId, {
        fieldName: 'SessionId',
        required: false,
        maxLength: 200
      }) : undefined
    };
  }
}

export default InputValidator;
