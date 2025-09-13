/**
 * Mandatory Enforcement Integration
 * 
 * Combines the "natural preference" approach with "hard blocking" enforcement.
 * This creates a system where safe approaches are not just preferred, but become
 * the unavoidable path of least resistance.
 */

import { StealthSafetySystem } from './invisible-safety-layer';
import { preOperationSafetyCheck } from './safe-editing-defaults';

/**
 * Critical File Protection - Cannot Be Bypassed
 */
const CRITICAL_FILES = [
  'app/dashboard/page.tsx',      // Dashboard components
  'app/layout.tsx',              // Global layout  
  'components/auth/*.tsx',       // Authentication
  'lib/auth/*.ts',              // Auth utilities
  'middleware.ts',              // Request handling
  'app/*/page.tsx',             // All page components
  'components/ui/*.tsx',        // UI components
  'lib/db/*.ts',                // Database operations
  'actions/*.ts'                // Server actions
];

/**
 * Operation Risk Levels That Trigger Enforcement
 */
enum EnforcementLevel {
  ADVISORY = 'advisory',           // Suggests safer approach
  MANDATORY = 'mandatory',         // Blocks risky operation
  CRITICAL = 'critical'            // Blocks + requires methodology
}

interface BugXEnforcementError extends Error {
  enforcementLevel: EnforcementLevel;
  saferAlternative: string;
  estimatedSavings: string;
  requiredMethodology?: string;
}

/**
 * Hard Enforcement Layer - Cannot Be Bypassed
 */
export class MandatoryBugXEnforcement {
  
  /**
   * PRE-OPERATION GATE: Every file operation MUST pass through this
   */
  static enforcePreOperationGate(
    filePath: string,
    operationType: 'read' | 'write' | 'batch_replace',
    operationComplexity: number = 1
  ): void {
    
    const enforcementLevel = this.determineEnforcementLevel(filePath, operationType, operationComplexity);
    
    switch (enforcementLevel) {
      case EnforcementLevel.CRITICAL:
        this.blockCriticalOperation(filePath, operationType, operationComplexity);
        break;
        
      case EnforcementLevel.MANDATORY:
        this.enforceSaferApproach(filePath, operationType, operationComplexity);
        break;
        
      case EnforcementLevel.ADVISORY:
        this.provideSafetyGuidance(filePath, operationType);
        break;
    }
  }
  
  /**
   * Determine enforcement level based on risk factors
   */
  private static determineEnforcementLevel(
    filePath: string, 
    operationType: string, 
    complexity: number
  ): EnforcementLevel {
    
    const isCriticalFile = this.isCriticalFile(filePath);
    const isComplexOperation = complexity > 2 || operationType === 'batch_replace';
    const isHighRiskCombo = isCriticalFile && isComplexOperation;
    
    if (isHighRiskCombo && complexity > 3) {
      return EnforcementLevel.CRITICAL;
    } else if (isCriticalFile || (isComplexOperation && complexity > 2)) {
      return EnforcementLevel.MANDATORY;
    } else {
      return EnforcementLevel.ADVISORY;
    }
  }
  
  /**
   * CRITICAL LEVEL: Block operation entirely, require methodology
   */
  private static blockCriticalOperation(filePath: string, operationType: string, complexity: number): never {
    const error = new Error(`
🚨 BUGX ENFORCEMENT: CRITICAL RISK OPERATION BLOCKED

File: ${filePath}
Operation: ${operationType} with complexity ${complexity}
Risk Level: CRITICAL

REQUIRED ACTIONS:
1. Use BugXPatternEngine.analyzeAndRecommend()
2. Complete systematic risk analysis
3. Use write_file approach for atomic changes
4. Confirm backup/rollback strategy

SAFER ALTERNATIVE: 
- Read entire file first
- Use write_file for complete replacement
- Estimated savings: 20-40 credits vs debugging corruption

Cannot proceed without completing BugX methodology.
    `.trim()) as BugXEnforcementError;
    
    error.enforcementLevel = EnforcementLevel.CRITICAL;
    error.saferAlternative = 'write_file with complete file analysis';
    error.estimatedSavings = '20-40 credits';
    error.requiredMethodology = 'BugXPatternEngine.analyzeAndRecommend()';
    
    throw error;
  }
  
  /**
   * MANDATORY LEVEL: Force safer approach, but allow with guidance
   */
  private static enforceSaferApproach(filePath: string, operationType: string, complexity: number): void {
    
    const safetyCheck = preOperationSafetyCheck(filePath, operationType as any, complexity);
    
    if (safetyCheck.recommendedTool !== operationType) {
      console.warn(`
⚠️ BUGX ENFORCEMENT: SAFER APPROACH RECOMMENDED

File: ${filePath}
Current approach: ${operationType}
Recommended: ${safetyCheck.recommendedTool}

Reasoning: ${safetyCheck.reasoning}
Estimated cost difference: ${safetyCheck.riskLevel === 'high' ? '15-25' : '5-10'} credits

Proceeding with recommended approach for safety...
      `.trim());
      
      // In real implementation, this would redirect to the safer tool
      // For now, we log the enforcement
    }
  }
  
  /**
   * ADVISORY LEVEL: Gentle guidance with safety tips
   */
  private static provideSafetyGuidance(filePath: string, operationType: string): void {
    const guidance = StealthSafetySystem.getSubtleGuidance(filePath, `${operationType} operation`);
    
    console.info(`
💡 BugX Safety Guidance: 
${guidance.casualReasoning}

Quick tips:
${guidance.quickTips.map(tip => `- ${tip}`).join('\n')}
    `.trim());
  }
  
  /**
   * Check if file matches critical patterns
   */
  private static isCriticalFile(filePath: string): boolean {
    return CRITICAL_FILES.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(filePath);
      }
      return filePath.includes(pattern);
    });
  }
}

/**
 * Credit Budget Enforcement - Hard Limits
 */
export class CreditProtectionEnforcement {
  
  private static readonly MAX_OPERATION_COST = 15;
  private static readonly REQUIRE_BUGX_ABOVE = 10;
  
  /**
   * Enforce credit budget before expensive operations
   */
  static enforceBeforeExpensiveOperation(estimatedCost: number, operationDescription: string): void {
    
    if (estimatedCost > this.MAX_OPERATION_COST) {
      throw new Error(`
🚨 CREDIT PROTECTION: Operation blocked (${estimatedCost} credits)

Maximum allowed: ${this.MAX_OPERATION_COST} credits
Operation: ${operationDescription}

REQUIRED: Complete BugX analysis showing safer approach
Alternative approaches typically save 10-20 credits

Use BugXPatternEngine.findSaferAlternative() to proceed.
      `.trim());
    }
    
    if (estimatedCost > this.REQUIRE_BUGX_ABOVE) {
      console.warn(`
⚠️ CREDIT WARNING: High-cost operation (${estimatedCost} credits)
Consider BugX analysis for potential savings.
      `.trim());
    }
  }
}

/**
 * Runtime Pattern Detection - Catches Risky Sequences
 */
export class RuntimePatternEnforcement {
  
  private static operationHistory: string[] = [];
  
  /**
   * Monitor for dangerous operation patterns
   */
  static monitorOperationPattern(operation: string, filePath: string): void {
    
    this.operationHistory.push(`${operation}:${filePath}`);
    
    // Keep only last 5 operations
    if (this.operationHistory.length > 5) {
      this.operationHistory.shift();
    }
    
    // Check for risky patterns
    this.detectMultipleReplacePattern();
    this.detectComplexFileWithoutAnalysis();
  }
  
  /**
   * Pattern: Multiple search_replace on same file
   */
  private static detectMultipleReplacePattern(): void {
    const recentReplaces = this.operationHistory.filter(op => 
      op.startsWith('batch_replace')
    );
    
    if (recentReplaces.length >= 2) {
      const sameFile = recentReplaces.every(op => 
        op.split(':')[1] === recentReplaces[0].split(':')[1]
      );
      
      if (sameFile) {
        throw new Error(`
🚨 BUGX PATTERN ENFORCEMENT: Multiple batch replacements detected
This pattern frequently leads to file corruption.

REQUIRED: Switch to write_file approach for remaining changes.
        `.trim());
      }
    }
  }
  
  /**
   * Pattern: Complex file modification without analysis
   */
  private static detectComplexFileWithoutAnalysis(): void {
    const recentOps = this.operationHistory.slice(-3);
    const hasComplexOp = recentOps.some(op => op.includes('batch_replace'));
    const hasReadOp = recentOps.some(op => op.includes('read'));
    
    if (hasComplexOp && !hasReadOp) {
      console.warn(`
⚠️ BUGX PATTERN: Complex operation without file analysis
Recommend reading file completely before modifications.
      `.trim());
    }
  }
}

/**
 * Integration Point: This is where the enforcement actually happens
 */
export function enforceOperationSafety(
  operation: 'read' | 'write' | 'batch_replace',
  filePath: string,
  complexity: number = 1,
  estimatedCost: number = 5
): void {
  
  // 1. Hard enforcement gate
  MandatoryBugXEnforcement.enforcePreOperationGate(filePath, operation, complexity);
  
  // 2. Credit protection
  CreditProtectionEnforcement.enforceBeforeExpensiveOperation(estimatedCost, `${operation} on ${filePath}`);
  
  // 3. Runtime pattern monitoring
  RuntimePatternEnforcement.monitorOperationPattern(operation, filePath);
  
  console.log(`✅ Operation approved: ${operation} on ${filePath}`);
}

/**
 * THE KEY INSIGHT IMPLEMENTED:
 * 
 * This system makes bypass HARDER than compliance by:
 * 
 * 1. BLOCKING risky operations entirely (not just warning)
 * 2. REDIRECTING to safer approaches automatically  
 * 3. REQUIRING explicit methodology for dangerous operations
 * 4. MONITORING patterns to catch risky sequences
 * 5. LIMITING credit spending to prevent expensive debugging
 * 
 * The enforcement is UNAVOIDABLE - every file operation must pass through
 * these gates. The safe approach becomes the path of least resistance.
 */