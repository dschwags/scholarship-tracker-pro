'use client';

import { useState, useEffect } from 'react';

/**
 * Theme Debugger Component
 * 
 * Real-time inspection of CSS custom properties and theme variables.
 * Helps debug dark mode issues and verify theme variable inheritance.
 * 
 * Usage:
 * <ThemeDebugger />
 * 
 * Features:
 * - Live CSS custom property values
 * - Computed style inspection
 * - Theme variable inheritance chain
 * - Color palette visualization
 */
export function ThemeDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [themeVars, setThemeVars] = useState<Record<string, string>>({});
  
  // Common theme variable names to check
  const commonThemeVars = [
    '--background',
    '--foreground', 
    '--card',
    '--card-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring'
  ];
  
  // Update theme variables
  useEffect(() => {
    if (!isVisible) return;
    
    const updateVars = () => {
      const rootStyles = getComputedStyle(document.documentElement);
      const vars: Record<string, string> = {};
      
      commonThemeVars.forEach(varName => {
        vars[varName] = rootStyles.getPropertyValue(varName).trim();
      });
      
      setThemeVars(vars);
    };
    
    updateVars();
    const interval = setInterval(updateVars, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  // Element inspection
  const inspectElement = (element: Element) => {
    setSelectedElement(element);
    console.log('Theme Debugger - Inspecting element:', {
      element,
      computedStyle: getComputedStyle(element),
      classList: Array.from(element.classList),
      customProperties: getCustomProperties(element)
    });
  };
  
  // Get all custom properties from element
  const getCustomProperties = (element: Element) => {
    const computed = getComputedStyle(element);
    const props: Record<string, string> = {};
    
    // Get all CSS custom properties
    for (let i = 0; i < computed.length; i++) {
      const property = computed[i];
      if (property.startsWith('--')) {
        props[property] = computed.getPropertyValue(property).trim();
      }
    }
    
    return props;
  };
  
  // Color preview component
  const ColorPreview = ({ value, name }: { value: string; name: string }) => {
    // Try to parse HSL values
    const parseHSL = (hslString: string) => {
      const match = hslString.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
      if (match) {
        return `hsl(${match[1]}, ${match[2]}%, ${match[3]}%)`;
      }
      return hslString;
    };
    
    const colorValue = value.includes('hsl') ? parseHSL(value) : value;
    
    return (
      <div className="flex items-center gap-2 mb-1">
        <div 
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: colorValue }}
          title={colorValue}
        />
        <span className="text-xs font-mono text-gray-300">{name}</span>
        <span className="text-xs text-gray-400">{value}</span>
      </div>
    );
  };
  
  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded shadow-lg z-50 text-sm font-mono"
        title="Open Theme Debugger"
      >
        🎨 THEME
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded shadow-lg z-50 max-w-sm max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-bold">Theme Debugger</div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {/* Current Theme Detection */}
      <div className="mb-4">
        <div className="text-xs font-semibold mb-1">Current Theme:</div>
        <div className="text-xs text-gray-300">
          {document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}
        </div>
      </div>
      
      {/* Theme Variables */}
      <div className="mb-4">
        <div className="text-xs font-semibold mb-2">CSS Custom Properties:</div>
        <div className="max-h-40 overflow-y-auto">
          {Object.entries(themeVars).map(([name, value]) => (
            <ColorPreview key={name} name={name} value={value} />
          ))}
        </div>
      </div>
      
      {/* Element Inspector */}
      <div className="mb-4">
        <div className="text-xs font-semibold mb-2">Element Inspector:</div>
        <button
          onClick={() => {
            // Enable element selection mode
            const handler = (e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              
              const target = e.target as Element;
              if (target && !target.closest('.theme-debugger')) {
                inspectElement(target);
                document.removeEventListener('click', handler, true);
              }
            };
            
            document.addEventListener('click', handler, true);
          }}
          className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded"
        >
          Select Element
        </button>
        
        {selectedElement && (
          <div className="mt-2 text-xs">
            <div className="text-gray-400">Selected:</div>
            <div className="font-mono text-green-400">
              {selectedElement.tagName.toLowerCase()}
              {selectedElement.className && `.${selectedElement.className.split(' ')[0]}`}
            </div>
          </div>
        )}
      </div>
      
      {/* Diagnostic Tools */}
      <div className="mb-4">
        <div className="text-xs font-semibold mb-2">Diagnostic Tools:</div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => {
              // Find elements with background colors
              const elements = document.querySelectorAll('*');
              const withBackgrounds: Array<{element: Element, background: string}> = [];
              
              elements.forEach(el => {
                const computed = getComputedStyle(el);
                const bg = computed.backgroundColor;
                if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                  withBackgrounds.push({ element: el, background: bg });
                }
              });
              
              console.log('Elements with backgrounds:', withBackgrounds);
            }}
            className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded"
          >
            Find Background Elements
          </button>
          
          <button
            onClick={() => {
              // Toggle debug outlines
              document.body.classList.toggle('debug-outlines');
            }}
            className="text-xs bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded"
          >
            Toggle Debug Outlines
          </button>
          
          <button
            onClick={() => {
              // Export theme variables
              const exportData = {
                timestamp: new Date().toISOString(),
                theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                variables: themeVars
              };
              
              console.log('Theme Export:', exportData);
              
              // Copy to clipboard if available
              if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
              }
            }}
            className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded"
          >
            Export Theme Data
          </button>
        </div>
      </div>
      
      {/* Quick Theme Tests */}
      <div>
        <div className="text-xs font-semibold mb-2">Quick Tests:</div>
        <div className="grid grid-cols-2 gap-1">
          <div 
            className="p-2 rounded text-xs text-center"
            style={{ 
              backgroundColor: 'var(--background)', 
              color: 'var(--foreground)',
              border: '1px solid var(--border)'
            }}
          >
            Background
          </div>
          <div 
            className="p-2 rounded text-xs text-center"
            style={{ 
              backgroundColor: 'var(--card)', 
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)'
            }}
          >
            Card
          </div>
          <div 
            className="p-2 rounded text-xs text-center"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'var(--primary-foreground)'
            }}
          >
            Primary
          </div>
          <div 
            className="p-2 rounded text-xs text-center"
            style={{ 
              backgroundColor: 'var(--secondary)', 
              color: 'var(--secondary-foreground)'
            }}
          >
            Secondary
          </div>
        </div>
      </div>
    </div>
  );
}