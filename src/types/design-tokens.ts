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
