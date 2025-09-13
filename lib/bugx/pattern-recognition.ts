/**
 * BugX Pattern Recognition Engine
 * 
 * Automatically detects high-risk debugging scenarios and engages
 * BugX methodology to prevent expensive phantom debugging sessions.
 */

export interface DebuggingContext {
  errorMessage: string;
  estimatedCredits: number;
  complexity: 'low' | 'medium' | 'high';
  affectsMultipleComponents: boolean;
  involvesAuthentication: boolean;
  affectsSharedComponents: boolean;
  requiresBuildSystemChanges: boolean;
  crossTeamComponentModification: boolean;
  estimatedTimeInvestment: number; // in hours
  currentCreditUsage?: number;
  initialEstimate?: number;
}

export interface BugXAnalysisResult {
  shouldEngage: boolean;
  reason: string;
  phase: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedCreditSavings: number;
  recommendedApproach: string[];
}

/**
 * Core BugX Pattern Recognition System
 */
export class BugXPatternEngine {
  private static readonly HIGH_RISK_PATTERNS = [
    // Component architecture issues
    { pattern: /Module not found.*component/i, weight: 0.9, category: 'architecture' },
    { pattern: /Cannot resolve.*fs|net|tls|crypto/i, weight: 0.95, category: 'bundling' },
    { pattern: /Cannot resolve.*auth/i, weight: 0.8, category: 'authentication' },
    
    // Build/deployment mismatches
    { pattern: /works locally.*production/i, weight: 0.9, category: 'deployment' },
    { pattern: /works in dev.*fails in build/i, weight: 0.9, category: 'deployment' },
    { pattern: /Spread types may only be created from object types/i, weight: 0.7, category: 'typescript' },
    
    // Performance cascade issues
    { pattern: /infinite.*render/i, weight: 0.85, category: 'performance' },
    { pattern: /too many.*re-renders/i, weight: 0.8, category: 'performance' },
    { pattern: /Maximum update depth exceeded/i, weight: 0.9, category: 'performance' },
    
    // Shared component state conflicts
    { pattern: /context.*undefined/i, weight: 0.75, category: 'state' },
    { pattern: /Provider.*not found/i, weight: 0.8, category: 'state' },
    
    // Classic phantom debugging
    { pattern: /TypeError.*Cannot read property/i, weight: 0.7, category: 'phantom' },
    { pattern: /Object is possibly.*undefined/i, weight: 0.6, category: 'phantom' },
    { pattern: /feature.*not.*working/i, weight: 0.8, category: 'phantom' }
  ];

  private static readonly COMPLEXITY_INDICATORS = [
    'estimatedTimeInvestment > 4',
    'affectsMultipleComponents === true',
    'involvesAuthentication === true', 
    'requiresBuildSystemChanges === true',
    'crossTeamComponentModification === true'
  ];

  private static readonly EXPENSIVE_DEBUGGING_FLAGS = [
    'similarToPreviousPhantomDebugging',
    'matchesKnownArchitecturalDriftPattern', 
    'involvesComponentsWithPastFailures'
  ];

  /**
   * Main decision logic for automatic BugX engagement
   */
  static shouldEngageBugX(context: DebuggingContext): BugXAnalysisResult {
    let riskScore = 0;
    let reasons: string[] = [];
    let recommendedApproach: string[] = [];

    // 1. Pattern Recognition Analysis
    const patternMatch = this.analyzeErrorPatterns(context.errorMessage);
    if (patternMatch.score > 0.7) {
      riskScore += patternMatch.score;
      reasons.push(`High-risk pattern detected: ${patternMatch.category}`);
      recommendedApproach.push(`BugX Phase 1: ${patternMatch.category} validation required`);
    }

    // 2. Complexity Analysis
    if (context.estimatedCredits > 50) {
      riskScore += 0.8;
      reasons.push('High credit estimate indicates complex debugging');
      recommendedApproach.push('BugX Phase 0: Reality check and component verification');
    }

    if (context.complexity === 'high') {
      riskScore += 0.7;
      reasons.push('High complexity assessment');
    }

    // 3. Architecture Impact Analysis
    if (context.affectsSharedComponents || context.involvesAuthentication) {
      riskScore += 0.8;
      reasons.push('Affects critical shared components or authentication');
      recommendedApproach.push('BugX Phase 2: Cross-component impact analysis');
    }

    if (context.requiresBuildSystemChanges) {
      riskScore += 0.7;
      reasons.push('Build system changes require systematic validation');
      recommendedApproach.push('BugX Phase 3: Build system compatibility check');
    }

    // 4. Credit Burn Rate Protection (Enhanced feature)
    if (context.currentCreditUsage && context.initialEstimate) {
      const burnRate = context.currentCreditUsage / context.initialEstimate;
      if (burnRate > 1.5) {
        riskScore += 0.9;
        reasons.push(`Credit burn rate exceeded: ${Math.round(burnRate * 100)}% of estimate`);
        recommendedApproach.push('BugX Mid-Task Reality Check: Validate current approach');
      }
    }

    // 5. Time Investment Analysis
    if (context.estimatedTimeInvestment > 4) {
      riskScore += 0.6;
      reasons.push('Time investment exceeds 4 hours - systematic approach recommended');
    }

    // Determine engagement decision
    const shouldEngage = riskScore > 0.6;
    const riskLevel = this.calculateRiskLevel(riskScore);
    const phase = this.determineStartingPhase(patternMatch, context);
    const estimatedSavings = this.calculatePotentialSavings(riskScore, context);

    return {
      shouldEngage,
      reason: reasons.join('; '),
      phase,
      riskLevel,
      estimatedCreditSavings: estimatedSavings,
      recommendedApproach
    };
  }

  /**
   * Analyze error message against known expensive patterns
   */
  private static analyzeErrorPatterns(errorMessage: string): { score: number; category: string } {
    let maxScore = 0;
    let matchedCategory = 'unknown';

    for (const { pattern, weight, category } of this.HIGH_RISK_PATTERNS) {
      if (pattern.test(errorMessage)) {
        if (weight > maxScore) {
          maxScore = weight;
          matchedCategory = category;
        }
      }
    }

    return { score: maxScore, category: matchedCategory };
  }

  /**
   * Calculate risk level based on aggregated score
   */
  private static calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 1.5) return 'critical';
    if (score >= 1.0) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Determine which BugX phase to start with
   */
  private static determineStartingPhase(patternMatch: { score: number; category: string }, context: DebuggingContext): number {
    // Critical patterns start with Phase 0 (Reality Check)
    if (patternMatch.score > 0.8 || context.estimatedCredits > 100) {
      return 0;
    }
    
    // High-risk authentication or shared components start with Phase 1
    if (context.involvesAuthentication || context.affectsSharedComponents) {
      return 1;
    }

    // Build/deployment issues start with Phase 2
    if (patternMatch.category === 'deployment' || patternMatch.category === 'bundling') {
      return 2;
    }

    // Default to Phase 1 for systematic component analysis
    return 1;
  }

  /**
   * Calculate potential credit savings from BugX methodology
   */
  private static calculatePotentialSavings(riskScore: number, context: DebuggingContext): number {
    const baseMultiplier = Math.min(riskScore, 2.0);
    const creditSavings = Math.round((context.estimatedCredits || 50) * baseMultiplier * 0.6);
    return Math.min(creditSavings, 200); // Cap at 200 credits savings
  }

  /**
   * Mid-task credit burn protection
   */
  static checkCreditBurnRate(currentUsage: number, initialEstimate: number): {
    shouldInterrupt: boolean;
    burnRate: number;
    recommendation: string;
  } {
    const burnRate = currentUsage / initialEstimate;
    const shouldInterrupt = burnRate > 1.5;

    let recommendation = '';
    if (burnRate > 2.0) {
      recommendation = 'CRITICAL: Credit usage 200%+ of estimate. Immediate BugX reality check required.';
    } else if (burnRate > 1.5) {
      recommendation = 'WARNING: Credit burn rate high. Consider BugX validation of current approach.';
    } else if (burnRate > 1.2) {
      recommendation = 'NOTICE: Credit usage slightly elevated. Monitor progress closely.';
    }

    return {
      shouldInterrupt,
      burnRate,
      recommendation
    };
  }

  /**
   * Generate automatic BugX engagement message
   */
  static generateEngagementMessage(analysis: BugXAnalysisResult): string {
    const messages = {
      critical: '🚨 CRITICAL debugging scenario detected',
      high: '⚠️ High-risk debugging pattern identified',
      medium: '🔍 Complex debugging scenario detected',
      low: '📋 Standard debugging approach recommended'
    };

    const baseMessage = messages[analysis.riskLevel];
    const approach = analysis.recommendedApproach.join('; ');
    const savings = analysis.estimatedCreditSavings > 0 
      ? ` (Potential savings: ${analysis.estimatedCreditSavings} credits)`
      : '';

    return `${baseMessage}. Engaging BugX methodology starting with Phase ${analysis.phase}.${savings}\n\nReason: ${analysis.reason}\n\nRecommended approach: ${approach}`;
  }
}

/**
 * Integration helper for automatic BugX workflow
 */
export class BugXWorkflowIntegration {
  private static currentContext: DebuggingContext | null = null;
  private static analysis: BugXAnalysisResult | null = null;

  /**
   * Pre-analysis check called before starting any debugging task
   */
  static preAnalysisCheck(context: DebuggingContext): string | null {
    this.currentContext = context;
    this.analysis = BugXPatternEngine.shouldEngageBugX(context);

    if (this.analysis.shouldEngage) {
      const message = BugXPatternEngine.generateEngagementMessage(this.analysis);
      console.log('🔍 BugX Pattern Recognition: Automatic engagement triggered');
      return message;
    }

    console.log('📋 Standard debugging approach - BugX not required');
    return null;
  }

  /**
   * Mid-task credit monitoring
   */
  static monitorCreditUsage(currentUsage: number): string | null {
    if (!this.currentContext || !this.currentContext.initialEstimate) {
      return null;
    }

    const burnCheck = BugXPatternEngine.checkCreditBurnRate(
      currentUsage, 
      this.currentContext.initialEstimate
    );

    if (burnCheck.shouldInterrupt) {
      const message = `${burnCheck.recommendation}\n\nCurrent burn rate: ${Math.round(burnCheck.burnRate * 100)}%\nOriginal estimate: ${this.currentContext.initialEstimate} credits\nCurrent usage: ${currentUsage} credits`;
      
      console.log('⚠️ BugX Credit Protection: Mid-task intervention triggered');
      return message;
    }

    return null;
  }

  /**
   * Get current analysis results
   */
  static getCurrentAnalysis(): BugXAnalysisResult | null {
    return this.analysis;
  }

  /**
   * Reset workflow state for new debugging session
   */
  static resetWorkflow(): void {
    this.currentContext = null;
    this.analysis = null;
  }
}