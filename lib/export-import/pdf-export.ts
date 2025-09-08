import jsPDF from 'jspdf';
import { ExportData } from './types';

export interface PDFPortfolioOptions {
  includePhoto?: boolean;
  includePersonalInfo?: boolean;
  includeFinancialDetails?: boolean;
  schoolLogo?: string;
  customBranding?: {
    schoolName?: string;
    counselorName?: string;
    counselorEmail?: string;
  };
}

export interface StudentProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  graduationYear: number;
  gpa?: number;
  photo?: string;
  achievements?: string[];
  extracurriculars?: string[];
  volunteerWork?: string[];
}

export class PDFPortfolioGenerator {
  private doc: jsPDF;
  private yPosition: number = 20;
  private readonly pageWidth: number;
  private readonly margins = { left: 20, right: 20, top: 20, bottom: 20 };

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
  }

  async generatePortfolio(
    exportData: ExportData,
    studentProfile: StudentProfile,
    options: PDFPortfolioOptions = {}
  ): Promise<Blob> {
    // Reset position
    this.yPosition = 20;

    // Header Section
    this.addHeader(studentProfile, options);
    
    // Scholarship Summary Section
    this.addScholarshipSummary(exportData);
    
    // Active Applications Section
    this.addActiveApplications(exportData);
    
    // Completed Awards Section
    this.addCompletedAwards(exportData);
    
    // Financial Progress Section
    if (options.includeFinancialDetails !== false) {
      this.addFinancialProgress(exportData);
    }
    
    // Requirements Progress Section
    this.addRequirementsProgress(exportData);
    
    // Key Achievements Section
    this.addAchievements(studentProfile);
    
    // Contact Information Section
    this.addContactInfo(studentProfile, options);

    // Generate and return PDF blob
    const pdfOutput = this.doc.output('blob');
    return pdfOutput;
  }

  private addHeader(student: StudentProfile, options: PDFPortfolioOptions) {
    const centerX = this.pageWidth / 2;
    
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Scholarship Portfolio', centerX, this.yPosition, { align: 'center' });
    this.yPosition += 15;

    // Student name
    this.doc.setFontSize(18);
    this.doc.text(student.name, centerX, this.yPosition, { align: 'center' });
    this.yPosition += 10;

    // Basic info line
    const infoLine = [];
    if (student.graduationYear) infoLine.push(`Class of ${student.graduationYear}`);
    if (student.gpa) infoLine.push(`GPA: ${student.gpa}`);
    if (student.email && options.includePersonalInfo !== false) infoLine.push(student.email);

    if (infoLine.length > 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(infoLine.join(' • '), centerX, this.yPosition, { align: 'center' });
      this.yPosition += 15;
    }

    // Add separator line
    this.doc.line(this.margins.left, this.yPosition, this.pageWidth - this.margins.right, this.yPosition);
    this.yPosition += 15;
  }

  private addScholarshipSummary(data: ExportData) {
    this.addSectionHeader('Scholarship Summary');
    
    const totalApplied = data.scholarships?.length || 0;
    const totalAwarded = data.scholarships?.filter(s => s.applicationStatus === 'awarded').length || 0;
    const totalPending = data.scholarships?.filter(s => s.applicationStatus === 'submitted' || s.applicationStatus === 'in-progress').length || 0;
    const totalAmount = data.scholarships?.reduce((sum, s) => {
      return sum + (s.applicationStatus === 'awarded' ? (s.amount || 0) : 0);
    }, 0) || 0;

    const summaryData = [
      { label: 'Total Applications', value: totalApplied.toString() },
      { label: 'Awards Received', value: totalAwarded.toString() },
      { label: 'Pending Applications', value: totalPending.toString() },
      { label: 'Total Awarded', value: `$${totalAmount.toLocaleString()}` }
    ];

    // Create a simple table
    const startX = this.margins.left;
    const colWidth = (this.pageWidth - this.margins.left - this.margins.right) / 2;

    summaryData.forEach((item, index) => {
      const x = startX + (index % 2) * colWidth;
      const y = this.yPosition + Math.floor(index / 2) * 15;
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.text(`${item.label}:`, x, y);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.value, x + 80, y);
    });

    this.yPosition += Math.ceil(summaryData.length / 2) * 15 + 10;
  }

  private addActiveApplications(data: ExportData) {
    const activeScholarships = data.scholarships?.filter(s => 
      s.applicationStatus === 'submitted' || s.applicationStatus === 'in-progress'
    ) || [];

    if (activeScholarships.length === 0) return;

    this.addSectionHeader('Active Applications');

    activeScholarships.slice(0, 6).forEach(scholarship => { // Limit to 6 for space
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(11);
      this.doc.text(scholarship.name, this.margins.left, this.yPosition);

      const rightAlign = this.pageWidth - this.margins.right;
      this.doc.setFont('helvetica', 'normal');
      if (scholarship.amount) {
        this.doc.text(`$${scholarship.amount.toLocaleString()}`, rightAlign, this.yPosition, { align: 'right' });
      }

      this.yPosition += 8;

      // Status and deadline
      const statusInfo = [];
      if (scholarship.applicationStatus) statusInfo.push(`Status: ${scholarship.applicationStatus}`);
      if (scholarship.deadline) {
        const deadlineDate = new Date(scholarship.deadline);
        statusInfo.push(`Due: ${deadlineDate.toLocaleDateString()}`);
      }

      if (statusInfo.length > 0) {
        this.doc.setFontSize(9);
        this.doc.setTextColor(100);
        this.doc.text(statusInfo.join(' • '), this.margins.left + 10, this.yPosition);
        this.doc.setTextColor(0);
        this.yPosition += 6;
      }

      this.yPosition += 4;
    });

    if (activeScholarships.length > 6) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.setFontSize(10);
      this.doc.text(`... and ${activeScholarships.length - 6} more applications`, this.margins.left, this.yPosition);
      this.yPosition += 15;
    }
  }

  private addCompletedAwards(data: ExportData) {
    const awardedScholarships = data.scholarships?.filter(s => s.applicationStatus === 'awarded') || [];

    if (awardedScholarships.length === 0) return;

    this.addSectionHeader('Scholarship Awards');

    awardedScholarships.forEach(scholarship => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(11);
      this.doc.text(scholarship.name, this.margins.left, this.yPosition);

      const rightAlign = this.pageWidth - this.margins.right;
      if (scholarship.amount) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 150, 0); // Green color
        this.doc.text(`$${scholarship.amount.toLocaleString()}`, rightAlign, this.yPosition, { align: 'right' });
        this.doc.setTextColor(0);
      }

      this.yPosition += 12;
    });
  }

  private addFinancialProgress(data: ExportData) {
    if (!data.financialGoals || data.financialGoals.length === 0) return;

    this.addSectionHeader('Financial Goals Progress');

    const totalGoals = data.financialGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalFunding = data.scholarships?.reduce((sum, s) => {
      return sum + (s.applicationStatus === 'awarded' ? (s.amount || 0) : 0);
    }, 0) || 0;

    const progressPercentage = totalGoals > 0 ? (totalFunding / totalGoals) * 100 : 0;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.text(`Total Financial Goals: $${totalGoals.toLocaleString()}`, this.margins.left, this.yPosition);
    this.yPosition += 8;

    this.doc.text(`Total Funding Secured: $${totalFunding.toLocaleString()}`, this.margins.left, this.yPosition);
    this.yPosition += 8;

    this.doc.text(`Progress: ${progressPercentage.toFixed(1)}%`, this.margins.left, this.yPosition);
    
    // Draw progress bar
    const barWidth = 150;
    const barHeight = 8;
    const barX = this.margins.left + 100;
    const barY = this.yPosition - 4;

    // Background bar
    this.doc.setFillColor(230, 230, 230);
    this.doc.rect(barX, barY, barWidth, barHeight, 'F');

    // Progress bar
    const progressWidth = Math.min(barWidth, (progressPercentage / 100) * barWidth);
    const color = progressPercentage >= 100 ? [0, 150, 0] : [59, 130, 246]; // Green if complete, blue otherwise
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.rect(barX, barY, progressWidth, barHeight, 'F');

    this.yPosition += 20;
  }

  private addRequirementsProgress(_data: ExportData) {
    // This would show essay completion, transcript status, etc.
    // For now, we'll show basic application progress
    this.addSectionHeader('Application Requirements');

    const requirements = [
      { name: 'Personal Statement', status: 'completed', link: 'https://docs.google.com/document/d/...' },
      { name: 'Academic Transcripts', status: 'completed', link: null },
      { name: 'Letters of Recommendation', status: 'in_progress', link: null },
      { name: 'Financial Aid Forms', status: 'pending', link: null },
    ];

    requirements.forEach(req => {
      const statusSymbol = req.status === 'completed' ? '✓' : 
                          req.status === 'in_progress' ? '◐' : '○';
      const statusColor = req.status === 'completed' ? [0, 150, 0] : 
                         req.status === 'in_progress' ? [255, 165, 0] : [150, 150, 150];

      this.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      this.doc.text(statusSymbol, this.margins.left, this.yPosition);
      
      this.doc.setTextColor(0);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(req.name, this.margins.left + 15, this.yPosition);

      if (req.link) {
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        this.doc.setTextColor(0, 0, 255);
        this.doc.text('(View Document)', this.pageWidth - this.margins.right - 60, this.yPosition);
        this.doc.setTextColor(0);
        this.doc.setFontSize(11);
      }

      this.yPosition += 12;
    });
  }

  private addAchievements(student: StudentProfile) {
    if (!student.achievements && !student.extracurriculars && !student.volunteerWork) return;

    this.addSectionHeader('Key Achievements & Activities');

    if (student.achievements && student.achievements.length > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text('Academic Honors:', this.margins.left, this.yPosition);
      this.yPosition += 8;

      student.achievements.slice(0, 3).forEach(achievement => {
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`• ${achievement}`, this.margins.left + 10, this.yPosition);
        this.yPosition += 6;
      });
      this.yPosition += 5;
    }

    if (student.extracurriculars && student.extracurriculars.length > 0) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text('Extracurricular Activities:', this.margins.left, this.yPosition);
      this.yPosition += 8;

      student.extracurriculars.slice(0, 3).forEach(activity => {
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`• ${activity}`, this.margins.left + 10, this.yPosition);
        this.yPosition += 6;
      });
      this.yPosition += 5;
    }
  }

  private addContactInfo(student: StudentProfile, options: PDFPortfolioOptions) {
    if (!options.includePersonalInfo) return;

    this.addSectionHeader('Contact Information');

    if (student.email) {
      this.doc.text(`Email: ${student.email}`, this.margins.left, this.yPosition);
      this.yPosition += 8;
    }

    if (student.phone) {
      this.doc.text(`Phone: ${student.phone}`, this.margins.left, this.yPosition);
      this.yPosition += 8;
    }

    if (options.customBranding?.counselorName) {
      this.yPosition += 5;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Counselor: ${options.customBranding.counselorName}`, this.margins.left, this.yPosition);
      if (options.customBranding.counselorEmail) {
        this.yPosition += 8;
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Counselor Email: ${options.customBranding.counselorEmail}`, this.margins.left, this.yPosition);
      }
    }
  }

  private addSectionHeader(title: string) {
    // Check if we need a new page
    if (this.yPosition > 250) {
      this.doc.addPage();
      this.yPosition = 20;
    }

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(59, 130, 246); // Blue color
    this.doc.text(title, this.margins.left, this.yPosition);
    this.doc.setTextColor(0);
    this.yPosition += 12;

    // Add underline
    const textWidth = this.doc.getTextWidth(title);
    this.doc.line(this.margins.left, this.yPosition - 8, this.margins.left + textWidth, this.yPosition - 8);
    this.yPosition += 8;
  }

  async downloadPDF(
    exportData: ExportData,
    studentProfile: StudentProfile,
    filename: string = 'scholarship-portfolio.pdf',
    options: PDFPortfolioOptions = {}
  ) {
    const pdfBlob = await this.generatePortfolio(exportData, studentProfile, options);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}