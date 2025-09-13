import { NextRequest, NextResponse } from 'next/server';
// BugX: Dynamic imports to prevent build-time database issues
// import { getUser } from '@/lib/db/queries';
// import { GoalsDataMigrator } from '@/lib/data-migration/migrate-goals';

export async function POST(request: NextRequest) {
  try {
    // BugX: Environment check
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { error: 'Database not configured in this environment' },
        { status: 503 }
      );
    }
    
    // BugX: Dynamic imports
    const { getUser } = await import('@/lib/db/queries');
    const { GoalsDataMigrator } = await import('@/lib/data-migration/migrate-goals');
    
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId } = body;

    // Verify user owns the data
    if (user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Perform migration
    console.log(`🔄 Starting goals migration for user ${userId}`);
    const migrator = new GoalsDataMigrator(userId);
    const result = await migrator.migrateUserGoals();

    // Return success/failure
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Migration completed: ${result.migratedGoals} goals, ${result.migratedExpenses} expenses`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.errors.join(', ')
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Migration API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        message: `Migration failed: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}