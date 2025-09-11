'use client';

import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { 
  Calendar,
  DollarSign,
  Building2,
  GraduationCap,
  Plus,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  User,
  FileText,
  Users,
  ClipboardList,
  CreditCard,
  Edit,
  HelpCircle,
  Info,
  Save,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Trophy,
  CheckSquare,
  Settings
} from 'lucide-react';

// Scholarship categories based on existing data
const SCHOLARSHIP_CATEGORIES = [
  'Merit',
  'Need-Based',
  'STEM',
  'Athletics',
  'Service',
  'Research',
  'Diversity'
];

// Status options
const STATUS_OPTIONS = [
  'not started',
  'in progress', 
  'submitted',
  'awarded',
  'rejected',
  'waitlisted',
  'withdrawn'
];

// Interfaces for comprehensive form data
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
  customValue?: string;
  interviewDate?: string;
  interviewTime?: string;
}

interface NewScholarshipData {
  title: string;
  provider: string;
  amount: number;
  deadline: string;
  status: string;
  category: string;
  organizationUrl: string;
  applicationUrl: string;
  description: string;
  essayTopic?: string;
  essayLink?: string;
  financialDocsLink?: string;
  contacts: Contact[];
  documentRequirements: Requirement[];
  academicRequirements: Requirement[];
  activityRequirements: Requirement[];
  processRequirements: Requirement[];
  communicationRequirements: Requirement[];
  financialRequirements: Requirement[];
  customRequirements: Requirement[];
  completion: number;
  completionText: string;
}

interface ScholarshipCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateScholarship: (scholarship: NewScholarshipData) => void;
}

// Default requirements based on common scholarship needs
const getDefaultDocumentRequirements = (): Requirement[] => [
  { id: 'doc-1', label: 'Official transcript', isRequired: false, isCompleted: false, isCustom: false },
  { id: 'doc-2', label: 'Letters of recommendation', isRequired: false, isCompleted: false, isCustom: false },
  { id: 'doc-3', label: 'Personal essay', isRequired: false, isCompleted: false, isCustom: false },
  { id: 'doc-4', label: 'Financial aid forms', isRequired: false, isCompleted: false, isCustom: false }
];

const getDefaultAcademicRequirements = (): Requirement[] => [
  { id: 'acad-1', label: 'GPA verification', isRequired: false, isCompleted: false, isCustom: false },
  { id: 'acad-2', label: 'Test scores', isRequired: false, isCompleted: false, isCustom: false }
];

const getDefaultActivityRequirements = (): Requirement[] => [
  { id: 'act-1', label: 'Community service', isRequired: false, isCompleted: false, isCustom: false },
  { id: 'act-2', label: 'Leadership experience', isRequired: false, isCompleted: false, isCustom: false }
];

const getDefaultProcessRequirements = (): Requirement[] => [
  { id: 'proc-1', label: 'Application submitted', isRequired: false, isCompleted: false, isCustom: false },
  { id: 'proc-2', label: 'Interview completed', isRequired: false, isCompleted: false, isCustom: false, interviewDate: '', interviewTime: '' }
];

const getDefaultCommunicationRequirements = (): Requirement[] => [
  { id: 'comm-1', label: 'Application submitted', isRequired: false, isCompleted: false, isCustom: false },
  { id: 'comm-2', label: 'Interview completed', isRequired: false, isCompleted: false, isCustom: false, interviewDate: '', interviewTime: '' }
];

const getDefaultFinancialRequirements = (): Requirement[] => [
  { id: 'fin-1', label: 'FAFSA completed', isRequired: false, isCompleted: false, isCustom: false }
];

// Initial form data constant
const initialFormData: NewScholarshipData = {
  title: '',
  provider: '',
  amount: 0,
  deadline: '',
  status: 'not started',
  category: '',
  organizationUrl: '',
  applicationUrl: '',
  description: '',
  essayTopic: '',
  essayLink: '',
  financialDocsLink: '',
  contacts: [],
  documentRequirements: getDefaultDocumentRequirements(),
  academicRequirements: getDefaultAcademicRequirements(),
  activityRequirements: getDefaultActivityRequirements(),
  processRequirements: getDefaultProcessRequirements(),
  communicationRequirements: getDefaultCommunicationRequirements(),
  financialRequirements: getDefaultFinancialRequirements(),
  customRequirements: [],
  completion: 0,
  completionText: '0/0 completed'
};

export function ScholarshipCreationForm({
  isOpen,
  onClose,
  onCreateScholarship
}: ScholarshipCreationFormProps) {
  // Initialize comprehensive form data with all fields empty/zeroed
  const [formData, setFormData] = useState<NewScholarshipData>(initialFormData);

  const [errors, setErrors] = useState<Partial<Record<keyof NewScholarshipData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(true);
  const [newCustomField, setNewCustomField] = useState('');
  const [activeSection, setActiveSection] = useState<string>('basic');

  // Helper functions for comprehensive form management

  const getHelpText = (sectionTitle: string): string => {
    switch (sectionTitle) {
      case 'Document Requirements':
        return 'Track required documents like transcripts, essays, and letters. Mark as REQ if required, DONE when completed. Add essay topics for personal statements.';
      case 'Academic Requirements':
        return 'Enter GPA minimums, test score requirements, and course prerequisites. Use custom fields to specify exact requirements.';
      case 'Activities & Experience':
        return 'Track extracurricular requirements like community service hours, leadership experience, or work experience needed.';
      case 'Application Process':
        return 'Manage interview scheduling, thank you notes, and follow-up communications with scholarship providers.';
      case 'Financial Information':
        return 'Track financial aid documents like FAFSA, tax documents, or other financial requirements.';
      case 'Custom Requirements':
        return 'Add any additional requirements specific to this scholarship that dont fit in other categories.';
      default:
        return 'Use checkboxes to mark items as required (REQ) or completed (DONE). Add custom fields as needed.';
    }
  };

  const HelpTooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div className="inline-flex cursor-help">
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm p-2">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewScholarshipData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Scholarship title is required';
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'Provider/organization is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    // Category is optional - no validation needed

    // URL validation (optional fields but must be valid if provided)
    if (formData.organizationUrl && !isValidUrl(formData.organizationUrl)) {
      newErrors.organizationUrl = 'Please enter a valid URL';
    }

    if (formData.applicationUrl && !isValidUrl(formData.applicationUrl)) {
      newErrors.applicationUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate progress for the new scholarship
      const progress = calculateProgress();
      
      // Create the scholarship object with additional calculated fields
      const newScholarship = {
        ...formData,
        id: Date.now(), // Simple ID generation for demo
        completion: progress,
        completionText: `0/${formData.documentRequirements.length + formData.academicRequirements.length + formData.activityRequirements.length + formData.processRequirements.length + formData.communicationRequirements.length + formData.financialRequirements.length + formData.customRequirements.length} completed`
      };

      onCreateScholarship(newScholarship);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Error creating scholarship:', error);
      // In a real app, you'd show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({ ...initialFormData });
    setErrors({});
    setActiveSection('basic');
    setShowHelpGuide(true);
    setNewCustomField('');
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof NewScholarshipData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Contact management functions
  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: '',
      role: '',
      email: '',
      phone: '',
      links: [],
      notes: '',
      isExpanded: true
    };
    
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const updateContact = (contactId: string, field: keyof Contact, value: any) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === contactId
          ? { ...contact, [field]: value }
          : contact
      )
    }));
  };

  const removeContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== contactId)
    }));
  };

  const toggleContact = (contactId: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === contactId
          ? { ...contact, isExpanded: !contact.isExpanded }
          : contact
      )
    }));
  };

  // Requirement management functions
  const addRequirement = (section: 'documentRequirements' | 'academicRequirements' | 'activityRequirements' | 'processRequirements' | 'communicationRequirements' | 'financialRequirements' | 'customRequirements') => {
    if (!newCustomField.trim()) return;
    
    const newRequirement: Requirement = {
      id: Date.now().toString(),
      label: newCustomField.trim(),
      isRequired: false,
      isCompleted: false,
      isCustom: true
    };
    
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newRequirement]
    }));
    
    setNewCustomField('');
  };

  const updateRequirement = (section: string, requirementId: string, field: keyof Requirement, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section as keyof NewScholarshipData] as Requirement[]).map(req =>
        req.id === requirementId
          ? { ...req, [field]: value }
          : req
      )
    }));
  };

  const removeRequirement = (section: string, requirementId: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section as keyof NewScholarshipData] as Requirement[]).filter(req => req.id !== requirementId)
    }));
  };

  // Calculate progress
  const calculateProgress = () => {
    const allRequirements = [
      ...formData.documentRequirements,
      ...formData.academicRequirements,
      ...formData.activityRequirements,
      ...formData.processRequirements,
      ...formData.communicationRequirements,
      ...formData.financialRequirements,
      ...formData.customRequirements
    ];
    
    const requiredRequirements = allRequirements.filter(req => req.isRequired);
    
    if (requiredRequirements.length === 0) return 0;
    
    const completedRequirements = requiredRequirements.filter(req => req.isCompleted);
    
    return Math.round((completedRequirements.length / requiredRequirements.length) * 100);
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Scholarship
          </DialogTitle>
          <DialogDescription>
            Create a new scholarship application to track your progress and requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Collapsible How-To Guide */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                  <HelpCircle className="w-4 h-4" />
                  How to Create a Scholarship Application
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpGuide(!showHelpGuide)}
                  className="text-blue-700 hover:text-blue-800"
                >
                  {showHelpGuide ? (
                    <><ChevronUp className="w-4 h-4" /> Hide Guide</>
                  ) : (
                    <><ChevronDown className="w-4 h-4" /> Show Guide</>
                  )}
                </Button>
              </div>
            </CardHeader>
            {showHelpGuide && (
              <CardContent className="text-sm text-blue-700 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">📋 Getting Started</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Fill in basic information (title, provider, amount, deadline)</li>
                      <li>• Add contacts for this scholarship (optional but recommended)</li>
                      <li>• Define all requirements in the appropriate sections</li>
                      <li>• Mark requirements as "Required" if they're mandatory</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">✅ Best Practices</h4>
                    <ul className="space-y-1 text-xs">
                      <li>• Break down complex requirements into smaller tasks</li>
                      <li>• Use custom requirements for unique scholarship needs</li>
                      <li>• Check off completed items to track your progress</li>
                      <li>• Keep contact information up-to-date</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-md">
                  <p className="text-xs">
                    <strong>💡 Tip:</strong> All fields start empty - you can add as much or as little detail as needed. 
                    You can always edit this information later from the scholarship details page.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Progress Overview (only show if there are requirements) */}
          {formData.documentRequirements.length > 0 || formData.academicRequirements.length > 0 || formData.activityRequirements.length > 0 || formData.processRequirements.length > 0 || formData.communicationRequirements.length > 0 || formData.financialRequirements.length > 0 || formData.customRequirements.length > 0 ? (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">Progress Overview</span>
                  <span className="text-sm text-green-700">{calculateProgress()}% Complete</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title">
                  Scholarship Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g., Merit Excellence Scholarship"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Provider */}
              <div className="space-y-2">
                <Label htmlFor="provider">
                  Provider/Organization <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => handleFieldChange('provider', e.target.value)}
                  placeholder="e.g., State University Foundation"
                  className={errors.provider ? 'border-red-500' : ''}
                />
                {errors.provider && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.provider}
                  </p>
                )}
              </div>

              {/* Amount and Category Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="amount">
                    Amount ($) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.amount}
                      onChange={(e) => handleFieldChange('amount', parseInt(e.target.value) || 0)}
                      placeholder="5000"
                      className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleFieldChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOLARSHIP_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Deadline and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    Application Deadline <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleFieldChange('deadline', e.target.value)}
                      className={`pl-10 ${errors.deadline ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.deadline}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleFieldChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links and Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Organization URL */}
              <div className="space-y-2">
                <Label htmlFor="organizationUrl">Organization Website</Label>
                <Input
                  id="organizationUrl"
                  type="url"
                  value={formData.organizationUrl}
                  onChange={(e) => handleFieldChange('organizationUrl', e.target.value)}
                  placeholder="https://www.organization.edu"
                  className={errors.organizationUrl ? 'border-red-500' : ''}
                />
                {errors.organizationUrl && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.organizationUrl}
                  </p>
                )}
              </div>

              {/* Application URL */}
              <div className="space-y-2">
                <Label htmlFor="applicationUrl">Application Portal</Label>
                <Input
                  id="applicationUrl"
                  type="url"
                  value={formData.applicationUrl}
                  onChange={(e) => handleFieldChange('applicationUrl', e.target.value)}
                  placeholder="https://apply.organization.edu/scholarship"
                  className={errors.applicationUrl ? 'border-red-500' : ''}
                />
                {errors.applicationUrl && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.applicationUrl}
                  </p>
                )}
              </div>

              {/* Essay Topic Field */}
              <div className="space-y-1">
                <Label htmlFor="essayTopic">Essay Topic/Prompt</Label>
                <Input
                  id="essayTopic"
                  value={formData.essayTopic || ''}
                  onChange={(e) => handleFieldChange('essayTopic', e.target.value)}
                  placeholder="e.g., Describe your leadership experience and future goals..."
                />
              </div>

              {/* Essay Link Field */}
              <div className="space-y-1">
                <Label htmlFor="essayLink">Essay Document Link (Optional)</Label>
                <Input
                  id="essayLink"
                  type="url"
                  value={formData.essayLink || ''}
                  onChange={(e) => handleFieldChange('essayLink', e.target.value)}
                  placeholder="https://docs.google.com/document/... (for reference only)"
                />
              </div>

              {/* Financial Documents Link */}
              <div className="space-y-1">
                <Label htmlFor="financialDocsLink">Financial Documents Link (Optional)</Label>
                <Input
                  id="financialDocsLink"
                  type="url"
                  value={formData.financialDocsLink || ''}
                  onChange={(e) => handleFieldChange('financialDocsLink', e.target.value)}
                  placeholder="https://drive.google.com/folder/... (for reference only)"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Brief description of the scholarship requirements, eligibility criteria, or notes..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacts Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contacts ({formData.contacts.length})
                </CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addContact}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.contacts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No contacts added yet. Click "Add Contact" to start.
                </p>
              ) : (
                formData.contacts.map((contact, index) => (
                  <Card key={contact.id} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleContact(contact.id)}
                          className="flex-1 justify-start p-0 h-auto font-normal"
                        >
                          <div className="flex items-center gap-2">
                            {contact.isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {contact.name || `Contact ${index + 1}`} 
                              {contact.role && ` (${contact.role})`}
                            </span>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(contact.id)}
                          className="text-red-500 hover:text-red-600 h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {contact.isExpanded && (
                      <CardContent className="pt-0 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={contact.name}
                              onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                              placeholder="Contact name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Role/Title</Label>
                            <Input
                              value={contact.role}
                              onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                              placeholder="e.g., Scholarship Coordinator"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Email</Label>
                            <Input
                              type="email"
                              value={contact.email}
                              onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                              placeholder="email@domain.com"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Phone</Label>
                            <Input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                              placeholder="(555) 123-4567"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <Label className="text-xs">Notes</Label>
                          <Textarea
                            value={contact.notes}
                            onChange={(e) => updateContact(contact.id, 'notes', e.target.value)}
                            placeholder="Additional notes about this contact..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Requirements Sections */}
          <div className="grid gap-3">
            {/* Document Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Requirements ({formData.documentRequirements.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCustomField}
                      onChange={(e) => setNewCustomField(e.target.value)}
                      placeholder="Add custom requirement"
                      className="h-8 text-sm w-48"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement('documentRequirements');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRequirement('documentRequirements')}
                      disabled={!newCustomField.trim()}
                      className="text-xs h-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {formData.documentRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No document requirements added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.documentRequirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.isCompleted}
                            onChange={(e) => updateRequirement('documentRequirements', req.id, 'isCompleted', e.target.checked)}
                            className="rounded"
                          />
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <Input
                              value={req.label}
                              onChange={(e) => updateRequirement('documentRequirements', req.id, 'label', e.target.value)}
                              className="h-7 text-sm border-none p-1 bg-transparent"
                            />
                          </div>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={req.isRequired}
                              onChange={(e) => updateRequirement('documentRequirements', req.id, 'isRequired', e.target.checked)}
                              className="rounded w-3 h-3"
                            />
                            Required
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement('documentRequirements', req.id)}
                          className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Academic Requirements ({formData.academicRequirements.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCustomField}
                      onChange={(e) => setNewCustomField(e.target.value)}
                      placeholder="Add custom requirement"
                      className="h-8 text-sm w-48"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement('academicRequirements');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRequirement('academicRequirements')}
                      disabled={!newCustomField.trim()}
                      className="text-xs h-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.academicRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No academic requirements added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.academicRequirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.isCompleted}
                            onChange={(e) => updateRequirement('academicRequirements', req.id, 'isCompleted', e.target.checked)}
                            className="rounded"
                          />
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <Input
                              value={req.label}
                              onChange={(e) => updateRequirement('academicRequirements', req.id, 'label', e.target.value)}
                              className="h-7 text-sm border-none p-1 bg-transparent"
                            />
                          </div>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={req.isRequired}
                              onChange={(e) => updateRequirement('academicRequirements', req.id, 'isRequired', e.target.checked)}
                              className="rounded w-3 h-3"
                            />
                            Required
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement('academicRequirements', req.id)}
                          className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Activity Requirements ({formData.activityRequirements.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCustomField}
                      onChange={(e) => setNewCustomField(e.target.value)}
                      placeholder="Add custom requirement"
                      className="h-8 text-sm w-48"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement('activityRequirements');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRequirement('activityRequirements')}
                      disabled={!newCustomField.trim()}
                      className="text-xs h-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.activityRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No activity requirements added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.activityRequirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.isCompleted}
                            onChange={(e) => updateRequirement('activityRequirements', req.id, 'isCompleted', e.target.checked)}
                            className="rounded"
                          />
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <Input
                              value={req.label}
                              onChange={(e) => updateRequirement('activityRequirements', req.id, 'label', e.target.value)}
                              className="h-7 text-sm border-none p-1 bg-transparent"
                            />
                          </div>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={req.isRequired}
                              onChange={(e) => updateRequirement('activityRequirements', req.id, 'isRequired', e.target.checked)}
                              className="rounded w-3 h-3"
                            />
                            Required
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement('activityRequirements', req.id)}
                          className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Process Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Process Requirements ({formData.processRequirements.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCustomField}
                      onChange={(e) => setNewCustomField(e.target.value)}
                      placeholder="Add custom requirement"
                      className="h-8 text-sm w-48"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement('processRequirements');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRequirement('processRequirements')}
                      disabled={!newCustomField.trim()}
                      className="text-xs h-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.processRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No process requirements added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.processRequirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.isCompleted}
                            onChange={(e) => updateRequirement('processRequirements', req.id, 'isCompleted', e.target.checked)}
                            className="rounded"
                          />
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <Input
                              value={req.label}
                              onChange={(e) => updateRequirement('processRequirements', req.id, 'label', e.target.value)}
                              className="h-7 text-sm border-none p-1 bg-transparent"
                            />
                          </div>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={req.isRequired}
                              onChange={(e) => updateRequirement('processRequirements', req.id, 'isRequired', e.target.checked)}
                              className="rounded w-3 h-3"
                            />
                            Required
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement('processRequirements', req.id)}
                          className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Communication & Follow-up Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Communication & Follow-up ({formData.communicationRequirements.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCustomField}
                      onChange={(e) => setNewCustomField(e.target.value)}
                      placeholder="Add custom requirement"
                      className="h-8 text-sm w-48"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement('communicationRequirements');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRequirement('communicationRequirements')}
                      disabled={!newCustomField.trim()}
                      className="text-xs h-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.communicationRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No communication requirements added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.communicationRequirements.map((req) => (
                      <div key={req.id} className="border rounded p-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={req.isCompleted}
                              onChange={(e) => updateRequirement('communicationRequirements', req.id, 'isCompleted', e.target.checked)}
                              className="rounded"
                            />
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <Input
                                value={req.label}
                                onChange={(e) => updateRequirement('communicationRequirements', req.id, 'label', e.target.value)}
                                className="h-7 text-sm border-none p-1 bg-transparent"
                              />
                            </div>
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={req.isRequired}
                                onChange={(e) => updateRequirement('communicationRequirements', req.id, 'isRequired', e.target.checked)}
                                className="rounded w-3 h-3"
                              />
                              Required
                            </label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement('communicationRequirements', req.id)}
                            className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {req.label.toLowerCase().includes('interview') && (
                          <div className="flex items-center gap-2 ml-6">
                            <div className="flex items-center gap-1">
                              <Label className="text-xs min-w-fit">Date:</Label>
                              <Input
                                type="date"
                                value={req.interviewDate || ''}
                                onChange={(e) => updateRequirement('communicationRequirements', req.id, 'interviewDate', e.target.value)}
                                className="h-8 text-sm w-36"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-xs min-w-fit">Time:</Label>
                              <Input
                                type="time"
                                value={req.interviewTime || ''}
                                onChange={(e) => updateRequirement('communicationRequirements', req.id, 'interviewTime', e.target.value)}
                                className="h-8 text-sm w-28"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Financial Requirements ({formData.financialRequirements.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCustomField}
                      onChange={(e) => setNewCustomField(e.target.value)}
                      placeholder="Add custom requirement"
                      className="h-8 text-sm w-48"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement('financialRequirements');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRequirement('financialRequirements')}
                      disabled={!newCustomField.trim()}
                      className="text-xs h-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.financialRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No financial requirements added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.financialRequirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.isCompleted}
                            onChange={(e) => updateRequirement('financialRequirements', req.id, 'isCompleted', e.target.checked)}
                            className="rounded"
                          />
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <Input
                              value={req.label}
                              onChange={(e) => updateRequirement('financialRequirements', req.id, 'label', e.target.value)}
                              className="h-7 text-sm border-none p-1 bg-transparent"
                            />
                          </div>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={req.isRequired}
                              onChange={(e) => updateRequirement('financialRequirements', req.id, 'isRequired', e.target.checked)}
                              className="rounded w-3 h-3"
                            />
                            Required
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement('financialRequirements', req.id)}
                          className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Custom Requirements ({formData.customRequirements.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCustomField}
                      onChange={(e) => setNewCustomField(e.target.value)}
                      placeholder="Add custom requirement"
                      className="h-8 text-sm w-48"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement('customRequirements');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addRequirement('customRequirements')}
                      disabled={!newCustomField.trim()}
                      className="text-xs h-8"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {formData.customRequirements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No custom requirements added yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.customRequirements.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={req.isCompleted}
                            onChange={(e) => updateRequirement('customRequirements', req.id, 'isCompleted', e.target.checked)}
                            className="rounded"
                          />
                          <div className="flex items-center gap-2 max-w-[200px]">
                            <Input
                              value={req.label}
                              onChange={(e) => updateRequirement('customRequirements', req.id, 'label', e.target.value)}
                              className="h-7 text-sm border-none p-1 bg-transparent"
                            />
                          </div>
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={req.isRequired}
                              onChange={(e) => updateRequirement('customRequirements', req.id, 'isRequired', e.target.checked)}
                              className="rounded w-3 h-3"
                            />
                            Required
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequirement('customRequirements', req.id)}
                          className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (!isSubmitting) {
                  resetForm();
                  onClose();
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Saving...' : 'Save & Close'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}