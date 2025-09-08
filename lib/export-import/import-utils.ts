import { 
  ExportData, 
  ImportResult, 
  ImportConflict, 
  ScholarshipExportData 
} from './types';

// Mock types - replace with actual imports
interface Scholarship {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  description: string;
  requirements: any;
  status?: string;
}

export class DataImportService {
  
  static async importFromJSON(
    jsonData: string | ExportData,
    existingScholarships: Scholarship[],
    importOptions: {
      mergeStrategy: 'replace' | 'merge' | 'skip-duplicates';
      autoResolveConflicts: boolean;
      preserveExistingProgress: boolean;
    }
  ): Promise<ImportResult> {
    
    try {
      const data: ExportData = typeof jsonData === 'string' 
        ? JSON.parse(jsonData) 
        : jsonData;
      
      // Validate import data
      const validationResult = this.validateImportData(data);
      if (!validationResult.valid) {
        return {
          success: false,
          summary: { scholarshipsImported: 0, duplicatesFound: 0, conflictsResolved: 0, applicationsImported: 0 },
          conflicts: [],
          errors: validationResult.errors
        };
      }

      // Process scholarships for import
      const importResult = await this.processScholarshipImport(
        data.scholarships,
        existingScholarships,
        importOptions
      );

      // Import financial goals if present
      if (data.financialGoals && importOptions.mergeStrategy !== 'skip-duplicates') {
        // Handle financial goals import
        importResult.summary.applicationsImported += data.financialGoals.length;
      }

      return importResult;

    } catch (error) {
      return {
        success: false,
        summary: { scholarshipsImported: 0, duplicatesFound: 0, conflictsResolved: 0, applicationsImported: 0 },
        conflicts: [],
        errors: [`Import failed: ${error.message}`]
      };
    }
  }

  static async importFromCSV(
    csvData: string,
    existingScholarships: Scholarship[],
    importOptions: {
      mergeStrategy: 'replace' | 'merge' | 'skip-duplicates';
      hasHeaders: boolean;
      columnMapping: Record<string, string>;
    }
  ): Promise<ImportResult> {
    
    try {
      const scholarships = this.parseCSVToScholarships(csvData, importOptions);
      
      return await this.processScholarshipImport(
        scholarships,
        existingScholarships,
        {
          mergeStrategy: importOptions.mergeStrategy,
          autoResolveConflicts: true,
          preserveExistingProgress: true
        }
      );

    } catch (error) {
      return {
        success: false,
        summary: { scholarshipsImported: 0, duplicatesFound: 0, conflictsResolved: 0, applicationsImported: 0 },
        conflicts: [],
        errors: [`CSV import failed: ${error.message}`]
      };
    }
  }

  private static async processScholarshipImport(
    importScholarships: ScholarshipExportData[],
    existingScholarships: Scholarship[],
    options: {
      mergeStrategy: 'replace' | 'merge' | 'skip-duplicates';
      autoResolveConflicts: boolean;
      preserveExistingProgress: boolean;
    }
  ): Promise<ImportResult> {
    
    const result: ImportResult = {
      success: true,
      summary: {
        scholarshipsImported: 0,
        duplicatesFound: 0,
        conflictsResolved: 0,
        applicationsImported: 0
      },
      conflicts: [],
      errors: []
    };

    const processedScholarships: Scholarship[] = [];

    for (const importScholarship of importScholarships) {
      // Check for duplicates
      const existingScholarship = existingScholarships.find(
        existing => this.areDuplicateScholarships(existing, importScholarship)
      );

      if (existingScholarship) {
        result.summary.duplicatesFound++;
        
        const conflict: ImportConflict = {
          type: 'duplicate-scholarship',
          scholarshipName: importScholarship.name,
          existingData: existingScholarship,
          importedData: importScholarship,
          resolution: options.mergeStrategy
        };

        // Handle conflict based on strategy
        switch (options.mergeStrategy) {
          case 'replace':
            processedScholarships.push(this.convertToScholarship(importScholarship));
            conflict.resolution = 'replace';
            result.summary.conflictsResolved++;
            break;
            
          case 'merge':
            const mergedScholarship = this.mergeScholarships(
              existingScholarship, 
              importScholarship, 
              options.preserveExistingProgress
            );
            processedScholarships.push(mergedScholarship);
            conflict.resolution = 'merge';
            result.summary.conflictsResolved++;
            break;
            
          case 'skip-duplicates':
            // Keep existing, skip import
            processedScholarships.push(existingScholarship);
            conflict.resolution = 'skip';
            break;
        }

        result.conflicts.push(conflict);
        
      } else {
        // New scholarship, add it
        processedScholarships.push(this.convertToScholarship(importScholarship));
        result.summary.scholarshipsImported++;
      }
    }

    // Validate imported scholarships
    const validationErrors = this.validateScholarships(processedScholarships);
    if (validationErrors.length > 0) {
      result.errors.push(...validationErrors);
      result.success = false;
    }

    return result;
  }

  private static validateImportData(data: ExportData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!data.exportDate) errors.push('Missing export date');
    if (!data.scholarships || !Array.isArray(data.scholarships)) {
      errors.push('Invalid or missing scholarships data');
    }

    // Check data freshness
    const exportDate = new Date(data.exportDate);
    const monthsOld = (Date.now() - exportDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld > 6) {
      errors.push(`Warning: Import data is ${Math.round(monthsOld)} months old. Scholarship deadlines may be outdated.`);
    }

    // Validate scholarships
    if (data.scholarships) {
      data.scholarships.forEach((scholarship, index) => {
        if (!scholarship.name) errors.push(`Scholarship ${index + 1}: Missing name`);
        if (!scholarship.deadline) errors.push(`Scholarship ${index + 1}: Missing deadline`);
        if (scholarship.amount <= 0) errors.push(`Scholarship ${index + 1}: Invalid amount`);
        
        // Check deadline validity
        const deadline = new Date(scholarship.deadline);
        if (deadline < new Date()) {
          errors.push(`Scholarship "${scholarship.name}": Deadline has passed (${scholarship.deadline})`);
        }
      });
    }

    return {
      valid: errors.length === 0 || errors.every(e => e.startsWith('Warning:')),
      errors
    };
  }

  private static parseCSVToScholarships(
    csvData: string, 
    options: {
      hasHeaders: boolean;
      columnMapping: Record<string, string>;
    }
  ): ScholarshipExportData[] {
    
    const lines = csvData.split('\\n').filter(line => line.trim());
    const startIndex = options.hasHeaders ? 1 : 0;
    
    return lines.slice(startIndex).map((line, index) => {
      const values = this.parseCSVLine(line);
      
      // Map CSV columns to scholarship fields
      const scholarship: ScholarshipExportData = {
        id: `imported-${Date.now()}-${index}`,
        name: this.getColumnValue(values, 'Scholarship Name', options.columnMapping, 0),
        amount: this.parseAmount(this.getColumnValue(values, 'Amount', options.columnMapping, 1)),
        deadline: this.getColumnValue(values, 'Deadline', options.columnMapping, 2),
        description: this.getColumnValue(values, 'Description', options.columnMapping, 3) || '',
        requirements: this.parseRequirements(
          this.getColumnValue(values, 'Requirements', options.columnMapping, 4)
        )
      };

      // Optional fields
      const status = this.getColumnValue(values, 'Status', options.columnMapping, -1);
      if (status) {
        scholarship.applicationStatus = status as any;
      }

      return scholarship;
    });
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static getColumnValue(
    values: string[], 
    columnName: string, 
    mapping: Record<string, string>, 
    defaultIndex: number
  ): string {
    const mappedIndex = mapping[columnName];
    if (mappedIndex !== undefined) {
      const index = parseInt(mappedIndex);
      return values[index] || '';
    }
    return defaultIndex >= 0 ? values[defaultIndex] || '' : '';
  }

  private static parseAmount(amountStr: string): number {
    // Remove currency symbols and commas, parse as float
    const cleaned = amountStr.replace(/[$,]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private static parseRequirements(reqStr: string): string[] {
    if (!reqStr) return [];
    // Split by semicolon, comma, or newline
    return reqStr.split(/[;,\\n]/).map(req => req.trim()).filter(req => req.length > 0);
  }

  private static areDuplicateScholarships(
    existing: Scholarship, 
    imported: ScholarshipExportData
  ): boolean {
    // Multiple criteria for detecting duplicates
    const nameMatch = existing.name.toLowerCase() === imported.name.toLowerCase();
    const amountMatch = Math.abs(existing.amount - imported.amount) < 100; // Within $100
    const deadlineMatch = existing.deadline === imported.deadline;
    
    // Consider duplicate if name matches and either amount or deadline matches
    return nameMatch && (amountMatch || deadlineMatch);
  }

  private static mergeScholarships(
    existing: Scholarship, 
    imported: ScholarshipExportData, 
    preserveProgress: boolean
  ): Scholarship {
    return {
      ...existing,
      // Update basic info from import
      name: imported.name,
      amount: imported.amount,
      deadline: imported.deadline,
      description: imported.description || existing.description,
      requirements: imported.requirements || existing.requirements,
      
      // Preserve existing progress if requested
      status: preserveProgress ? existing.status : imported.applicationStatus,
    };
  }

  private static convertToScholarship(imported: ScholarshipExportData): Scholarship {
    return {
      id: imported.id,
      name: imported.name,
      amount: imported.amount,
      deadline: imported.deadline,
      description: imported.description,
      requirements: imported.requirements,
      status: imported.applicationStatus
    };
  }

  private static validateScholarships(scholarships: Scholarship[]): string[] {
    const errors: string[] = [];
    
    scholarships.forEach((scholarship, index) => {
      // Validate required fields
      if (!scholarship.name) errors.push(`Scholarship ${index + 1}: Name is required`);
      if (scholarship.amount <= 0) errors.push(`Scholarship ${index + 1}: Amount must be greater than 0`);
      
      // Validate deadline
      try {
        const deadline = new Date(scholarship.deadline);
        if (isNaN(deadline.getTime())) {
          errors.push(`Scholarship ${index + 1}: Invalid deadline format`);
        }
      } catch {
        errors.push(`Scholarship ${index + 1}: Invalid deadline`);
      }
    });

    return errors;
  }

  // File reading utilities
  static readJSONFile(file: File): Promise<ExportData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static readCSVFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}