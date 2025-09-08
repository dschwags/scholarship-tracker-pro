'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Scholarship = {
  id: number;
  title: string;
  amount: number;
  deadline: string;
  status: 'not started';
  completion: number;
  completionText: string;
  category: string;
  provider: string;
  organizationUrl: string;
  applicationUrl: string;
  description: string;
  contacts: any[];
  documentRequirements: any[];
  academicRequirements: any[];
  activityRequirements: any[];
  processRequirements: any[];
  financialRequirements: any[];
  customRequirements: any[];
};

const createNewScholarship = (): Scholarship => ({
  id: Date.now(),
  title: '',
  amount: 0,
  deadline: '',
  status: 'not started' as const,
  completion: 0,
  completionText: '0/0 completed',
  category: '',
  provider: '',
  organizationUrl: '',
  applicationUrl: '',
  description: '',
  contacts: [
    {
      id: '1',
      name: '',
      role: '',
      email: '',
      phone: '',
      links: [],
      notes: '',
      isExpanded: true
    }
  ],
  documentRequirements: [],
  academicRequirements: [],
  activityRequirements: [],
  processRequirements: [],
  financialRequirements: [],
  customRequirements: []
});

export default function QuickAddScholarshipPage() {
  console.log('🚀 QUICK ADD PAGE: Starting...')
  
  const newScholarship = createNewScholarship();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Add Your First Scholarship</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <QuickAddForm scholarship={newScholarship} />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAddForm({ scholarship }: { scholarship: any }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    console.log('🔴 SAVE BUTTON: Clicked!');
    
    // Validate form
    if (!title.trim() || !amount.trim() || !deadline.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('💾 Saving scholarship via API:', { title, amount, deadline });
      
      const response = await fetch('/api/scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          title: title.trim(),
          amount: parseFloat(amount),
          deadline: deadline,
          description: `Scholarship added via Quick Add on ${new Date().toLocaleDateString()}`,
          provider: 'Self-Added'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Scholarship saved successfully:', result);
      
      setSaved(true);
      setIsSaving(false);
      
      // Redirect to dashboard after 2 seconds with router refresh
      setTimeout(() => {
        console.log('🔄 Redirecting to dashboard with refresh...');
        router.push('/dashboard');
        router.refresh(); // Force refresh to get latest data
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error saving scholarship:', error);
      setIsSaving(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to save scholarship: ${errorMessage}`);
    }
  };

  if (saved) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
        <p className="text-gray-600 mb-4">Your scholarship "{title}" for ${amount} has been saved to your dashboard!</p>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">🎉 SUCCESS! Modal Bypass Working!</h2>
        <p className="text-green-600 font-medium">
          The Quick Start Action is now functional!
        </p>
        <p className="text-gray-600 mt-2">
          Fill out the basic information below to get started. You can add more details like requirements, contacts, and notes after saving by clicking the "⟲" edit button on your dashboard.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scholarship Title *
          </label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter scholarship name..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Award Amount ($) *
          </label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5000"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Deadline *
          </label>
          <input 
            type="date" 
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex gap-4 pt-4">
          <button 
            onClick={handleSave}
            disabled={!title || !amount || !deadline || isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Scholarship'}
          </button>
          <a href="/dashboard" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}