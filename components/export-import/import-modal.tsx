'use client';

import { useState, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileText, 
  Table, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  X,
  Users,
  GraduationCap
} from 'lucide-react';
import { ImportResult, ExportData } from '@/lib/export-import/types';
import { DataImportService } from '@/lib/export-import/import-utils';


interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: ImportResult) => void;
  existingScholarships: any[];
}

export function ImportModal({ 
  isOpen, 
  onClose, 
  onImportComplete, 
  existingScholarships 
}: ImportModalProps) {
  const [step, setStep] = useState<'select' | 'preview' | 'options' | 'result'>('select');
  const [fileType, setFileType] = useState<'json' | 'csv'>('json');
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<'merge' | 'replace' | 'skip-duplicates'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      if (fileType === 'json') {
        const data = await DataImportService.readJSONFile(file);
        setImportData(data);
        setStep('preview');
      } else {
        const csvContent = await DataImportService.readCSVFile(file);
        setCsvData(csvContent);
        setStep('options');
      }
    } catch (error) {
      console.error('File reading failed:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importData && !csvData) return;
    
    setIsProcessing(true);
    
    try {
      let result: ImportResult;
      
      if (fileType === 'json' && importData) {
        result = await DataImportService.importFromJSON(
          importData,
          existingScholarships,
          {
            mergeStrategy,
            autoResolveConflicts: true,
            preserveExistingProgress: true
          }
        );
      } else if (fileType === 'csv' && csvData) {
        result = await DataImportService.importFromCSV(
          csvData,
          existingScholarships,
          {
            mergeStrategy,
            hasHeaders: true,
            columnMapping: {
              'Scholarship Name': '0',
              'Amount': '1',
              'Deadline': '2',
              'Requirements': '3'
            }
          }
        );
      } else {
        throw new Error('No data to import');
      }
      
      setImportResult(result);
      setStep('result');
      
      if (result.success) {
        onImportComplete(result);
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportResult({
        success: false,
        summary: { scholarshipsImported: 0, duplicatesFound: 0, conflictsResolved: 0, applicationsImported: 0 },
        conflicts: [],
        errors: [errorMessage]
      });
      setStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setStep('select');
    setImportData(null);
    setCsvData('');
    setImportResult(null);
    setIsProcessing(false);
  };

  const renderFileSelector = () => (
    <div className="space-y-6">
      {/* Help Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 mb-2">Import Data</h3>
        <p className="text-sm text-blue-800">Upload your scholarship data from JSON or CSV files. Choose how to handle conflicts with existing data.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Source</CardTitle>
          <CardDescription>
            Choose the type of file you want to import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={fileType} onValueChange={(value: any) => setFileType(value)}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="json" id="json-import" />
              <div className="flex-1">
                <Label htmlFor="json-import" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium">JSON File</div>
                    <div className="text-sm text-muted-foreground">
                      Complete data export from scholarship tracker
                    </div>
                  </div>
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="csv" id="csv-import" />
              <div className="flex-1">
                <Label htmlFor="csv-import" className="flex items-center gap-2 cursor-pointer">
                  <Table className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium">CSV File</div>
                    <div className="text-sm text-muted-foreground">
                      Spreadsheet with scholarship information
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <div className="pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={fileType === 'json' ? '.json' : '.csv'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : `Select ${fileType.toUpperCase()} File`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Examples */}
      <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200">Common Use Cases</div>
              <ul className="text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                <li>• Import scholarship templates from counselors</li>
                <li>• Restore data from backup files</li>
                <li>• Add scholarships shared by other students</li>
                <li>• Bulk import from spreadsheets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Import Preview
          </CardTitle>
          <CardDescription>
            Review the data before importing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {importData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Export Type</Label>
                <div className="text-sm text-muted-foreground">
                  {importData.exportType.replace('-', ' ')}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Export Date</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(importData.exportDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Scholarships</Label>
                <div className="text-sm text-muted-foreground">
                  {importData.scholarships.length} items
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Exported By</Label>
                <div className="text-sm text-muted-foreground">
                  {importData.exportedBy}
                </div>
              </div>
            </div>
          )}

          {importData?.scholarships.slice(0, 3).map((scholarship, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="font-medium">{scholarship.name}</div>
              <div className="text-sm text-muted-foreground">
                ${scholarship.amount.toLocaleString()} • Due: {scholarship.deadline}
              </div>
            </div>
          ))}

          {importData && importData.scholarships.length > 3 && (
            <div className="text-sm text-center text-muted-foreground">
              ... and {importData.scholarships.length - 3} more scholarships
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Duplicate Handling</Label>
            <RadioGroup value={mergeStrategy} onValueChange={(value: any) => setMergeStrategy(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="merge" id="merge" />
                <Label htmlFor="merge" className="cursor-pointer">
                  Merge with existing (recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="cursor-pointer">
                  Replace existing data
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="skip-duplicates" id="skip" />
                <Label htmlFor="skip" className="cursor-pointer">
                  Skip duplicates
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-4">
      <Card className={importResult?.success ? 'border-green-200' : 'border-red-200'}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {importResult?.success ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-red-500" />
            )}
            Import {importResult?.success ? 'Successful' : 'Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {importResult && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Scholarships Imported</Label>
                <div className="text-lg font-bold text-green-600">
                  {importResult.summary.scholarshipsImported}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Duplicates Found</Label>
                <div className="text-lg font-bold text-yellow-600">
                  {importResult.summary.duplicatesFound}
                </div>
              </div>
            </div>
          )}

          {importResult?.errors && importResult.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200">
              <div className="font-medium text-red-800 dark:text-red-200 mb-1">Errors:</div>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {importResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Scholarship Data
          </DialogTitle>
          <DialogDescription>
            Import scholarships from templates, backups, or spreadsheets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'select' && renderFileSelector()}
          {step === 'preview' && renderPreview()}
          {step === 'result' && renderResult()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {step !== 'select' && (
                <Button variant="outline" onClick={() => setStep('select')}>
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={step === 'result' ? resetModal : onClose}>
                {step === 'result' ? 'Import More' : 'Cancel'}
              </Button>
              
              {step === 'preview' && (
                <Button 
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? 'Importing...' : 'Import Data'}
                </Button>
              )}
              
              {step === 'result' && importResult?.success && (
                <Button onClick={onClose}>
                  Done
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}