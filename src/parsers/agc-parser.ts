import { PrototypeData, AGCData, ComponentRef, ArtboardManifest } from '../types/xd-data';

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
  static getPrimaryAGCComponent(artboard: ArtboardManifest): ComponentRef | null {
    const primaryComponent = artboard.components?.find(
      (c: ComponentRef) => c.rel === 'primary' && c.type === 'agc'
    );
    return primaryComponent || null;
  }
}
