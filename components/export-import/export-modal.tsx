'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Table, Share2, Eye, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { DataExportService } from '@/lib/export-import/export-utils';
import { ExportOptions } from '@/lib/export-import/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarships: any[];
  studentProfile: any;
  financialGoals: any[];
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  scholarships, 
  studentProfile, 
  financialGoals 
}: ExportModalProps) {
  
  // Export Options State
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt' | 'html' | 'rtf'>('html');
  const [exportType, setExportType] = useState<'template' | 'portfolio' | 'full-backup'>('portfolio');
  const [csvFormat, setCSVFormat] = useState<'scholarships' | 'applications'>('scholarships');
  
  // Privacy & Content Options
  const [includePersonalResponses, setIncludePersonalResponses] = useState(false);
  const [includeFinancialInfo, setIncludeFinancialInfo] = useState(false);
  const [includeEligibilityCriteria, setIncludeEligibilityCriteria] = useState(true);
  const [includeApplicationProgress, setIncludeApplicationProgress] = useState(true);
  const [anonymizeData, setAnonymizeData] = useState(false);
  
  // Export Notes
  const [exportNotes, setExportNotes] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Loading states
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions: ExportOptions = {
    includePersonalResponses,
    includeFinancialInfo,
    includeEligibilityCriteria,
    includeApplicationProgress,
    anonymizeData
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let data: string;
      let filename: string;
      let mimeType: string;

      const baseFilename = fileName || `scholarship-${exportType}-${new Date().toISOString().split('T')[0]}`;

      switch (exportFormat) {
        case 'json':
          const jsonData = await DataExportService.exportToJSON(
            scholarships, 
            studentProfile, 
            financialGoals, 
            exportOptions, 
            exportType
          );
          data = JSON.stringify(jsonData, null, 2);
          filename = `${baseFilename}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          data = await DataExportService.exportToCSV(scholarships, exportOptions, csvFormat);
          filename = `${baseFilename}.csv`;
          mimeType = 'text/csv';
          break;

        case 'txt':
          data = await DataExportService.exportToText(
            scholarships, 
            studentProfile, 
            financialGoals, 
            exportOptions, 
            exportType
          );
          filename = `${baseFilename}.txt`;
          mimeType = 'text/plain';
          break;

        case 'html':
          data = await DataExportService.exportToHTML(
            scholarships, 
            studentProfile, 
            financialGoals, 
            exportOptions, 
            exportType
          );
          filename = `${baseFilename}.html`;
          mimeType = 'text/html';
          break;

        case 'rtf':
          data = await DataExportService.exportToRTF(
            scholarships, 
            studentProfile, 
            financialGoals, 
            exportOptions, 
            exportType
          );
          filename = `${baseFilename}.rtf`;
          mimeType = 'application/rtf';
          break;

        default:
          throw new Error(`Unsupported export format: ${exportFormat}`);
      }

      // Create and download file
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'json':
        return 'Complete data backup. Best for importing back into the system later.';
      case 'csv':
        return 'Spreadsheet format. Great for data analysis and sharing with counselors.';
      case 'txt':
        return 'Simple text format. Easy to read, print, and share with anyone. Works everywhere!';
      case 'html':
        return 'Beautiful layout with formatting. Opens perfectly in Word, Google Docs, and browsers.';
      case 'rtf':
        return 'Rich Text format with beautiful styling. Works perfectly in Word, Google Docs, and all document editors.';
      default:
        return '';
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'template':
        return 'Just scholarship information without your personal data.';
      case 'portfolio':
        return 'Professional summary of your scholarship progress. Perfect for counselors!';
      case 'full-backup':
        return 'Everything including essays and personal responses. For backup purposes.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Scholarship Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          
          {/* Export Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Choose Export Format
              </CardTitle>
              <CardDescription>
                Different formats serve different purposes. Pick what works best for you!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={exportFormat} onValueChange={(value: any) => setExportFormat(value)} className="space-y-4">
                
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 bg-blue-50 border-blue-200">
                  <RadioGroupItem value="html" id="html" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="html" className="font-medium cursor-pointer flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Professional Layout (.html)
                      <Badge variant="secondary">Recommended</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getFormatDescription('html')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="rtf" id="rtf" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="rtf" className="font-medium cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Document Editor (.rtf)
                      <Badge variant="outline">Word • Google Docs</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getFormatDescription('rtf')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="txt" id="txt" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="txt" className="font-medium cursor-pointer flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Simple Text (.txt) 
                      <Badge variant="outline">Universal</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getFormatDescription('txt')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="csv" id="csv" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="csv" className="font-medium cursor-pointer flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Spreadsheet (.csv)
                      <Badge variant="outline">Data Analysis</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getFormatDescription('csv')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="json" id="json" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="json" className="font-medium cursor-pointer flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      Complete Backup (.json)
                      <Badge variant="outline">Full Data</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getFormatDescription('json')}</p>
                  </div>
                </div>
              </RadioGroup>

              {/* CSV sub-options */}
              {exportFormat === 'csv' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <Label className="text-sm font-medium">CSV Type:</Label>
                  <RadioGroup value={csvFormat} onValueChange={(value: any) => setCSVFormat(value)} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scholarships" id="csv-scholarships" />
                      <Label htmlFor="csv-scholarships" className="text-sm">Scholarship List</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="applications" id="csv-applications" />
                      <Label htmlFor="csv-applications" className="text-sm">Application Progress</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                What to Include
              </CardTitle>
              <CardDescription>
                Choose how much information to include in your export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={exportType} onValueChange={(value: any) => setExportType(value)} className="space-y-4">
                
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="portfolio" id="portfolio" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="portfolio" className="font-medium cursor-pointer">
                      Scholarship Portfolio 
                      <Badge variant="secondary" className="ml-2">Best for Counselors</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getTypeDescription('portfolio')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="template" id="template" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="template" className="font-medium cursor-pointer">
                      Scholarship Template
                      <Badge variant="outline" className="ml-2">Share Safely</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getTypeDescription('template')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="full-backup" id="full-backup" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="full-backup" className="font-medium cursor-pointer">
                      Complete Backup
                      <Badge variant="outline" className="ml-2">Everything</Badge>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{getTypeDescription('full-backup')}</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Privacy & Content Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Privacy & Content Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="eligibility" 
                  checked={includeEligibilityCriteria}
                  onCheckedChange={(checked) => setIncludeEligibilityCriteria(!!checked)}
                />
                <Label htmlFor="eligibility" className="text-sm">
                  Include eligibility criteria and requirements
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="progress" 
                  checked={includeApplicationProgress}
                  onCheckedChange={(checked) => setIncludeApplicationProgress(!!checked)}
                />
                <Label htmlFor="progress" className="text-sm">
                  Show application progress and status
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="personal" 
                  checked={includePersonalResponses}
                  onCheckedChange={(checked) => setIncludePersonalResponses(!!checked)}
                />
                <Label htmlFor="personal" className="text-sm">
                  Include personal essays and responses
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="financial" 
                  checked={includeFinancialInfo}
                  onCheckedChange={(checked) => setIncludeFinancialInfo(!!checked)}
                />
                <Label htmlFor="financial" className="text-sm">
                  Include financial goals and information
                </Label>
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="anonymize" 
                  checked={anonymizeData}
                  onCheckedChange={(checked) => setAnonymizeData(!!checked)}
                />
                <Label htmlFor="anonymize" className="text-sm font-medium">
                  Remove personal identifying information (make anonymous)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* File Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="filename" className="text-sm font-medium">Custom filename (optional)</Label>
                <Input
                  id="filename"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="my-scholarships"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Export notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={exportNotes}
                  onChange={(e) => setExportNotes(e.target.value)}
                  placeholder="Add any notes about this export..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}