import { XDDocument, XDArtboard, XDElement, XDColor, XDComponent } from './xd-parser';
import { PrototypeData } from '../types/xd-data';

interface XDWebSpec {
  artboards?: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    elements?: any[];
  }>;
  colors?: Array<{
    value: string;
    name?: string;
  }>;
  components?: Array<{
    id: string;
    name: string;
    elements?: any[];
  }>;
}

export class XDWebParser {
  /**
   * Extract window.prototypeData from HTML
   */
  extractPrototypeData(html: string): PrototypeData | null {
    // Pattern to match: window.prototypeData = {...};
    const pattern = /window\.prototypeData\s*=\s*({.+?});(?:\s*if\s*\(|$)/s;
    const match = html.match(pattern);
    
    if (!match) {
      return null;
    }
    
    try {
      const jsonStr = match[1];
      const data = JSON.parse(jsonStr) as PrototypeData;
      return data;
    } catch (error) {
      console.error('Failed to parse prototypeData:', error);
      return null;
    }
  }
  
  /**
   * Fetch HTML from Adobe XD specs URL
   */
  async fetchSpecsPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://xd.adobe.com/'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch XD spec: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  }

  async parseWebSpec(url: string): Promise<XDDocument> {
    const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
    
    const html = await this.fetchSpecsPage(normalizedUrl);
    const specData = this.extractSpecData(html, normalizedUrl);
    
    let artboards = this.parseArtboards(specData);
    let colors = this.extractColors(specData);
    const components = this.parseComponents(specData);

    if (artboards.length === 0 && colors.length === 0) {
      const apiUrl = this.extractApiUrl(html, normalizedUrl);
      if (apiUrl) {
        try {
          const apiResponse = await fetch(apiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Referer': normalizedUrl
            }
          });
          
          if (apiResponse.ok) {
            const apiData = await apiResponse.json() as any;
            if (apiData?.artboards) artboards = this.parseArtboards({ artboards: apiData.artboards });
            if (apiData?.colors) colors = apiData.colors;
          }
        } catch (e) {
        }
      }
    }

    return {
      name: this.extractDocumentName(html) || 'XD Design',
      artboards,
      colors,
      components
    };
  }

  private extractApiUrl(html: string, baseUrl: string): string | null {
    const patterns = [
      /"apiUrl":\s*"([^"]+)"/,
      /api\.adobe\.com\/[^"'\s]+/,
      /\/api\/[^"'\s]+/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1] || match[0];
        if (!url.startsWith('http')) {
          url = new URL(url, baseUrl).href;
        }
        return url;
      }
    }

    return null;
  }

  private extractSpecData(html: string, baseUrl: string): XDWebSpec {
    const spec: XDWebSpec = {
      artboards: [],
      colors: [],
      components: []
    };

    const jsonPatterns = [
      /window\.__XD_DATA__\s*=\s*({.+?});/s,
      /window\.__INITIAL_STATE__\s*=\s*({.+?});/s,
      /window\.__PRELOADED_STATE__\s*=\s*({.+?});/s,
      /window\.__APP_DATA__\s*=\s*({.+?});/s,
      /<script[^>]*type="application\/json"[^>]*id="[^"]*data[^"]*"[^>]*>(.+?)<\/script>/s,
      /<script[^>]*type="application\/json"[^>]*>(.+?)<\/script>/s
    ];

    for (const pattern of jsonPatterns) {
      const jsonMatch = html.match(pattern);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1].trim();
          const data = JSON.parse(jsonStr);
          
          if (data.artboards || data.artboard || data.boards) {
            spec.artboards = data.artboards || data.boards || (data.artboard ? [data.artboard] : []);
          }
          if (data.colors || data.colorPalette || data.palette) {
            spec.colors = data.colors || data.colorPalette || data.palette || [];
          }
          if (data.components || data.component) {
            spec.components = data.components || (data.component ? [data.component] : []);
          }
          
          if (data.document) {
            if (data.document.artboards) spec.artboards = data.document.artboards;
            if (data.document.colors) spec.colors = data.document.colors;
            if (data.document.components) spec.components = data.document.components;
          }
          
          if (spec.artboards && spec.artboards.length > 0) {
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    const artboardPatterns = [
      /data-artboard-id="([^"]+)"[^>]*data-artboard-name="([^"]+)"[^>]*data-width="(\d+)"[^>]*data-height="(\d+)"/g,
      /<div[^>]*class="[^"]*artboard[^"]*"[^>]*data-width="(\d+)"[^>]*data-height="(\d+)"[^>]*data-name="([^"]+)"/g,
      /<svg[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*data-artboard="([^"]+)"/g
    ];

    for (const pattern of artboardPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        if (!spec.artboards) spec.artboards = [];
        const existing = spec.artboards.find(ab => 
          (match[1] && ab.id === match[1]) || 
          (match[3] && ab.name === match[3])
        );
        if (!existing) {
          spec.artboards.push({
            id: match[1] || Math.random().toString(36),
            name: match[2] || match[3] || `Artboard ${spec.artboards.length + 1}`,
            width: parseInt(match[3] || match[1] || '1440', 10),
            height: parseInt(match[4] || match[2] || '900', 10),
            elements: []
          });
        }
      }
    }

    const cssVarPattern = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
    const colorSet = new Set<string>();
    let cssVarMatch;
    while ((cssVarMatch = cssVarPattern.exec(html)) !== null) {
      const color = this.normalizeColor(cssVarMatch[2].trim());
      if (color && !colorSet.has(color)) {
        colorSet.add(color);
        if (!spec.colors) spec.colors = [];
        spec.colors.push({
          value: color,
          name: cssVarMatch[1]
        });
      }
    }

    const stylePatterns = [
      /\.([a-zA-Z0-9_-]+)\s*\{[^}]*color:\s*([^;]+);/g,
      /background-color:\s*([^;]+);/g,
      /fill:\s*([^;]+);/g,
      /stroke:\s*([^;]+);/g,
      /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g,
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/g
    ];

    for (const pattern of stylePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        let color: string;
        if (match.length === 4) {
          const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
          const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
          const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
          color = `#${r}${g}${b}`;
        } else {
          color = this.normalizeColor(match[1] || match[0]);
        }
        
        if (color && !colorSet.has(color)) {
          colorSet.add(color);
          if (!spec.colors) spec.colors = [];
          spec.colors.push({ value: color });
        }
      }
    }

    if (!spec.artboards || spec.artboards.length === 0) {
      const viewportMatch = html.match(/viewport[^>]*width="(\d+)"[^>]*height="(\d+)"/i);
      if (viewportMatch) {
        if (!spec.artboards) spec.artboards = [];
        spec.artboards.push({
          id: 'default',
          name: 'Main Artboard',
          width: parseInt(viewportMatch[1], 10) || 1440,
          height: parseInt(viewportMatch[2], 10) || 900,
          elements: []
        });
      }
    }

    return spec;
  }

  private parseArtboards(spec: XDWebSpec): XDArtboard[] {
    if (!spec.artboards) return [];

    return spec.artboards.map(ab => ({
      id: ab.id,
      name: ab.name,
      x: 0,
      y: 0,
      width: ab.width,
      height: ab.height,
      elements: ab.elements ? this.parseElements(ab.elements) : []
    }));
  }

  private parseElements(elements: any[]): XDElement[] {
    return elements.map(el => ({
      id: el.id || Math.random().toString(36),
      type: this.mapElementType(el.type || el.tagName),
      name: el.name || el.className,
      x: el.x || el.left || 0,
      y: el.y || el.top || 0,
      width: el.width || 0,
      height: el.height || 0,
      text: el.text || el.textContent,
      fill: el.fill || el.backgroundColor,
      stroke: el.stroke || el.borderColor,
      children: el.children ? this.parseElements(el.children) : undefined
    }));
  }

  private parseComponents(spec: XDWebSpec): XDComponent[] {
    if (!spec.components) return [];

    return spec.components.map(comp => ({
      id: comp.id,
      name: comp.name,
      elements: comp.elements ? this.parseElements(comp.elements) : []
    }));
  }

  private extractColors(spec: XDWebSpec): XDColor[] {
    if (spec.colors && spec.colors.length > 0) {
      return spec.colors;
    }

    const colors: XDColor[] = [];
    const colorSet = new Set<string>();

    const findColors = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      if (obj.fill || obj.backgroundColor) {
        const hex = this.normalizeColor(obj.fill || obj.backgroundColor);
        if (hex && !colorSet.has(hex)) {
          colorSet.add(hex);
          colors.push({ value: hex });
        }
      }

      if (obj.stroke || obj.borderColor) {
        const hex = this.normalizeColor(obj.stroke || obj.borderColor);
        if (hex && !colorSet.has(hex)) {
          colorSet.add(hex);
          colors.push({ value: hex });
        }
      }

      if (Array.isArray(obj)) {
        obj.forEach(findColors);
      } else {
        Object.values(obj).forEach(findColors);
      }
    };

    if (spec.artboards) {
      spec.artboards.forEach(ab => findColors(ab));
    }

    return colors;
  }

  private mapElementType(type: string): XDElement['type'] {
    const typeMap: { [key: string]: XDElement['type'] } = {
      'div': 'rectangle',
      'rect': 'rectangle',
      'ellipse': 'ellipse',
      'circle': 'ellipse',
      'text': 'text',
      'p': 'text',
      'h1': 'text',
      'h2': 'text',
      'h3': 'text',
      'span': 'text',
      'group': 'group',
      'component': 'component'
    };

    return typeMap[type?.toLowerCase()] || 'group';
  }

  private normalizeColor(color: string): string {
    if (!color) return '';

    color = color.trim();

    if (color.startsWith('#')) {
      if (color.length === 4) {
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
      }
      return color.length === 7 ? color : '';
    }

    if (color.startsWith('rgb')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
        const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
        const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
    }

    const namedColors: { [key: string]: string } = {
      'black': '#000000',
      'white': '#ffffff',
      'red': '#ff0000',
      'green': '#00ff00',
      'blue': '#0000ff'
    };

    return namedColors[color.toLowerCase()] || '';
  }

  private extractDocumentName(html: string): string {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    const metaMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (metaMatch) {
      return metaMatch[1].trim();
    }

    return 'XD Design';
  }
}

