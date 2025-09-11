/**
 * Progressive Form Disclosure Engine
 * 
 * Implements intelligent form field visibility management based on:
 * - User input patterns and expertise level
 * - AI confidence scores and decision trees
 * - Form completion status and validation results
 * - Contextual relevance and dependencies
 */

export interface DisclosureRule {
  id: string;
  fieldId: string;
  condition: DisclosureCondition;
  priority: number;
  confidence: number;
  reason: string;
}

export interface DisclosureCondition {
  type: 'field_value' | 'completion_rate' | 'confidence_level' | 'user_expertise' | 'dependency_chain';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'exists' | 'not_exists';
  targetField?: string;
  targetValue?: any;
  threshold?: number;
}

export interface DisclosureContext {
  formData: Record<string, any>;
  completedFields: string[];
  confidenceScores: Record<string, number>;
  userExpertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  currentPhase: string;
  validationResults: any;
  uncertaintyFlags: any[];
}

export interface FieldDisclosureState {
  isVisible: boolean;
  isRequired: boolean;
  isHighlighted: boolean;
  showHelpText: boolean;
  reason: string;
  confidence: number;
  suggestedOrder: number;
}

/**
 * Progressive Disclosure Engine
 */
export class ProgressiveDisclosureEngine {
  private rules: DisclosureRule[] = [];
  
  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default disclosure rules for financial forms
   */
  private initializeDefaultRules(): void {
    this.rules = [
      // Basic Information Phase Rules
      {
        id: 'show_target_amount_after_title',
        fieldId: 'targetAmount',
        condition: {
          type: 'field_value',
          operator: 'exists',
          targetField: 'title'
        },
        priority: 1,
        confidence: 0.9,
        reason: 'Title provides context for amount estimation'
      },
      
      {
        id: 'show_deadline_after_amount',
        fieldId: 'deadline',
        condition: {
          type: 'field_value',
          operator: 'greater_than',
          targetField: 'targetAmount',
          targetValue: 0
        },
        priority: 2,
        confidence: 0.85,
        reason: 'Amount helps determine realistic timeline'
      },

      // Expertise-Based Rules
      {
        id: 'show_advanced_fields_for_experts',
        fieldId: 'advancedCalculations',
        condition: {
          type: 'user_expertise',
          operator: 'equals',
          targetValue: 'advanced'
        },
        priority: 3,
        confidence: 0.8,
        reason: 'Advanced users can handle complex calculations'
      },

      // Confidence-Based Rules
      {
        id: 'show_clarification_for_low_confidence',
        fieldId: 'clarificationFields',
        condition: {
          type: 'confidence_level',
          operator: 'less_than',
          threshold: 0.6
        },
        priority: 4,
        confidence: 0.9,
        reason: 'Low confidence requires additional clarification'
      },

      // Dependency Chain Rules
      {
        id: 'show_current_savings_after_target',
        fieldId: 'currentAmount',
        condition: {
          type: 'dependency_chain',
          operator: 'exists',
          targetField: 'targetAmount'
        },
        priority: 2,
        confidence: 0.88,
        reason: 'Current savings context needed after target is set'
      },

      {
        id: 'show_monthly_capacity_progressive',
        fieldId: 'monthlyContribution',
        condition: {
          type: 'completion_rate',
          operator: 'greater_than',
          threshold: 0.4
        },
        priority: 5,
        confidence: 0.75,
        reason: 'Show contribution capacity after basic info is complete'
      },

      // Financial Planning Specific Rules
      {
        id: 'show_detailed_expenses_for_large_goals',
        fieldId: 'expenseBreakdown',
        condition: {
          type: 'field_value',
          operator: 'greater_than',
          targetField: 'targetAmount',
          targetValue: 10000
        },
        priority: 6,
        confidence: 0.82,
        reason: 'Large goals benefit from detailed expense planning'
      },

      {
        id: 'show_funding_sources_after_expenses',
        fieldId: 'fundingSourcesSection',
        condition: {
          type: 'field_value',
          operator: 'exists',
          targetField: 'expenseBreakdown'
        },
        priority: 7,
        confidence: 0.85,
        reason: 'Funding sources follow expense planning logically'
      }
    ];
  }

  /**
   * Calculate field visibility based on current context
   */
  calculateFieldVisibility(
    fieldId: string, 
    context: DisclosureContext
  ): FieldDisclosureState {
    const applicableRules = this.getApplicableRules(fieldId, context);
    
    if (applicableRules.length === 0) {
      return this.getDefaultDisclosureState(fieldId, context);
    }

    // Evaluate rules and calculate visibility
    const evaluationResults = applicableRules.map(rule => 
      this.evaluateRule(rule, context)
    );

    // Determine final visibility based on rule results
    const shouldShow = this.aggregateRuleResults(evaluationResults);
    const highestConfidenceRule = evaluationResults
      .filter(r => r.shouldShow)
      .sort((a, b) => b.confidence - a.confidence)[0];

    return {
      isVisible: shouldShow,
      isRequired: this.determineIfRequired(fieldId, context),
      isHighlighted: this.shouldHighlight(fieldId, context),
      showHelpText: this.shouldShowHelp(fieldId, context),
      reason: highestConfidenceRule?.reason || 'Standard form progression',
      confidence: highestConfidenceRule?.confidence || 0.5,
      suggestedOrder: this.calculateSuggestedOrder(fieldId, context)
    };
  }

  /**
   * Get all applicable rules for a field
   */
  private getApplicableRules(fieldId: string, context: DisclosureContext): DisclosureRule[] {
    return this.rules.filter(rule => 
      rule.fieldId === fieldId || 
      rule.fieldId === 'all' || 
      this.fieldMatchesPattern(fieldId, rule.fieldId)
    );
  }

  /**
   * Evaluate a single disclosure rule
   */
  private evaluateRule(rule: DisclosureRule, context: DisclosureContext): {
    shouldShow: boolean;
    confidence: number;
    reason: string;
  } {
    const condition = rule.condition;
    let shouldShow = false;

    switch (condition.type) {
      case 'field_value':
        shouldShow = this.evaluateFieldCondition(condition, context);
        break;
      
      case 'completion_rate':
        shouldShow = this.evaluateCompletionRate(condition, context);
        break;
      
      case 'confidence_level':
        shouldShow = this.evaluateConfidenceLevel(condition, context);
        break;
      
      case 'user_expertise':
        shouldShow = this.evaluateUserExpertise(condition, context);
        break;
      
      case 'dependency_chain':
        shouldShow = this.evaluateDependencyChain(condition, context);
        break;
    }

    return {
      shouldShow,
      confidence: rule.confidence,
      reason: rule.reason
    };
  }

  /**
   * Evaluate field value conditions
   */
  private evaluateFieldCondition(
    condition: DisclosureCondition, 
    context: DisclosureContext
  ): boolean {
    if (!condition.targetField) return false;
    
    const fieldValue = context.formData[condition.targetField];
    
    switch (condition.operator) {
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null || fieldValue === '';
      
      case 'equals':
        return fieldValue === condition.targetValue;
      
      case 'greater_than':
        return typeof fieldValue === 'number' && fieldValue > (condition.targetValue || 0);
      
      case 'less_than':
        return typeof fieldValue === 'number' && fieldValue < (condition.targetValue || 0);
      
      case 'contains':
        return typeof fieldValue === 'string' && 
               fieldValue.toLowerCase().includes(String(condition.targetValue).toLowerCase());
      
      default:
        return false;
    }
  }

  /**
   * Evaluate completion rate conditions
   */
  private evaluateCompletionRate(
    condition: DisclosureCondition, 
    context: DisclosureContext
  ): boolean {
    const totalFields = Object.keys(context.formData).length || 1;
    const completedFields = context.completedFields.length;
    const completionRate = completedFields / totalFields;
    
    const threshold = condition.threshold || 0;
    
    switch (condition.operator) {
      case 'greater_than':
        return completionRate > threshold;
      case 'less_than':
        return completionRate < threshold;
      case 'equals':
        return Math.abs(completionRate - threshold) < 0.1;
      default:
        return false;
    }
  }

  /**
   * Evaluate confidence level conditions
   */
  private evaluateConfidenceLevel(
    condition: DisclosureCondition, 
    context: DisclosureContext
  ): boolean {
    const avgConfidence = this.calculateAverageConfidence(context.confidenceScores);
    const threshold = condition.threshold || 0;
    
    switch (condition.operator) {
      case 'greater_than':
        return avgConfidence > threshold;
      case 'less_than':
        return avgConfidence < threshold;
      case 'equals':
        return Math.abs(avgConfidence - threshold) < 0.1;
      default:
        return false;
    }
  }

  /**
   * Evaluate user expertise conditions
   */
  private evaluateUserExpertise(
    condition: DisclosureCondition, 
    context: DisclosureContext
  ): boolean {
    return condition.operator === 'equals' && 
           context.userExpertiseLevel === condition.targetValue;
  }

  /**
   * Evaluate dependency chain conditions
   */
  private evaluateDependencyChain(
    condition: DisclosureCondition, 
    context: DisclosureContext
  ): boolean {
    if (!condition.targetField) return false;
    
    return this.evaluateFieldCondition({
      type: 'field_value',
      operator: condition.operator,
      targetField: condition.targetField,
      targetValue: condition.targetValue
    }, context);
  }

  /**
   * Aggregate multiple rule results
   */
  private aggregateRuleResults(results: Array<{
    shouldShow: boolean;
    confidence: number;
    reason: string;
  }>): boolean {
    if (results.length === 0) return false;
    
    // Weight by confidence and take majority vote
    const weightedVotes = results.map(result => ({
      vote: result.shouldShow ? 1 : -1,
      weight: result.confidence
    }));
    
    const totalWeight = weightedVotes.reduce((sum, vote) => sum + vote.weight, 0);
    const weightedSum = weightedVotes.reduce((sum, vote) => sum + (vote.vote * vote.weight), 0);
    
    return weightedSum > 0;
  }

  /**
   * Helper methods
   */
  private getDefaultDisclosureState(fieldId: string, context: DisclosureContext): FieldDisclosureState {
    // Basic fields are always visible
    const basicFields = ['title', 'description', 'targetAmount', 'deadline'];
    
    return {
      isVisible: basicFields.includes(fieldId),
      isRequired: basicFields.includes(fieldId),
      isHighlighted: false,
      showHelpText: context.userExpertiseLevel === 'beginner',
      reason: 'Default visibility rule',
      confidence: 0.5,
      suggestedOrder: basicFields.indexOf(fieldId) + 1 || 99
    };
  }

  private determineIfRequired(fieldId: string, context: DisclosureContext): boolean {
    const requiredFields = ['title', 'targetAmount'];
    return requiredFields.includes(fieldId);
  }

  private shouldHighlight(fieldId: string, context: DisclosureContext): boolean {
    // Highlight fields with low confidence scores
    const confidence = context.confidenceScores[fieldId] || 1.0;
    return confidence < 0.6;
  }

  private shouldShowHelp(fieldId: string, context: DisclosureContext): boolean {
    const hasUncertainty = context.uncertaintyFlags.some(flag => flag.fieldId === fieldId);
    const isBeginnerUser = context.userExpertiseLevel === 'beginner';
    return hasUncertainty || isBeginnerUser;
  }

  private calculateSuggestedOrder(fieldId: string, context: DisclosureContext): number {
    const standardOrder = [
      'title', 'targetAmount', 'deadline', 'currentAmount', 
      'monthlyContribution', 'description', 'expenseBreakdown', 
      'fundingSourcesSection'
    ];
    
    const index = standardOrder.indexOf(fieldId);
    return index !== -1 ? index + 1 : 99;
  }

  private fieldMatchesPattern(fieldId: string, pattern: string): boolean {
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      return new RegExp(regexPattern).test(fieldId);
    }
    return fieldId === pattern;
  }

  private calculateAverageConfidence(confidenceScores: Record<string, number>): number {
    const scores = Object.values(confidenceScores);
    return scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 1.0;
  }

  /**
   * Get recommended next fields to show
   */
  getRecommendedNextFields(context: DisclosureContext): Array<{
    fieldId: string;
    reason: string;
    confidence: number;
    suggestedOrder: number;
  }> {
    const allFields = [
      'title', 'targetAmount', 'deadline', 'currentAmount', 
      'monthlyContribution', 'description', 'expenseBreakdown', 
      'fundingSourcesSection', 'clarificationFields', 'advancedCalculations'
    ];

    const recommendations = allFields
      .filter(fieldId => !context.completedFields.includes(fieldId))
      .map(fieldId => {
        const state = this.calculateFieldVisibility(fieldId, context);
        return {
          fieldId,
          reason: state.reason,
          confidence: state.confidence,
          suggestedOrder: state.suggestedOrder,
          shouldShow: state.isVisible
        };
      })
      .filter(rec => rec.shouldShow)
      .sort((a, b) => a.suggestedOrder - b.suggestedOrder)
      .slice(0, 3); // Return top 3 recommendations

    return recommendations;
  }
}

// Export singleton instance
export const progressiveDisclosureEngine = new ProgressiveDisclosureEngine();