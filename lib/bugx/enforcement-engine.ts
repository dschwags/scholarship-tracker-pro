/**
 * BugX Enforcement Engine
 * Automatically intercepts risky operations and enforces pattern checking
 */

import { BugXPatternRecognition } from './pattern-recognition';
import { AssistantBugXWorkflow } from './assistant-integration';

export interface EditOperation {
  type: 'search_replace_batch' | 'write_file' | 'read_file';
  filePath: string;
  fileSize?: number;
  complexity?: 'low' | 'medium' | 'high';
  operationCount?: number;
}

export interface EnforcementResult {
  allowed: boolean;
  requiresBugXConsultation: boolean;
  recommendedApproach?: string;
  riskFactors: string[];
  estimatedCredits: number;
  mandatoryChecks: string[];
}

export class BugXEnforcementEngine {
  private patternRecognition: BugXPatternRecognition;
  private workflow: AssistantBugXWorkflow;
  
  // Critical file patterns that require extra scrutiny
  private criticalFilePatterns = [
    /components\/.*\/.*\.(tsx|ts)$/,
    /app\/.*\/.*\.(tsx|ts)$/,
    /lib\/.*\.(ts|tsx)$/,
    /.*\/actions\.(ts|tsx)$/,
    /.*middleware\.(ts|tsx)$/
  ];

  constructor() {
    this.patternRecognition = new BugXPatternRecognition();
    this.workflow = new AssistantBugXWorkflow();
  }

  /**
   * MANDATORY: Must be called before any file editing operation
   * This is the enforcement point that prevents risky operations
   */
  public async enforcePreEditChecks(operation: EditOperation): Promise<EnforcementResult> {
    const riskFactors: string[] = [];
    let estimatedCredits = 5; // Base cost
    const mandatoryChecks: string[] = [];

    // 1. Critical File Check
    const isCriticalFile = this.criticalFilePatterns.some(pattern => 
      pattern.test(operation.filePath)
    );
    
    if (isCriticalFile) {
      riskFactors.push('Critical file modification');
      estimatedCredits += 10;
      mandatoryChecks.push('Read entire file before editing');
      mandatoryChecks.push('Create backup strategy');
    }

    // 2. Operation Risk Assessment
    if (operation.type === 'search_replace_batch') {
      const operationCount = operation.operationCount || 1;
      const fileSize = operation.fileSize || 0;

      if (operationCount > 5) {
        riskFactors.push(`High operation count: ${operationCount} replacements`);
        estimatedCredits += operationCount * 2;
      }

      if (fileSize > 200) {
        riskFactors.push(`Large file: ${fileSize} lines`);
        estimatedCredits += Math.floor(fileSize / 50);
        mandatoryChecks.push('Consider write_file instead of search_replace_batch');
      }

      if (operationCount > 3 && fileSize > 150) {
        riskFactors.push('DESTRUCTIVE-EDIT-FAILURE pattern detected');
        estimatedCredits += 20;
        mandatoryChecks.push('MANDATORY: Use write_file approach');
        return {
          allowed: false,
          requiresBugXConsultation: true,
          recommendedApproach: 'write_file',
          riskFactors,
          estimatedCredits,
          mandatoryChecks: [...mandatoryChecks, 'BugX Pattern #3 violation - Use safer approach']
        };
      }
    }

    // 3. Pattern Recognition Check
    const context = {
      operation: operation.type,
      filePath: operation.filePath,
      fileSize: operation.fileSize || 0,
      complexity: operation.complexity || 'medium'
    };

    const detectedPatterns = await this.patternRecognition.analyzeContext(context);
    const highRiskPatterns = detectedPatterns.filter(p => p.risk === 'high');

    if (highRiskPatterns.length > 0) {
      riskFactors.push(...highRiskPatterns.map(p => `Pattern: ${p.description}`));
      estimatedCredits += highRiskPatterns.length * 15;
      mandatoryChecks.push('BugX consultation required for high-risk patterns');
    }

    // 4. Enforcement Decision
    const requiresBugXConsultation = 
      riskFactors.length > 2 || 
      highRiskPatterns.length > 0 || 
      estimatedCredits > 25;

    const allowed = !mandatoryChecks.some(check => check.includes('MANDATORY'));

    return {
      allowed,
      requiresBugXConsultation,
      recommendedApproach: this.getRecommendedApproach(operation, riskFactors),
      riskFactors,
      estimatedCredits,
      mandatoryChecks
    };
  }

  /**
   * Generate mandatory pre-edit checklist
   */
  public generatePreEditChecklist(operation: EditOperation): string[] {
    const checklist = [
      '✓ Read current file state with read_file',
      '✓ Identify exact sections to modify',
      '✓ Estimate operation complexity',
      '✓ Run enforcement engine check'
    ];

    if (this.criticalFilePatterns.some(p => p.test(operation.filePath))) {
      checklist.push('✓ CRITICAL FILE: Extra verification required');
      checklist.push('✓ Create mental backup plan');
    }

    if (operation.type === 'search_replace_batch') {
      checklist.push('✓ Verify each replacement is unique and specific');
      checklist.push('✓ Consider write_file if >3 replacements or >200 lines');
    }

    return checklist;
  }

  private getRecommendedApproach(operation: EditOperation, riskFactors: string[]): string {
    if (riskFactors.some(r => r.includes('Large file')) && 
        riskFactors.some(r => r.includes('operation count'))) {
      return 'write_file';
    }

    if (operation.type === 'search_replace_batch' && 
        (operation.operationCount || 0) > 5) {
      return 'write_file';
    }

    return operation.type;
  }

  /**
   * Post-operation verification
   */
  public async verifyEditSuccess(filePath: string): Promise<{
    success: boolean;
    issues: string[];
    nextSteps: string[];
  }> {
    // This would integrate with lint_diagnostic and other verification tools
    return {
      success: true,
      issues: [],
      nextSteps: [
        'Run lint_diagnostic on modified file',
        'Test application functionality',
        'Verify no syntax errors introduced'
      ]
    };
  }
}

/**
 * MANDATORY WORKFLOW INTEGRATION
 * This should be the standard process for ALL file edits
 */
export class MandatoryBugXWorkflow {
  private enforcement: BugXEnforcementEngine;

  constructor() {
    this.enforcement = new BugXEnforcementEngine();
  }

  /**
   * Standard process that MUST be followed for any file edit
   */
  public async executeEditWorkflow(operation: EditOperation): Promise<{
    proceed: boolean;
    checklist: string[];
    enforcement: EnforcementResult;
    message: string;
  }> {
    // 1. Mandatory enforcement check
    const enforcement = await this.enforcement.enforcePreEditChecks(operation);
    
    // 2. Generate checklist
    const checklist = this.enforcement.generatePreEditChecklist(operation);

    // 3. Determine if operation should proceed
    if (!enforcement.allowed) {
      return {
        proceed: false,
        checklist,
        enforcement,
        message: `❌ OPERATION BLOCKED: ${enforcement.mandatoryChecks.join(', ')}`
      };
    }

    if (enforcement.requiresBugXConsultation) {
      return {
        proceed: false,
        checklist: [...checklist, '⚠️  BugX consultation required before proceeding'],
        enforcement,
        message: `⚠️  HIGH RISK: Estimated ${enforcement.estimatedCredits} credits. BugX consultation required.`
      };
    }

    return {
      proceed: true,
      checklist,
      enforcement,
      message: `✅ APPROVED: Estimated ${enforcement.estimatedCredits} credits. Proceed with caution.`
    };
  }
}

/**
 * INTEGRATION POINT: This should be called before EVERY file edit operation
 */
export const mandatoryBugXCheck = async (operation: EditOperation) => {
  const workflow = new MandatoryBugXWorkflow();
  const result = await workflow.executeEditWorkflow(operation);
  
  console.log('\n🔍 MANDATORY BUGX CHECK:');
  console.log(`📁 File: ${operation.filePath}`);
  console.log(`🔧 Operation: ${operation.type}`);
  console.log(`💰 Estimated Credits: ${result.enforcement.estimatedCredits}`);
  console.log(`📋 Status: ${result.message}`);
  
  if (result.enforcement.riskFactors.length > 0) {
    console.log('⚠️  Risk Factors:');
    result.enforcement.riskFactors.forEach(factor => console.log(`   • ${factor}`));
  }

  if (result.checklist.length > 0) {
    console.log('📝 Pre-Edit Checklist:');
    result.checklist.forEach(item => console.log(`   ${item}`));
  }

  return result;
};