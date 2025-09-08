'use client';

import { useState } from 'react';

interface ZIndexDetectorProps {
  enabled?: boolean;
}

export function ZIndexDetector({ enabled = false }: ZIndexDetectorProps) {
  const [currentZIndex, setCurrentZIndex] = useState('-z-10');
  const [color, setColor] = useState('bg-red-500');
  const [opacity, setOpacity] = useState('opacity-50');

  const zIndexOptions = [
    '-z-50', '-z-40', '-z-30', '-z-20', '-z-10', 
    '-z-5', '-z-1', 'z-0', 'z-1', 'z-5', 
    'z-10', 'z-20', 'z-30', 'z-40', 'z-50'
  ];

  const colorOptions = [
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-black', label: 'Black' },
  ];

  const opacityOptions = [
    { value: 'opacity-10', label: '10%' },
    { value: 'opacity-25', label: '25%' },
    { value: 'opacity-50', label: '50%' },
    { value: 'opacity-75', label: '75%' },
    { value: 'opacity-90', label: '90%' },
  ];

  if (!enabled) return null;

  return (
    <>
      {/* Debug Overlay */}
      <div className={`fixed inset-0 ${color} ${opacity} pointer-events-none ${currentZIndex}`}>
        <div className="absolute top-4 left-4 text-white font-bold bg-black/50 px-2 py-1 rounded">
          DEBUG OVERLAY: {currentZIndex}
        </div>
      </div>

      {/* Debug Controls */}
      <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 min-w-64">
        <h3 className="font-bold mb-3 text-sm">🔍 Z-Index Detector</h3>
        
        <div className="space-y-3 text-xs">
          {/* Z-Index Selection */}
          <div>
            <label className="block font-medium mb-1">Z-Index Level:</label>
            <select 
              value={currentZIndex} 
              onChange={(e) => setCurrentZIndex(e.target.value)}
              className="w-full p-1 border rounded text-black"
            >
              {zIndexOptions.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block font-medium mb-1">Overlay Color:</label>
            <select 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-1 border rounded text-black"
            >
              {colorOptions.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Opacity Selection */}
          <div>
            <label className="block font-medium mb-1">Opacity:</label>
            <select 
              value={opacity} 
              onChange={(e) => setOpacity(e.target.value)}
              className="w-full p-1 border rounded text-black"
            >
              {opacityOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <p className="font-medium mb-2">Quick Tests:</p>
            <div className="flex gap-1 flex-wrap">
              <button 
                onClick={() => {setCurrentZIndex('-z-10'); setColor('bg-red-500');}}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
              >
                Start Test
              </button>
              <button 
                onClick={() => {setCurrentZIndex('z-0'); setColor('bg-blue-500');}}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Test z-0
              </button>
              <button 
                onClick={() => {setCurrentZIndex('z-10'); setColor('bg-green-500');}}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
              >
                Test z-10
              </button>
            </div>
          </div>

          <div className="pt-2 border-t text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>Usage:</strong> Start at -z-10 and work up until your issue disappears. That tells you the z-index range of the problematic element.
          </div>
        </div>
      </div>
    </>
  );
}

// Usage in any component:
// <ZIndexDetector enabled={process.env.NODE_ENV === 'development'} />