// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { XDTools } from './tools/xd-tools';

const server = new Server(
  {
    name: 'adobe-xd-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const xdTools = new XDTools();

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_xd_info',
        description: 'Get information about an Adobe XD document including artboards, colors, and components',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the XD document (local file path or Adobe XD web specs URL)',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'generate_react_component',
        description: 'Generate React components from XD artboards or components',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the XD document (local file path or Adobe XD web specs URL)',
            },
            artboardName: {
              type: 'string',
              description: 'Name of specific artboard to generate (optional)',
            },
            componentName: {
              type: 'string',
              description: 'Name of specific component to generate (optional)',
            },
            outputDir: {
              type: 'string',
              description: 'Output directory for generated files (defaults to XD file location)',
            },
            styleSystem: {
              type: 'string',
              enum: ['styled-components', 'tailwind', 'css-modules'],
              description: 'CSS system to use (default: tailwind)',
            },
            typescript: {
              type: 'boolean',
              description: 'Generate TypeScript files (default: true)',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'extract_colors',
        description: 'Extract color palette from XD document',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the XD document (local file path or Adobe XD web specs URL)',
            },
            format: {
              type: 'string',
              enum: ['css', 'json', 'tailwind'],
              description: 'Output format (default: css)',
            },
            outputFile: {
              type: 'string',
              description: 'File to save output to (optional)',
            },
          },
          required: ['path'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    
    switch (name) {
      case 'get_xd_info':
        if (!args || typeof args !== 'object' || !('path' in args)) {
          throw new Error('Invalid arguments: path is required');
        }
        result = await xdTools.getDocumentInfo(args as { path: string });
        break;
      
      case 'generate_react_component':
        if (!args || typeof args !== 'object' || !('path' in args)) {
          throw new Error('Invalid arguments: path is required');
        }
        result = await xdTools.generateReactComponent(args as { 
          path: string; 
          artboardName?: string; 
          componentName?: string; 
          outputDir?: string; 
          styleSystem?: "styled-components" | "tailwind" | "css-modules"; 
          typescript?: boolean;
        });
        break;
      
      case 'extract_colors':
        if (!args || typeof args !== 'object' || !('path' in args)) {
          throw new Error('Invalid arguments: path is required');
        }
        result = await xdTools.extractColors(args as { 
          path: string; 
          format?: "tailwind" | "css" | "json"; 
          outputFile?: string;
        });
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);
console.error('Adobe XD MCP server started');
