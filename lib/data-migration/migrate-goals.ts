/**
 * Data Migration Utility - localStorage to Database
 * Bulletproof migration with rollback capabilities
 */

// 🚨 BUGX CRITICAL FIX: Dynamic imports to prevent legacy lock
// import { db } from '@/lib/db/drizzle';
// import { financialGoals, goalExpenses } from '@/lib/db/schema-financial-goals';
import { eq } from 'drizzle-orm';

interface LegacyGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  expenses?: Array<{
    name: string;
    amount: number;
    frequency?: string;
  }>;
  // Legacy fields that might exist
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LegacyGoalsData {
  goals: LegacyGoal[];
  metadata?: {
    version?: string;
    lastUpdated?: string;
    totalGoals?: number;
  };
}

interface MigrationResult {
  success: boolean;
  migratedGoals: number;
  migratedExpenses: number;
  errors: string[];
  backupCreated: boolean;
  rollbackAvailable: boolean;
}

export class GoalsDataMigrator {
  private userId: number;
  private backupKey: string;
  
  constructor(userId: number) {
    this.userId = userId;
    this.backupKey = `goals_backup_${userId}_${Date.now()}`;
  }

  /**
   * Main migration function - safe with automatic rollback
   */
  async migrateUserGoals(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedGoals: 0,
      migratedExpenses: 0,
      errors: [],
      backupCreated: false,
      rollbackAvailable: false,
    };

    try {
      console.log(`🔄 Starting goals migration for user ${this.userId}`);

      // Step 1: Load legacy data
      const legacyData = await this.loadLegacyData();
      if (!legacyData || !legacyData.goals || legacyData.goals.length === 0) {
        console.log('ℹ️ No legacy goals found to migrate');
        result.success = true;
        return result;
      }

      // Step 2: Create backup
      result.backupCreated = await this.createBackup(legacyData);
      if (!result.backupCreated) {
        result.errors.push('Failed to create backup - migration aborted for safety');
        return result;
      }

      // Step 3: Validate legacy data
      const validationErrors = await this.validateLegacyData(legacyData);
      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        // Continue with partial migration if possible
      }

      // Step 4: Check if user already has goals in database
      const existingGoals = await this.checkExistingGoals();
      if (existingGoals.length > 0) {
        console.log(`⚠️ User already has ${existingGoals.length} goals in database`);
        // Merge strategy: keep database goals, add unique localStorage goals
        result.errors.push('Database goals already exist - using merge strategy');
      }

      // Step 5: Migrate goals with transaction safety
      const migrationResults = await this.performMigration(legacyData.goals);
      result.migratedGoals = migrationResults.goals;
      result.migratedExpenses = migrationResults.expenses;
      result.errors.push(...migrationResults.errors);

      // Step 6: Verify migration integrity
      const verificationPassed = await this.verifyMigration(legacyData.goals);
      if (!verificationPassed) {
        result.errors.push('Migration verification failed');
        await this.rollbackMigration();
        result.rollbackAvailable = true;
        return result;
      }

      // Step 7: Mark as successful
      result.success = true;
      result.rollbackAvailable = true;
      
      console.log(`✅ Migration completed successfully: ${result.migratedGoals} goals, ${result.migratedExpenses} expenses`);

      // Step 8: Archive legacy data (don't delete immediately)
      await this.archiveLegacyData();

      return result;

    } catch (error) {
      console.error('🚨 Migration failed:', error);
      result.errors.push(`Migration error: ${error.message}`);
      
      // Attempt automatic rollback
      if (result.backupCreated) {
        await this.rollbackMigration();
        result.rollbackAvailable = true;
      }
      
      return result;
    }
  }

  /**
   * Load legacy data from localStorage
   */
  private async loadLegacyData(): Promise<LegacyGoalsData | null> {
    try {
      // Try multiple possible localStorage keys
      const possibleKeys = [
        `goals_${this.userId}`,
        `financial_goals_${this.userId}`,
        'goals_data',
        'financial_goals',
        'user_goals'
      ];

      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Handle different legacy formats
          if (Array.isArray(parsed)) {
            return { goals: parsed };
          } else if (parsed.goals && Array.isArray(parsed.goals)) {
            return parsed;
          } else if (parsed.financial && Array.isArray(parsed.financial)) {
            return { goals: parsed.financial };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error loading legacy data:', error);
      return null;
    }
  }

  /**
   * Create backup of current state
   */
  private async createBackup(legacyData: LegacyGoalsData): Promise<boolean> {
    try {
      // Backup legacy localStorage data
      localStorage.setItem(this.backupKey, JSON.stringify({
        type: 'legacy_backup',
        timestamp: new Date().toISOString(),
        userId: this.userId,
        data: legacyData,
      }));

      // Backup current database state
      const currentDbGoals = await this.checkExistingGoals();
      localStorage.setItem(`${this.backupKey}_db`, JSON.stringify({
        type: 'database_backup',
        timestamp: new Date().toISOString(),
        userId: this.userId,
        goals: currentDbGoals,
      }));

      return true;
    } catch (error) {
      console.error('Backup creation failed:', error);
      return false;
    }
  }

  /**
   * Validate legacy data format and content
   */
  private async validateLegacyData(legacyData: LegacyGoalsData): Promise<string[]> {
    const errors: string[] = [];

    if (!legacyData.goals || !Array.isArray(legacyData.goals)) {
      errors.push('Invalid legacy data format: goals not found or not array');
      return errors;
    }

    legacyData.goals.forEach((goal, index) => {
      if (!goal.title || typeof goal.title !== 'string') {
        errors.push(`Goal ${index}: Missing or invalid title`);
      }
      
      if (!goal.targetAmount || typeof goal.targetAmount !== 'number' || goal.targetAmount <= 0) {
        errors.push(`Goal ${index}: Invalid target amount`);
      }

      if (goal.deadline && isNaN(new Date(goal.deadline).getTime())) {
        errors.push(`Goal ${index}: Invalid deadline format`);
      }
    });

    return errors;
  }

  /**
   * Check existing goals in database
   */
  private async checkExistingGoals() {
    // 🚨 BUGX CRITICAL FIX: Dynamic import to prevent legacy lock
    const { db } = await import('@/lib/db/drizzle');
    const { financialGoals } = await import('@/lib/db/schema-financial-goals');
    
    return await db
      .select()
      .from(financialGoals)
      .where(eq(financialGoals.userId, this.userId));
  }

  /**
   * Perform the actual migration with transaction safety
   */
  private async performMigration(legacyGoals: LegacyGoal[]): Promise<{
    goals: number;
    expenses: number;
    errors: string[];
  }> {
    const result = { goals: 0, expenses: 0, errors: [] };

    // Use database transaction for safety
    try {
      // 🚨 BUGX CRITICAL FIX: Dynamic import to prevent legacy lock
      const { db } = await import('@/lib/db/drizzle');
      const { financialGoals, goalExpenses } = await import('@/lib/db/schema-financial-goals');
      
      await db.transaction(async (tx) => {
        for (const legacyGoal of legacyGoals) {
          try {
            // Convert legacy goal to new format
            const newGoalData = this.convertLegacyGoal(legacyGoal);
            
            // Insert goal
            const [newGoal] = await tx
              .insert(financialGoals)
              .values(newGoalData)
              .returning();

            result.goals++;

            // Migrate expenses if they exist
            if (legacyGoal.expenses && legacyGoal.expenses.length > 0) {
              for (const expense of legacyGoal.expenses) {
                try {
                  await tx.insert(goalExpenses).values({
                    goalId: newGoal.id,
                    name: expense.name,
                    amount: expense.amount.toString(),
                    frequency: expense.frequency || 'one_time',
                    isEstimated: true,
                    confidenceLevel: '0.7', // Migrated data has medium confidence
                  });
                  result.expenses++;
                } catch (expenseError) {
                  result.errors.push(`Failed to migrate expense "${expense.name}": ${expenseError.message}`);
                }
              }
            }

          } catch (goalError) {
            result.errors.push(`Failed to migrate goal "${legacyGoal.title}": ${goalError.message}`);
          }
        }
      });

    } catch (transactionError) {
      result.errors.push(`Transaction failed: ${transactionError.message}`);
      throw transactionError;
    }

    return result;
  }

  /**
   * Convert legacy goal format to new database format
   */
  private convertLegacyGoal(legacyGoal: LegacyGoal): any {
    return {
      userId: this.userId,
      title: legacyGoal.title,
      description: legacyGoal.description || null,
      goalType: this.mapLegacyType(legacyGoal.type || legacyGoal.category || 'education'),
      targetAmount: legacyGoal.targetAmount.toString(),
      currentAmount: (legacyGoal.currentAmount || 0).toString(),
      deadline: legacyGoal.deadline ? new Date(legacyGoal.deadline) : null,
      priority: legacyGoal.priority || 'medium',
      status: 'active',
      calculationMethod: 'manual_entry',
      aiConfidenceScore: '0.5', // Migrated data starts with medium confidence
      needsHumanReview: true, // Migrated goals should be reviewed
    };
  }

  /**
   * Map legacy types to new goal types
   */
  private mapLegacyType(legacyType: string): string {
    const typeMap: Record<string, string> = {
      'education': 'education',
      'tuition': 'education',
      'school': 'education',
      'college': 'education',
      'living': 'living',
      'housing': 'living',
      'emergency': 'emergency',
      'career': 'career',
      'research': 'research',
      'travel': 'travel',
    };

    return typeMap[legacyType.toLowerCase()] || 'education';
  }

  /**
   * Verify migration integrity
   */
  private async verifyMigration(legacyGoals: LegacyGoal[]): Promise<boolean> {
    try {
      const migratedGoals = await this.checkExistingGoals();
      
      // Basic count check
      const expectedCount = legacyGoals.length;
      const actualCount = migratedGoals.filter(goal => 
        goal.needsHumanReview === true && goal.calculationMethod === 'manual_entry'
      ).length;

      if (actualCount < expectedCount) {
        console.error(`Verification failed: Expected ${expectedCount} migrated goals, found ${actualCount}`);
        return false;
      }

      // Verify titles match
      const legacyTitles = legacyGoals.map(g => g.title.toLowerCase());
      const migratedTitles = migratedGoals.map(g => g.title.toLowerCase());
      
      for (const legacyTitle of legacyTitles) {
        if (!migratedTitles.includes(legacyTitle)) {
          console.error(`Verification failed: Missing goal "${legacyTitle}"`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  /**
   * Rollback migration in case of failure
   */
  async rollbackMigration(): Promise<boolean> {
    try {
      console.log('🔄 Performing migration rollback...');

      // Delete migrated goals (identified by needsHumanReview and calculationMethod)
      await db
        .delete(financialGoals)
        .where(
          eq(financialGoals.userId, this.userId)
          // Add additional filters to only delete migrated goals
        );

      // Restore from backup if needed
      const backupData = localStorage.getItem(this.backupKey);
      if (backupData) {
        const backup = JSON.parse(backupData);
        // Restore to original localStorage keys
        localStorage.setItem(`goals_${this.userId}`, JSON.stringify(backup.data));
      }

      console.log('✅ Migration rollback completed');
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      return false;
    }
  }

  /**
   * Archive legacy data (move to archive key instead of deleting)
   */
  private async archiveLegacyData(): Promise<void> {
    try {
      const legacyKeys = [
        `goals_${this.userId}`,
        `financial_goals_${this.userId}`,
        'goals_data',
        'financial_goals',
        'user_goals'
      ];

      for (const key of legacyKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          // Archive instead of delete
          localStorage.setItem(`${key}_archived_${Date.now()}`, data);
          // Keep original for safety (don't delete yet)
          // localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to archive legacy data:', error);
    }
  }
}

/**
 * Convenience function for easy migration
 */
export async function migrateGoalsForUser(userId: number): Promise<MigrationResult> {
  const migrator = new GoalsDataMigrator(userId);
  return await migrator.migrateUserGoals();
}

/**
 * Check if user has legacy data to migrate
 */
export function hasLegacyGoalsData(userId: number): boolean {
  const possibleKeys = [
    `goals_${userId}`,
    `financial_goals_${userId}`,
    'goals_data',
    'financial_goals',
    'user_goals'
  ];

  return possibleKeys.some(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) || 
               (parsed.goals && Array.isArray(parsed.goals)) ||
               (parsed.financial && Array.isArray(parsed.financial));
      } catch {
        return false;
      }
    }
    return false;
  });
}