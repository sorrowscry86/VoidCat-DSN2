#!/usr/bin/env node

/**
 * VoidCat-DSN v2.0 - MCP Server
 * Model Context Protocol server for Claude Desktop/Code integration
 * 
 * Provides 9 standardized tools for interacting with the Sanctuary Network:
 * - sanctuary_health_check: Network status
 * - sanctuary_beta_analyze: Code analysis & security (Beta)
 * - sanctuary_gamma_design: Architecture & design (Gamma)
 * - sanctuary_delta_test: Testing & QA (Delta)
 * - sanctuary_sigma_document: Documentation (Sigma)
 * - sanctuary_omega_orchestrate: Multi-clone workflows (Omega)
 * - sanctuary_store_artifact: Store work products
 * - sanctuary_get_artifact: Retrieve artifacts
 * - sanctuary_audit_log: View audit trail
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const CLONE_PORTS = {
  omega: 3000,
  beta: 3002,
  gamma: 3003,
  delta: 3004,
  sigma: 3005
};

export class SanctuaryMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sanctuary-network',
        version: '2.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools()
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) =>
      this.handleToolCall(request)
    );
  }

  getTools() {
    return [
      {
        name: 'sanctuary_health_check',
        description: 'Check health status of all clones in the Sanctuary Network',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'sanctuary_beta_analyze',
        description: 'Submit code for security analysis and debugging to Beta Clone',
        inputSchema: {
          type: 'object',
          properties: {
            code: { 
              type: 'string', 
              description: 'Code to analyze' 
            },
            language: { 
              type: 'string', 
              description: 'Programming language (e.g., JavaScript, Python)' 
            },
            context: { 
              type: 'string', 
              description: 'Additional context or specific concerns' 
            }
          },
          required: ['code']
        }
      },
      {
        name: 'sanctuary_gamma_design',
        description: 'Request system architecture design from Gamma Clone',
        inputSchema: {
          type: 'object',
          properties: {
            requirements: { 
              type: 'string', 
              description: 'System requirements and goals' 
            },
            constraints: { 
              type: 'string', 
              description: 'Technical constraints or limitations' 
            }
          },
          required: ['requirements']
        }
      },
      {
        name: 'sanctuary_delta_test',
        description: 'Request test strategy and test generation from Delta Clone',
        inputSchema: {
          type: 'object',
          properties: {
            code: { 
              type: 'string', 
              description: 'Code to generate tests for' 
            },
            testFramework: { 
              type: 'string', 
              description: 'Test framework (e.g., mocha, jest, pytest)' 
            },
            context: { 
              type: 'string', 
              description: 'Additional context' 
            }
          },
          required: ['code']
        }
      },
      {
        name: 'sanctuary_sigma_document',
        description: 'Request documentation generation from Sigma Clone',
        inputSchema: {
          type: 'object',
          properties: {
            content: { 
              type: 'string', 
              description: 'Code or system to document' 
            },
            format: { 
              type: 'string', 
              description: 'Documentation format (e.g., markdown, jsdoc)' 
            }
          },
          required: ['content']
        }
      },
      {
        name: 'sanctuary_omega_orchestrate',
        description: 'Orchestrate multi-clone workflow via Omega Coordinator',
        inputSchema: {
          type: 'object',
          properties: {
            objective: { 
              type: 'string', 
              description: 'Clear objective for the workflow (5-20 words optimal)' 
            },
            targetClone: { 
              type: 'string', 
              description: 'Target clone name (beta, gamma, delta, sigma)' 
            },
            essentialData: { 
              type: 'object', 
              description: 'Essential data for the task' 
            }
          },
          required: ['objective', 'targetClone']
        }
      },
      {
        name: 'sanctuary_store_artifact',
        description: 'Store work product as artifact with SHA-256 checksum',
        inputSchema: {
          type: 'object',
          properties: {
            type: { 
              type: 'string', 
              description: 'Artifact type (code, documentation, schema, configuration)' 
            },
            content: { 
              type: 'string', 
              description: 'Artifact content' 
            },
            metadata: { 
              type: 'object', 
              description: 'Additional metadata' 
            }
          },
          required: ['type', 'content']
        }
      },
      {
        name: 'sanctuary_get_artifact',
        description: 'Retrieve artifact by ID',
        inputSchema: {
          type: 'object',
          properties: {
            artifactId: { 
              type: 'string', 
              description: 'Artifact UUID' 
            },
            manifestOnly: { 
              type: 'boolean', 
              description: 'Return only manifest (no content)' 
            }
          },
          required: ['artifactId']
        }
      },
      {
        name: 'sanctuary_audit_log',
        description: 'Get audit trail for clone operations',
        inputSchema: {
          type: 'object',
          properties: {
            clone: { 
              type: 'string', 
              description: 'Clone name (omega, beta, gamma, delta, sigma)' 
            },
            limit: { 
              type: 'number', 
              description: 'Number of recent entries to retrieve' 
            }
          },
          required: ['clone']
        }
      }
    ];
  }

  async handleToolCall(request) {
    // Validate request structure
    if (!request?.params) {
      return {
        content: [{
          type: 'text',
          text: 'Error: Invalid request - missing params'
        }],
        isError: true
      };
    }
    
    if (!request.params.name) {
      return {
        content: [{
          type: 'text',
          text: 'Error: Invalid request - missing tool name'
        }],
        isError: true
      };
    }
    
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'sanctuary_health_check':
          return await this.healthCheck();
        case 'sanctuary_beta_analyze':
          return await this.callBetaAnalyze(args);
        case 'sanctuary_gamma_design':
          return await this.callGammaDesign(args);
        case 'sanctuary_delta_test':
          return await this.callDeltaTest(args);
        case 'sanctuary_sigma_document':
          return await this.callSigmaDocument(args);
        case 'sanctuary_omega_orchestrate':
          return await this.callOmegaOrchestrate(args);
        case 'sanctuary_store_artifact':
          return await this.storeArtifact(args);
        case 'sanctuary_get_artifact':
          return await this.getArtifact(args);
        case 'sanctuary_audit_log':
          return await this.getAuditLog(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  }

  async healthCheck() {
    const results = [];
    
    for (const [name, port] of Object.entries(CLONE_PORTS)) {
      try {
        const response = await axios.get(
          `http://localhost:${port}/health`,
          { timeout: 5000 }
        );
        results.push({
          clone: name,
          port,
          healthy: true,
          status: response.data.status,
          uptime: response.data.metrics?.uptime || 0
        });
      } catch (error) {
        results.push({
          clone: name,
          port,
          healthy: false,
          error: error.code === 'ECONNREFUSED' ? 'Not running' : error.message
        });
      }
    }

    const healthy = results.filter(r => r.healthy).length;
    const total = results.length;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          summary: `${healthy}/${total} clones healthy`,
          clones: results
        }, null, 2)
      }]
    };
  }

  async callBetaAnalyze(args) {
    const response = await axios.post(
      `http://localhost:${CLONE_PORTS.beta}/analyze`,
      {
        code: args.code,
        language: args.language,
        context: args.context
      },
      { timeout: 30000 }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async callGammaDesign(args) {
    const response = await axios.post(
      `http://localhost:${CLONE_PORTS.gamma}/design`,
      {
        requirements: args.requirements,
        constraints: args.constraints
      },
      { timeout: 30000 }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async callDeltaTest(args) {
    const response = await axios.post(
      `http://localhost:${CLONE_PORTS.delta}/generate-tests`,
      {
        code: args.code,
        testFramework: args.testFramework,
        context: args.context
      },
      { timeout: 30000 }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async callSigmaDocument(args) {
    const response = await axios.post(
      `http://localhost:${CLONE_PORTS.sigma}/document`,
      {
        content: args.content,
        format: args.format
      },
      { timeout: 30000 }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async callOmegaOrchestrate(args) {
    const response = await axios.post(
      `http://localhost:${CLONE_PORTS.omega}/orchestrate`,
      {
        objective: args.objective,
        targetClone: args.targetClone,
        essentialData: args.essentialData
      },
      { timeout: 60000 }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async storeArtifact(args) {
    const response = await axios.post(
      `http://localhost:${CLONE_PORTS.omega}/artifacts`,
      {
        type: args.type,
        content: args.content,
        metadata: args.metadata
      },
      { timeout: 10000 }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async getArtifact(args) {
    const url = `http://localhost:${CLONE_PORTS.omega}/artifacts/${args.artifactId}`;
    const params = args.manifestOnly ? { manifestOnly: 'true' } : {};

    const response = await axios.get(url, { params, timeout: 10000 });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async getAuditLog(args) {
    // Note: This endpoint may need to be implemented in clones
    const port = CLONE_PORTS[args.clone] || CLONE_PORTS.omega;
    const url = `http://localhost:${port}/audit`;
    const params = args.limit ? { limit: args.limit } : {};

    const response = await axios.get(url, { params, timeout: 10000 });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.data, null, 2)
      }]
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sanctuary MCP Server v2.0.0 running on stdio');
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new SanctuaryMCPServer();
  server.start().catch(error => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}
