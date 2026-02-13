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
