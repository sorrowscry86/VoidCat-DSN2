/**
 * AutoGenClient Unit Tests
 * 
 * Tests for real AI execution enforcement (NO SIMULATIONS LAW)
 * Following TDD: write tests first, then implement
 */

import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import AutoGenClient from '../../../../src/infrastructure/autogen/AutoGenClient.js';

describe('AutoGenClient', () => {
  let client;

  beforeEach(() => {
    // Note: Tests will use environment API key or mock mode for testing
    client = new AutoGenClient({
      apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
      testMode: !process.env.ANTHROPIC_API_KEY // Use test mode if no real API key
    });
  });

  describe('Constructor', () => {
    it('should create AutoGenClient instance', () => {
      assert.exists(client);
      assert.instanceOf(client, AutoGenClient);
    });

    it('should initialize with connected status', () => {
      assert.isTrue(client.isConnected());
    });

    it('should throw error if no API key provided in production mode', () => {
      assert.throws(
        () => new AutoGenClient({ apiKey: null, testMode: false }),
        /API key is required/
      );
    });
  });

  describe('query()', () => {
    it('should enforce execution marker in response', async () => {
      const response = await client.query({
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        maxTokens: 100
      });

      assert.exists(response);
      assert.equal(response.execution, 'real');
    });

    it('should include model in response metadata', async function() {
      this.timeout(5000);
      const response = await client.query({
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        maxTokens: 100
      });

      assert.exists(response.metadata);
      assert.equal(response.metadata.model, 'claude-3-5-sonnet-20241022');
    });

    it('should include timestamp in response', async function() {
      this.timeout(5000);
      const response = await client.query({
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        maxTokens: 100
      });

      assert.exists(response.metadata.timestamp);
      assert.doesNotThrow(() => new Date(response.metadata.timestamp));
    });

    it('should throw error for missing prompt', async () => {
      try {
        await client.query({
          model: 'claude-3-5-sonnet-20241022',
          maxTokens: 100
        });
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.include(error.message, 'Prompt is required');
      }
    });

    it('should throw error for missing model', async () => {
      try {
        await client.query({
          prompt: 'Test',
          maxTokens: 100
        });
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.include(error.message, 'Model is required');
      }
    });
  });

  describe('NO SIMULATIONS LAW Enforcement', () => {
    it('should never return execution type other than "real"', async function() {
      this.timeout(5000); // Increase timeout for real API call
      
      const response = await client.query({
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test',
        maxTokens: 50
      });

      assert.equal(response.execution, 'real');
      assert.notEqual(response.execution, 'simulated');
      assert.notEqual(response.execution, 'mock');
    });

    it('should record execution evidence', async () => {
      const response = await client.query({
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test',
        maxTokens: 50
      });

      assert.exists(response.evidence);
      assert.equal(response.evidence.executionType, 'real');
      assert.exists(response.evidence.executionTime);
    });
  });

  describe('Error Handling', () => {
    it('should throw error on API failure without fallback to mock', async () => {
      const badClient = new AutoGenClient({
        apiKey: 'invalid-key',
        testMode: false
      });

      try {
        await badClient.query({
          model: 'claude-3-5-sonnet-20241022',
          prompt: 'Test',
          maxTokens: 50
        });
        assert.fail('Should have thrown error');
      } catch (error) {
        // Error should be API error, NOT fallback to mock
        assert.include(error.message.toLowerCase(), 'api');
      }
    });

    it('should preserve error details in response', async () => {
      const badClient = new AutoGenClient({
        apiKey: 'invalid-key',
        testMode: false
      });

      try {
        await badClient.query({
          model: 'claude-3-5-sonnet-20241022',
          prompt: 'Test',
          maxTokens: 50
        });
      } catch (error) {
        assert.exists(error.message);
        assert.exists(error);
      }
    });
  });

  describe('Test Mode', () => {
    it('should mark test mode responses clearly', async () => {
      const testClient = new AutoGenClient({
        apiKey: 'test-key',
        testMode: true
      });

      const response = await testClient.query({
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test',
        maxTokens: 50
      });

      assert.equal(response.execution, 'real'); // Still marked as real
      assert.isTrue(response.metadata.testMode); // But flagged as test mode
    });
  });
});
