# Adobe XD MCP Server: Design Understanding First

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready MCP server that deeply understands Adobe XD design structures, extracts comprehensive design data, and generates Tailwind-styled React components.

**Architecture:** Extract data from Adobe XD specs URLs by parsing embedded `window.prototypeData`, fetching AGC files and global resources from Adobe CDN, then provide rich MCP tools for design analysis (80% effort) and React generation (20% effort).

**Tech Stack:** TypeScript, MCP SDK, Zod, Node.js fetch API, Tailwind CSS code generation

**Priority:** Design understanding and data extraction FIRST, then enhanced React component generation informed by that understanding.

---

## Implementation Structure

### Phase 1: Foundation - Data Extraction (Tasks 1-6)
**Goal:** Extract ALL design data from Adobe XD specs URLs
**Focus:** URL validation, prototype data parsing, AGC file fetching, global resources

### Phase 2: Design Analysis (Tasks 7-12)
**Goal:** Analyze and expose design structures through MCP tools
**Focus:** Design tokens, hierarchy analysis, layout systems, element relationships

### Phase 3: React Generation (Tasks 13-15)
**Goal:** Generate Tailwind-styled React components using design insights
**Focus:** Component structure, Tailwind class generation, configurable props

### Phase 4: Testing & Documentation (Tasks 16-17)
**Goal:** Comprehensive testing and documentation
**Focus:** Integration tests, MCP Inspector validation, README updates

---

## Data Structures Discovered

### window.prototypeData Structure
```typescript
interface PrototypeData {
  manifest: {
    id: string;                    // e.g., "urn:aaid:sc:US:bbf16730-..."
    name: string;                  // Project name
    artboards: ArtboardManifest[]; // 20 artboards with metadata
    globalResources: ResourceRef;  // Design tokens reference
    interactions: ResourceRef;     // Interaction data reference
    resources: Record<string, ResourceRef>; // Asset mapping
  };
  linkTemplate: {
    href: string;  // URL pattern for Adobe CDN
    data: {
      api_key: string;
      access_token: string;
    };
  };
}

interface ArtboardManifest {
  id: string;
  name: string;
  bounds: { width: number; height: number; x: number; y: number };
  viewport: { height: number };
  components: ComponentRef[];  // AGC file reference + thumbnail
  resources: string[];         // Resource IDs used in this artboard
}

interface ComponentRef {
  id: string;
  path: string;     // e.g., "artwork/artboard-{id}/graphics/graphicContent.agc"
  version: string;
  revision: string;
  rel: "primary" | "thumbnail";
  type?: "agc";
}

interface ResourceRef {
  id: string;
  path: string;
  version: string;
  revision: string;
}
```

### AGC File Structure (Assumption - to be validated during implementation)
```typescript
interface AGCData {
  artboard: {
    children: AGCElement[];
    style: AGCStyle;
    meta: AGCMeta;
  };
}

interface AGCElement {
  id: string;
  name: string;
  type: "shape" | "text" | "group" | "artboard" | "component";
  transform: {
    tx: number; // translateX
    ty: number; // translateY
    a: number;  // scaleX
    d: number;  // scaleY
    b?: number; // skewY
    c?: number; // skewX
  };
  style?: AGCStyle;
  shape?: AGCShape;
  text?: AGCText;
  children?: AGCElement[];
}

interface AGCStyle {
  fill?: AGCFill;
  stroke?: AGCStroke;
  opacity?: number;
  blendMode?: string;
  filters?: AGCFilter[];
}

interface AGCFill {
  type: "solid" | "gradient" | "pattern";
  color?: { r: number; g: number; b: number; a: number };
  gradient?: AGCGradient;
}

interface AGCGradient {
  type: "linear" | "radial";
  stops: Array<{ offset: number; color: { r: number; g: number; b: number; a: number } }>;
}

interface AGCStroke {
  color: { r: number; g: number; b: number; a: number };
  width: number;
  position: "center" | "inside" | "outside";
}

interface AGCShape {
  type: "rect" | "ellipse" | "path";
  width?: number;
  height?: number;
  path?: string; // SVG path data
  r?: number;    // border radius for rects
}

interface AGCText {
  rawText: string;
  paragraphs: Array<{
    lines: Array<{
      y: number;
      x: number;
    }>;
  }>;
  style: {
    font: {
      family: string;
      postscriptName: string;
      size: number;
      style: string;
    };
    fill: AGCFill;
  };
}

interface AGCFilter {
  type: "dropShadow" | "blur" | "backgroundBlur";
  params: Record<string, any>;
}
```

### Global Resources Structure (Design Tokens)
```typescript
interface GlobalResources {
  colors: Array<{
    id: string;
    name: string;
    value: { r: number; g: number; b: number; a: number };
  }>;
  characterStyles: Array<{
    id: string;
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing?: number;
    textTransform?: string;
  }>;
  // Additional token types may exist
}
```

---

## Task Breakdown

### Task 1: Create Type Definitions

**Files:**
- Create: `src/types/xd-data.ts`
- Create: `src/types/design-tokens.ts`
- Create: `src/types/layout-system.ts`
- Create: `src/types/design-hierarchy.ts`

**Step 1: Write comprehensive TypeScript types for XD data**

Create `src/types/xd-data.ts`:

```typescript
// Complete type definitions based on discovered structure above
export interface PrototypeData {
  manifest: PrototypeManifest;
  linkTemplate: LinkTemplate;
  ownerId: string;
  modifiedDate: number;
  version: number;
  appVersion: string;
  manifestURL: string;
}

export interface PrototypeManifest {
  id: string;
  name: string;
  thumbnail: ResourceRef;
  artboards: ArtboardManifest[];
  globalResources: ResourceRef;
  interactions: ResourceRef;
  resources: Record<string, ResourceRef>;
  platform: string;
  docId: string;
  homeArtboardType: string;
  disableNavigation: boolean;
  includeSpecs: boolean;
  includeAssets: boolean;
}

export interface ArtboardManifest {
  id: string;
  name: string;
  bounds: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  viewport: {
    height: number;
  };
  components: ComponentRef[];
  resources: string[];
}

export interface ComponentRef {
  id: string;
  path: string;
  version: string;
  revision: string;
  rel: "primary" | "thumbnail";
  type?: "agc";
}

export interface ResourceRef {
  id: string;
  path: string;
  version: string;
  revision: string;
  component_id?: string;
}

export interface LinkTemplate {
  href: string;
  data: {
    api_key: string;
    access_token: string;
  };
}

// AGC Data Types
export interface AGCData {
  artboard: AGCArtboard;
  version?: string;
}

export interface AGCArtboard {
  meta: AGCMeta;
  children: AGCElement[];
  style?: AGCStyle;
}

export interface AGCMeta {
  uxdesign: {
    width: number;
    height: number;
  };
}

export interface AGCElement {
  id: string;
  name?: string;
  type: "shape" | "text" | "group" | "artboard" | "component" | "symbolInstance";
  transform?: AGCTransform;
  style?: AGCStyle;
  shape?: AGCShape;
  text?: AGCText;
  children?: AGCElement[];
  artboard?: AGCArtboard;
}

export interface AGCTransform {
  tx: number; // translateX
  ty: number; // translateY
  a: number;  // scaleX
  d: number;  // scaleY
  b?: number; // skewY
  c?: number; // skewX
}

export interface AGCStyle {
  fill?: AGCFill;
  stroke?: AGCStroke;
  opacity?: number;
  blendMode?: string;
  filters?: AGCFilter[];
  font?: AGCFont;
}

export interface AGCFill {
  type: "solid" | "gradient" | "pattern";
  color?: RGBA;
  gradient?: AGCGradient;
  pattern?: {
    width: number;
    height: number;
    href: string;
  };
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface AGCGradient {
  type: "linear" | "radial";
  stops: Array<{
    offset: number;
    color: RGBA;
  }>;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface AGCStroke {
  color: RGBA;
  width: number;
  position?: "center" | "inside" | "outside";
  cap?: "butt" | "round" | "square";
  join?: "miter" | "round" | "bevel";
  dasharray?: number[];
}

export interface AGCShape {
  type: "rect" | "ellipse" | "path" | "line";
  width?: number;
  height?: number;
  path?: string; // SVG path data
  r?: number | { topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number }; // border radius
  cx?: number; // circle/ellipse center x
  cy?: number; // circle/ellipse center y
  rx?: number; // ellipse radius x
  ry?: number; // ellipse radius y
}

export interface AGCText {
  rawText: string;
  paragraphs: Array<{
    lines: Array<{
      y: number;
      x: number;
      from: number;
      to: number;
    }>;
  }>;
  style?: AGCTextStyle;
}

export interface AGCTextStyle {
  font?: AGCFont;
  fill?: AGCFill;
  textAlign?: "left" | "center" | "right" | "justify";
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface AGCFont {
  family: string;
  postscriptName: string;
  size: number;
  style: "normal" | "italic" | "oblique";
  weight: number;
}

export interface AGCFilter {
  type: "dropShadow" | "blur" | "backgroundBlur" | "innerShadow";
  visible?: boolean;
  params: {
    dx?: number;
    dy?: number;
    r?: number;
    color?: RGBA;
    blurAmount?: number;
  };
}

// Global Resources Types
export interface GlobalResources {
  meta?: {
    version: string;
  };
  colors?: ColorToken[];
  characterStyles?: CharacterStyle[];
  gradients?: GradientToken[];
}

export interface ColorToken {
  id: string;
  name: string;
  value: RGBA;
}

export interface CharacterStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontPostscriptName?: string;
  fontSize: number;
  fontWeight: number;
  fontStyle?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: string;
  color?: RGBA;
}

export interface GradientToken {
  id: string;
  name: string;
  gradient: AGCGradient;
}
```

**Step 2: Create design token types**

Create `src/types/design-tokens.ts`:

```typescript
import { RGBA, AGCGradient } from './xd-data';

// Design tokens in Tailwind-compatible format
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
  fontSize: FontSizeTokens;
  fontWeight: FontWeightTokens;
  lineHeight: LineHeightTokens;
  letterSpacing: LetterSpacingTokens;
}

export interface ColorTokens {
  [key: string]: string | ColorScale;
}

export interface ColorScale {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
}

export interface TypographyTokens {
  [key: string]: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string | number;
    lineHeight: string;
    letterSpacing?: string;
    textTransform?: string;
  };
}

export interface SpacingTokens {
  [key: string]: string;
}

export interface ShadowTokens {
  [key: string]: string;
}

export interface BorderRadiusTokens {
  [key: string]: string;
}

export interface FontSizeTokens {
  [key: string]: [string, { lineHeight: string; letterSpacing?: string }];
}

export interface FontWeightTokens {
  [key: string]: string | number;
}

export interface LineHeightTokens {
  [key: string]: string;
}

export interface LetterSpacingTokens {
  [key: string]: string;
}

// Tailwind config type
export interface TailwindConfig {
  theme: {
    extend: DesignTokens;
  };
}

// Token extraction metadata
export interface TokenExtractionResult {
  tokens: DesignTokens;
  tailwindConfig: TailwindConfig;
  stats: {
    totalColors: number;
    totalTypographyStyles: number;
    totalSpacingValues: number;
    totalShadows: number;
  };
}
```

**Step 3: Create layout system types**

Create `src/types/layout-system.ts`:

```typescript
export interface LayoutInformation {
  artboardId: string;
  artboardName: string;
  deviceType: "desktop" | "mobile" | "tablet";
  dimensions: {
    width: number;
    height: number;
  };
  grid?: GridSystem;
  constraints: ConstraintSystem;
  responsive: ResponsiveBreakpoints;
}

export interface GridSystem {
  type: "columns" | "rows" | "both";
  columns?: {
    count: number;
    width: number;
    gutter: number;
  };
  rows?: {
    count: number;
    height: number;
    gutter: number;
  };
}

export interface ConstraintSystem {
  elements: Array<{
    id: string;
    name: string;
    constraints: {
      left?: ConstraintType;
      right?: ConstraintType;
      top?: ConstraintType;
      bottom?: ConstraintType;
      width?: "fixed" | "stretch";
      height?: "fixed" | "stretch";
    };
  }>;
}

export type ConstraintType = "fixed" | "min" | "max" | "center" | "scale";

export interface ResponsiveBreakpoints {
  breakpoints: Array<{
    name: string;
    width: number;
    artboardId?: string;
  }>;
}
```

**Step 4: Create design hierarchy types**

Create `src/types/design-hierarchy.ts`:

```typescript
import { AGCElement, AGCStyle } from './xd-data';

export interface DesignHierarchy {
  artboardId: string;
  artboardName: string;
  root: HierarchyNode;
  flattenedElements: FlattenedElement[];
  stats: HierarchyStats;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  depth: number;
  path: string; // e.g., "root/header/logo"
  element: AGCElement;
  children: HierarchyNode[];
  boundingBox: BoundingBox;
  computedStyle: ComputedStyle;
}

export interface FlattenedElement {
  id: string;
  name: string;
  type: string;
  depth: number;
  path: string;
  parentId?: string;
  childIds: string[];
  boundingBox: BoundingBox;
  styles: AGCStyle;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  absoluteX: number; // Computed from transforms
  absoluteY: number;
}

export interface ComputedStyle {
  position: {
    x: number;
    y: number;
    absoluteX: number;
    absoluteY: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  colors: {
    fill?: string; // Hex color
    stroke?: string;
  };
  typography?: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight?: number;
    letterSpacing?: number;
  };
  effects: {
    shadows: string[]; // CSS shadow strings
    blur?: number;
    opacity?: number;
  };
}

export interface HierarchyStats {
  totalElements: number;
  maxDepth: number;
  elementsByType: Record<string, number>;
  totalGroups: number;
  totalComponents: number;
}
```

**Step 5: No test needed (types only)**

Skip - type definitions don't need tests yet.

**Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add comprehensive type definitions for XD data structures"
```

---

### Task 2: URL Validator

**Files:**
- Create: `src/parsers/url-validator.ts`
- Test: Manual validation with example URLs

**Step 1: Write URL validator**

Create `src/parsers/url-validator.ts`:

```typescript
export interface ParsedXDUrl {
  type: "project" | "screen";
  projectId: string;
  screenId?: string;
  isValid: boolean;
  normalizedUrl: string;
}

export class XDUrlValidator {
  private static readonly XD_URL_PATTERN = /^https?:\/\/xd\.adobe\.com\/view\/([a-f0-9-]+)(?:\/screen\/([a-f0-9-]+))?/i;
  
  /**
   * Parse and validate an Adobe XD specs URL
   * 
   * Supported formats:
   * - Project overview: https://xd.adobe.com/view/PROJECT_ID/specs/
   * - Specific screen: https://xd.adobe.com/view/PROJECT_ID/screen/SCREEN_ID/specs/
   */
  static parseUrl(url: string): ParsedXDUrl {
    const trimmedUrl = url.trim();
    const match = trimmedUrl.match(this.XD_URL_PATTERN);
    
    if (!match) {
      return {
        type: "project",
        projectId: "",
        isValid: false,
        normalizedUrl: trimmedUrl
      };
    }
    
    const projectId = match[1];
    const screenId = match[2];
    
    // Normalize URL to ensure it ends with /specs/
    let normalizedUrl = `https://xd.adobe.com/view/${projectId}`;
    if (screenId) {
      normalizedUrl += `/screen/${screenId}`;
    }
    if (!normalizedUrl.endsWith('/specs/')) {
      normalizedUrl += '/specs/';
    }
    
    return {
      type: screenId ? "screen" : "project",
      projectId,
      screenId,
      isValid: true,
      normalizedUrl
    };
  }
  
  /**
   * Validate if a URL is a valid Adobe XD specs URL
   */
  static isValidUrl(url: string): boolean {
    return this.parseUrl(url).isValid;
  }
  
  /**
   * Extract project ID from URL
   */
  static getProjectId(url: string): string | null {
    const parsed = this.parseUrl(url);
    return parsed.isValid ? parsed.projectId : null;
  }
  
  /**
   * Extract screen ID from URL (if present)
   */
  static getScreenId(url: string): string | null {
    const parsed = this.parseUrl(url);
    return parsed.isValid ? parsed.screenId || null : null;
  }
}
```

**Step 2: Test validator with example URLs**

Run: `node -e "const { XDUrlValidator } = require('./dist/parsers/url-validator'); console.log(XDUrlValidator.parseUrl('https://xd.adobe.com/view/bbf16730-a767-4220-8569-80c09395e5b9-eea2/specs/'))"`

Expected: Output shows `isValid: true`, `type: "project"`, `projectId: "bbf16730-a767-4220-8569-80c09395e5b9-eea2"`

**Step 3: Commit**

```bash
git add src/parsers/url-validator.ts
git commit -m "feat: add URL validator for Adobe XD specs URLs"
```

---

### Task 3: Enhanced XD Web Parser - Extract window.prototypeData

**Files:**
- Modify: `src/parsers/xd-web-parser.ts`

**Step 1: Add method to extract window.prototypeData from HTML**

Add to `src/parsers/xd-web-parser.ts`:

```typescript
import { PrototypeData } from '../types/xd-data';

export class XDWebParser {
  // ... existing code ...
  
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
}
```

**Step 2: Test extraction**

Run: Test with example URL in MCP Inspector after building

Expected: Successfully extracts `window.prototypeData` with manifest, linkTemplate, etc.

**Step 3: Commit**

```bash
git add src/parsers/xd-web-parser.ts
git commit -m "feat: add window.prototypeData extraction from HTML"
```

---

### Task 4: AGC File Parser

**Files:**
- Create: `src/parsers/agc-parser.ts`

**Step 1: Create AGC parser**

Create `src/parsers/agc-parser.ts`:

```typescript
import { PrototypeData, AGCData, ComponentRef } from '../types/xd-data';

export class AGCParser {
  /**
   * Build AGC file URL from prototype data and component reference
   */
  static buildAGCUrl(prototypeData: PrototypeData, componentRef: ComponentRef): string {
    const { linkTemplate } = prototypeData;
    const { href, data } = linkTemplate;
    
    // Replace template variables in href
    let url = href
      .replace('{;revision}', `;revision=${componentRef.revision}`)
      .replace('{?component_id,component_path}', '');
    
    // Add query parameters
    const params = new URLSearchParams({
      component_id: componentRef.id,
      component_path: componentRef.path,
      api_key: data.api_key,
      access_token: data.access_token
    });
    
    return `${url}?${params.toString()}`;
  }
  
  /**
   * Fetch and parse AGC file
   */
  async fetchAGC(url: string): Promise<AGCData | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json,*/*',
          'Referer': 'https://xd.adobe.com/'
        }
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch AGC: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json() as AGCData;
      return data;
    } catch (error) {
      console.error('Error fetching AGC file:', error);
      return null;
    }
  }
  
  /**
   * Get primary AGC component for an artboard
   */
  static getPrimaryAGCComponent(artboard: any): ComponentRef | null {
    const primaryComponent = artboard.components?.find(
      (c: ComponentRef) => c.rel === 'primary' && c.type === 'agc'
    );
    return primaryComponent || null;
  }
}
```

**Step 2: Test AGC fetching**

Run: Test in MCP Inspector with example project

Expected: Successfully fetches AGC JSON data

**Step 3: Commit**

```bash
git add src/parsers/agc-parser.ts
git commit -m "feat: add AGC file parser and fetcher"
```

---

### Task 5: Global Resources Parser

**Files:**
- Create: `src/parsers/global-resources-parser.ts`

**Step 1: Create global resources parser**

Create `src/parsers/global-resources-parser.ts`:

```typescript
import { PrototypeData, GlobalResources, ResourceRef } from '../types/xd-data';

export class GlobalResourcesParser {
  /**
   * Build global resources URL from prototype data
   */
  static buildGlobalResourcesUrl(prototypeData: PrototypeData): string {
    const { linkTemplate, manifest } = prototypeData;
    const { globalResources } = manifest;
    const { href, data } = linkTemplate;
    
    // Replace template variables
    let url = href
      .replace('{;revision}', `;revision=${globalResources.revision}`)
      .replace('{?component_id,component_path}', '');
    
    // Add query parameters
    const params = new URLSearchParams({
      component_id: globalResources.id,
      component_path: globalResources.path,
      api_key: data.api_key,
      access_token: data.access_token
    });
    
    return `${url}?${params.toString()}`;
  }
  
  /**
   * Fetch and parse global resources
   */
  async fetchGlobalResources(url: string): Promise<GlobalResources | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json,*/*',
          'Referer': 'https://xd.adobe.com/'
        }
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch global resources: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json() as GlobalResources;
      return data;
    } catch (error) {
      console.error('Error fetching global resources:', error);
      return null;
    }
  }
}
```

**Step 2: Test global resources fetching**

Run: Test in MCP Inspector

Expected: Successfully fetches design tokens JSON

**Step 3: Commit**

```bash
git add src/parsers/global-resources-parser.ts
git commit -m "feat: add global resources parser for design tokens"
```

---

### Task 6: Hierarchy Analyzer

**Files:**
- Create: `src/analyzers/hierarchy-analyzer.ts`

**Step 1: Create hierarchy analyzer**

Create `src/analyzers/hierarchy-analyzer.ts`:

```typescript
import { AGCData, AGCElement, AGCTransform } from '../types/xd-data';
import { DesignHierarchy, HierarchyNode, FlattenedElement, BoundingBox, ComputedStyle, HierarchyStats } from '../types/design-hierarchy';

export class HierarchyAnalyzer {
  /**
   * Build design hierarchy from AGC data
   */
  static buildHierarchy(artboardId: string, artboardName: string, agcData: AGCData): DesignHierarchy {
    const root: HierarchyNode = {
      id: 'root',
      name: artboardName,
      type: 'artboard',
      depth: 0,
      path: 'root',
      element: agcData.artboard as any,
      children: [],
      boundingBox: {
        x: 0,
        y: 0,
        width: agcData.artboard.meta.uxdesign.width,
        height: agcData.artboard.meta.uxdesign.height,
        absoluteX: 0,
        absoluteY: 0
      },
      computedStyle: {
        position: { x: 0, y: 0, absoluteX: 0, absoluteY: 0 },
        dimensions: {
          width: agcData.artboard.meta.uxdesign.width,
          height: agcData.artboard.meta.uxdesign.height
        },
        colors: {},
        effects: { shadows: [] }
      }
    };
    
    // Build tree recursively
    if (agcData.artboard.children) {
      root.children = agcData.artboard.children.map((child, index) =>
        this.buildNode(child, 1, `root/${index}`, { tx: 0, ty: 0, a: 1, d: 1 })
      );
    }
    
    // Flatten tree
    const flattenedElements: FlattenedElement[] = [];
    this.flattenTree(root, flattenedElements);
    
    // Calculate stats
    const stats = this.calculateStats(flattenedElements);
    
    return {
      artboardId,
      artboardName,
      root,
      flattenedElements,
      stats
    };
  }
  
  private static buildNode(
    element: AGCElement,
    depth: number,
    path: string,
    parentTransform: AGCTransform
  ): HierarchyNode {
    // Compute absolute transform
    const transform = element.transform || { tx: 0, ty: 0, a: 1, d: 1 };
    const absoluteX = parentTransform.tx + transform.tx;
    const absoluteY = parentTransform.ty + transform.ty;
    
    // Compute bounding box
    const boundingBox = this.computeBoundingBox(element, transform, parentTransform);
    
    // Compute styles
    const computedStyle = this.computeStyle(element, boundingBox);
    
    // Build children
    const children = element.children?.map((child, index) =>
      this.buildNode(child, depth + 1, `${path}/${child.name || index}`, {
        tx: absoluteX,
        ty: absoluteY,
        a: transform.a,
        d: transform.d
      })
    ) || [];
    
    return {
      id: element.id,
      name: element.name || `${element.type}-${element.id.substring(0, 8)}`,
      type: element.type,
      depth,
      path,
      element,
      children,
      boundingBox,
      computedStyle
    };
  }
  
  private static computeBoundingBox(
    element: AGCElement,
    transform: AGCTransform,
    parentTransform: AGCTransform
  ): BoundingBox {
    const x = transform.tx;
    const y = transform.ty;
    const width = element.shape?.width || 0;
    const height = element.shape?.height || 0;
    const absoluteX = parentTransform.tx + x;
    const absoluteY = parentTransform.ty + y;
    
    return { x, y, width, height, absoluteX, absoluteY };
  }
  
  private static computeStyle(element: AGCElement, boundingBox: BoundingBox): ComputedStyle {
    const style: ComputedStyle = {
      position: {
        x: boundingBox.x,
        y: boundingBox.y,
        absoluteX: boundingBox.absoluteX,
        absoluteY: boundingBox.absoluteY
      },
      dimensions: {
        width: boundingBox.width,
        height: boundingBox.height
      },
      colors: {},
      effects: {
        shadows: []
      }
    };
    
    // Extract colors
    if (element.style?.fill?.color) {
      const c = element.style.fill.color;
      style.colors.fill = this.rgbaToHex(c);
    }
    
    if (element.style?.stroke?.color) {
      const c = element.style.stroke.color;
      style.colors.stroke = this.rgbaToHex(c);
    }
    
    // Extract typography
    if (element.text?.style?.font) {
      const font = element.text.style.font;
      style.typography = {
        fontFamily: font.family,
        fontSize: font.size,
        fontWeight: font.weight,
        lineHeight: element.text.style.font.size * 1.5 // Default line height
      };
    }
    
    // Extract effects
    if (element.style?.filters) {
      element.style.filters.forEach(filter => {
        if (filter.type === 'dropShadow' && filter.params.color) {
          const c = filter.params.color;
          const colorStr = this.rgbaToRgbaString(c);
          const shadow = `${filter.params.dx || 0}px ${filter.params.dy || 0}px ${filter.params.r || 0}px ${colorStr}`;
          style.effects.shadows.push(shadow);
        }
      });
    }
    
    if (element.style?.opacity !== undefined) {
      style.effects.opacity = element.style.opacity;
    }
    
    return style;
  }
  
  private static rgbaToHex(rgba: { r: number; g: number; b: number; a: number }): string {
    const r = Math.round(rgba.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgba.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgba.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  private static rgbaToRgbaString(rgba: { r: number; g: number; b: number; a: number }): string {
    const r = Math.round(rgba.r * 255);
    const g = Math.round(rgba.g * 255);
    const b = Math.round(rgba.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${rgba.a})`;
  }
  
  private static flattenTree(node: HierarchyNode, result: FlattenedElement[]): void {
    const flattened: FlattenedElement = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth: node.depth,
      path: node.path,
      childIds: node.children.map(c => c.id),
      boundingBox: node.boundingBox,
      styles: node.element.style || {}
    };
    
    result.push(flattened);
    
    node.children.forEach(child => this.flattenTree(child, result));
  }
  
  private static calculateStats(elements: FlattenedElement[]): HierarchyStats {
    const stats: HierarchyStats = {
      totalElements: elements.length,
      maxDepth: 0,
      elementsByType: {},
      totalGroups: 0,
      totalComponents: 0
    };
    
    elements.forEach(el => {
      stats.maxDepth = Math.max(stats.maxDepth, el.depth);
      stats.elementsByType[el.type] = (stats.elementsByType[el.type] || 0) + 1;
      if (el.type === 'group') stats.totalGroups++;
      if (el.type === 'component') stats.totalComponents++;
    });
    
    return stats;
  }
}
```

**Step 2: Test hierarchy building**

Run: Test in MCP Inspector

Expected: Successfully builds hierarchy tree from AGC data

**Step 3: Commit**

```bash
git add src/analyzers/hierarchy-analyzer.ts
git commit -m "feat: add hierarchy analyzer for design tree structures"
```

---

### Task 7: Token Extractor

**Files:**
- Create: `src/generators/token-extractor.ts`

**Step 1: Create token extractor**

Create `src/generators/token-extractor.ts`:

```typescript
import { GlobalResources, RGBA, CharacterStyle } from '../types/xd-data';
import { DesignTokens, ColorTokens, TypographyTokens } from '../types/design-tokens';

export class TokenExtractor {
  /**
   * Extract design tokens from global resources
   */
  static extractTokens(globalResources: GlobalResources): DesignTokens {
    const tokens: DesignTokens = {
      colors: this.extractColors(globalResources),
      typography: this.extractTypography(globalResources),
      spacing: {},
      shadows: {},
      borderRadius: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
      letterSpacing: {}
    };
    
    return tokens;
  }
  
  private static extractColors(globalResources: GlobalResources): ColorTokens {
    const colors: ColorTokens = {};
    
    if (!globalResources.colors) return colors;
    
    globalResources.colors.forEach(colorToken => {
      const name = this.sanitizeTokenName(colorToken.name);
      const hex = this.rgbaToHex(colorToken.value);
      colors[name] = hex;
    });
    
    return colors;
  }
  
  private static extractTypography(globalResources: GlobalResources): TypographyTokens {
    const typography: TypographyTokens = {};
    
    if (!globalResources.characterStyles) return typography;
    
    globalResources.characterStyles.forEach(style => {
      const name = this.sanitizeTokenName(style.name);
      typography[name] = {
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}px`,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight ? `${style.lineHeight}px` : 'normal',
        letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
        textTransform: style.textTransform
      };
    });
    
    return typography;
  }
  
  private static rgbaToHex(rgba: RGBA): string {
    const r = Math.round(rgba.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgba.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgba.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  private static sanitizeTokenName(name: string): string {
    // Convert "Primary / 500" to "primary-500"
    return name
      .toLowerCase()
      .replace(/\s*\/\s*/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
```

**Step 2: Test token extraction**

Run: Test in MCP Inspector

Expected: Successfully extracts color and typography tokens

**Step 3: Commit**

```bash
git add src/generators/token-extractor.ts
git commit -m "feat: add token extractor for design tokens"
```

---

### Task 8: Tailwind Config Generator

**Files:**
- Create: `src/generators/tailwind-config-generator.ts`

**Step 1: Create Tailwind config generator**

Create `src/generators/tailwind-config-generator.ts`:

```typescript
import { DesignTokens, TailwindConfig } from '../types/design-tokens';

export class TailwindConfigGenerator {
  /**
   * Generate Tailwind config from design tokens
   */
  static generateConfig(tokens: DesignTokens): TailwindConfig {
    return {
      theme: {
        extend: tokens
      }
    };
  }
  
  /**
   * Generate Tailwind config as formatted string
   */
  static generateConfigString(tokens: DesignTokens): string {
    const config = this.generateConfig(tokens);
    
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: ${JSON.stringify(config.theme.extend, null, 2)}
  },
  plugins: [],
}`;
  }
  
  /**
   * Generate TypeScript Tailwind config
   */
  static generateConfigTypeScript(tokens: DesignTokens): string {
    const config = this.generateConfig(tokens);
    
    return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [],
  theme: {
    extend: ${JSON.stringify(config.theme.extend, null, 2)}
  },
  plugins: [],
}

export default config`;
  }
}
```

**Step 2: Test config generation**

Run: Test in MCP Inspector

Expected: Generates valid Tailwind config

**Step 3: Commit**

```bash
git add src/generators/tailwind-config-generator.ts
git commit -m "feat: add Tailwind config generator"
```

---

### Task 9: Implement MCP Tool - analyze_design_structure

**Files:**
- Modify: `src/tools/xd-tools.ts`
- Modify: `src/index.ts`

**Step 1: Add analyze_design_structure tool**

Add to `src/tools/xd-tools.ts`:

```typescript
import { z } from 'zod';
import { XDUrlValidator } from '../parsers/url-validator';
import { XDWebParser } from '../parsers/xd-web-parser';
import { AGCParser } from '../parsers/agc-parser';
import { HierarchyAnalyzer } from '../analyzers/hierarchy-analyzer';

export const analyzeDesignStructureSchema = z.object({
  url: z.string().describe('Adobe XD specs URL (project or screen)'),
  artboardId: z.string().optional().describe('Specific artboard ID to analyze (optional)')
});

export async function analyzeDesignStructure(args: z.infer<typeof analyzeDesignStructureSchema>) {
  const { url, artboardId } = args;
  
  // Validate URL
  const parsedUrl = XDUrlValidator.parseUrl(url);
  if (!parsedUrl.isValid) {
    throw new Error('Invalid Adobe XD URL');
  }
  
  // Fetch specs page
  const parser = new XDWebParser();
  const html = await parser.fetchSpecsPage(parsedUrl.normalizedUrl);
  
  // Extract prototype data
  const prototypeData = parser.extractPrototypeData(html);
  if (!prototypeData) {
    throw new Error('Failed to extract prototype data from page');
  }
  
  // Determine which artboard to analyze
  let targetArtboard;
  if (artboardId) {
    targetArtboard = prototypeData.manifest.artboards.find(ab => ab.id === artboardId);
  } else if (parsedUrl.screenId) {
    targetArtboard = prototypeData.manifest.artboards.find(ab => ab.id === parsedUrl.screenId);
  } else {
    targetArtboard = prototypeData.manifest.artboards[0]; // First artboard
  }
  
  if (!targetArtboard) {
    throw new Error('Artboard not found');
  }
  
  // Get AGC component
  const agcComponent = AGCParser.getPrimaryAGCComponent(targetArtboard);
  if (!agcComponent) {
    throw new Error('No AGC component found for artboard');
  }
  
  // Fetch AGC data
  const agcUrl = AGCParser.buildAGCUrl(prototypeData, agcComponent);
  const agcParser = new AGCParser();
  const agcData = await agcParser.fetchAGC(agcUrl);
  if (!agcData) {
    throw new Error('Failed to fetch AGC data');
  }
  
  // Build hierarchy
  const hierarchy = HierarchyAnalyzer.buildHierarchy(
    targetArtboard.id,
    targetArtboard.name,
    agcData
  );
  
  return {
    artboard: {
      id: targetArtboard.id,
      name: targetArtboard.name,
      dimensions: targetArtboard.bounds
    },
    hierarchy,
    summary: `Analyzed ${hierarchy.stats.totalElements} elements across ${hierarchy.stats.maxDepth} levels`
  };
}
```

**Step 2: Register tool in index.ts**

Add to `src/index.ts`:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools ...
    {
      name: 'analyze_design_structure',
      description: 'Analyze complete design structure from Adobe XD specs URL. Returns full element hierarchy, bounding boxes, styles, and statistics. Use this to deeply understand the design before generating components.',
      inputSchema: zodToJsonSchema(analyzeDesignStructureSchema)
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // ... existing tool handlers ...
  
  if (request.params.name === 'analyze_design_structure') {
    const args = analyzeDesignStructureSchema.parse(request.params.arguments);
    const result = await analyzeDesignStructure(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
});
```

**Step 3: Build and test**

Run: `npm run build && npx @modelcontextprotocol/inspector node dist/index.js`

Expected: Tool appears in MCP Inspector, successfully analyzes design structure

**Step 4: Commit**

```bash
git add src/tools/xd-tools.ts src/index.ts
git commit -m "feat: add analyze_design_structure MCP tool"
```

---

### Task 10: Implement MCP Tool - extract_design_tokens

**Files:**
- Modify: `src/tools/xd-tools.ts`
- Modify: `src/index.ts`

**Step 1: Add extract_design_tokens tool**

Add to `src/tools/xd-tools.ts`:

```typescript
import { GlobalResourcesParser } from '../parsers/global-resources-parser';
import { TokenExtractor } from '../generators/token-extractor';
import { TailwindConfigGenerator } from '../generators/tailwind-config-generator';

export const extractDesignTokensSchema = z.object({
  url: z.string().describe('Adobe XD specs URL'),
  format: z.enum(['json', 'tailwind-js', 'tailwind-ts']).default('json').describe('Output format')
});

export async function extractDesignTokens(args: z.infer<typeof extractDesignTokensSchema>) {
  const { url, format } = args;
  
  // Validate URL
  const parsedUrl = XDUrlValidator.parseUrl(url);
  if (!parsedUrl.isValid) {
    throw new Error('Invalid Adobe XD URL');
  }
  
  // Fetch specs page
  const parser = new XDWebParser();
  const html = await parser.fetchSpecsPage(parsedUrl.normalizedUrl);
  
  // Extract prototype data
  const prototypeData = parser.extractPrototypeData(html);
  if (!prototypeData) {
    throw new Error('Failed to extract prototype data from page');
  }
  
  // Fetch global resources
  const grUrl = GlobalResourcesParser.buildGlobalResourcesUrl(prototypeData);
  const grParser = new GlobalResourcesParser();
  const globalResources = await grParser.fetchGlobalResources(grUrl);
  if (!globalResources) {
    throw new Error('Failed to fetch global resources');
  }
  
  // Extract tokens
  const tokens = TokenExtractor.extractTokens(globalResources);
  
  // Format output
  let output: string;
  switch (format) {
    case 'tailwind-js':
      output = TailwindConfigGenerator.generateConfigString(tokens);
      break;
    case 'tailwind-ts':
      output = TailwindConfigGenerator.generateConfigTypeScript(tokens);
      break;
    default:
      output = JSON.stringify(tokens, null, 2);
  }
  
  return {
    tokens,
    formatted: output,
    stats: {
      totalColors: Object.keys(tokens.colors).length,
      totalTypographyStyles: Object.keys(tokens.typography).length
    }
  };
}
```

**Step 2: Register tool**

Add to `src/index.ts`:

```typescript
{
  name: 'extract_design_tokens',
  description: 'Extract complete design token system (colors, typography, spacing) from Adobe XD specs URL. Returns tokens in JSON or Tailwind config format.',
  inputSchema: zodToJsonSchema(extractDesignTokensSchema)
}

// In CallToolRequestSchema handler:
if (request.params.name === 'extract_design_tokens') {
  const args = extractDesignTokensSchema.parse(request.params.arguments);
  const result = await extractDesignTokens(args);
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
  };
}
```

**Step 3: Build and test**

Run: `npm run build && npx @modelcontextprotocol/inspector node dist/index.js`

Expected: Successfully extracts design tokens

**Step 4: Commit**

```bash
git add src/tools/xd-tools.ts src/index.ts
git commit -m "feat: add extract_design_tokens MCP tool"
```

---

### Task 11: Implement MCP Tool - list_artboards

**Files:**
- Modify: `src/tools/xd-tools.ts`
- Modify: `src/index.ts`

**Step 1: Add list_artboards tool**

Add to `src/tools/xd-tools.ts`:

```typescript
export const listArtboardsSchema = z.object({
  url: z.string().describe('Adobe XD specs URL (project URL)')
});

export async function listArtboards(args: z.infer<typeof listArtboardsSchema>) {
  const { url } = args;
  
  // Validate URL
  const parsedUrl = XDUrlValidator.parseUrl(url);
  if (!parsedUrl.isValid) {
    throw new Error('Invalid Adobe XD URL');
  }
  
  // Fetch specs page
  const parser = new XDWebParser();
  const html = await parser.fetchSpecsPage(parsedUrl.normalizedUrl);
  
  // Extract prototype data
  const prototypeData = parser.extractPrototypeData(html);
  if (!prototypeData) {
    throw new Error('Failed to extract prototype data from page');
  }
  
  // Map artboards
  const artboards = prototypeData.manifest.artboards.map(ab => ({
    id: ab.id,
    name: ab.name,
    dimensions: {
      width: ab.bounds.width,
      height: ab.bounds.height
    },
    viewport: ab.viewport,
    deviceType: ab.bounds.width >= 1024 ? 'desktop' : ab.bounds.width >= 768 ? 'tablet' : 'mobile',
    resourceCount: ab.resources?.length || 0
  }));
  
  return {
    projectId: prototypeData.manifest.id,
    projectName: prototypeData.manifest.name,
    totalArtboards: artboards.length,
    artboards
  };
}
```

**Step 2: Register tool**

Add to `src/index.ts`

**Step 3: Build and test**

Run: Test in MCP Inspector

**Step 4: Commit**

```bash
git add src/tools/xd-tools.ts src/index.ts
git commit -m "feat: add list_artboards MCP tool"
```

---

### Task 12: Implement MCP Tool - get_element_details

**Files:**
- Modify: `src/tools/xd-tools.ts`
- Modify: `src/index.ts`

**Step 1: Add get_element_details tool**

Add to `src/tools/xd-tools.ts`:

```typescript
export const getElementDetailsSchema = z.object({
  url: z.string().describe('Adobe XD specs URL'),
  elementPath: z.string().describe('Element path (e.g., "root/header/logo")'),
  artboardId: z.string().optional().describe('Artboard ID (optional)')
});

export async function getElementDetails(args: z.infer<typeof getElementDetailsSchema>) {
  const { url, elementPath, artboardId } = args;
  
  // Use analyzeDesignStructure to get hierarchy
  const analysis = await analyzeDesignStructure({ url, artboardId });
  
  // Find element by path
  const element = analysis.hierarchy.flattenedElements.find(el => el.path === elementPath);
  if (!element) {
    throw new Error(`Element not found at path: ${elementPath}`);
  }
  
  return {
    element,
    artboard: analysis.artboard
  };
}
```

**Step 2: Register tool**

**Step 3: Build and test**

**Step 4: Commit**

```bash
git add src/tools/xd-tools.ts src/index.ts
git commit -m "feat: add get_element_details MCP tool"
```

---

### Task 13: Tailwind Class Generator

**Files:**
- Create: `src/generators/tailwind-class-generator.ts`

**Step 1: Create Tailwind class generator**

Create `src/generators/tailwind-class-generator.ts`:

```typescript
import { AGCElement, AGCStyle, RGBA } from '../types/xd-data';

export class TailwindClassGenerator {
  /**
   * Generate Tailwind classes from AGC element
   */
  static generateClasses(element: AGCElement): string[] {
    const classes: string[] = [];
    
    // Position (absolute by default for XD designs)
    classes.push('absolute');
    
    // Dimensions
    if (element.shape?.width) {
      classes.push(`w-[${Math.round(element.shape.width)}px]`);
    }
    if (element.shape?.height) {
      classes.push(`h-[${Math.round(element.shape.height)}px]`);
    }
    
    // Positioning
    if (element.transform) {
      classes.push(`left-[${Math.round(element.transform.tx)}px]`);
      classes.push(`top-[${Math.round(element.transform.ty)}px]`);
    }
    
    // Background color
    if (element.style?.fill?.color) {
      const hex = this.rgbaToHex(element.style.fill.color);
      classes.push(`bg-[${hex}]`);
    }
    
    // Border
    if (element.style?.stroke) {
      const hex = this.rgbaToHex(element.style.stroke.color);
      classes.push(`border-[${element.style.stroke.width}px]`);
      classes.push(`border-[${hex}]`);
    }
    
    // Border radius
    if (element.shape?.r) {
      const radius = typeof element.shape.r === 'number' ? element.shape.r : element.shape.r.topLeft || 0;
      if (radius > 0) {
        classes.push(`rounded-[${Math.round(radius)}px]`);
      }
    }
    
    // Opacity
    if (element.style?.opacity !== undefined && element.style.opacity < 1) {
      const opacityPercent = Math.round(element.style.opacity * 100);
      classes.push(`opacity-${opacityPercent}`);
    }
    
    // Typography
    if (element.text?.style?.font) {
      const font = element.text.style.font;
      classes.push(`text-[${Math.round(font.size)}px]`);
      classes.push(`font-[${font.weight}]`);
      
      if (font.style === 'italic') {
        classes.push('italic');
      }
    }
    
    // Text alignment
    if (element.text?.style?.textAlign) {
      classes.push(`text-${element.text.style.textAlign}`);
    }
    
    // Shadows
    if (element.style?.filters) {
      element.style.filters.forEach(filter => {
        if (filter.type === 'dropShadow' && filter.params.color) {
          // Use arbitrary shadow value
          const dx = filter.params.dx || 0;
          const dy = filter.params.dy || 0;
          const blur = filter.params.r || 0;
          const color = this.rgbaToRgbaString(filter.params.color);
          classes.push(`shadow-[${dx}px_${dy}px_${blur}px_${color}]`);
        }
      });
    }
    
    return classes;
  }
  
  private static rgbaToHex(rgba: RGBA): string {
    const r = Math.round(rgba.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgba.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgba.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  private static rgbaToRgbaString(rgba: RGBA): string {
    const r = Math.round(rgba.r * 255);
    const g = Math.round(rgba.g * 255);
    const b = Math.round(rgba.b * 255);
    return `rgba(${r},${g},${b},${rgba.a})`;
  }
}
```

**Step 2: Test class generation**

Run: Test in MCP Inspector

**Step 3: Commit**

```bash
git add src/generators/tailwind-class-generator.ts
git commit -m "feat: add Tailwind class generator from AGC elements"
```

---

### Task 14: Component Structure Generator

**Files:**
- Create: `src/generators/component-structure.ts`

**Step 1: Create component structure generator**

Create `src/generators/component-structure.ts`:

```typescript
import { AGCElement } from '../types/xd-data';
import { HierarchyNode } from '../types/design-hierarchy';

export interface ComponentNode {
  id: string;
  name: string;
  type: 'div' | 'text' | 'image';
  className: string;
  textContent?: string;
  children: ComponentNode[];
  props: Record<string, any>;
}

export class ComponentStructureGenerator {
  /**
   * Generate component structure from hierarchy
   */
  static generateStructure(hierarchyNode: HierarchyNode): ComponentNode {
    return this.buildComponentNode(hierarchyNode);
  }
  
  private static buildComponentNode(node: HierarchyNode): ComponentNode {
    const element = node.element;
    
    // Determine component type
    let type: 'div' | 'text' | 'image' = 'div';
    if (element.type === 'text') {
      type = 'text';
    } else if (element.shape?.type === 'rect' && element.style?.fill?.pattern) {
      type = 'image';
    }
    
    // Build component node
    const componentNode: ComponentNode = {
      id: node.id,
      name: node.name,
      type,
      className: '', // Will be filled with Tailwind classes
      children: [],
      props: {}
    };
    
    // Add text content
    if (element.text?.rawText) {
      componentNode.textContent = element.text.rawText;
    }
    
    // Add props for configurability
    if (element.text) {
      componentNode.props.text = element.text.rawText;
    }
    
    // Build children
    componentNode.children = node.children.map(child => this.buildComponentNode(child));
    
    return componentNode;
  }
}
```

**Step 2: Test structure generation**

**Step 3: Commit**

```bash
git add src/generators/component-structure.ts
git commit -m "feat: add component structure generator"
```

---

### Task 15: Enhanced React Generator

**Files:**
- Modify: `src/generators/react-generator.ts`

**Step 1: Enhance React generator**

Modify `src/generators/react-generator.ts`:

```typescript
import { HierarchyNode } from '../types/design-hierarchy';
import { ComponentStructureGenerator, ComponentNode } from './component-structure';
import { TailwindClassGenerator } from './tailwind-class-generator';

export class ReactGenerator {
  /**
   * Generate React component from hierarchy
   */
  static generateComponent(
    componentName: string,
    hierarchyNode: HierarchyNode,
    options: {
      typescript?: boolean;
      includeComments?: boolean;
      configurableProps?: boolean;
    } = {}
  ): string {
    const { typescript = true, includeComments = true, configurableProps = true } = options;
    
    // Generate component structure
    const structure = ComponentStructureGenerator.generateStructure(hierarchyNode);
    
    // Generate props interface
    let propsInterface = '';
    if (typescript && configurableProps) {
      propsInterface = this.generatePropsInterface(componentName, structure);
    }
    
    // Generate JSX
    const jsx = this.generateJSX(structure, hierarchyNode, 0, includeComments);
    
    // Build component
    const propsType = typescript && configurableProps ? `: ${componentName}Props` : '';
    const propsParam = configurableProps ? 'props' : '';
    
    return `${propsInterface}

export default function ${componentName}(${propsParam}${propsType}) {
  return (
${jsx}
  );
}`;
  }
  
  private static generatePropsInterface(componentName: string, structure: ComponentNode): string {
    const props: string[] = [];
    
    // Collect props from structure
    this.collectProps(structure, props);
    
    if (props.length === 0) {
      return `interface ${componentName}Props {}`;
    }
    
    return `interface ${componentName}Props {
  ${props.join(';\n  ')};
}`;
  }
  
  private static collectProps(node: ComponentNode, props: string[]): void {
    Object.entries(node.props).forEach(([key, value]) => {
      const type = typeof value === 'string' ? 'string' : 'any';
      props.push(`${key}?: ${type}`);
    });
    
    node.children.forEach(child => this.collectProps(child, props));
  }
  
  private static generateJSX(
    structure: ComponentNode,
    hierarchyNode: HierarchyNode,
    indent: number,
    includeComments: boolean
  ): string {
    const indentStr = '  '.repeat(indent + 2);
    const classes = TailwindClassGenerator.generateClasses(hierarchyNode.element);
    
    let jsx = '';
    
    // Add comment with design metadata
    if (includeComments) {
      jsx += `${indentStr}{/* ${structure.name} - ${structure.type} */}\n`;
    }
    
    // Generate element
    const classNames = classes.join(' ');
    
    if (structure.type === 'text') {
      jsx += `${indentStr}<div className="${classNames}">\n`;
      jsx += `${indentStr}  {props.${structure.id}_text || "${structure.textContent || ''}"}\n`;
      jsx += `${indentStr}</div>`;
    } else if (structure.type === 'image') {
      jsx += `${indentStr}<img className="${classNames}" alt="${structure.name}" />`;
    } else {
      jsx += `${indentStr}<div className="${classNames}">`;
      
      if (structure.children.length > 0) {
        jsx += '\n';
        structure.children.forEach((child, index) => {
          const childHierarchy = hierarchyNode.children[index];
          jsx += this.generateJSX(child, childHierarchy, indent + 1, includeComments);
          jsx += '\n';
        });
        jsx += `${indentStr}`;
      }
      
      jsx += `</div>`;
    }
    
    return jsx;
  }
}
```

**Step 2: Build and test**

**Step 3: Commit**

```bash
git add src/generators/react-generator.ts
git commit -m "feat: enhance React generator with Tailwind classes and configurable props"
```

---

### Task 16: Integration Testing

**Files:**
- Test: All MCP tools with example URLs

**Step 1: Test all tools in MCP Inspector**

Run: `npx @modelcontextprotocol/inspector node dist/index.js`

Test each tool:
1. `list_artboards` with project URL
2. `analyze_design_structure` with screen URL
3. `extract_design_tokens` with project URL
4. `get_element_details` with element path
5. `generate_react_component` (if exists)

Expected: All tools work correctly with example Adobe XD URLs

**Step 2: Document any issues found**

Create test report in `docs/testing-report.md`

**Step 3: Fix any issues**

**Step 4: Commit**

```bash
git add .
git commit -m "test: comprehensive integration testing of all MCP tools"
```

---

### Task 17: Documentation

**Files:**
- Modify: `README.md`
- Create: `docs/ARCHITECTURE.md`
- Create: `docs/API.md`

**Step 1: Update README**

Update `README.md` with:
- New features
- Tool descriptions
- Usage examples
- Design-first approach explanation

**Step 2: Create architecture documentation**

Create `docs/ARCHITECTURE.md` explaining:
- Data flow (URL → HTML → prototypeData → AGC/GlobalResources → Tokens/Hierarchy)
- Component architecture
- Type system

**Step 3: Create API documentation**

Create `docs/API.md` with:
- All MCP tools
- Input schemas
- Output examples
- Error handling

**Step 4: Commit**

```bash
git add README.md docs/
git commit -m "docs: comprehensive documentation for design-first MCP server"
```

---

## Success Criteria

- [ ] All type definitions complete and accurate
- [ ] URL validator handles both project and screen URLs
- [ ] Successfully extracts `window.prototypeData` from Adobe XD specs pages
- [ ] AGC files fetch correctly from Adobe CDN
- [ ] Global resources (design tokens) fetch correctly
- [ ] Hierarchy analyzer builds complete element trees
- [ ] Design tokens extract in Tailwind-compatible format
- [ ] 6 MCP tools implemented and tested:
  - `analyze_design_structure`
  - `extract_design_tokens`
  - `list_artboards`
  - `get_element_details`
  - `get_layout_information` (optional)
  - `generate_react_component` (enhanced)
- [ ] All tools tested with example Adobe XD URLs
- [ ] Tailwind class generation from AGC styles
- [ ] React components generated with configurable props
- [ ] Comprehensive documentation
- [ ] Server builds and runs without errors

---

## Testing Strategy

**Unit Testing (Optional):**
- URL validator with various URL formats
- Color conversion utilities (RGBA → Hex)
- Token name sanitization

**Integration Testing (Required):**
- Test with all 3 example URLs
- Verify data extraction completeness
- Test each MCP tool in MCP Inspector
- Validate Tailwind config output
- Verify React component output

**Manual Testing:**
- Test with MCP Inspector: `npx @modelcontextprotocol/inspector node dist/index.js`
- Test in IDE with MCP client
- Verify outputs are correct and complete

---

## Notes

- AGC file structure may vary - be prepared to adjust types during implementation
- Adobe CDN URLs require proper authentication tokens from linkTemplate
- Design tokens may have different structures than assumed - validate with real data
- React generation is secondary - prioritize design understanding first
- Use MCP Inspector frequently to validate tools work correctly
- Keep error messages actionable (follow MCP best practices)

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-02-13-design-understanding-first.md`.**

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
