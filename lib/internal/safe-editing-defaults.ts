/**
 * Safe Editing Defaults - Automatic Risk-Aware Decision Making
 * 
 * This system automatically applies risk assessment and safe editing principles
 * without requiring explicit BugX invocation. It works by establishing
 * intelligent defaults that inherently prevent risky operations.
 */

export interface FileOperationContext {
  filePath: string;
  operationType: 'read' | 'write' | 'batch_replace' | 'search';
  changeComplexity: 'simple' | 'moderate' | 'complex';
  fileImportance: 'low' | 'medium' | 'high' | 'critical';
}

export interface SafeEditingDecision {
  recommendedTool: 'write_file' | 'search_replace_batch' | 'read_first';
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  automaticSafeguards: string[];
}

/**
 * Automatic File Importance Assessment
 * Runs transparently to categorize file criticality
 */
export function assessFileImportance(filePath: string): 'low' | 'medium' | 'high' | 'critical' {
  const path = filePath.toLowerCase();
  
  // Critical files - highest risk
  if (path.includes('page.tsx') || 
      path.includes('layout.tsx') || 
      path.includes('middleware.ts') ||
      path.includes('config') ||
      path.includes('auth') ||
      path.includes('database') ||
      path.includes('schema')) {
    return 'critical';
  }
  
  // High importance - major functionality
  if (path.includes('component') || 
      path.includes('api/') || 
      path.includes('server') ||
      path.includes('action') ||
      path.includes('hook')) {
    return 'high';
  }
  
  // Medium importance - supporting files
  if (path.includes('util') || 
      path.includes('helper') || 
      path.includes('type') ||
      path.includes('constant')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Automatic Change Complexity Assessment
 * Evaluates operation complexity without explicit input
 */
export function assessChangeComplexity(
  operationType: string,
  targetFile: string,
  estimatedChanges: number
): 'simple' | 'moderate' | 'complex' {
  
  // Complex scenarios - multiple changes in critical files
  if (estimatedChanges > 3 && assessFileImportance(targetFile) === 'critical') {
    return 'complex';
  }
  
  // Complex scenarios - batch operations on large files
  if (operationType === 'batch_replace' && estimatedChanges > 2) {
    return 'complex';
  }
  
  // Moderate scenarios - single changes in important files
  if (assessFileImportance(targetFile) === 'high' || estimatedChanges > 1) {
    return 'moderate';
  }
  
  return 'simple';
}

/**
 * Intelligent Tool Selection
 * Automatically chooses safest approach based on context
 */
export function getOptimalEditingApproach(context: FileOperationContext): SafeEditingDecision {
  const { filePath, operationType, changeComplexity, fileImportance } = context;
  
  // Critical files + complex changes = always use write_file
  if (fileImportance === 'critical' && changeComplexity === 'complex') {
    return {
      recommendedTool: 'write_file',
      riskLevel: 'high',
      reasoning: 'Critical file with complex changes - write_file ensures atomic operation',
      automaticSafeguards: [
        'Read entire file first',
        'Preserve all existing functionality', 
        'Test immediately after changes',
        'Lint/typecheck validation'
      ]
    };
  }
  
  // High importance files with multiple changes = prefer write_file  
  if (fileImportance === 'high' && changeComplexity !== 'simple') {
    return {
      recommendedTool: 'write_file',
      riskLevel: 'medium',
      reasoning: 'Important file with non-trivial changes - write_file reduces corruption risk',
      automaticSafeguards: [
        'Read file completely first',
        'Validate syntax after changes',
        'Check for breaking changes'
      ]
    };
  }
  
  // Batch operations on any important file = read first, then write_file
  if (operationType === 'batch_replace' && fileImportance !== 'low') {
    return {
      recommendedTool: 'read_first',
      riskLevel: 'medium', 
      reasoning: 'Batch operations require full context - read completely, then use write_file',
      automaticSafeguards: [
        'Complete file analysis before changes',
        'Atomic replacement via write_file',
        'Immediate validation'
      ]
    };
  }
  
  // Safe scenarios - can use search_replace_batch with safeguards
  return {
    recommendedTool: 'search_replace_batch',
    riskLevel: 'low',
    reasoning: 'Simple changes in low-risk file - batch replacement acceptable',
    automaticSafeguards: [
      'Verify exact match strings',
      'Single operation per call',
      'Immediate validation'
    ]
  };
}

/**
 * Automatic Pre-Operation Check
 * Runs before any file operation to apply safe defaults
 */
export function preOperationSafetyCheck(
  filePath: string,
  intendedOperation: 'read' | 'write' | 'batch_replace',
  estimatedChanges: number = 1
): SafeEditingDecision {
  
  const context: FileOperationContext = {
    filePath,
    operationType: intendedOperation,
    changeComplexity: assessChangeComplexity(intendedOperation, filePath, estimatedChanges),
    fileImportance: assessFileImportance(filePath)
  };
  
  return getOptimalEditingApproach(context);
}

/**
 * Credit Cost Estimation
 * Automatic estimation based on approach and complexity
 */
export function estimateOperationCost(decision: SafeEditingDecision): number {
  const baseCost = decision.recommendedTool === 'write_file' ? 5 : 8;
  
  const riskMultiplier = {
    'low': 1,
    'medium': 1.5, 
    'high': 2.5
  }[decision.riskLevel];
  
  return Math.ceil(baseCost * riskMultiplier);
}