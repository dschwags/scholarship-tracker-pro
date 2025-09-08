'use client';

import { useState } from 'react';
import { WelcomeDashboard } from '@/components/onboarding/welcome-dashboard';
import { FinancialGoalsModal } from '@/components/goals/financial-goals-modal';
import { ScholarshipDetailModal } from '@/components/scholarship/scholarship-detail-modal';

export default function WelcomeTestPage() {
  const [isFinancialGoalsModalOpen, setIsFinancialGoalsModalOpen] = useState(false);
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  console.log('WelcomeTestPage rendering with states:', {
    isFinancialGoalsModalOpen,
    isScholarshipModalOpen,
    selectedScholarship: !!selectedScholarship
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome Dashboard Test Page</h1>
        <p className="mb-4 text-muted-foreground">
          This is a test page to isolate the WelcomeDashboard component and debug the action handlers.
        </p>
        
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="font-semibold mb-2">Debug Info:</h2>
          <p>Scholarships saved: {scholarships.length}</p>
          <p>Show welcome: {showWelcome ? 'Yes' : 'No'}</p>
          <button 
            onClick={() => setShowWelcome(!showWelcome)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Toggle Welcome Dashboard
          </button>
          <button 
            onClick={() => setScholarships([])}
            className="mt-2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Scholarships
          </button>
        </div>
        
        {showWelcome && (
          <WelcomeDashboard 
          userName="Test User"
          onGetStarted={() => {
            console.log('🎓 TEST PAGE: "Add Your First Scholarship" clicked!');
            console.log('TEST: onGetStarted called - creating scholarship');
            const newScholarship = {
              id: Date.now(),
              title: 'New Scholarship',
              amount: 5000,
              deadline: '2024-12-31',
              status: 'not_started' as const,
              completionPercentage: 0,
              category: 'Test',
              provider: 'Test Provider',
              description: 'A test scholarship for demonstration purposes',
              contacts: [
                {
                  id: '1',
                  name: 'Scholarship Coordinator',
                  role: 'Program Manager',
                  email: 'coordinator@testprovider.com',
                  phone: '(555) 123-4567',
                  links: [
                    { id: '1', label: 'Website', url: 'https://testprovider.com' },
                    { id: '2', label: 'Application Portal', url: 'https://apply.testprovider.com' }
                  ],
                  notes: 'Primary contact for all scholarship inquiries',
                  isExpanded: false
                }
              ],
              documentRequirements: [
                { id: '1', label: 'Official transcript', isRequired: true, isCompleted: false, isCustom: false },
                { id: '2', label: 'Personal essay', isRequired: true, isCompleted: false, isCustom: false },
                { id: '3', label: 'Letter of recommendation', isRequired: true, isCompleted: false, isCustom: false }
              ],
              academicRequirements: [
                { id: '1', label: 'Minimum GPA 3.0', isRequired: true, isCompleted: false, isCustom: false, customValue: '3.0+ required' }
              ],
              activityRequirements: [
                { id: '1', label: 'Community service', isRequired: false, isCompleted: false, isCustom: false, customValue: '50+ hours preferred' }
              ],
              processRequirements: [
                { id: '1', label: 'Application submitted', isRequired: true, isCompleted: false, isCustom: false }
              ],
              financialRequirements: [
                { id: '1', label: 'FAFSA completed', isRequired: false, isCompleted: false, isCustom: false }
              ],
              customRequirements: []
            };
            console.log('📝 Setting scholarship and opening modal...');
            setSelectedScholarship(newScholarship);
            setIsScholarshipModalOpen(true);
            console.log('✅ Modal should be open now');
          }}
          onLoadSampleData={() => {
            console.log('TEST: onLoadSampleData called');
            alert('Sample data would be loaded here');
          }}
          onSetFinancialGoals={() => {
            console.log('TEST: onSetFinancialGoals called - opening financial goals modal');
            setIsFinancialGoalsModalOpen(true);
          }}
          onSetupProfile={() => {
            console.log('TEST: onSetupProfile called');
            alert('Profile setup would open here');
          }}
          />
        )}
        
        {!showWelcome && (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Regular Dashboard View</h2>
            <p className="text-gray-600">This is where the main dashboard would show when scholarships exist.</p>
            <p className="mt-2">Scholarships: {scholarships.length}</p>
            {scholarships.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Saved Scholarships:</h3>
                <ul className="text-left max-w-md mx-auto">
                  {scholarships.map((scholarship, index) => (
                    <li key={index} className="border-b py-1">
                      {scholarship.title || 'Untitled Scholarship'} - {scholarship.provider || 'Unknown Provider'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Financial Goals Modal */}
        <FinancialGoalsModal
          isOpen={isFinancialGoalsModalOpen}
          onClose={() => {
            console.log('TEST: Closing financial goals modal');
            setIsFinancialGoalsModalOpen(false);
          }}
          onSaveGoals={(goals) => {
            console.log('TEST: Saving financial goals:', goals);
            setFinancialGoals(goals);
            setIsFinancialGoalsModalOpen(false);
          }}
          initialGoals={financialGoals}
          mode="create"
        />

        {/* Scholarship Modal */}
        {selectedScholarship && (
          <ScholarshipDetailModal
            scholarship={selectedScholarship}
            isOpen={isScholarshipModalOpen}
            onClose={() => {
              console.log('TEST: Closing scholarship modal');
              setIsScholarshipModalOpen(false);
              setSelectedScholarship(null);
            }}
            onSave={(updatedScholarship) => {
              console.log('💾 TEST PAGE: Saving scholarship:', updatedScholarship.title);
              // Add scholarship to state
              setScholarships(prev => {
                const newScholarships = [...prev, updatedScholarship];
                console.log('📈 New scholarships count:', newScholarships.length);
                return newScholarships;
              });
              setIsScholarshipModalOpen(false);
              setSelectedScholarship(null);
              // Hide welcome screen after adding scholarship
              console.log('🚀 Hiding welcome screen...');
              setShowWelcome(false);
              console.log('✅ Welcome screen should be hidden now');
            }}
          />
        )}
      </div>
    </div>
  );
}