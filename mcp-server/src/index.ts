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
        name: 'list_projects',
        description: 'List all projects',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'toggle_project',
        description: 'Create a project if it does not exist, or delete it if it exists',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Project ID' },
            name: { type: 'string', description: 'Project name (only used when creating)' }
          },
          required: ['id']
        }
      },
      {
        name: 'create_test_case',
        description: 'Create a new test case',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Project ID (optional)' },
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
        description: 'List all test cases or filter by project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Filter by project ID (optional)' },
            tag: { type: 'string', description: 'Filter by tag (optional)' }
          }
        }
      },
      {
        name: 'get_test_case',
        description: 'Get a specific test case by ID, optionally filtered by project',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Test case ID' },
            projectId: { type: 'string', description: 'Project ID (optional, for verification)' }
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
        description: 'Delete a test case, optionally filtered by project',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Test case ID' },
            projectId: { type: 'string', description: 'Project ID (optional, for verification)' }
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
    case 'list_projects': {
      const projects = await storage.getAllProjects();
      const summary = projects.length > 0 
        ? projects.map(p => `- ${p.name} (${p.id})`).join('\n')
        : 'No projects found.';

      return {
        content: [
          {
            type: 'text',
            text: `Found ${projects.length} projects:\n\n${summary}`
          }
        ]
      };
    }

    case 'toggle_project': {
      const result = await storage.toggleProject(args.id as string, args.name as string);
      
      if (result.action === 'created') {
        return {
          content: [
            {
              type: 'text',
              text: `Project created successfully!\n\nID: ${result.project!.id}\nName: ${result.project!.name}`
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `Project ${args.id} deleted successfully.`
            }
          ]
        };
      }
    }

    case 'create_test_case': {
      const testCase = await storage.createTestCase({
        projectId: args.projectId as string,
        title: args.title as string,
        description: (args.description as string) || '',
        preconditions: (args.preconditions as string[]) || [],
        steps: (args.steps as TestStep[]) || [],
        tags: (args.tags as string[]) || []
      });
        
      const projectInfo = testCase.projectId ? ` (Project: ${testCase.projectId})` : '';
      return {
        content: [
          {
            type: 'text',
            text: `Test case created successfully!\n\nID: ${testCase.id}\nTitle: ${testCase.title}${projectInfo}\nSteps: ${testCase.steps.length}`
          }
        ]
      };
    }

    case 'list_test_cases': {
      let testCases;
      if (args.projectId) {
        testCases = await storage.getTestCasesByProject(args.projectId as string);
      } else {
        testCases = await storage.getAllTestCases();
      }
      
      const filtered = args.tag 
        ? testCases.filter(tc => tc.tags.includes(args.tag as string))
        : testCases;

      const summary = filtered.map(tc => {
        const projectInfo = tc.projectId ? ` [Project: ${tc.projectId}]` : '';
        return `- ${tc.title} (${tc.id}) - ${tc.steps.length} steps [${tc.tags.join(', ')}]${projectInfo}`;
      }).join('\n');

      const filterInfo = args.projectId ? ` in project ${args.projectId}` : '';
      return {
        content: [
          {
            type: 'text',
            text: `Found ${filtered.length} test cases${filterInfo}:\n\n${summary}`
          }
        ]
      };
    }

    case 'get_test_case': {
      let testCase;
      if (args.projectId) {
        testCase = await storage.getTestCaseByProjectAndId(args.projectId as string, args.id as string);
      } else {
        testCase = await storage.getTestCase(args.id as string);
      }
      
      if (!testCase) {
        const notFoundMsg = args.projectId 
          ? `Test case with ID ${args.id} not found in project ${args.projectId}.`
          : `Test case with ID ${args.id} not found.`;
        return {
          content: [
            {
              type: 'text',
              text: notFoundMsg
            }
          ]
        };
      }

      const details = [
        `# ${testCase.title}`,
        '',
        `**ID:** ${testCase.id}`,
        testCase.projectId ? `**Project:** ${testCase.projectId}` : '',
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
      ].filter(line => line !== '').join('\n');

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
      let deleted;
      if (args.projectId) {
        deleted = await storage.deleteTestCaseByProjectAndId(args.projectId as string, args.id as string);
      } else {
        deleted = await storage.deleteTestCase(args.id as string);
      }
      
      if (!deleted) {
        const notFoundMsg = args.projectId 
          ? `Test case with ID ${args.id} not found in project ${args.projectId}.`
          : `Test case with ID ${args.id} not found.`;
        return {
          content: [
            {
              type: 'text',
              text: notFoundMsg
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