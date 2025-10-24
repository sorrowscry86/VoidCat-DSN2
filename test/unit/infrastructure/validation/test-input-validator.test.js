/**
 * InputValidator Unit Tests
 */

import { describe, it } from 'mocha';
import { assert } from 'chai';
import InputValidator from '../../../../src/infrastructure/validation/InputValidator.js';

describe('InputValidator', () => {
  describe('validateString()', () => {
    it('should validate required string', () => {
      const s = InputValidator.validateString('hello', { fieldName: 'X', required: true, minLength: 1, maxLength: 10 });
      assert.equal(s, 'hello');
    });

    it('should allow empty when not required', () => {
      const s = InputValidator.validateString('', { fieldName: 'X', required: false });
      assert.equal(s, '');
    });

    it('should throw for missing required', () => {
      assert.throws(() => InputValidator.validateString('', { fieldName: 'X', required: true }), /X is required/);
    });

    it('should throw for type mismatch', () => {
      assert.throws(() => InputValidator.validateString(123, { fieldName: 'X' }), /X must be a string/);
    });

    it('should enforce minLength and maxLength', () => {
      assert.throws(() => InputValidator.validateString('a', { fieldName: 'X', minLength: 2 }), /at least 2/);
      assert.throws(() => InputValidator.validateString('abc', { fieldName: 'X', maxLength: 2 }), /maximum length of 2/);
    });
  });

  describe('validateObject()', () => {
    it('should validate object', () => {
      const obj = InputValidator.validateObject({ a: 1 }, { fieldName: 'Obj' });
      assert.deepEqual(obj, { a: 1 });
    });

    it('should allow empty object when not required', () => {
      const obj = InputValidator.validateObject(null, { fieldName: 'Obj', required: false });
      assert.deepEqual(obj, {});
    });

    it('should throw for missing required object', () => {
      assert.throws(() => InputValidator.validateObject(undefined, { fieldName: 'Obj', required: true }), /Obj is required/);
    });

    it('should throw for non-object types', () => {
      assert.throws(() => InputValidator.validateObject('x', { fieldName: 'Obj' }), /Obj must be an object/);
      assert.throws(() => InputValidator.validateObject([], { fieldName: 'Obj' }), /Obj must be an object/);
    });
  });

  describe('validateDesignRequest()', () => {
    it('should validate design request with optional fields', () => {
      const req = InputValidator.validateDesignRequest({
        requirements: 'Build a secure API with JWT',
        constraints: 'Must use Node.js',
        context: { focus: 'security' }
      });
      assert.equal(req.requirements.includes('secure API'), true);
      assert.equal(req.constraints.includes('Node.js'), true);
      assert.deepEqual(req.context, { focus: 'security' });
    });

    it('should require requirements with min length', () => {
      assert.throws(() => InputValidator.validateDesignRequest({ requirements: 'short' }), /at least 10/);
    });
  });

  describe('validateTaskRequest()', () => {
    it('should validate task request with optional sessionId', () => {
      const req = InputValidator.validateTaskRequest({ prompt: 'Do work', context: { a: 1 }, sessionId: 'sid' });
      assert.equal(req.prompt, 'Do work');
      assert.deepEqual(req.context, { a: 1 });
      assert.equal(req.sessionId, 'sid');
    });

    it('should reject missing prompt', () => {
      assert.throws(() => InputValidator.validateTaskRequest({ context: {} }), /Prompt is required/);
    });
  });

  describe('validateOrchestrateRequest()', () => {
    it('should validate orchestrate request and coerce arrays/objects', () => {
      const req = InputValidator.validateOrchestrateRequest({
        objective: 'Analyze system risks',
        targetClone: 'beta',
        artifactManifests: [{ artifactId: 'a', type: 'code' }],
        essentialData: { x: 1 },
        sessionId: 's1'
      });
      assert.equal(req.objective, 'Analyze system risks');
      assert.equal(req.targetClone, 'beta');
      assert.isArray(req.artifactManifests);
      assert.deepEqual(req.essentialData, { x: 1 });
      assert.equal(req.sessionId, 's1');
    });
  });

  describe('validateDelegateRequest()', () => {
    it('should validate delegate request', () => {
      const req = InputValidator.validateDelegateRequest({
        targetClone: 'gamma',
        prompt: 'Design this',
        context: { topic: 'arch' },
        sessionId: 'S2'
      });
      assert.equal(req.targetClone, 'gamma');
      assert.equal(req.prompt, 'Design this');
      assert.deepEqual(req.context, { topic: 'arch' });
      assert.equal(req.sessionId, 'S2');
    });
  });
});
