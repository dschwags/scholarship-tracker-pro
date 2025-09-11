import { 
  ExportData, 
  ExportOptions, 
  ScholarshipExportData, 
  ScholarshipCSVRow, 
  ApplicationCSVRow,
  StudentProfileExport 
} from './types';

// Enhanced type definitions for better type safety
type ScholarshipStatus = 'draft' | 'in-progress' | 'submitted' | 'awarded' | 'received' | 'rejected';

interface ScholarshipDocument {
  name: string;
  required: boolean;
  submitted: boolean;
  description?: string;
}

interface ScholarshipEssay {
  prompt: string;
  wordLimit: number;
  response?: string;
}

interface Scholarship {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  description: string;
  requirements: string[] | string;
  status?: ScholarshipStatus;
  essays?: ScholarshipEssay[];
  documents?: ScholarshipDocument[];
  notes?: string;
  // Extended properties for export compatibility
  title?: string;
  organization?: string;
  provider?: string;
  sponsor?: string;
  applicationUrl?: string;
  link?: string;
  url?: string;
}

interface StudentProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  gpa?: number;
  major?: string;
  graduationYear?: number;
  school?: string;
  state?: string;
  ethnicity?: string;
  firstGeneration?: boolean;
  financialNeed?: boolean;
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline: string;
  calculationMethod?: string;
}

export class DataExportService {
  
  static async exportToJSON(
    scholarships: Scholarship[],
    studentProfile: StudentProfile,
    financialGoals: FinancialGoal[],
    exportOptions: ExportOptions,
    exportType: 'full-backup' | 'template' | 'portfolio' = 'template'
  ): Promise<ExportData> {
    
    // Calculate financial analytics once and reuse the stats
    const financialAnalytics = this.calculateFinancialAnalytics(scholarships, financialGoals);
    
    const exportData: ExportData = {
      exportType,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0.0',
      exportedBy: exportOptions.anonymizeData 
        ? 'Anonymous User' 
        : `${studentProfile.firstName} ${studentProfile.lastName}`,
      
      scholarships: this.processScholarshipsForExport(scholarships, exportOptions),
      
      metadata: {
        totalScholarships: scholarships.length,
        // Reuse the already calculated stats instead of filtering again
        completedApplications: financialAnalytics.statusBreakdown.awarded,
        pendingApplications: financialAnalytics.statusBreakdown.pending,
        totalPotentialFunding: scholarships.reduce((sum, s) => sum + (s.amount || 0), 0),
        
        // Enhanced Financial Analytics (already calculated)
        financialAnalytics,
        
        exportSettings: exportOptions
      }
    };

    // Add conditional data based on export options
    if (exportType === 'full-backup' || exportOptions.includePersonalResponses) {
      exportData.studentProfile = this.processStudentProfile(studentProfile, exportOptions);
    }

    if (exportOptions.includeFinancialInfo && financialGoals.length > 0) {
      exportData.financialGoals = financialGoals.map(goal => ({
        id: goal.id,
        title: goal.title,
        targetAmount: exportOptions.anonymizeData ? undefined : goal.targetAmount,
        currentAmount: exportOptions.anonymizeData ? undefined : goal.currentAmount,
        deadline: goal.deadline,
        calculationMethod: goal.calculationMethod,
        goalCategory: exportOptions.anonymizeData ? this.categorizeGoal(goal) : undefined
      }));
    }

    return exportData;
  }

  static async exportToCSV(
    scholarships: Scholarship[],
    exportOptions: ExportOptions,
    format: 'scholarships' | 'applications' = 'scholarships'
  ): Promise<string> {
    
    if (format === 'scholarships') {
      return this.exportScholarshipsToCSV(scholarships, exportOptions);
    } else {
      return this.exportApplicationsToCSV(scholarships, exportOptions);
    }
  }

  private static processScholarshipsForExport(
    scholarships: Scholarship[], 
    options: ExportOptions
  ): ScholarshipExportData[] {
    
    return scholarships.map(scholarship => {
      const exportScholarship: ScholarshipExportData = {
        id: scholarship.id,
        name: scholarship.name || scholarship.title || scholarship.organization || 'Scholarship Application',
        organization: scholarship.organization || scholarship.provider || scholarship.sponsor,
        applicationUrl: scholarship.applicationUrl || scholarship.link || scholarship.url,
        amount: scholarship.amount,
        deadline: scholarship.deadline,
        description: scholarship.description,
        requirements: Array.isArray(scholarship.requirements) 
          ? scholarship.requirements 
          : (scholarship.requirements ? [scholarship.requirements] : [])
      };

      // Add eligibility info if requested
      if (options.includeEligibilityCriteria) {
        exportScholarship.eligibilityMet = this.checkEligibility(scholarship);
      }

      // Add application progress if requested
      if (options.includeApplicationProgress) {
        exportScholarship.applicationStatus = scholarship.status;
      }

      // Add personal application data if requested
      if (options.includePersonalResponses && !options.anonymizeData) {
        exportScholarship.applicationData = {
          essays: scholarship.essays?.map(essay => ({
            prompt: essay.prompt,
            wordLimit: essay.wordLimit,
            response: essay.response
          })),
          documents: scholarship.documents?.map(doc => ({
            name: doc.name,
            required: doc.required,
            submitted: doc.submitted,
            description: doc.description
          })),
          personalNotes: scholarship.notes
        };
      }

      return exportScholarship;
    });
  }

  private static processStudentProfile(
    profile: StudentProfile, 
    options: ExportOptions
  ): StudentProfileExport {
    
    if (options.anonymizeData) {
      return {
        academicProfile: {
          gpaRange: this.getGPARange(profile.gpa),
          majorCategory: this.getMajorCategory(profile.major),
          classStanding: this.getClassStanding(profile.graduationYear)
        }
      };
    }

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      gpa: profile.gpa,
      major: profile.major,
      graduationYear: profile.graduationYear,
      school: profile.school,
      state: profile.state,
      ethnicity: profile.ethnicity,
      firstGeneration: profile.firstGeneration,
      financialNeed: profile.financialNeed
    };
  }

  private static exportScholarshipsToCSV(
    scholarships: Scholarship[], 
    options: ExportOptions
  ): string {
    
    const headers = [
      'Scholarship Name',
      'Amount',
      'Deadline',
      'Requirements',
      'Eligibility Met',
      'Application Status',
      'Website/Contact',
      'Notes',
      'Difficulty Level',
      'Recommended For'
    ];

    const rows = scholarships.map(scholarship => {
      const row: ScholarshipCSVRow = {
        'Scholarship Name': scholarship.name || 'Unnamed Scholarship',
        'Amount': scholarship.amount ? `$${scholarship.amount.toLocaleString()}` : 'Amount TBD',
        'Deadline': scholarship.deadline || 'No deadline specified',
        'Requirements': Array.isArray(scholarship.requirements) 
          ? scholarship.requirements.join('; ') 
          : (scholarship.requirements || 'No requirements listed'),
        'Eligibility Met': options.includeEligibilityCriteria 
          ? (this.checkEligibility(scholarship) ? 'Yes' : 'No') 
          : 'Not Evaluated',
        'Application Status': options.includeApplicationProgress 
          ? (scholarship.status || 'Not Started') 
          : 'Not Tracked',
        'Website/Contact': scholarship.website || scholarship.contact || '', 
        'Notes': options.includePersonalResponses ? (scholarship.notes || '') : '',
        'Difficulty Level': this.assessDifficulty(scholarship),
        'Recommended For': this.getRecommendations(scholarship)
      };
      return row;
    });

    return this.convertToCSV([headers, ...rows.map(row => Object.values(row))]);
  }

  private static exportApplicationsToCSV(
    scholarships: Scholarship[], 
    options: ExportOptions
  ): string {
    
    const headers = [
      'Scholarship Name',
      'Status',
      'Deadline',
      'Essay Required',
      'Documents Needed',
      'Submission Date',
      'Follow-up Date',
      'Notes'
    ];

    const rows = scholarships
      .filter(scholarship => options.includeApplicationProgress && scholarship.status)
      .map(scholarship => {
        const row: ApplicationCSVRow = {
          'Scholarship Name': scholarship.name || 'Unnamed Scholarship',
          'Status': scholarship.status || 'Not Started',
          'Deadline': scholarship.deadline || 'No deadline specified',
          'Essay Required': scholarship.essays?.length ? 'Yes' : 'No',
          'Documents Needed': scholarship.documents?.map(d => d.name).join('; ') || 'None',
          'Submission Date': scholarship.submissionDate || '', 
          'Follow-up Date': scholarship.followUpDate || '', 
          'Notes': options.includePersonalResponses ? (scholarship.notes || '') : ''
        };
        return row;
      });

    return this.convertToCSV([headers, ...rows.map(row => Object.values(row))]);
  }

  // Utility methods
  private static convertToCSV(data: string[][]): string {
    return data
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\\n');
  }

  private static checkEligibility(scholarship: Scholarship): boolean {
    // Implement eligibility checking logic based on student profile
    // This would compare scholarship requirements with student data
    return true; // Placeholder
  }

  private static getGPARange(gpa?: number): string {
    if (!gpa) return 'Not provided';
    if (gpa >= 3.7) return '3.7-4.0';
    if (gpa >= 3.3) return '3.3-3.7';
    if (gpa >= 3.0) return '3.0-3.3';
    return '2.0-3.0';
  }

  private static getMajorCategory(major?: string): string {
    if (!major) return 'Undeclared';
    const stemFields = ['engineering', 'computer', 'science', 'math', 'technology'];
    const businessFields = ['business', 'finance', 'accounting', 'economics'];
    const artsFields = ['art', 'music', 'theater', 'english', 'literature'];
    
    const lowerMajor = major.toLowerCase();
    if (stemFields.some(field => lowerMajor.includes(field))) return 'STEM';
    if (businessFields.some(field => lowerMajor.includes(field))) return 'Business';
    if (artsFields.some(field => lowerMajor.includes(field))) return 'Arts & Humanities';
    return 'Other';
  }

  private static getClassStanding(graduationYear?: number): string {
    if (!graduationYear) return 'Unknown';
    const currentYear = new Date().getFullYear();
    const yearsRemaining = graduationYear - currentYear;
    
    if (yearsRemaining <= 0) return 'Graduate/Alumni';
    if (yearsRemaining === 1) return 'Senior';
    if (yearsRemaining === 2) return 'Junior';
    if (yearsRemaining === 3) return 'Sophomore';
    return 'Freshman';
  }

  private static categorizeGoal(goal: any): string {
    const amount = goal.targetAmount || 0;
    if (amount >= 50000) return 'Full College Funding';
    if (amount >= 20000) return 'Annual Tuition';
    if (amount >= 10000) return 'Semester Support';
    return 'Supplemental Funding';
  }

  private static calculateFinancialAnalytics(scholarships: Scholarship[], financialGoals: FinancialGoal[]) {
    // Input validation
    if (!Array.isArray(scholarships)) {
      throw new Error('Scholarships must be an array');
    }
    if (!Array.isArray(financialGoals)) {
      throw new Error('Financial goals must be an array');
    }
    // Optimize: Single pass through scholarships array instead of multiple filters
    const scholarshipStats = scholarships.reduce(
      (acc, scholarship) => {
        const amount = scholarship.amount || 0;
        const status = scholarship.status;
        
        if (status === 'awarded' || status === 'received') {
          acc.awardedCount++;
          acc.totalAwarded += amount;
        } else if (status === 'submitted' || status === 'in-progress') {
          acc.appliedCount++;
          acc.totalApplied += amount;
        } else if (status === 'draft' || !status) {
          acc.draftCount++;
        }
        
        // Count non-draft applications for success rate
        if (status && status !== 'draft') {
          acc.activeApplications++;
        }
        
        return acc;
      },
      {
        awardedCount: 0,
        appliedCount: 0,
        draftCount: 0,
        activeApplications: 0,
        totalAwarded: 0,
        totalApplied: 0
      }
    );
    
    // Calculate total need from financial goals
    const totalNeed = financialGoals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
    const currentSavings = financialGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
    const remainingNeed = Math.max(0, totalNeed - currentSavings - scholarshipStats.totalAwarded);
    
    // Gap analysis
    const fundingGap = Math.max(0, totalNeed - scholarshipStats.totalAwarded - currentSavings);
    const gapCoveredByPending = Math.min(fundingGap, scholarshipStats.totalApplied);
    const remainingGapAfterPending = Math.max(0, fundingGap - scholarshipStats.totalApplied);
    
    // Success rates and efficiency (using optimized counts)
    const applicationSuccessRate = scholarshipStats.activeApplications > 0 
      ? (scholarshipStats.awardedCount / scholarshipStats.activeApplications) * 100 
      : 0;
    
    const averageAwardAmount = scholarshipStats.awardedCount > 0 
      ? scholarshipStats.totalAwarded / scholarshipStats.awardedCount 
      : 0;
    
    return {
      // Core Financial Metrics
      totalAwarded: scholarshipStats.totalAwarded,
      totalApplied: scholarshipStats.totalApplied,
      totalNeed,
      currentSavings,
      remainingNeed,
      
      // Gap Analysis
      fundingGap,
      gapCoveredByPending,
      remainingGapAfterPending,
      gapCoveragePercentage: totalNeed > 0 ? ((totalAwarded + currentSavings) / totalNeed) * 100 : 100,
      
      // Performance Metrics
      applicationSuccessRate: Math.round(applicationSuccessRate * 10) / 10,
      averageAwardAmount,
      totalApplicationsSubmitted: scholarshipStats.appliedCount + scholarshipStats.awardedCount,
      
      // Status Breakdown
      statusBreakdown: {
        awarded: scholarshipStats.awardedCount,
        pending: scholarshipStats.appliedCount,
        draft: scholarshipStats.draftCount,
        total: scholarships.length
      }
    };
  }

  private static assessDifficulty(scholarship: Scholarship): string {
    // Simple heuristic - could be more sophisticated
    const amount = scholarship.amount || 0;
    const requirements = Array.isArray(scholarship.requirements) 
      ? scholarship.requirements.length 
      : (scholarship.requirements ? 1 : 0);
    
    if (amount > 10000 || requirements > 5) return 'Competitive';
    if (amount > 2000 || requirements > 2) return 'Medium';
    return 'Easy';
  }

  private static getRecommendations(scholarship: Scholarship): string {
    // This would analyze requirements and suggest student types
    const recs: string[] = [];
    
    // Safe handling of requirements - could be undefined/null
    const requirements = scholarship.requirements || [];
    const reqText = JSON.stringify(requirements).toLowerCase();
    
    // Also check scholarship name and description for keywords
    const nameText = (scholarship.name || '').toLowerCase();
    const descText = (scholarship.description || '').toLowerCase();
    const allText = `${reqText} ${nameText} ${descText}`;
    
    if (allText.includes('stem') || allText.includes('engineering')) recs.push('STEM Students');
    if (allText.includes('first') && allText.includes('generation')) recs.push('First-Generation');
    if (allText.includes('financial') && allText.includes('need')) recs.push('Financial Need');
    if (allText.includes('gpa') && (allText.includes('3.5') || allText.includes('high'))) recs.push('High GPA');
    if (allText.includes('community') && allText.includes('service')) recs.push('Community Leaders');
    if (allText.includes('minority') || allText.includes('diversity')) recs.push('Diversity');
    if (allText.includes('woman') || allText.includes('female')) recs.push('Women');
    
    return recs.join(', ') || 'All Students';
  }

  // Text and Word export methods
  static async exportToText(
    scholarships: Scholarship[],
    studentProfile: any,
    financialGoals: any[],
    options: ExportOptions,
    exportType: 'full-backup' | 'template' | 'portfolio'
  ): Promise<string> {
    const exportData = await this.exportToJSON(scholarships, studentProfile, financialGoals, options, exportType);
    return this.formatAsText(exportData, options);
  }

  static async exportToHTML(
    scholarships: Scholarship[],
    studentProfile: any,
    financialGoals: any[],
    options: ExportOptions,
    exportType: 'full-backup' | 'template' | 'portfolio'
  ): Promise<string> {
    const exportData = await this.exportToJSON(scholarships, studentProfile, financialGoals, options, exportType);
    return this.formatAsHTML(exportData, options);
  }

  static async exportToRTF(
    scholarships: Scholarship[],
    studentProfile: any,
    financialGoals: any[],
    options: ExportOptions,
    exportType: 'full-backup' | 'template' | 'portfolio'
  ): Promise<string> {
    const exportData = await this.exportToJSON(scholarships, studentProfile, financialGoals, options, exportType);
    return this.formatAsRTF(exportData, options);
  }

  // Legacy method names for compatibility
  static async exportToTXT(
    scholarships: Scholarship[],
    studentProfile: any,
    financialGoals: any[],
    options: ExportOptions,
    exportType: 'full-backup' | 'template' | 'portfolio'
  ): Promise<string> {
    return this.exportToText(scholarships, studentProfile, financialGoals, options, exportType);
  }

  static async exportToWord(
    scholarships: Scholarship[],
    studentProfile: any,
    financialGoals: any[],
    options: ExportOptions,
    exportType: 'full-backup' | 'template' | 'portfolio'
  ): Promise<string> {
    return this.exportToHTML(scholarships, studentProfile, financialGoals, options, exportType);
  }

  private static formatAsText(data: ExportData, options: ExportOptions): string {
    let text = '';
    
    // Header
    text += `SCHOLARSHIP ${data.exportType.toUpperCase()} EXPORT\n`;
    text += `Generated: ${new Date(data.exportDate).toLocaleDateString()}\n`;
    text += `Exported by: ${data.exportedBy}\n`;
    text += '='.repeat(60) + '\n\n';
    
    // Summary
    text += `SUMMARY\n`;
    text += `Total Scholarships: ${data.metadata.totalScholarships}\n`;
    text += `Completed Applications: ${data.metadata.completedApplications}\n`;
    text += `Pending Applications: ${data.metadata.pendingApplications}\n`;
    text += `Total Potential Funding: $${data.metadata.totalPotentialFunding.toLocaleString()}\n\n`;
    
    // Financial Analytics
    if (data.metadata.financialAnalytics) {
      const analytics = data.metadata.financialAnalytics;
      text += `FINANCIAL PROGRESS & GAP ANALYSIS\n`;
      text += '-'.repeat(40) + '\n';
      text += `💰 Total Awarded: $${analytics.totalAwarded.toLocaleString()}\n`;
      text += `📋 Pending Applications: $${analytics.totalApplied.toLocaleString()}\n`;
      text += `🎯 Total Financial Need: $${analytics.totalNeed.toLocaleString()}\n`;
      text += `💵 Current Savings: $${analytics.currentSavings.toLocaleString()}\n`;
      text += `📊 Gap Coverage: ${analytics.gapCoveragePercentage.toFixed(1)}%\n`;
      text += `⚡ Success Rate: ${analytics.applicationSuccessRate}%\n`;
      
      if (analytics.fundingGap > 0) {
        text += `\n🔍 FUNDING GAP ANALYSIS:\n`;
        text += `   Remaining Gap: $${analytics.fundingGap.toLocaleString()}\n`;
        text += `   Covered by Pending: $${analytics.gapCoveredByPending.toLocaleString()}\n`;
        text += `   Still Need to Apply: $${analytics.remainingGapAfterPending.toLocaleString()}\n`;
      }
      text += '\n';
    }
    
    // Scholarships
    text += `SCHOLARSHIPS\n`;
    text += '-'.repeat(40) + '\n';
    
    data.scholarships.forEach((scholarship, index) => {
      text += `${index + 1}. ${scholarship.name}${scholarship.organization ? ` (${scholarship.organization})` : ''}\n`;
      text += `   Amount: $${scholarship.amount?.toLocaleString() || 'TBD'}\n`;
      text += `   Deadline: ${scholarship.deadline || 'No deadline'}\n`;
      if (scholarship.applicationUrl) {
        text += `   Apply: ${scholarship.applicationUrl}\n`;
      }
      
      if (scholarship.requirements && Array.isArray(scholarship.requirements)) {
        text += `   Requirements: ${scholarship.requirements.join(', ')}\n`;
      }
      
      if (options.includeApplicationProgress && scholarship.applicationStatus) {
        text += `   Status: ${scholarship.applicationStatus}\n`;
      }
      
      if (scholarship.description) {
        text += `   Description: ${scholarship.description}\n`;
      }
      
      text += '\n';
    });
    
    // Financial Goals (if included)
    if (data.financialGoals && data.financialGoals.length > 0) {
      text += `FINANCIAL GOALS\n`;
      text += '-'.repeat(40) + '\n';
      
      data.financialGoals.forEach((goal, index) => {
        text += `${index + 1}. ${goal.title}\n`;
        text += `   Target: $${goal.targetAmount?.toLocaleString() || 'TBD'}\n`;
        text += `   Deadline: ${goal.deadline || 'No deadline'}\n\n`;
      });
    }
    
    return text;
  }

  private static formatAsRTF(data: ExportData, options: ExportOptions): string {
    // Enhanced RTF format - professional look while maintaining Word compatibility
    let rtf = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\froman Times New Roman;}{\\f1\\fswiss Arial;}}{\\colortbl;\\red0\\green0\\blue0;\\red59\\green130\\blue246;}\n';
    
    // Professional title with center alignment
    rtf += '{\\pard\\qc\\f1\\fs28\\b\\cf2 Scholarship ' + data.exportType.charAt(0).toUpperCase() + data.exportType.slice(1) + ' Portfolio}\\par\\par\n';
    
    // Header info box with background shading
    rtf += '{\\pard\\sa150\\f0\\fs20 ';
    rtf += '{\\b Generated:} ' + new Date(data.exportDate).toLocaleDateString() + '\\tab ';
    rtf += '{\\b Exported by:} ' + data.exportedBy + '}\\par\\par\n';
    
    // Portfolio Summary with enhanced formatting
    rtf += '{\\pard\\sa100\\f1\\fs22\\b\\cf2 PORTFOLIO SUMMARY}\\par\n';
    rtf += '{\\pard\\fi720\\f0\\fs20 ';
    rtf += '{\\b Total Scholarships:}\\tab ' + data.metadata.totalScholarships + '\\par\n';
    rtf += '{\\b Completed Applications:}\\tab ' + data.metadata.completedApplications + '\\par\n';
    rtf += '{\\b Pending Applications:}\\tab ' + data.metadata.pendingApplications + '\\par\n';
    rtf += '{\\b Total Potential Funding:}\\tab {\\b $' + data.metadata.totalPotentialFunding.toLocaleString() + '}\\par}\\par\n';
    
    // Financial Analytics with better formatting
    if (data.metadata.financialAnalytics) {
      const analytics = data.metadata.financialAnalytics;
      const gapStatus = analytics.gapCoveragePercentage >= 100 ? 'Goals Met' : 'Gap: $' + analytics.fundingGap.toLocaleString();
      rtf += '{\\pard\\sa50\\f1\\fs18\\b FINANCIAL SUMMARY:} ';
      rtf += '{\\f0\\fs18 $' + analytics.totalAwarded.toLocaleString() + ' awarded \\bullet ';
      rtf += '$' + analytics.totalApplied.toLocaleString() + ' pending \\bullet ';
      rtf += analytics.applicationSuccessRate + '% success \\bullet ';
      rtf += gapStatus + '}\\par\\par\n';
    }
    
    // Scholarships with professional formatting
    rtf += '{\\pard\\sa150\\f1\\fs22\\b\\cf2 SCHOLARSHIP PORTFOLIO}\\par\n';
    
    data.scholarships.forEach((scholarship, index) => {
      // Scholarship title with numbering
      rtf += '{\\pard\\sa100\\f1\\fs20\\b ' + (index + 1) + '. ' + scholarship.name;
      if (scholarship.organization) {
        rtf += '{\\f0\\fs18\\i by ' + scholarship.organization + '}';
      }
      rtf += '}\\par\n';
      
      // Details with indentation
      rtf += '{\\pard\\fi360\\f0\\fs18 ';
      rtf += '{\\b Amount:}\\tab $' + (scholarship.amount?.toLocaleString() || 'TBD') + '\\par\n';
      rtf += '{\\b Deadline:}\\tab ' + (scholarship.deadline || 'No deadline specified') + '\\par\n';
      
      if (scholarship.applicationUrl) {
        rtf += '{\\b Apply:}\\tab ' + scholarship.applicationUrl + '\\par\n';
      }
      
      if (scholarship.requirements && Array.isArray(scholarship.requirements)) {
        rtf += '{\\b Requirements:}\\tab ' + scholarship.requirements.join(', ') + '\\par\n';
      }
      
      if (options.includeApplicationProgress && scholarship.applicationStatus) {
        rtf += '{\\b Status:}\\tab {\\b ' + scholarship.applicationStatus.toUpperCase() + '}\\par\n';
      }
      
      rtf += '}\\par\n';
    });
    
    rtf += '}';
    return rtf;
  }

  private static formatAsHTML(data: ExportData, options: ExportOptions): string {
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Scholarship ${data.exportType} Export</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; line-height: 1.6; color: #374151; }
        h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 30px; page-break-after: avoid; }
        h2 { color: #1e40af; margin-top: 40px; margin-bottom: 20px; font-size: 1.5em; page-break-after: avoid; }
        .header-info { background: #f9fafb; padding: 8px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e5e7eb; font-size: 0.9em; }
        .summary { background: #eff6ff; padding: 12px; border-radius: 8px; margin: 10px 0; border: 1px solid #bfdbfe; page-break-inside: avoid; }
        .financial-analytics { background: #f0fdf4; padding: 8px 12px; margin: 8px 0; border: 1px solid #bbf7d0; border-radius: 6px; max-height: 120px; page-break-inside: avoid; }
        .gap-analysis { background: #fef7ff; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e879f9; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; margin: 8px 0; }
        .metric { padding: 8px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; text-align: center; }
        .metric-value { font-size: 1.2em; font-weight: bold; margin: 2px 0; }
        .metric-label { font-size: 0.8em; color: #6b7280; }
        .amount { font-weight: bold; color: #059669; }
        .amount.large { font-size: 1.2em; }
        .deadline { color: #dc2626; font-weight: bold; }
        .scholarship { margin: 15px 0; padding: 12px; border-left: 4px solid #3b82f6; background: #f8fafc; border-radius: 0 6px 6px 0; page-break-inside: avoid; }
        .status { padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; text-transform: uppercase; }
        .status.awarded { background: #dcfce7; color: #166534; }
        .status.pending { background: #fef3c7; color: #a16207; }
        .status.not-started { background: #fee2e2; color: #991b1b; }
        .requirements { font-style: italic; color: #6b7280; background: #f9fafb; padding: 10px; border-radius: 6px; }
        .progress-bar { width: 100%; height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s ease; }
        
        /* Print-specific optimizations */
        @media print {
            body { margin: 15mm; font-size: 12pt; line-height: 1.4; }
            h1 { font-size: 18pt; margin-bottom: 20pt; }
            h2 { font-size: 14pt; margin-top: 20pt; margin-bottom: 12pt; }
            .header-info, .summary, .financial-analytics { 
                background: none !important; 
                border: 1px solid #ccc; 
                margin: 12pt 0; 
                padding: 12pt; 
            }
            .scholarship { 
                background: none !important; 
                border-left: 3px solid #666; 
                margin: 15pt 0; 
                padding: 12pt; 
                page-break-inside: avoid; 
            }
            .metric-grid { gap: 8pt; }
            .metric { background: none !important; border: 1px solid #ccc; padding: 8pt; }
            .status { background: none !important; border: 1px solid #666; color: #000 !important; }
            a { color: #000; text-decoration: underline; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <h1 style="font-size: 1.5em; margin-bottom: 15px;">📋 Scholarship ${data.exportType.charAt(0).toUpperCase() + data.exportType.slice(1)} Portfolio</h1>
    
    <div class="header-info">
        <strong>📅 Generated:</strong> ${new Date(data.exportDate).toLocaleDateString()}<br>
        <strong>👤 Exported by:</strong> ${data.exportedBy}
    </div>
    
    <div class="summary">
        <h2 style="margin-top: 0; margin-bottom: 8px; color: #1f2937; font-size: 1.2em;">📊 Portfolio Summary</h2>
        <div class="metric-grid">
            <div class="metric">
                <div class="metric-value" style="color: #3b82f6;">${data.metadata.totalScholarships}</div>
                <div class="metric-label">Total Scholarships</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #10b981;">${data.metadata.completedApplications}</div>
                <div class="metric-label">Completed Applications</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #f59e0b;">${data.metadata.pendingApplications}</div>
                <div class="metric-label">Pending Applications</div>
            </div>
            <div class="metric">
                <div class="metric-value amount">$${data.metadata.totalPotentialFunding.toLocaleString()}</div>
                <div class="metric-label">Total Potential Funding</div>
            </div>
        </div>
    </div>

    ${data.metadata.financialAnalytics ? this.generateFinancialAnalyticsHTML(data.metadata.financialAnalytics) : this.generateMinimalFinancialAnalyticsHTML(data.metadata)}
    
    <h2>🎓 Scholarship Portfolio</h2>
`;
    
    data.scholarships.forEach((scholarship, index) => {
      html += `    <div class="scholarship">
        <h3>${index + 1}. ${scholarship.name}${scholarship.organization ? ` <span style="font-size: 0.9em; color: #6b7280; font-weight: normal;">by ${scholarship.organization}</span>` : ''}</h3>
        <p><strong>Amount:</strong> <span class="amount">$${scholarship.amount?.toLocaleString() || 'TBD'}</span></p>
        <p><strong>Deadline:</strong> <span class="deadline">${scholarship.deadline || 'No deadline specified'}</span></p>
        ${scholarship.applicationUrl ? `<p><strong>Apply:</strong> <a href="${scholarship.applicationUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">${scholarship.applicationUrl}</a></p>` : ''}
`;
      
      if (scholarship.requirements && Array.isArray(scholarship.requirements)) {
        html += `        <p><strong>Requirements:</strong> <span class="requirements">${scholarship.requirements.join(', ')}</span></p>
`;
      }
      
      if (options.includeApplicationProgress && scholarship.applicationStatus) {
        const statusClass = scholarship.applicationStatus === 'awarded' ? 'awarded' : 
                           scholarship.applicationStatus === 'submitted' ? 'pending' : 'not-started';
        html += `        <p><strong>Status:</strong> <span class="status ${statusClass}">${scholarship.applicationStatus}</span></p>
`;
      }
      
      if (scholarship.description) {
        html += `        <p><strong>Description:</strong> ${scholarship.description}</p>
`;
      }
      
      html += `    </div>
`;
    });
    
    // Financial Goals (if included)
    if (data.financialGoals && data.financialGoals.length > 0) {
      html += `
    <h2>Financial Goals</h2>
`;
      
      data.financialGoals.forEach((goal, index) => {
        html += `    <div class="scholarship">
        <h3>${index + 1}. ${goal.title}</h3>
        <p><strong>Target Amount:</strong> <span class="amount">$${goal.targetAmount?.toLocaleString() || 'TBD'}</span></p>
        <p><strong>Deadline:</strong> <span class="deadline">${goal.deadline || 'No deadline specified'}</span></p>
    </div>
`;
      });
    }
    
    html += `
</body>
</html>`;
    
    return html;
  }

  private static generateFinancialAnalyticsHTML(analytics: any): string {
    // Calculate proper percentages with fallbacks
    const totalGoal = (analytics.totalAwarded || 0) + (analytics.fundingGap || 0);
    const gapCoverageWidth = totalGoal > 0 ? Math.min(100, ((analytics.totalAwarded || 0) / totalGoal) * 100) : 0;
    const successRateWidth = Math.min(100, analytics.applicationSuccessRate || 0);
    const gapStatus = gapCoverageWidth >= 100 ? '✓ Goals Met!' : `Gap: $${(analytics.fundingGap || 0).toLocaleString()}`;
    
    // Ultra-compact single-line version within green box boundaries
    return `
    <div class="financial-analytics" style="background: #f0fdf4; padding: 8px 12px; margin: 8px 0; border: 1px solid #bbf7d0; border-radius: 6px; max-height: 120px;">
        <!-- Ultra-Compact Metrics Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85em; margin-bottom: 8px;">
            <span><strong style="color: #059669;">💰 $${(analytics.totalAwarded || 0).toLocaleString()}</strong> awarded</span>
            <span><strong style="color: #f59e0b;">⏳ $${(analytics.totalApplied || 0).toLocaleString()}</strong> pending</span>
            <span><strong>📈 ${analytics.applicationSuccessRate || 0}%</strong> success</span>
            <span style="color: ${gapCoverageWidth >= 100 ? '#22c55e' : '#ef4444'};"><strong>${gapStatus}</strong></span>
        </div>
        
        <!-- Horizontal Compact Charts Row -->
        <div style="display: flex; gap: 15px; align-items: center;">
            <!-- Funding Progress Compact -->
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.75em; color: #374151; margin-bottom: 2px;">💰 Funding Progress</div>
                <div style="background: #e5e7eb; border-radius: 4px; height: 16px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${Math.round(gapCoverageWidth)}%; border-radius: 4px 0 0 4px;"></div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.7em; font-weight: bold; color: ${gapCoverageWidth > 50 ? '#fff' : '#374151'};">${Math.round(gapCoverageWidth)}%</div>
                </div>
            </div>
            
            <!-- Success Rate Compact -->
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.75em; color: #374151; margin-bottom: 2px;">📈 Success Rate</div>
                <div style="background: #e5e7eb; border-radius: 4px; height: 16px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: ${Math.round(successRateWidth)}%; border-radius: 4px 0 0 4px;"></div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.7em; font-weight: bold; color: ${successRateWidth > 50 ? '#fff' : '#374151'};">${analytics.applicationSuccessRate || 0}%</div>
                </div>
            </div>
            
            <!-- Mini Status Circles -->
            <div style="display: flex; gap: 8px; align-items: center;">
                <div style="text-align: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7em; margin: 0 auto 2px;">${analytics.statusBreakdown?.awarded || 0}</div>
                    <div style="font-size: 0.6em; color: #6b7280;">Awarded</div>
                </div>
                <div style="text-align: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #f59e0b; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7em; margin: 0 auto 2px;">${analytics.statusBreakdown?.pending || 0}</div>
                    <div style="font-size: 0.6em; color: #6b7280;">Pending</div>
                </div>
                <div style="text-align: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #6b7280; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7em; margin: 0 auto 2px;">${analytics.statusBreakdown?.draft || 0}</div>
                    <div style="font-size: 0.6em; color: #6b7280;">Draft</div>
                </div>
            </div>
        </div>
    </div>`;
  }

  private static generateMinimalFinancialAnalyticsHTML(metadata: any): string {
    // Fallback when full financial analytics aren't available
    const completedApps = metadata.completedApplications || 0;
    const pendingApps = metadata.pendingApplications || 0;
    const totalFunding = metadata.totalPotentialFunding || 0;
    
    return `
    <div class="financial-analytics" style="background: #f0fdf4; padding: 8px 12px; margin: 8px 0; border: 1px solid #bbf7d0; border-radius: 6px; max-height: 120px;">
        <!-- Minimal Metrics Display -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85em; margin-bottom: 8px;">
            <span><strong style="color: #059669;">💰 $0</strong> awarded</span>
            <span><strong style="color: #f59e0b;">⏳ $${totalFunding.toLocaleString()}</strong> potential</span>
            <span><strong>📈 0%</strong> success</span>
            <span style="color: #ef4444;"><strong>Goal: Get Started!</strong></span>
        </div>
        
        <!-- Horizontal Compact Charts Row -->
        <div style="display: flex; gap: 15px; align-items: center;">
            <!-- Funding Progress Compact -->
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.75em; color: #374151; margin-bottom: 2px;">💰 Funding Progress</div>
                <div style="background: #e5e7eb; border-radius: 4px; height: 16px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: 0%; border-radius: 4px 0 0 4px;"></div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.7em; font-weight: bold; color: #374151;">0%</div>
                </div>
            </div>
            
            <!-- Success Rate Compact -->
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.75em; color: #374151; margin-bottom: 2px;">📈 Success Rate</div>
                <div style="background: #e5e7eb; border-radius: 4px; height: 16px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: 0%; border-radius: 4px 0 0 4px;"></div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.7em; font-weight: bold; color: #374151;">0%</div>
                </div>
            </div>
            
            <!-- Mini Status Circles -->
            <div style="display: flex; gap: 8px; align-items: center;">
                <div style="text-align: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7em; margin: 0 auto 2px;">${completedApps}</div>
                    <div style="font-size: 0.6em; color: #6b7280;">Awarded</div>
                </div>
                <div style="text-align: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #f59e0b; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7em; margin: 0 auto 2px;">${pendingApps}</div>
                    <div style="font-size: 0.6em; color: #6b7280;">Pending</div>
                </div>
                <div style="text-align: center;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: #6b7280; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7em; margin: 0 auto 2px;">${metadata.totalScholarships - completedApps - pendingApps}</div>
                    <div style="font-size: 0.6em; color: #6b7280;">Draft</div>
                </div>
            </div>
        </div>
    </div>`;
  }

  // File download utilities
  static downloadJSON(data: ExportData, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    this.downloadBlob(blob, `${filename}.json`);
  }

  static downloadTXT(textData: string, filename: string): void {
    const blob = new Blob([textData], { 
      type: 'text/plain;charset=utf-8' 
    });
    this.downloadBlob(blob, `${filename}.txt`);
  }

  static downloadHTML(htmlData: string, filename: string): void {
    const blob = new Blob([htmlData], { 
      type: 'text/html;charset=utf-8' 
    });
    this.downloadBlob(blob, `${filename}.html`);
  }

  static downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { 
      type: 'text/csv;charset=utf-8;' 
    });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  static downloadRTF(rtfData: string, filename: string): void {
    const blob = new Blob([rtfData], { 
      type: 'application/rtf;charset=utf-8' 
    });
    this.downloadBlob(blob, `${filename}.rtf`);
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}