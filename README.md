# Adobe XD MCP Server

A Model Context Protocol (MCP) server that enables Claude to interact with Adobe XD files, extract design information, and generate React components from your designs.

## Features

- **Document Analysis**: Extract comprehensive information from XD files including artboards, components, and assets
- **React Component Generation**: Convert XD designs to React components with multiple styling options
- **Color Extraction**: Extract color palettes in various formats (CSS, JSON, Tailwind)
- **Multiple Style Systems**: Support for styled-components, Tailwind CSS, and CSS modules
- **TypeScript Support**: Generate type-safe React components

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Claude Desktop application

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/adobe-xd-mcp.git
cd adobe-xd-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Configuration

Add the server to your Claude Desktop configuration:

### macOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
Edit: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "adobe-xd": {
      "command": "node",
      "args": ["/absolute/path/to/adobe-xd-mcp/dist/index.js"]
    }
  }
}
```

**Note**: Replace `/absolute/path/to/adobe-xd-mcp` with the actual path to your installation directory.

## Usage

After configuring and restarting Claude Desktop, you can use the following commands:

### Get XD Document Information

Ask Claude to analyze your XD file:
```
"Get information about the XD file at /path/to/your/design.xd"
```

This returns:
- Document name and dimensions
- List of artboards with sizes
- Components and their element counts

### Generate React Components

Convert XD designs to React components:
```
"Generate a React component from the LoginScreen artboard in /path/to/design.xd"
```

Options:
- `artboardName`: Specific artboard to convert (optional)
- `componentName`: Custom component name (optional)
- `outputDir`: Output directory (optional, defaults to ./generated)
- `styleSystem`: Choose from "styled-components", "tailwind", or "css-modules"
- `typescript`: Generate TypeScript components (true/false)

### Extract Colors

Extract color palettes from your designs:
```
"Extract colors from /path/to/design.xd and save as CSS variables"
```

Options:
- `format`: Output format - "css", "json", or "tailwind"
- `outputFile`: Save to file instead of displaying output

## Examples

### Example 1: Generate a TypeScript React component with Tailwind
```
"Generate a React component from the Header artboard in design.xd using TypeScript and Tailwind CSS"
```

### Example 2: Extract colors as Tailwind config
```
"Extract colors from design.xd in Tailwind format and save to colors.js"
```

### Example 3: Get overview of all components
```
"Show me all components in my design system at /designs/system.xd"
```

## Development

### Project Structure
```
adobe-xd-mcp/
├── src/
│   ├── index.ts          # MCP server setup
│   └── tools/
│       └── xd-tools.ts   # XD processing logic
├── dist/                 # Compiled output
├── package.json
└── tsconfig.json
```

### Running in Development
```bash
npm run dev
```

### Building
```bash
npm run build
```

## Troubleshooting

### Server not appearing in Claude
1. Ensure the path in `claude_desktop_config.json` is absolute
2. Restart Claude Desktop after configuration changes
3. Check that the build completed successfully

### XD file parsing errors
1. Ensure the XD file path is correct and accessible
2. Verify the XD file is not corrupted
3. Check file permissions

### Component generation issues
1. Verify the artboard name exists in the XD file
2. Ensure the output directory is writable
3. Check for naming conflicts with existing files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.