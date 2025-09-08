/**
 * Debug Components
 * 
 * Collection of debugging utilities for development environments.
 * These components help identify and resolve common development issues.
 */

export { ZIndexDetector, useZIndexTest } from './ZIndexDetector';
export { ThemeDebugger } from './ThemeDebugger';

// Debug utilities for console use
export const debugUtils = {
  /**
   * Find elements with specific background colors
   */
  findElementsByBackground: (color = 'white') => {
    const elements = document.querySelectorAll('*');
    const matches: Array<{ element: Element; background: string }> = [];
    
    elements.forEach(el => {
      const computed = getComputedStyle(el);
      const bg = computed.backgroundColor;
      
      if (
        bg.includes(color) || 
        bg === 'rgb(255, 255, 255)' ||
        bg === '#ffffff' ||
        bg === '#fff'
      ) {
        matches.push({ element: el, background: bg });
      }
    });
    
    return matches;
  },

  /**
   * Find elements within specific z-index range
   */
  findElementsByZIndex: (min = 0, max = 1000) => {
    const elements = document.querySelectorAll('*');
    const matches: Array<{ element: Element; zIndex: number }> = [];
    
    elements.forEach(el => {
      const computed = getComputedStyle(el);
      const zIndex = parseInt(computed.zIndex);
      
      if (!isNaN(zIndex) && zIndex >= min && zIndex <= max) {
        matches.push({ element: el, zIndex });
      }
    });
    
    return matches.sort((a, b) => b.zIndex - a.zIndex);
  },

  /**
   * Get all CSS custom properties from document root
   */
  getThemeVariables: () => {
    const rootStyles = getComputedStyle(document.documentElement);
    const vars: Record<string, string> = {};
    
    // Get all CSS custom properties
    for (let i = 0; i < rootStyles.length; i++) {
      const property = rootStyles[i];
      if (property.startsWith('--')) {
        vars[property] = rootStyles.getPropertyValue(property).trim();
      }
    }
    
    return vars;
  },

  /**
   * Test element visibility at different z-index layers
   */
  testElementVisibility: (element: Element) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const elementsAtPoint = document.elementsFromPoint(centerX, centerY);
    const elementIndex = elementsAtPoint.indexOf(element);
    
    return {
      element,
      position: { x: centerX, y: centerY },
      layerIndex: elementIndex,
      elementsAbove: elementsAtPoint.slice(0, elementIndex),
      isVisible: elementIndex !== -1
    };
  },

  /**
   * Toggle debug visualization classes
   */
  toggleDebugMode: (mode: 'outlines' | 'backgrounds' | 'zindex') => {
    const className = `debug-${mode}`;
    document.body.classList.toggle(className);
    
    return document.body.classList.contains(className);
  },

  /**
   * Export current page debugging information
   */
  exportDebugInfo: () => {
    const info = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      themeVariables: debugUtils.getThemeVariables(),
      elementsWithBackgrounds: debugUtils.findElementsByBackground(),
      elementsWithZIndex: debugUtils.findElementsByZIndex(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    console.log('Debug Info Export:', info);
    
    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(info, null, 2))
        .then(() => console.log('Debug info copied to clipboard'))
        .catch(() => console.log('Could not copy to clipboard'));
    }
    
    return info;
  }
};

// Make debug utilities available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugUtils = debugUtils;
}