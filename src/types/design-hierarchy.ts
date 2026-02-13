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
