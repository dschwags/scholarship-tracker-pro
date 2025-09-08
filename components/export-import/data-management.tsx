'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Upload, 
  Share, 
  Users, 
  GraduationCap, 
  FileText,
  ArrowUpRight
} from 'lucide-react';
import ExportModal from './export-modal';
import { ImportModal } from './import-modal';
import { ImportResult } from '@/lib/export-import/types';

interface DataManagementProps {
  scholarships: any[];
  studentProfile: any;
  financialGoals: any[];
  onDataImported: (result: ImportResult) => void;
}

export function DataManagement({ 
  scholarships, 
  studentProfile, 
  financialGoals, 
  onDataImported 
}: DataManagementProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const stats = {
    totalScholarships: scholarships.length,
    appliedCount: scholarships.filter(s => s.status === 'submitted' || s.status === 'in-progress').length,
    potentialFunding: scholarships.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0)
  };
  
  console.log('📊 DataManagement: Calculated stats:', {
    totalScholarships: stats.totalScholarships,
    appliedCount: stats.appliedCount,
    potentialFunding: stats.potentialFunding,
    rawAmounts: scholarships.map(s => ({ id: s.id, amount: s.amount, type: typeof s.amount }))
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalScholarships}</div>
                <div className="text-sm text-muted-foreground">Total Scholarships</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.appliedCount}</div>
                <div className="text-sm text-muted-foreground">Applications</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  ${stats.potentialFunding.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Potential Funding</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Share className="w-4 h-4 text-blue-500" />
                <div className="font-medium">Share Template</div>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Create a template for other students or counselors
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowExportModal(true)}
                className="w-full"
              >
                <ArrowUpRight className="w-3 h-3 mr-2" />
                Export Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-500" />
                <div className="font-medium">Full Backup</div>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Complete backup including personal data
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowExportModal(true)}
                className="w-full"
              >
                <Download className="w-3 h-3 mr-2" />
                Create Backup
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <div className="font-medium">Portfolio</div>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Showcase completed applications and essays
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowExportModal(true)}
                className="w-full"
              >
                <FileText className="w-3 h-3 mr-2" />
                Export Portfolio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Import scholarships from templates, backups, or spreadsheets
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">From Counselor/Student</div>
              <div className="text-sm text-muted-foreground mb-3">
                Import scholarship templates shared by counselors or other students
              </div>
              <Button 
                onClick={() => setShowImportModal(true)}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Template
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">From Spreadsheet</div>
              <div className="text-sm text-muted-foreground mb-3">
                Import scholarship data from CSV files or Excel spreadsheets
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowImportModal(true)}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base text-blue-800 dark:text-blue-200">
            💡 Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 dark:text-blue-300">
          <ul className="space-y-2">
            <li>• <strong>Counselors:</strong> Create templates with pre-filled eligibility criteria to help students find relevant scholarships</li>
            <li>• <strong>Students:</strong> Share scholarship opportunities with classmates by exporting templates without personal data</li>
            <li>• <strong>Backup:</strong> Regular exports ensure you never lose your application progress and research</li>
            <li>• <strong>Collaboration:</strong> Use CSV format for easy viewing and editing in spreadsheet applications</li>
          </ul>
        </CardContent>
      </Card>

      {/* Modals */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        scholarships={scholarships}
        studentProfile={studentProfile}
        financialGoals={financialGoals}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={onDataImported}
        existingScholarships={scholarships}
      />
    </div>
  );
}