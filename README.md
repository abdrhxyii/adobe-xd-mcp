# Adobe XD MCP Server

A Model Context Protocol (MCP) server that enables Claude to interact with Adobe XD files, extract design information, and generate React components from your designs.

## Features

- **Document Analysis**: Extract comprehensive information from XD files (local `.xd` files or web share URLs) including artboards, components, and assets
- **Web URL Support**: Work directly with Adobe XD web share links (specs URLs) - no need to download files
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

### Claude Desktop

#### macOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

#### Windows
Edit: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "adobe-xd": {
      "command": "node",
      "args": ["C:\\Users\\abdur\\Documents\\IT Projects\\Lyzant\\Commerce\\Synergic Software\\adobe-xd-mcp\\dist\\index.js"]
    }
  }
}
```

### Cursor IDE

Cursor IDE requires MCP servers to be configured through its settings:

1. **Open Cursor Settings**:
   - Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Or navigate to: File → Preferences → Settings

2. **Search for "MCP"** in the settings search bar

3. **Add MCP Server Configuration**:
   - Look for "MCP Servers" or "Model Context Protocol" settings
   - Click "Add" or "Edit" to add a new server
   - Use the following configuration:

```json
{
  "name": "adobe-xd",
  "command": "node",
  "args": ["C:\\Users\\abdur\\Documents\\IT Projects\\Lyzant\\Commerce\\Synergic Software\\adobe-xd-mcp\\dist\\index.js"]
}
```

**Alternative**: If Cursor uses a configuration file, it may be located at:
- Windows: `%APPDATA%\Cursor\User\settings.json` or `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\settings.json`

**Note**: Replace the path with your actual installation directory path. Use forward slashes `/` or escaped backslashes `\\` in JSON paths.

## Usage

After configuring and restarting Claude Desktop, you can use the following commands:

### Get XD Document Information

Ask Claude to analyze your XD file (local file or web URL):
```
"Get information about the XD file at /path/to/your/design.xd"
"Get information about the XD design at https://xd.adobe.com/view/82c81c10-0103-4445-b1f0-5db805a92e64-d79b/specs/"
```

This returns:
- Document name and dimensions
- List of artboards with sizes
- Components and their element counts

**Note**: You can use either local `.xd` file paths or Adobe XD web share URLs (specs links).

### Generate React Components

Convert XD designs to React components (from local files or web URLs):
```
"Generate a React component from the LoginScreen artboard in /path/to/design.xd"
"Generate React components from https://xd.adobe.com/view/82c81c10-0103-4445-b1f0-5db805a92e64-d79b/specs/"
```

Options:
- `artboardName`: Specific artboard to convert (optional)
- `componentName`: Custom component name (optional)
- `outputDir`: Output directory (optional, defaults to ./generated for web URLs, or file directory for local files)
- `styleSystem`: Choose from "styled-components", "tailwind", or "css-modules"
- `typescript`: Generate TypeScript components (true/false)

### Extract Colors

Extract color palettes from your designs (from local files or web URLs):
```
"Extract colors from /path/to/design.xd and save as CSS variables"
"Extract colors from https://xd.adobe.com/view/82c81c10-0103-4445-b1f0-5db805a92e64-d79b/specs/ in Tailwind format"
```

Options:
- `format`: Output format - "css", "json", or "tailwind"
- `outputFile`: Save to file instead of displaying output

## Examples

### Example 1: Generate a TypeScript React component with Tailwind (from local file)
```
"Generate a React component from the Header artboard in design.xd using TypeScript and Tailwind CSS"
```

### Example 2: Generate components from Adobe XD web specs
```
"Generate React components from https://xd.adobe.com/view/82c81c10-0103-4445-b1f0-5db805a92e64-d79b/specs/ using Tailwind CSS"
```

### Example 3: Extract colors as Tailwind config
```
"Extract colors from design.xd in Tailwind format and save to colors.js"
"Extract colors from https://xd.adobe.com/view/82c81c10-0103-4445-b1f0-5db805a92e64-d79b/specs/ in Tailwind format"
```

### Example 4: Get overview of all components
```
"Show me all components in my design system at /designs/system.xd"
"Get information about the XD design at https://xd.adobe.com/view/82c81c10-0103-4445-b1f0-5db805a92e64-d79b/specs/"
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