// src/generators/react-generator.ts
import { XDArtboard, XDElement, XDComponent } from '../parsers/xd-parser';

export interface GeneratorOptions {
  styleSystem: 'styled-components' | 'tailwind' | 'css-modules';
  typescript: boolean;
}

export class ReactGenerator {
  private options: GeneratorOptions;
  
  constructor(options: GeneratorOptions) {
    this.options = options;
  }
  
  generateFromArtboard(artboard: XDArtboard): string {
    const componentName = this.toPascalCase(artboard.name);
    const elements = this.generateElements(artboard.elements);
    
    return this.wrapComponent(componentName, elements);
  }
  
  generateFromComponent(component: XDComponent): string {
    const componentName = this.toPascalCase(component.name);
    const elements = this.generateElements(component.elements);
    
    return this.wrapComponent(componentName, elements);
  }
  
  private wrapComponent(name: string, content: string): string {
    const fileExt = this.options.typescript ? 'tsx' : 'jsx';
    
    let imports = 'import React from \'react\';\n';
    
    if (this.options.styleSystem === 'styled-components') {
      imports += 'import styled from \'styled-components\';\n';
    } else if (this.options.styleSystem === 'css-modules') {
      imports += `import styles from './${name}.module.css';\n`;
    }
    
    const componentDef = this.options.typescript 
      ? `const ${name}: React.FC = () => {`
      : `const ${name} = () => {`;
    
    return `${imports}
${componentDef}
  return (
${content}
  );
};

export default ${name};
`;
  }
  
  private generateElements(elements: XDElement[], indent: string = '    '): string {
    if (elements.length === 0) {
      return `${indent}<div />`;
    }
    
    if (elements.length === 1) {
      return this.generateElement(elements[0], indent);
    }
    
    // Multiple elements need a wrapper
    const childElements = elements
      .map(el => this.generateElement(el, indent + '  '))
      .join('\n');
    
    return `${indent}<div className="${this.getContainerClass()}">
${childElements}
${indent}</div>`;
  }
  
  private generateElement(element: XDElement, indent: string): string {
    switch (element.type) {
      case 'text':
        return this.generateText(element, indent);
      case 'rectangle':
      case 'ellipse':
        return this.generateShape(element, indent);
      case 'group':
      case 'component':
        return this.generateGroup(element, indent);
      default:
        return `${indent}<div />`;
    }
  }
  
  private generateText(element: XDElement, indent: string): string {
    const className = this.getClassName('text', element);
    const text = element.text || 'Text';
    
    // Determine appropriate HTML element based on text size/role
    const tag = this.inferTextTag(element);
    
    return `${indent}<${tag} className="${className}">${text}</${tag}>`;
  }
  
  private generateShape(element: XDElement, indent: string): string {
    const className = this.getClassName(element.type, element);
    
    if (element.children && element.children.length > 0) {
      const children = element.children
        .map(child => this.generateElement(child, indent + '  '))
        .join('\n');
      
      return `${indent}<div className="${className}">
${children}
${indent}</div>`;
    }
    
    return `${indent}<div className="${className}" />`;
  }
  
  private generateGroup(element: XDElement, indent: string): string {
    const className = this.getClassName('group', element);
    
    if (!element.children || element.children.length === 0) {
      return `${indent}<div className="${className}" />`;
    }
    
    const children = element.children
      .map(child => this.generateElement(child, indent + '  '))
      .join('\n');
    
    return `${indent}<div className="${className}">
${children}
${indent}</div>`;
  }
  
  private getClassName(type: string, element: XDElement): string {
    if (this.options.styleSystem === 'tailwind') {
      return this.getTailwindClasses(type, element);
    } else if (this.options.styleSystem === 'css-modules') {
      return element.name 
        ? `styles.${this.toCamelCase(element.name)}`
        : `styles.${type}`;
    } else {
      // styled-components
      return element.name 
        ? this.toPascalCase(element.name)
        : this.toPascalCase(type);
    }
  }
  
  private getContainerClass(): string {
    if (this.options.styleSystem === 'tailwind') {
      return 'flex flex-col';
    } else if (this.options.styleSystem === 'css-modules') {
      return 'styles.container';
    } else {
      return 'Container';
    }
  }
  
  private getTailwindClasses(type: string, element: XDElement): string {
    const classes: string[] = [];
    
    // Basic display
    if (type === 'group' || element.children) {
      classes.push('flex');
    }
    
    // Shape-specific
    if (element.type === 'ellipse') {
      classes.push('rounded-full');
    }
    
    // Text-specific
    if (type === 'text') {
      classes.push('text-base');
    }
    
    return classes.join(' ');
  }
  
  private inferTextTag(element: XDElement): string {
    // In a real implementation, we'd analyze font size, weight, etc.
    // For now, default to appropriate semantic HTML
    if (element.name?.toLowerCase().includes('heading')) {
      return 'h2';
    }
    if (element.name?.toLowerCase().includes('title')) {
      return 'h3';
    }
    return 'p';
  }
  
  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, chr) => chr ? chr.toUpperCase() : '')
      .replace(/^(.)/, (_, chr) => chr.toUpperCase());
  }
  
  private toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, chr) => chr ? chr.toUpperCase() : '')
      .replace(/^(.)/, (_, chr) => chr.toLowerCase());
  }
}
