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
