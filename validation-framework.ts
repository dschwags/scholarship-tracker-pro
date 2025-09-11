/**
 * CLACKY QUALITY ASSURANCE FRAMEWORK
 * 
 * This validation framework prevents the systematic issues identified in our deployment failures.
 * It should be used before generating ANY component or TypeScript code.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixes: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKER';
}

export class ClackyValidationFramework {
  
  /**
   * PHASE 1: PRE-GENERATION VALIDATION
   * Run these checks BEFORE writing any code
   */
  
  validateTypeScriptPattern(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKER' = 'LOW';

    // CRITICAL: Dynamic property access without type assertion
    const dynamicAccessPattern = /(\w+)\.(\w+)\?\.\[(\w+)\]/g;
    if (dynamicAccessPattern.test(code)) {
      errors.push("Dynamic property access detected without type assertion");
      fixes.push("Replace with: (object as any)?.[property] || defaultValue");
      severity = 'BLOCKER';
    }

    // CRITICAL: Missing return statements in React components
    const componentPattern = /export\s+(function|const)\s+\w+.*\{[\s\S]*\}/;
    const hasReturn = /return\s*\(/;
    if (componentPattern.test(code) && !hasReturn.test(code)) {
      errors.push("React component missing return statement");
      fixes.push("Add explicit return statement with JSX");
      severity = 'BLOCKER';
    }

    // HIGH: Destructuring without safe defaults
    const destructuringPattern = /const\s*{[^}]+}\s*=\s*\w+(?!\s*\|\|)/;
    if (destructuringPattern.test(code)) {
      warnings.push("Destructuring without safe defaults detected");
      fixes.push("Add fallback: const { prop } = object || {}");
      if (severity === 'LOW') severity = 'HIGH';
    }

    // HIGH: Error handling without proper type checking
    const errorHandlingPattern = /catch\s*\(\s*(\w+)\s*\)[\s\S]*\1\.message/;
    if (errorHandlingPattern.test(code)) {
      const errorVarMatch = code.match(/catch\s*\(\s*(\w+)\s*\)/);
      if (errorVarMatch) {
        const errorVar = errorVarMatch[1];
        const hasTypeCheck = new RegExp(`${errorVar}\\s+instanceof\\s+Error`).test(code);
        if (!hasTypeCheck) {
          errors.push("Error handling without instanceof Error check");
          fixes.push(`Add: const errorMessage = ${errorVar} instanceof Error ? ${errorVar}.message : 'Unknown error';`);
          if (severity !== 'BLOCKER') severity = 'HIGH';
        }
      }
    }

    // MEDIUM: Missing optional chaining
    const propertyAccessPattern = /\w+\.\w+\.\w+(?!\?\.)/g;
    if (propertyAccessPattern.test(code)) {
      warnings.push("Deep property access without optional chaining");
      fixes.push("Consider using optional chaining: object?.property?.subproperty");
      if (severity === 'LOW') severity = 'MEDIUM';
    }

    return {
      isValid: errors.length === 0 && severity !== 'BLOCKER',
      errors,
      warnings,
      fixes,
      severity
    };
  }

  /**
   * PHASE 2: REACT COMPONENT STRUCTURE VALIDATION
   */
  validateReactComponent(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKER' = 'LOW';

    // Check for complete JSX structure
    const jsxStartPattern = /return\s*\(\s*</;
    const jsxEndPattern = />\s*\)\s*;?\s*\}/;
    
    if (!jsxStartPattern.test(code)) {
      errors.push("JSX return structure incomplete - missing opening");
      fixes.push("Ensure return ( <div>...</div> ) structure");
      severity = 'BLOCKER';
    }

    if (!jsxEndPattern.test(code)) {
      errors.push("JSX return structure incomplete - missing closing");
      fixes.push("Ensure proper closing: </div> ); }");
      severity = 'BLOCKER';
    }

    // Check for proper imports
    const hasReactImport = /import.*React.*from\s+['"]react['"]/.test(code) || 
                          /import\s*{[^}]*}.*from\s+['"]react['"]/.test(code);
    
    if (!hasReactImport && /useState|useEffect|useCallback/.test(code)) {
      errors.push("React hooks used without proper React import");
      fixes.push("Add: import { useState, useEffect } from 'react';");
      if (severity !== 'BLOCKER') severity = 'HIGH';
    }

    // Check for orphaned braces or brackets
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
      severity = 'BLOCKER';
    }

    if (openBrackets !== closeBrackets) {
      errors.push(`Mismatched brackets: ${openBrackets} open, ${closeBrackets} close`);
      severity = 'BLOCKER';
    }

    if (openParens !== closeParens) {
      errors.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
      severity = 'BLOCKER';
    }

    return {
      isValid: errors.length === 0 && severity !== 'BLOCKER',
      errors,
      warnings,
      fixes,
      severity
    };
  }

  /**
   * PHASE 3: NEXT.JS SPECIFIC VALIDATION
   */
  validateNextJSComponent(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: string[] = [];
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKER' = 'LOW';

    // Check for server vs client component patterns
    const hasUseClient = /['"]use client['"]/.test(code);
    const hasClientOnlyFeatures = /useState|useEffect|onClick|onChange/.test(code);

    if (hasClientOnlyFeatures && !hasUseClient) {
      warnings.push("Client-side features detected without 'use client' directive");
      fixes.push("Add 'use client'; at the top of the file");
      severity = 'MEDIUM';
    }

    // Check for proper TypeScript interface definitions
    const hasPropsInterface = /interface\s+\w+Props/.test(code);
    const hasProps = /\(\s*{[^}]+}\s*:\s*\w+/.test(code);

    if (hasProps && !hasPropsInterface) {
      warnings.push("Component props without proper TypeScript interface");
      fixes.push("Define interface ComponentProps { ... } for type safety");
      if (severity === 'LOW') severity = 'MEDIUM';
    }

    return {
      isValid: errors.length === 0 && severity !== 'BLOCKER',
      errors,
      warnings,
      fixes,
      severity
    };
  }

  /**
   * MASTER VALIDATION FUNCTION
   * Run this on ALL generated code before writing files
   */
  validateCode(code: string, componentName: string): ValidationResult {
    console.log(`🔍 Validating ${componentName}...`);

    const tsValidation = this.validateTypeScriptPattern(code);
    const reactValidation = this.validateReactComponent(code);
    const nextjsValidation = this.validateNextJSComponent(code);

    // Combine all validation results
    const combinedResult: ValidationResult = {
      isValid: tsValidation.isValid && reactValidation.isValid && nextjsValidation.isValid,
      errors: [...tsValidation.errors, ...reactValidation.errors, ...nextjsValidation.errors],
      warnings: [...tsValidation.warnings, ...reactValidation.warnings, ...nextjsValidation.warnings],
      fixes: [...tsValidation.fixes, ...reactValidation.fixes, ...nextjsValidation.fixes],
      severity: [tsValidation.severity, reactValidation.severity, nextjsValidation.severity]
        .reduce((max, current) => {
          const levels = ['LOW', 'MEDIUM', 'HIGH', 'BLOCKER'];
          return levels.indexOf(current) > levels.indexOf(max) ? current : max;
        }, 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKER')
    };

    // Log validation results
    if (combinedResult.errors.length > 0) {
      console.log(`❌ VALIDATION FAILED for ${componentName}`);
      console.log('Errors:', combinedResult.errors);
      console.log('Suggested fixes:', combinedResult.fixes);
    } else if (combinedResult.warnings.length > 0) {
      console.log(`⚠️  VALIDATION WARNINGS for ${componentName}`);
      console.log('Warnings:', combinedResult.warnings);
    } else {
      console.log(`✅ VALIDATION PASSED for ${componentName}`);
    }

    return combinedResult;
  }

  /**
   * AUTO-FIX COMMON ISSUES
   * Apply safe automatic fixes for known patterns
   */
  autoFixCode(code: string): string {
    let fixedCode = code;

    // Fix 1: Add type assertion for dynamic property access
    fixedCode = fixedCode.replace(
      /(\w+)\.(\w+)\?\.\[(\w+)\]/g,
      '($1.$2 as any)?[$3]'
    );

    // Fix 2: Add error type checking
    fixedCode = fixedCode.replace(
      /catch\s*\(\s*(\w+)\s*\)[\s\S]*?\1\.message/g,
      (match, errorVar) => {
        if (!match.includes('instanceof Error')) {
          return match.replace(
            `${errorVar}.message`,
            `${errorVar} instanceof Error ? ${errorVar}.message : 'Unknown error occurred'`
          );
        }
        return match;
      }
    );

    // Fix 3: Add safe destructuring defaults
    fixedCode = fixedCode.replace(
      /const\s*{([^}]+)}\s*=\s*(\w+)(?!\s*\|\|)/g,
      'const {$1} = $2 || {}'
    );

    return fixedCode;
  }
}

/**
 * SAFE COMPONENT GENERATION TEMPLATES
 */
export class SafeComponentTemplates {
  
  static generateSafeReactComponent(name: string, props: string[] = []): string {
    const propsInterface = props.length > 0 
      ? `interface ${name}Props {\n  ${props.join(';\n  ')};\n}\n\n`
      : '';

    const propsParam = props.length > 0 ? `{ ${props.map(p => p.split(':')[0]).join(', ')} }: ${name}Props` : '';

    return `'use client';

import React, { useState, useCallback } from 'react';

${propsInterface}export function ${name}(${propsParam}) {
  try {
    // Safe state initialization
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Safe event handler
    const handleAction = useCallback((event: React.MouseEvent) => {
      try {
        setError(null);
        // Action implementation here
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Component error:', err);
      }
    }, []);

    // Always return complete JSX
    return (
      <div className="safe-component">
        {error && (
          <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="component-content">
          {/* Component content goes here */}
          <h2 className="text-xl font-semibold">${name}</h2>
          <p>Component is working correctly!</p>
        </div>
      </div>
    );
  } catch (err) {
    // Global error boundary
    console.error('${name} render error:', err);
    return (
      <div className="error-fallback bg-red-50 p-4 rounded">
        <h3>Error loading ${name}</h3>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }
}`;
  }
}

// Export singleton instance for easy use
export const validator = new ClackyValidationFramework();
export const templates = SafeComponentTemplates;