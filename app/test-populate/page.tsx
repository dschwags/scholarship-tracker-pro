'use client';

import { useState } from 'react';

async function testPopulateGoals() {
  // Simple inline function to populate goals
  const response = await fetch('/api/test-populate-goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json();
}

export default function TestPopulatePage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePopulate = async () => {
    setIsLoading(true);
    try {
      const result = await testPopulateGoals();
      setResult(result);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test: Populate Financial Goals</h1>
      
      <button
        onClick={handlePopulate}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 mb-6"
      >
        {isLoading ? 'Populating...' : 'Add Financial Goals to Test Users'}
      </button>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>This will add comprehensive financial goals to:</p>
        <ul className="mt-2 space-y-1">
          <li>• user1@stp.com: Bachelor's CS ($85K) + Study abroad Japan ($18K)</li>
          <li>• user2@stp.com: Master's Data Science ($72K) + Professional dev ($8.5K)</li>
          <li>• user3@stp.com: Community college transfer ($35K) + Emergency fund ($12K)</li>
        </ul>
      </div>
    </div>
  );
}