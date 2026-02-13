// Complete type definitions based on discovered Adobe XD structure
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
