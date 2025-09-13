/**
 * BugX Integration Hooks for Clacky AI Assistant
 * 
 * Provides seamless integration of BugX methodology into the debugging workflow
 * without requiring manual reminders or bureaucratic overhead.
 */

import { DebuggingContext, BugXPatternEngine, BugXWorkflowIntegration } from './pattern-recognition';

/**
 * Assistant Decision Enhancement Interface
 */
export interface AssistantBugXIntegration {
  preTaskAnalysis(taskContext: any): Promise<string | null>;
  duringTaskMonitoring(creditUsage: number): string | null;
  postTaskValidation(results: any): string | null;
}

/**
 * Main BugX Integration Class for AI Assistant
 */
export class ClackyBugXIntegration implements AssistantBugXIntegration {
  private taskStartTime: number = 0;
  private initialCreditEstimate: number = 0;
  private currentCreditUsage: number = 0;

  /**
   * Called before starting any debugging task
   * Automatically determines if BugX methodology should be engaged
   */
  async preTaskAnalysis(taskContext: {
    userMessage: string;
    errorMessage?: string;
    estimatedComplexity?: 'low' | 'medium' | 'high';
    estimatedCredits?: number;
    taskType?: string;
  }): Promise<string | null> {
    
    // Create debugging context from task information
    const context: DebuggingContext = {
      errorMessage: taskContext.errorMessage || taskContext.userMessage || '',
      estimatedCredits: taskContext.estimatedCredits || this.estimateCreditsFromMessage(taskContext.userMessage),
      complexity: taskContext.estimatedComplexity || this.assessComplexity(taskContext.userMessage),
      affectsMultipleComponents: this.detectMultiComponentImpact(taskContext.userMessage),
      involvesAuthentication: this.detectAuthenticationInvolvement(taskContext.userMessage),
      affectsSharedComponents: this.detectSharedComponentImpact(taskContext.userMessage),
      requiresBuildSystemChanges: this.detectBuildSystemChanges(taskContext.userMessage),
      crossTeamComponentModification: false, // Could be enhanced with team detection
      estimatedTimeInvestment: this.estimateTimeInvestment(taskContext.userMessage),
      currentCreditUsage: 0,
      initialEstimate: taskContext.estimatedCredits || this.estimateCreditsFromMessage(taskContext.userMessage)
    };

    // Store for monitoring
    this.taskStartTime = Date.now();
    this.initialCreditEstimate = context.estimatedCredits;
    this.currentCreditUsage = 0;

    // Check if BugX should be engaged
    const bugxMessage = BugXWorkflowIntegration.preAnalysisCheck(context);
    
    if (bugxMessage) {
      return this.formatBugXEngagementMessage(bugxMessage);
    }

    return null;
  }

  /**
   * Called during task execution to monitor credit burn rate
   */
  duringTaskMonitoring(creditUsage: number): string | null {
    this.currentCreditUsage = creditUsage;
    
    const burnWarning = BugXWorkflowIntegration.monitorCreditUsage(creditUsage);
    
    if (burnWarning) {
      return this.formatCreditBurnWarning(burnWarning);
    }

    return null;
  }

  /**
   * Called after task completion for learning and validation
   */
  postTaskValidation(results: {
    success: boolean;
    actualCreditsUsed: number;
    timeSpent: number;
    issuesEncountered: string[];
  }): string | null {
    const analysis = BugXWorkflowIntegration.getCurrentAnalysis();
    
    if (analysis && analysis.shouldEngage) {
      const actualSavings = Math.max(0, this.initialCreditEstimate - results.actualCreditsUsed);
      const predictedSavings = analysis.estimatedCreditSavings;
      
      // Learning feedback for pattern improvement
      const feedbackMessage = this.generateLearningFeedback(
        analysis,
        results,
        actualSavings,
        predictedSavings
      );
      
      // Reset for next task
      BugXWorkflowIntegration.resetWorkflow();
      
      return feedbackMessage;
    }

    return null;
  }

  /**
   * Smart credit estimation based on message content
   */
  private estimateCreditsFromMessage(message: string): number {
    const indicators = [
      { pattern: /build.*fail|deploy.*error/i, credits: 80 },
      { pattern: /auth.*not.*work|login.*break/i, credits: 100 },
      { pattern: /infinite.*render|too.*many.*render/i, credits: 60 },
      { pattern: /component.*not.*work|feature.*missing/i, credits: 70 },
      { pattern: /module.*not.*found|cannot.*resolve/i, credits: 90 },
      { pattern: /works.*locally.*production/i, credits: 120 },
      { pattern: /typescript.*error|type.*error/i, credits: 40 },
      { pattern: /fix.*bug|debug/i, credits: 50 },
      { pattern: /add.*feature|implement/i, credits: 30 }
    ];

    for (const indicator of indicators) {
      if (indicator.pattern.test(message)) {
        return indicator.credits;
      }
    }

    return 25; // Default low estimate
  }

  /**
   * Assess task complexity from message content
   */
  private assessComplexity(message: string): 'low' | 'medium' | 'high' {
    const highComplexityPatterns = [
      /architecture|refactor|migrate/i,
      /multiple.*component|cross.*component/i,
      /auth.*system|authentication/i,
      /build.*system|webpack|bundling/i,
      /performance.*issue|optimization/i
    ];

    const mediumComplexityPatterns = [
      /component.*not.*work/i,
      /state.*management|context/i,
      /api.*integration/i,
      /database.*query/i,
      /styling.*issue|css/i
    ];

    for (const pattern of highComplexityPatterns) {
      if (pattern.test(message)) return 'high';
    }

    for (const pattern of mediumComplexityPatterns) {
      if (pattern.test(message)) return 'medium';
    }

    return 'low';
  }

  /**
   * Detect if task affects multiple components
   */
  private detectMultiComponentImpact(message: string): boolean {
    const patterns = [
      /multiple.*component/i,
      /cross.*component/i,
      /shared.*component/i,
      /layout.*component/i,
      /header.*footer/i,
      /dashboard.*and/i
    ];

    return patterns.some(pattern => pattern.test(message));
  }

  /**
   * Detect authentication involvement
   */
  private detectAuthenticationInvolvement(message: string): boolean {
    const patterns = [
      /auth|login|password|session/i,
      /sign.*in|sign.*up|logout/i,
      /user.*management|permission/i,
      /security|token/i
    ];

    return patterns.some(pattern => pattern.test(message));
  }

  /**
   * Detect shared component impact
   */
  private detectSharedComponentImpact(message: string): boolean {
    const patterns = [
      /layout|header|footer|sidebar/i,
      /shared.*component|global.*component/i,
      /context.*provider|theme/i,
      /navigation|menu/i
    ];

    return patterns.some(pattern => pattern.test(message));
  }

  /**
   * Detect build system changes
   */
  private detectBuildSystemChanges(message: string): boolean {
    const patterns = [
      /build|webpack|bundling|compile/i,
      /next\.config|package\.json/i,
      /deploy|production/i,
      /module.*not.*found/i
    ];

    return patterns.some(pattern => pattern.test(message));
  }

  /**
   * Estimate time investment in hours
   */
  private estimateTimeInvestment(message: string): number {
    const timeIndicators = [
      { pattern: /simple.*fix|quick.*fix/i, hours: 1 },
      { pattern: /component.*issue|feature.*not.*work/i, hours: 3 },
      { pattern: /architecture|refactor|migrate/i, hours: 8 },
      { pattern: /build.*fail|deploy.*error/i, hours: 5 },
      { pattern: /auth.*system|authentication/i, hours: 6 },
      { pattern: /performance.*optimization/i, hours: 4 }
    ];

    for (const indicator of timeIndicators) {
      if (indicator.pattern.test(message)) {
        return indicator.hours;
      }
    }

    return 2; // Default 2 hours
  }

  /**
   * Format BugX engagement message for natural integration
   */
  private formatBugXEngagementMessage(bugxMessage: string): string {
    return `🔍 **Smart Debugging Detection**\n\n${bugxMessage}\n\n**Proceeding with systematic validation to prevent expensive debugging cycles...**`;
  }

  /**
   * Format credit burn warning message
   */
  private formatCreditBurnWarning(burnWarning: string): string {
    return `⚠️ **Credit Usage Alert**\n\n${burnWarning}\n\n**Recommendation**: Let me validate our current approach using BugX methodology to ensure we're on the right track.`;
  }

  /**
   * Generate learning feedback for pattern improvement
   */
  private generateLearningFeedback(
    analysis: any,
    results: any,
    actualSavings: number,
    predictedSavings: number
  ): string {
    const accuracy = predictedSavings > 0 ? (actualSavings / predictedSavings) : 0;
    
    let feedback = `📊 **BugX Analysis Results**\n\n`;
    feedback += `• **Predicted Credit Savings**: ${predictedSavings}\n`; 
    feedback += `• **Actual Credit Savings**: ${actualSavings}\n`;
    feedback += `• **Prediction Accuracy**: ${Math.round(accuracy * 100)}%\n`;
    feedback += `• **Task Success**: ${results.success ? '✅ Successful' : '❌ Issues encountered'}\n`;
    
    if (results.success && actualSavings > 20) {
      feedback += `\n✅ **BugX methodology successfully prevented expensive debugging cycle!**`;
    } else if (!results.success) {
      feedback += `\n📝 **Learning Opportunity**: Pattern analysis will be refined for similar future scenarios.`;
    }

    return feedback;
  }
}

/**
 * Convenience helper functions for easy integration
 */
export class BugXHelpers {
  private static integration = new ClackyBugXIntegration();

  /**
   * Quick check for debugging tasks
   */
  static async shouldUseBugX(userMessage: string, errorMessage?: string): Promise<boolean> {
    const result = await this.integration.preTaskAnalysis({
      userMessage,
      errorMessage
    });
    
    return result !== null;
  }

  /**
   * Get automatic engagement message
   */
  static async getEngagementMessage(userMessage: string, errorMessage?: string): Promise<string | null> {
    return await this.integration.preTaskAnalysis({
      userMessage,
      errorMessage
    });
  }

  /**
   * Monitor credit usage during task
   */
  static checkCreditBurn(currentUsage: number): string | null {
    return this.integration.duringTaskMonitoring(currentUsage);
  }

  /**
   * Generate natural language BugX trigger phrases
   */
  static getNaturalTriggerPhrase(analysisType: string): string {
    const phrases = {
      'authentication': "This involves authentication complexity, which requires systematic validation to prevent common auth pitfalls.",
      'architecture': "I'm detecting an architectural pattern that often leads to expensive debugging—let me verify component relationships first.",
      'bundling': "This matches a server/client bundling issue pattern. Let me check the import structure systematically.",
      'deployment': "This pattern suggests a build/deployment mismatch. I'll validate the production compatibility first.",
      'performance': "Performance issues often have hidden cascade effects. Let me analyze the component lifecycle systematically.",
      'phantom': "This could be phantom debugging—let me verify the feature actually exists before we start troubleshooting.",
      'typescript': "TypeScript errors sometimes mask deeper architectural issues. Let me validate the type relationships first."
    };

    return phrases[analysisType] || "This pattern suggests systematic validation would be more efficient than ad-hoc debugging.";
  }
}

/**
 * Usage example for Clacky AI integration:
 * 
 * // Before starting any debugging task:
 * const bugxMessage = await BugXHelpers.getEngagementMessage(userMessage, errorMessage);
 * if (bugxMessage) {
 *   console.log(bugxMessage);
 *   // Proceed with BugX methodology
 * }
 * 
 * // During task execution:
 * const burnWarning = BugXHelpers.checkCreditBurn(currentCreditUsage);
 * if (burnWarning) {
 *   console.log(burnWarning);
 *   // Consider validation checkpoint
 * }
 */