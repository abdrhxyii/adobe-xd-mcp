// src/tools/xd-tools.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { XDParser } from '../parsers/xd-parser';
import { ReactGenerator, GeneratorOptions } from '../generators/react-generator';

export class XDTools {
  private parser: XDParser;
  
  constructor() {
    this.parser = new XDParser();
  }
  
  async getDocumentInfo(args: { path: string }) {
    try {
      const doc = await this.parser.parseDocument(args.path);
      
      return {
        success: true,
        info: {
          name: doc.name,
          artboardCount: doc.artboards.length,
          artboards: doc.artboards.map(a => ({
            id: a.id,
            name: a.name,
            width: a.width,
            height: a.height,
            elementCount: a.elements.length
          })),
          colorCount: doc.colors.length,
          colors: doc.colors,
          componentCount: doc.components.length,
          components: doc.components.map(c => ({
            id: c.id,
            name: c.name,
            elementCount: c.elements.length
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  async generateReactComponent(args: {
    path: string;
    artboardName?: string;
    componentName?: string;
    outputDir?: string;
    styleSystem?: 'styled-components' | 'tailwind' | 'css-modules';
    typescript?: boolean;
  }) {
    try {
      const doc = await this.parser.parseDocument(args.path);
      
      const options: GeneratorOptions = {
        styleSystem: args.styleSystem || 'tailwind',
        typescript: args.typescript !== false
      };
      
      const generator = new ReactGenerator(options);
      const outputDir = args.outputDir || path.dirname(args.path);
      
      let generated = 0;
      
      // Generate from specific artboard
      if (args.artboardName) {
        const artboard = doc.artboards.find(
          a => a.name.toLowerCase() === args.artboardName!.toLowerCase()
        );
        
        if (!artboard) {
          return {
            success: false,
            error: `Artboard "${args.artboardName}" not found`
          };
        }
        
        const code = generator.generateFromArtboard(artboard);
        const fileName = `${this.toPascalCase(artboard.name)}.${options.typescript ? 'tsx' : 'jsx'}`;
        const filePath = path.join(outputDir, fileName);
        
        await fs.writeFile(filePath, code, 'utf-8');
        generated = 1;
        
        return {
          success: true,
          generated,
          files: [filePath]
        };
      }
      
      // Generate from specific component
      if (args.componentName) {
        const component = doc.components.find(
          c => c.name.toLowerCase() === args.componentName!.toLowerCase()
        );
        
        if (!component) {
          return {
            success: false,
            error: `Component "${args.componentName}" not found`
          };
        }
        
        const code = generator.generateFromComponent(component);
        const fileName = `${this.toPascalCase(component.name)}.${options.typescript ? 'tsx' : 'jsx'}`;
        const filePath = path.join(outputDir, fileName);
        
        await fs.writeFile(filePath, code, 'utf-8');
        generated = 1;
        
        return {
          success: true,
          generated,
          files: [filePath]
        };
      }
      
      // Generate all artboards
      const files: string[] = [];
      
      for (const artboard of doc.artboards) {
        const code = generator.generateFromArtboard(artboard);
        const fileName = `${this.toPascalCase(artboard.name)}.${options.typescript ? 'tsx' : 'jsx'}`;
        const filePath = path.join(outputDir, fileName);
        
        await fs.writeFile(filePath, code, 'utf-8');
        files.push(filePath);
        generated++;
      }
      
      return {
        success: true,
        generated,
        files
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  async extractColors(args: {
    path: string;
    format?: 'css' | 'json' | 'tailwind';
    outputFile?: string;
  }) {
    try {
      const doc = await this.parser.parseDocument(args.path);
      
      if (doc.colors.length === 0) {
        return {
          success: true,
          message: 'No colors found in document',
          colors: []
        };
      }
      
      let output: string;
      const format = args.format || 'css';
      
      switch (format) {
        case 'css':
          output = this.generateCSSVariables(doc.colors);
          break;
        case 'tailwind':
          output = this.generateTailwindColors(doc.colors);
          break;
        case 'json':
          output = JSON.stringify(doc.colors, null, 2);
          break;
        default:
          output = JSON.stringify(doc.colors, null, 2);
      }
      
      if (args.outputFile) {
        await fs.writeFile(args.outputFile, output, 'utf-8');
      }
      
      return {
        success: true,
        format,
        colorCount: doc.colors.length,
        colors: doc.colors,
        output: args.outputFile ? `Written to ${args.outputFile}` : output
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  private generateCSSVariables(colors: Array<{ value: string; name?: string }>): string {
    const lines = [':root {'];
    
    colors.forEach((color, index) => {
      const varName = color.name 
        ? `--color-${this.toKebabCase(color.name)}`
        : `--color-${index + 1}`;
      lines.push(`  ${varName}: ${color.value};`);
    });
    
    lines.push('}');
    return lines.join('\n');
  }
  
  private generateTailwindColors(colors: Array<{ value: string; name?: string }>): string {
    const colorObj: any = {};
    
    colors.forEach((color, index) => {
      const name = color.name 
        ? this.toCamelCase(color.name)
        : `color${index + 1}`;
      colorObj[name] = color.value;
    });
    
    return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorObj, null, 6).replace(/\n/g, '\n      ')}
    }
  }
}`;
  }
  
  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, chr) => chr ? chr.toUpperCase() : '')
      .replace(/^(.)/, (_, chr) => chr.toUpperCase());
  }
  
  private toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, chr) => chr ? chr.toUpperCase() : '')
      .replace(/^(.)/, (_, chr) => chr.toLowerCase());
  }
  
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}
