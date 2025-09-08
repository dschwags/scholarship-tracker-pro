'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  ExternalLink,
  Phone,
  Mail,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  GraduationCap,
  Users,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Info,
  Save
} from 'lucide-react';
import { getRequirementItemClasses } from '@/lib/utils/alternating-colors';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  links: { label: string; url: string; id: string }[];
  notes: string;
  isExpanded: boolean;
}

interface Requirement {
  id: string;
  label: string;
  isRequired: boolean;
  isCompleted: boolean;
  isCustom: boolean;
  essayTopic?: string;
  customValue?: string;
  interviewDate?: string;
  documentUrl?: string;
}

interface ScholarshipDetail {
  title: string;
  provider: string;
  organizationUrl: string;
  applicationUrl: string;
  amount: number;
  category: string;
  deadline: string;
  status: string;
  completion: number;
  completionText: string;
  description: string;
  contacts: Contact[];
  documentRequirements: Requirement[];
  academicRequirements: Requirement[];
  activityRequirements: Requirement[];
  processRequirements: Requirement[];
  financialRequirements: Requirement[];
  customRequirements: Requirement[];
}

interface ScholarshipDetailModalProps {
  scholarship: ScholarshipDetail;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scholarship: ScholarshipDetail) => void;
}

export function ScholarshipDetailModal({ 
  scholarship, 
  isOpen, 
  onClose, 
  onSave 
}: ScholarshipDetailModalProps) {
  const [editedScholarship, setEditedScholarship] = useState<ScholarshipDetail>(scholarship);
  const [newCustomField, setNewCustomField] = useState('');
  const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(true);
  
  const statusOptions = [
    'not started',
    'in progress', 
    'submitted',
    'awarded',
    'rejected',
    'waitlisted',
    'withdrawn'
  ];

  if (!isOpen) return null;

  const calculateProgress = () => {
    const allRequirements = [
      ...editedScholarship.documentRequirements,
      ...editedScholarship.academicRequirements,
      ...editedScholarship.activityRequirements,
      ...editedScholarship.processRequirements,
      ...editedScholarship.financialRequirements,
      ...editedScholarship.customRequirements
    ];
    
    const completed = allRequirements.filter(req => req.isCompleted).length;
    const total = allRequirements.length;
    
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const progress = calculateProgress();

  const saveData = (sectionName?: string) => {
    console.log('💾 MODAL SAVE STARTED', sectionName ? `(${sectionName})` : '(MAIN SAVE)');
    onSave(editedScholarship);
    
    const message = sectionName ? `${sectionName} saved successfully!` : 'All changes saved successfully!';
    alert(message);
    
    if (!sectionName) {
      onClose();
    }
  };

  const toggleRequirement = (section: keyof ScholarshipDetail, requirementId: string) => {
    setEditedScholarship(prev => ({
      ...prev,
      [section]: (prev[section] as Requirement[]).map(req =>
        req.id === requirementId
          ? { ...req, isCompleted: !req.isCompleted }
          : req
      )
    }));
  };

  const addCustomRequirement = (section: keyof ScholarshipDetail) => {
    if (!newCustomField.trim()) return;
    
    const newRequirement: Requirement = {
      id: Date.now().toString(),
      label: newCustomField.trim(),
      isRequired: false,
      isCompleted: false,
      isCustom: true
    };
    
    setEditedScholarship(prev => ({
      ...prev,
      [section]: [...(prev[section] as Requirement[]), newRequirement]
    }));
    
    setNewCustomField('');
  };

  const removeRequirement = (section: keyof ScholarshipDetail, requirementId: string) => {
    setEditedScholarship(prev => ({
      ...prev,
      [section]: (prev[section] as Requirement[]).filter(req => req.id !== requirementId)
    }));
  };

  const renderRequirementSection = (
    title: string,
    Icon: any,
    section: keyof ScholarshipDetail,
    requirements: Requirement[]
  ) => (
    <Card key={section} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" title={`Manage ${title.toLowerCase()} for this scholarship`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-transparent">
        <div className="space-y-3">
          {requirements.map((requirement, index) => (
            <div key={requirement.id} className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 ${getRequirementItemClasses(index)}`}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {/* Required Checkbox */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-red-600 mb-1">REQ</span>
                    <input
                      type="checkbox"
                      checked={requirement.isRequired}
                      onChange={(e) => {
                        const updated = (editedScholarship[section] as Requirement[]).map(req =>
                          req.id === requirement.id
                            ? { ...req, isRequired: e.target.checked }
                            : req
                        );
                        setEditedScholarship(prev => ({ ...prev, [section]: updated }));
                      }}
                      className="w-4 h-4 border-2 border-red-300 rounded"
                    />
                  </div>
                  
                  {/* Completed Checkbox */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-green-600 mb-1">DONE</span>
                    <input
                      type="checkbox"
                      checked={requirement.isCompleted}
                      onChange={() => toggleRequirement(section, requirement.id)}
                      className="w-4 h-4 border-2 border-green-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <span className={`${requirement.isCompleted ? 'line-through text-gray-500' : ''}`}>
                    {requirement.label}
                  </span>
                  
                  {/* Document URL Field - Only for Documents section */}
                  {section === 'documentRequirements' && (
                    <div className="mt-2">
                      <Input
                        placeholder="Document link (Google Drive, Dropbox, etc.)..."
                        value={requirement.documentUrl || ''}
                        onChange={(e) => {
                          const updated = (editedScholarship[section] as Requirement[]).map(req =>
                            req.id === requirement.id
                              ? { ...req, documentUrl: e.target.value }
                              : req
                          );
                          setEditedScholarship(prev => ({ ...prev, [section]: updated }));
                        }}
                        className="text-sm"
                      />
                      {requirement.documentUrl && (
                        <div className="mt-1">
                          <a 
                            href={requirement.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-xs flex items-center gap-1"
                          >
                            Open Document ⬈
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {(requirement.isCustom || section === 'documentRequirements') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRequirement(section, requirement.id)}
                  className="text-red-500 hover:text-red-700"
                  title={requirement.isCustom ? "Delete custom requirement" : "Delete document requirement"}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          {/* Add Custom Requirement */}
          <div className="flex gap-2 pt-2">
            <Input
              placeholder={`Add custom ${title.toLowerCase()} requirement...`}
              value={newCustomField}
              onChange={(e) => setNewCustomField(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addCustomRequirement(section);
                }
              }}
            />
            <Button
              onClick={() => addCustomRequirement(section)}
              disabled={!newCustomField.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Save Button for Section */}
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button onClick={() => saveData(title)} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save {title}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{editedScholarship.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {progress.completed} of {progress.total} requirements completed - {progress.percentage}%
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <Progress value={progress.percentage} className="h-3" />
        </div>

        {/* Instructions Header - Compact 3-Column Layout */}
        <div className="mx-6 mt-4 p-3 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 underline text-sm">How to Use This Form</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 h-6 w-6 p-0"
                >
                  {isInstructionsExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
              {isInstructionsExpanded && (
                <div className="grid grid-cols-3 gap-4 text-xs text-blue-800 dark:text-blue-200">
                  <div>
                    <h4 className="font-semibold mb-1">Quick Edit</h4>
                    <ul className="space-y-0.5">
                      <li>• All fields editable</li>
                      <li>• Save sections individually</li>
                      <li>• Save all to close</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Status Tracker</h4>
                    <ul className="space-y-0.5">
                      <li>• <strong className="text-red-600">REQ</strong> - Required items</li>
                      <li>• <strong className="text-green-600">DONE</strong> - Completed</li>
                      <li>• Progress bar shows %</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Tools</h4>
                    <ul className="space-y-0.5">
                      <li>• Add custom fields</li>
                      <li>• Delete with trash icons</li>
                      <li>• ? for help tips</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 bg-white dark:bg-gray-900">
          
          {/* Basic Information */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" title="Update scholarship details like amount, deadline, and contact information. All fields are directly editable." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Scholarship Title</Label>
                  <Input 
                    value={editedScholarship.title || ''}
                    onChange={(e) => setEditedScholarship(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Organization Name</Label>
                  <Input 
                    value={editedScholarship.provider || ''}
                    onChange={(e) => setEditedScholarship(prev => ({ ...prev, provider: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Organization URL</Label>
                  <Input 
                    value={editedScholarship.organizationUrl || ''}
                    onChange={(e) => setEditedScholarship(prev => ({ ...prev, organizationUrl: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Application URL</Label>
                  <Input 
                    value={editedScholarship.applicationUrl || ''}
                    onChange={(e) => setEditedScholarship(prev => ({ ...prev, applicationUrl: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Amount ($)</Label>
                  <Input 
                    type="number"
                    value={editedScholarship.amount || 0}
                    onChange={(e) => setEditedScholarship(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input 
                    type="date"
                    value={editedScholarship.deadline || ''}
                    onChange={(e) => setEditedScholarship(prev => ({ ...prev, deadline: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input 
                    value={editedScholarship.category || ''}
                    onChange={(e) => setEditedScholarship(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={editedScholarship.status || ''}
                    onValueChange={(value) => setEditedScholarship(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description / Notes</Label>
                <textarea 
                  className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Add personal notes about this scholarship..."
                  value={editedScholarship.description || ''}
                  onChange={(e) => setEditedScholarship(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              {/* Save Button for Basic Info */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => saveData('Basic Information')} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Basic Information
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requirements Sections */}
          {renderRequirementSection(
            'Documents',
            FileText,
            'documentRequirements',
            editedScholarship.documentRequirements
          )}
          
          {renderRequirementSection(
            'Academic Requirements',
            GraduationCap,
            'academicRequirements',
            editedScholarship.academicRequirements
          )}
          
          {renderRequirementSection(
            'Activities & Experience',
            Users,
            'activityRequirements',
            editedScholarship.activityRequirements
          )}
          
          {renderRequirementSection(
            'Communication & Follow-up',
            ClipboardList,
            'processRequirements',
            editedScholarship.processRequirements
          )}
          
          {renderRequirementSection(
            'Financial Information',
            CreditCard,
            'financialRequirements',
            editedScholarship.financialRequirements
          )}
          
          {renderRequirementSection(
            'Custom Requirements',
            Plus,
            'customRequirements',
            editedScholarship.customRequirements
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => saveData()}>
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}