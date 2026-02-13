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
