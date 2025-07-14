// src/parsers/xd-parser.ts
import * as fs from 'fs/promises';
import JSZip from 'jszip';

export interface XDArtboard {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  elements: XDElement[];
}

export interface XDElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'text' | 'group' | 'component';
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children?: XDElement[];
  text?: string;
  fill?: string;
  stroke?: string;
}

export interface XDColor {
  value: string;
  name?: string;
}

export interface XDComponent {
  id: string;
  name: string;
  elements: XDElement[];
}

export interface XDDocument {
  name: string;
  artboards: XDArtboard[];
  colors: XDColor[];
  components: XDComponent[];
}

export class XDParser {
  async parseDocument(filePath: string): Promise<XDDocument> {
    const data = await fs.readFile(filePath);
    const zip = await JSZip.loadAsync(data);
    
    // Read manifest
    const manifestFile = zip.file('manifest');
    if (!manifestFile) {
      throw new Error('Invalid XD file: no manifest found');
    }
    
    const manifestContent = await manifestFile.async('string');
    const manifest = JSON.parse(manifestContent);
    
    // Read artwork
    const artworkFile = zip.file('artwork.agc');
    if (!artworkFile) {
      throw new Error('Invalid XD file: no artwork found');
    }
    
    const artworkContent = await artworkFile.async('string');
    const artwork = JSON.parse(artworkContent);
    
    // Parse the document
    const artboards = this.parseArtboards(artwork);
    const colors = this.extractColors(artwork);
    const components = this.parseComponents(artwork);
    
    return {
      name: manifest.name || 'Untitled',
      artboards,
      colors,
      components
    };
  }
  
  private parseArtboards(artwork: any): XDArtboard[] {
    const artboards: XDArtboard[] = [];
    
    if (artwork.children) {
      for (const child of artwork.children) {
        if (child.type === 'artboard') {
          artboards.push({
            id: child.id,
            name: child.name || 'Untitled Artboard',
            x: child.transform?.tx || 0,
            y: child.transform?.ty || 0,
            width: child.width || 0,
            height: child.height || 0,
            elements: this.parseElements(child.children || [])
          });
        }
      }
    }
    
    return artboards;
  }
  
  private parseElements(children: any[]): XDElement[] {
    const elements: XDElement[] = [];
    
    for (const child of children) {
      const element: XDElement = {
        id: child.id,
        type: this.mapElementType(child.type),
        name: child.name,
        x: child.transform?.tx || 0,
        y: child.transform?.ty || 0,
        width: child.width || 0,
        height: child.height || 0
      };
      
      // Add type-specific properties
      if (child.type === 'text') {
        element.text = child.text?.rawText || '';
      }
      
      if (child.fill?.color) {
        element.fill = this.colorToHex(child.fill.color);
      }
      
      if (child.stroke?.color) {
        element.stroke = this.colorToHex(child.stroke.color);
      }
      
      // Parse children recursively
      if (child.children && child.children.length > 0) {
        element.children = this.parseElements(child.children);
      }
      
      elements.push(element);
    }
    
    return elements;
  }
  
  private mapElementType(xdType: string): XDElement['type'] {
    const typeMap: { [key: string]: XDElement['type'] } = {
      'shape': 'rectangle',
      'rect': 'rectangle',
      'ellipse': 'ellipse',
      'text': 'text',
      'group': 'group',
      'component': 'component'
    };
    
    return typeMap[xdType] || 'group';
  }
  
  private extractColors(artwork: any): XDColor[] {
    const colors: XDColor[] = [];
    const colorSet = new Set<string>();
    
    const findColors = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (obj.fill?.color) {
        const hex = this.colorToHex(obj.fill.color);
        if (!colorSet.has(hex)) {
          colorSet.add(hex);
          colors.push({ value: hex });
        }
      }
      
      if (obj.stroke?.color) {
        const hex = this.colorToHex(obj.stroke.color);
        if (!colorSet.has(hex)) {
          colorSet.add(hex);
          colors.push({ value: hex });
        }
      }
      
      // Recurse
      if (Array.isArray(obj)) {
        obj.forEach(findColors);
      } else {
        Object.values(obj).forEach(findColors);
      }
    };
    
    findColors(artwork);
    return colors;
  }
  
  private parseComponents(artwork: any): XDComponent[] {
    const components: XDComponent[] = [];
    
    // In XD, components are stored in a special section
    if (artwork.resources?.components) {
      for (const [id, component] of Object.entries(artwork.resources.components)) {
        components.push({
          id,
          name: (component as any).name || 'Untitled Component',
          elements: this.parseElements((component as any).children || [])
        });
      }
    }
    
    return components;
  }
  
  private colorToHex(color: any): string {
    if (!color) return '#000000';
    
    const r = Math.round((color.r || 0) * 255);
    const g = Math.round((color.g || 0) * 255);
    const b = Math.round((color.b || 0) * 255);
    
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}
