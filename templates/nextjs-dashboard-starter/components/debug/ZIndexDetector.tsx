'use client';

import { useState } from 'react';

interface ZIndexDetectorProps {
  testLayer?: number;
  color?: string;
  opacity?: number;
}

/**
 * Z-Index Detective Component
 * 
 * Systematically test different z-index layers to isolate CSS layering issues.
 * Particularly useful for debugging persistent white containers in dark mode
 * that can't be located through traditional DevTools inspection.
 * 
 * Usage:
 * <ZIndexDetector testLayer={1000} />
 * 
 * If the overlay disappears at a certain z-index, the problematic element
 * exists between that layer and the previous test value.
 */
export function ZIndexDetector({ 
  testLayer = 1000, 
  color = 'rgba(255, 0, 0, 0.3)',
  opacity = 0.3 
}: ZIndexDetectorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(testLayer);
  
  // Common z-index test values
  const testLayers = [10, 50, 100, 500, 1000, 5000, 9999];
  
  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-red-500 text-white px-3 py-2 rounded shadow-lg z-50 text-sm font-mono"
        title="Start Z-Index Detective"
      >
        🔍 Z-INDEX
      </button>
    );
  }
  
  return (
    <>
      {/* Test Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundColor: color,
          zIndex: currentLayer,
          opacity: opacity
        }}
      >
        <div className="absolute top-4 left-4 bg-black text-white p-2 rounded pointer-events-auto">
          <div className="text-sm font-bold">Z-Index Detective</div>
          <div className="text-xs">Testing Layer: {currentLayer}</div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="fixed bottom-4 left-4 bg-black text-white p-4 rounded shadow-lg z-50 max-w-xs">
        <div className="mb-2">
          <div className="text-sm font-bold mb-2">Z-Index Detective</div>
          <div className="text-xs mb-2">Current Layer: {currentLayer}</div>
        </div>
        
        {/* Quick Test Buttons */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          {testLayers.map(layer => (
            <button
              key={layer}
              onClick={() => setCurrentLayer(layer)}
              className={`px-2 py-1 text-xs rounded ${
                currentLayer === layer 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
        
        {/* Manual Input */}
        <div className="mb-3">
          <input
            type="number"
            value={currentLayer}
            onChange={(e) => setCurrentLayer(parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
            placeholder="Custom z-index"
          />
        </div>
        
        {/* Instructions */}
        <div className="text-xs text-gray-300 mb-3">
          <div className="font-semibold mb-1">Instructions:</div>
          <div>1. Test different z-index values</div>
          <div>2. Note when overlay disappears</div>
          <div>3. Problem element is between that layer and previous</div>
        </div>
        
        {/* Controls */}
        <div className="flex gap-2">
          <button 
            onClick={() => setIsVisible(false)}
            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
          >
            Hide
          </button>
          <button 
            onClick={() => {
              console.log('Z-Index Detective Results:', {
                currentLayer,
                elementsBelowThisLayer: document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
              });
            }}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded"
          >
            Log Elements
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Quick Z-Index Test Hook
 * 
 * For programmatic testing in development
 */
export function useZIndexTest() {
  const testElementsAtLayer = (zIndex: number) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 0, 0, 0.3);
      z-index: ${zIndex};
      pointer-events: none;
    `;
    
    document.body.appendChild(overlay);
    
    // Log elements at center point
    const centerElements = document.elementsFromPoint(
      window.innerWidth / 2, 
      window.innerHeight / 2
    );
    
    console.log(`Elements at z-index ${zIndex}:`, centerElements);
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 3000);
    
    return centerElements;
  };
  
  const findElementsByZIndex = (minZ = 0, maxZ = 1000) => {
    const elements = Array.from(document.querySelectorAll('*'));
    const matches: Array<{ element: Element; zIndex: number }> = [];
    
    elements.forEach(el => {
      const computed = getComputedStyle(el);
      const zIndex = parseInt(computed.zIndex);
      
      if (!isNaN(zIndex) && zIndex >= minZ && zIndex <= maxZ) {
        matches.push({ element: el, zIndex });
      }
    });
    
    return matches.sort((a, b) => b.zIndex - a.zIndex);
  };
  
  return {
    testElementsAtLayer,
    findElementsByZIndex
  };
}