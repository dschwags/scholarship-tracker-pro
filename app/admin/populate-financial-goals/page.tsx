'use client';

import { useState } from 'react';
import { populateFinancialGoalsAction } from '../populate-goals-action';

export default function PopulateFinancialGoalsPage() {
  const [isPopulating, setIsPopulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePopulate = async () => {
    setIsPopulating(true);
    setError(null);
    setResult(null);
    
    try {
      const result = await populateFinancialGoalsAction();
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Populate Financial Goals</h1>
      
      <div className="mb-6">
        <button
          onClick={handlePopulate}
          disabled={isPopulating}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isPopulating ? 'Populating...' : 'Add Financial Goals to Test Users'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong>
          <pre className="mt-2 text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">This will add:</h3>
        <ul className="space-y-2 text-sm">
          <li><strong>user1@stp.com:</strong> Bachelor's CS degree ($85K) + Study abroad in Japan ($18K)</li>
          <li><strong>user2@stp.com:</strong> Master's Data Science ($72K) + Professional development ($8.5K)</li>
          <li><strong>user3@stp.com:</strong> Community college transfer ($35K) + Emergency fund ($12K)</li>
        </ul>
        <p className="mt-2 text-xs text-gray-600">
          Each goal includes detailed expenses, funding sources, academic context, and geographic data.
        </p>
      </div>
    </div>
  );
}