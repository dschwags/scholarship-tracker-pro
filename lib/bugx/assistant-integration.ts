/**
 * BugX Assistant Integration Layer
 * 
 * Seamless integration of BugX methodology into Claude/AI assistant workflow
 * without requiring manual activation or process overhead.
 */

import { BugXHelpers, ClackyBugXIntegration } from './integration-hooks';
import { BugXPatternEngine, DebuggingContext } from './pattern-recognition';

/**
 * Main Assistant Integration Class
 * 
 * This class provides the interface between the AI assistant's decision-making
 * process and the BugX methodology, making BugX feel like natural enhanced
 * debugging capabilities rather than an additional process step.
 */
export class AssistantBugXWorkflow {
  private static instance: AssistantBugXWorkflow;
  private integration: ClackyBugXIntegration;
  private currentSession: {
    startTime: number;
    initialEstimate: number;
    currentUsage: number;
    context: DebuggingContext | null;
    engagementReason: string | null;
  } | null = null;

  private constructor() {
    this.integration = new ClackyBugXIntegration();
  }

  static getInstance(): AssistantBugXWorkflow {
    if (!this.instance) {
      this.instance = new AssistantBugXWorkflow();
    }
    return this.instance;
  }

  /**
   * Pre-Task Decision Logic
   * 
   * Called automatically before starting any debugging task.
   * Returns natural language guidance if BugX should be engaged.
   */
  async shouldEngageBugXForTask(userMessage: string, additionalContext?: {
    errorMessage?: string;
    filesPaths?: string[];
    previousAttempts?: number;
    estimatedComplexity?: 'low' | 'medium' | 'high';
  }): Promise<{
    shouldEngage: boolean;
    naturalMessage: string | null;
    internalReason: string;
    recommendedPhase: number;
    estimatedSavings: number;
  }> {
    
    const bugxMessage = await this.integration.preTaskAnalysis({
      userMessage,
      errorMessage: additionalContext?.errorMessage,
      estimatedComplexity: additionalContext?.estimatedComplexity
    });

    if (bugxMessage) {
      // Store session info for monitoring
      this.currentSession = {
        startTime: Date.now(),
        initialEstimate: this.estimateCreditsFromMessage(userMessage),
        currentUsage: 0,
        context: null, // Will be populated by pattern engine
        engagementReason: bugxMessage
      };

      const naturalMessage = this.convertToNaturalLanguage(bugxMessage, userMessage);
      const analysis = BugXPatternEngine.shouldEngageBugX({
        errorMessage: additionalContext?.errorMessage || userMessage,
        estimatedCredits: this.currentSession.initialEstimate,
        complexity: additionalContext?.estimatedComplexity || 'medium',
        affectsMultipleComponents: this.detectMultiComponent(userMessage),
        involvesAuthentication: this.detectAuth(userMessage),
        affectsSharedComponents: this.detectShared(userMessage),
        requiresBuildSystemChanges: this.detectBuild(userMessage),
        crossTeamComponentModification: false,
        estimatedTimeInvestment: this.estimateHours(userMessage)
      });

      return {
        shouldEngage: true,
        naturalMessage,
        internalReason: bugxMessage,
        recommendedPhase: analysis.phase,
        estimatedSavings: analysis.estimatedCreditSavings
      };
    }

    return {
      shouldEngage: false,
      naturalMessage: null,
      internalReason: 'Pattern analysis suggests standard debugging approach',
      recommendedPhase: 0,
      estimatedSavings: 0
    };
  }

  /**
   * Mid-Task Credit Monitoring
   * 
   * Called periodically during task execution to monitor credit burn rate
   */
  checkCreditBurnRate(currentUsage: number): {
    shouldIntervene: boolean;
    interventionMessage: string | null;
    burnRate: number;
  } {
    if (!this.currentSession) {
      return { shouldIntervene: false, interventionMessage: null, burnRate: 1.0 };
    }

    this.currentSession.currentUsage = currentUsage;
    const burnRate = currentUsage / this.currentSession.initialEstimate;
    
    const burnWarning = this.integration.duringTaskMonitoring(currentUsage);
    
    if (burnWarning && burnRate > 1.5) {
      const naturalMessage = this.convertBurnWarningToNatural(burnWarning, burnRate);
      
      return {
        shouldIntervene: true,
        interventionMessage: naturalMessage,
        burnRate
      };
    }

    return { shouldIntervene: false, interventionMessage: null, burnRate };
  }

  /**
   * Generate Natural Language BugX Engagement
   * 
   * Converts technical BugX analysis into natural assistant language
   */
  private convertToNaturalLanguage(bugxMessage: string, userMessage: string): string {
    // Extract key patterns from user message
    const patterns = this.identifyUserPatterns(userMessage);
    
    // Generate contextual natural language
    const introductions = [
      "I'm noticing a pattern here that could lead to expensive debugging.",
      "This looks like a scenario where systematic validation would be more efficient.",
      "I'm detecting complexity indicators that suggest a methodical approach would save time.",
      "This pattern often leads to rabbit holes - let me verify the fundamentals first."
    ];

    const approaches = {
      'authentication': "Let me first verify the authentication flow architecture before diving into specific debugging.",
      'bundling': "I should check the import structure and server/client separation before troubleshooting the specific error.",
      'architecture': "Let me validate the component relationships and dependencies systematically.",
      'deployment': "I'll verify the build configuration and environment consistency first.",
      'phantom': "Let me confirm this feature actually exists and identify the correct components before debugging.",
      'performance': "I should analyze the component lifecycle and state management before optimizing specific areas."
    };

    const primaryPattern = patterns[0] || 'architecture';
    const introduction = introductions[Math.floor(Math.random() * introductions.length)];
    const approach = approaches[primaryPattern] || approaches['architecture'];

    return `${introduction} ${approach}\n\nThis systematic approach typically prevents costly debugging cycles and gives us faster, more reliable results.`;
  }

  /**
   * Convert Credit Burn Warning to Natural Language
   */
  private convertBurnWarningToNatural(burnWarning: string, burnRate: number): string {
    const burnPercentage = Math.round(burnRate * 100);
    
    if (burnRate > 2.0) {
      return `I notice we're using significantly more credits than expected (${burnPercentage}% of estimate). This often indicates we might be debugging symptoms rather than the root cause. Let me step back and validate our approach using systematic analysis to get back on track efficiently.`;
    } else if (burnRate > 1.5) {
      return `Our credit usage is running higher than expected (${burnPercentage}% of estimate). This might be a good point to validate our current direction with a quick systematic check to ensure we're solving the right problem.`;
    }
    
    return `Credit usage is slightly elevated (${burnPercentage}% of estimate). I'll continue monitoring our progress closely.`;
  }

  /**
   * Identify User Message Patterns
   */
  private identifyUserPatterns(message: string): string[] {
    const patternMap = [
      { keywords: ['auth', 'login', 'session', 'password'], pattern: 'authentication' },
      { keywords: ['module not found', 'cannot resolve', 'import', 'bundle'], pattern: 'bundling' },
      { keywords: ['component', 'multiple', 'shared', 'layout'], pattern: 'architecture' },
      { keywords: ['build', 'deploy', 'production', 'works locally'], pattern: 'deployment' },
      { keywords: ['not working', 'missing', 'feature'], pattern: 'phantom' },
      { keywords: ['slow', 'performance', 'render', 'infinite'], pattern: 'performance' }
    ];

    const detectedPatterns: string[] = [];
    
    for (const { keywords, pattern } of patternMap) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        detectedPatterns.push(pattern);
      }
    }

    return detectedPatterns.length > 0 ? detectedPatterns : ['architecture'];
  }

  /**
   * Utility functions for pattern detection
   */
  private estimateCreditsFromMessage(message: string): number {
    // Simplified credit estimation logic
    if (/build.*fail|deploy.*error|module.*not.*found/.test(message)) return 100;
    if (/auth|login|session/.test(message)) return 80;
    if (/component.*not.*work|feature.*missing/.test(message)) return 60;
    if (/performance|slow|infinite/.test(message)) return 70;
    return 40;
  }

  private detectMultiComponent(message: string): boolean {
    return /multiple|shared|cross|layout|header|footer/.test(message.toLowerCase());
  }

  private detectAuth(message: string): boolean {
    return /auth|login|session|password|user|sign/.test(message.toLowerCase());
  }

  private detectShared(message: string): boolean {
    return /shared|global|layout|header|footer|context|provider/.test(message.toLowerCase());
  }

  private detectBuild(message: string): boolean {
    return /build|bundle|deploy|production|module.*not.*found/.test(message.toLowerCase());
  }

  private estimateHours(message: string): number {
    if (/simple|quick|small/.test(message.toLowerCase())) return 1;
    if (/complex|architecture|refactor/.test(message.toLowerCase())) return 6;
    if (/auth|build|deploy/.test(message.toLowerCase())) return 4;
    return 2;
  }

  /**
   * Session Management
   */
  endCurrentSession(): void {
    this.currentSession = null;
  }

  getCurrentSession() {
    return this.currentSession;
  }
}

/**
 * Convenience Functions for Easy Integration
 */
export class BugXAssistantHelpers {
  private static workflow = AssistantBugXWorkflow.getInstance();

  /**
   * Main integration point for AI assistants
   * 
   * Call this before starting any debugging task to get natural language
   * guidance on whether systematic validation would be beneficial.
   */
  static async checkForBugXOpportunity(
    userMessage: string,
    context?: {
      errorMessage?: string;
      filesPaths?: string[];
      estimatedComplexity?: 'low' | 'medium' | 'high';
    }
  ): Promise<string | null> {
    const result = await this.workflow.shouldEngageBugXForTask(userMessage, context);
    
    if (result.shouldEngage && result.naturalMessage) {
      console.log(`🔍 BugX Opportunity Detected: ${result.internalReason}`);
      console.log(`📊 Estimated Credit Savings: ${result.estimatedSavings}`);
      console.log(`🎯 Recommended Starting Phase: ${result.recommendedPhase}`);
      
      return result.naturalMessage;
    }

    return null;
  }

  /**
   * Credit monitoring during task execution
   */
  static monitorCreditUsage(currentUsage: number): string | null {
    const result = this.workflow.checkCreditBurnRate(currentUsage);
    
    if (result.shouldIntervene && result.interventionMessage) {
      console.log(`⚠️ Credit Burn Intervention: Rate ${Math.round(result.burnRate * 100)}%`);
      return result.interventionMessage;
    }

    return null;
  }

  /**
   * Get current session information for debugging
   */
  static getCurrentSessionInfo() {
    return this.workflow.getCurrentSession();
  }

  /**
   * End current debugging session
   */
  static endSession(): void {
    this.workflow.endCurrentSession();
  }

  /**
   * Generate natural trigger phrases for different scenarios
   */
  static getNaturalTriggerPhrase(scenario: string): string {
    const phrases = {
      'high-complexity': "This looks like a complex scenario that would benefit from systematic validation to avoid potential rabbit holes.",
      'authentication': "Authentication issues often have hidden dependencies - let me verify the auth flow architecture first.",
      'build-errors': "Build errors can mask deeper architectural issues - I'll check the fundamental structure before diving into specifics.",
      'phantom-debugging': "Let me first confirm this feature exists and identify the correct components before troubleshooting.",
      'performance': "Performance issues often have cascading effects - I'll analyze the component relationships systematically.",
      'multi-component': "This affects multiple components, so I'll map the dependencies to prevent unintended side effects."
    };

    return phrases[scenario] || phrases['high-complexity'];
  }
}

/**
 * Integration Example for AI Assistant Decision Logic:
 * 
 * // Before starting any debugging task:
 * const bugxGuidance = await BugXAssistantHelpers.checkForBugXOpportunity(
 *   userMessage,
 *   { errorMessage, estimatedComplexity: 'high' }
 * );
 * 
 * if (bugxGuidance) {
 *   // Natural integration - no "using BugX" announcement needed
 *   console.log(bugxGuidance);
 *   // Proceed with systematic validation approach
 * } else {
 *   // Standard debugging approach
 *   // Proceed normally
 * }
 * 
 * // During task execution:
 * const creditWarning = BugXAssistantHelpers.monitorCreditUsage(currentCreditCount);
 * if (creditWarning) {
 *   console.log(creditWarning);
 *   // Consider validation checkpoint
 * }
 * 
 * // End of task:
 * BugXAssistantHelpers.endSession();
 */