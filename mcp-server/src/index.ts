#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TestCaseStorage } from './storage.js';
import { TestStep } from './types.js';

const server = new Server(
  {
    name: 'case-harbor-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize storage
const storage = new TestCaseStorage();

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_test_case',
        description: 'Create a new test case',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Test case title' },
            description: { type: 'string', description: 'Test case description' },
            preconditions: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of preconditions'
            },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  expectedResult: { type: 'string' }
                },
                required: ['action', 'expectedResult']
              },
              description: 'Test steps'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization'
            }
          },
          required: ['title']
        }
      },
      {
        name: 'list_test_cases',
        description: 'List all test cases',
        inputSchema: {
          type: 'object',
          properties: {
            tag: { type: 'string', description: 'Filter by tag (optional)' }
          }
        }
      },
      {
        name: 'get_test_case',
        description: 'Get a specific test case by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Test case ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'update_test_case',
        description: 'Update an existing test case',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Test case ID' },
            title: { type: 'string', description: 'Test case title' },
            description: { type: 'string', description: 'Test case description' },
            preconditions: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of preconditions'
            },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  expectedResult: { type: 'string' }
                },
                required: ['action', 'expectedResult']
              },
              description: 'Test steps'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorization'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'delete_test_case',
        description: 'Delete a test case',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Test case ID' }
          },
          required: ['id']
        }
      }
    ]
  };
});

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
    case 'create_test_case': {
      const testCase = await storage.createTestCase({
        title: args.title as string,
        description: (args.description as string) || '',
        preconditions: (args.preconditions as string[]) || [],
        steps: (args.steps as TestStep[]) || [],
        tags: (args.tags as string[]) || []
      });
        
      return {
        content: [
          {
            type: 'text',
            text: `Test case created successfully!\n\nID: ${testCase.id}\nTitle: ${testCase.title}\nSteps: ${testCase.steps.length}`
          }
        ]
      };
    }

    case 'list_test_cases': {
      const testCases = await storage.getAllTestCases();
      const filtered = args.tag 
        ? testCases.filter(tc => tc.tags.includes(args.tag as string))
        : testCases;

      const summary = filtered.map(tc => 
        `- ${tc.title} (${tc.id}) - ${tc.steps.length} steps [${tc.tags.join(', ')}]`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${filtered.length} test cases:\n\n${summary}`
          }
        ]
      };
    }

    case 'get_test_case': {
      const testCase = await storage.getTestCase(args.id as string);
      if (!testCase) {
        return {
          content: [
            {
              type: 'text',
              text: `Test case with ID ${args.id} not found.`
            }
          ]
        };
      }

      const details = [
        `# ${testCase.title}`,
        '',
        `**ID:** ${testCase.id}`,
        `**Description:** ${testCase.description}`,
        '',
        '## Preconditions',
        testCase.preconditions.map(p => `- ${p}`).join('\n'),
        '',
        '## Steps',
        testCase.steps.map((s, i) => `${i + 1}. ${s.action} → ${s.expectedResult}`).join('\n'),
        '',
        `**Tags:** ${testCase.tags.join(', ')}`,
        `**Created:** ${testCase.createdAt}`,
        `**Updated:** ${testCase.updatedAt}`
      ].join('\n');

      return {
        content: [
          {
            type: 'text',
            text: details
          }
        ]
      };
    }

    case 'update_test_case': {
      const updated = await storage.updateTestCase(args.id as string, {
        title: args.title as string,
        description: args.description as string,
        preconditions: args.preconditions as string[],
        steps: args.steps as TestStep[],
        tags: args.tags as string[]
      });

      if (!updated) {
        return {
          content: [
            {
              type: 'text',
              text: `Test case with ID ${args.id} not found.`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Test case updated successfully!\n\nID: ${updated.id}\nTitle: ${updated.title}`
          }
        ]
      };
    }

    case 'delete_test_case': {
      const deleted = await storage.deleteTestCase(args.id as string);
      if (!deleted) {
        return {
          content: [
            {
              type: 'text',
              text: `Test case with ID ${args.id} not found.`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Test case ${args.id} deleted successfully.`
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CaseHarbor MCP Server running...');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});