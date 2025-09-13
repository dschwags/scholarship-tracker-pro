import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { financialGoals, goalExpenses, goalFundingSources } from '@/lib/db/schema-financial-goals';
import { eq, or } from 'drizzle-orm';

export async function POST() {
  try {
    console.log('🎯 Starting financial goals population...');

    // Get all test users
    const testUsers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, 'user1@stp.com'),
          eq(users.email, 'user2@stp.com'),
          eq(users.email, 'user3@stp.com')
        )
      );

    console.log(`Found ${testUsers.length} test users`);

    if (testUsers.length === 0) {
      return NextResponse.json({ error: 'No test users found' }, { status: 404 });
    }

    const results = [];

    for (const user of testUsers) {
      console.log(`💰 Processing ${user.email}...`);
      
      // Clear existing financial goals for this user first
      await db.delete(financialGoals).where(eq(financialGoals.userId, user.id));
      
      const userGoals = getUserSpecificGoals(user.email);
      
      for (const goalData of userGoals) {
        // Create the main financial goal
        const [createdGoal] = await db
          .insert(financialGoals)
          .values({
            userId: user.id,
            title: goalData.title,
            description: goalData.description,
            goalType: goalData.goalType as any,
            targetAmount: goalData.targetAmount,
            currentAmount: goalData.currentAmount,
            deadline: goalData.deadline,
            priority: goalData.priority as any,
            status: 'active',
            
            // Academic context
            educationLevel: goalData.educationLevel,
            schoolType: goalData.schoolType as any,
            programType: goalData.programType,
            creditHoursPerTerm: goalData.creditHoursPerTerm,
            termsPerYear: goalData.termsPerYear,
            programDurationYears: goalData.programDurationYears,
            
            // Geographic context
            targetState: goalData.targetState,
            targetCountry: 'United States',
            residencyStatus: goalData.residencyStatus as any,
            
            // Financial aid context
            estimatedEFC: goalData.estimatedEFC,
            pellEligible: goalData.pellEligible,
            stateAidEligible: goalData.stateAidEligible,
            familyIncomeRange: goalData.familyIncomeRange,
            
            // Timeline
            plannedStartDate: goalData.plannedStartDate,
            plannedEndDate: goalData.plannedEndDate,
            academicYear: goalData.academicYear,
            
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();

        console.log(`   ✅ Created goal: ${goalData.title}`);

        // Add detailed expenses
        if (goalData.expenses) {
          for (const expense of goalData.expenses) {
            await db.insert(goalExpenses).values({
              goalId: createdGoal.id,
              name: expense.name,
              amount: expense.amount,
              isEstimated: expense.isEstimated,
              frequency: expense.frequency,
              creditHours: 'creditHours' in expense ? expense.creditHours : null,
              locationDependent: expense.locationDependent,
              confidenceLevel: 'confidenceLevel' in expense ? expense.confidenceLevel : '0.8',
              dataSource: 'dataSource' in expense ? expense.dataSource : 'test_data',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          console.log(`   💡 Added ${goalData.expenses.length} expenses`);
        }

        // Add funding sources
        if (goalData.fundingSources) {
          for (const source of goalData.fundingSources) {
            await db.insert(goalFundingSources).values({
              goalId: createdGoal.id,
              sourceName: source.sourceName,
              sourceType: source.sourceType,
              amount: source.amount,
              probabilityPercentage: source.probabilityPercentage,
              deadline: source.deadline,
              renewable: source.renewable,
              applicationStatus: source.applicationStatus,
              confirmedAmount: source.confirmedAmount || '0',
              confidenceScore: source.confidenceScore || '0.7',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          console.log(`   🎓 Added ${goalData.fundingSources.length} funding sources`);
        }

        results.push({
          user: user.email,
          goal: goalData.title,
          amount: goalData.targetAmount,
          expenses: goalData.expenses?.length || 0,
          fundingSources: goalData.fundingSources?.length || 0
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Financial goals populated successfully',
      results
    });

  } catch (error) {
    console.error('❌ Error populating financial goals:', error);
    return NextResponse.json(
      { error: 'Failed to populate financial goals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getUserSpecificGoals(email: string) {
  const baseDate = new Date();
  const nextYear = new Date(baseDate.getFullYear() + 1, 8, 15);
  const graduationDate = new Date(baseDate.getFullYear() + 4, 5, 15);

  switch (email) {
    case 'user1@stp.com':
      return [
        {
          title: 'Bachelor\'s Degree in Computer Science',
          description: 'Complete undergraduate degree in Computer Science with focus on AI and machine learning',
          goalType: 'education',
          targetAmount: '85000.00',
          currentAmount: '12500.00',
          deadline: graduationDate,
          priority: 'high',
          
          educationLevel: 'undergraduate',
          schoolType: 'public_university',
          programType: 'Computer Science',
          creditHoursPerTerm: 15,
          termsPerYear: 2,
          programDurationYears: '4.0',
          
          targetState: 'California',
          residencyStatus: 'in_state',
          
          estimatedEFC: 8500,
          pellEligible: true,
          stateAidEligible: true,
          familyIncomeRange: '$40,000-$60,000',
          
          plannedStartDate: '2024-08-15',
          plannedEndDate: '2028-05-15',
          academicYear: '2024-2025',
          
          expenses: [
            { name: 'Tuition (In-State)', amount: '14000.00', isEstimated: true, frequency: 'annual', creditHours: 30, locationDependent: true },
            { name: 'Room & Board', amount: '16000.00', isEstimated: true, frequency: 'annual', locationDependent: true },
            { name: 'Books & Technology', amount: '2500.00', isEstimated: true, frequency: 'annual', locationDependent: false },
            { name: 'Transportation', amount: '1800.00', isEstimated: true, frequency: 'annual', locationDependent: true },
            { name: 'Personal Expenses', amount: '3200.00', isEstimated: true, frequency: 'annual', locationDependent: false }
          ],
          
          fundingSources: [
            { sourceName: 'Pell Grant', sourceType: 'federal_grant', amount: '7000.00', probabilityPercentage: 95, renewable: true, applicationStatus: 'approved', confirmedAmount: '7000.00' },
            { sourceName: 'Cal Grant A', sourceType: 'state_grant', amount: '12500.00', probabilityPercentage: 90, renewable: true, applicationStatus: 'pending' },
            { sourceName: 'Part-time Work Study', sourceType: 'work_study', amount: '6000.00', probabilityPercentage: 80, renewable: true, applicationStatus: 'not_applied' },
            { sourceName: 'Family Contribution', sourceType: 'family', amount: '8500.00', probabilityPercentage: 100, renewable: true, applicationStatus: 'confirmed', confirmedAmount: '8500.00' }
          ]
        },
        {
          title: 'Study Abroad Program - Japan',
          description: 'Semester exchange program in Tokyo focusing on AI research',
          goalType: 'education',
          targetAmount: '18000.00',
          currentAmount: '3500.00',
          deadline: new Date(baseDate.getFullYear() + 2, 8, 1),
          priority: 'medium',
          
          educationLevel: 'undergraduate',
          schoolType: 'international_exchange',
          programType: 'Study Abroad',
          creditHoursPerTerm: 12,
          termsPerYear: 1,
          programDurationYears: '0.5',
          
          targetState: 'International',
          targetCountry: 'Japan',
          residencyStatus: 'international',
          
          estimatedEFC: 8500,
          pellEligible: false,
          stateAidEligible: false,
          familyIncomeRange: '$40,000-$60,000',
          
          plannedStartDate: '2026-01-15',
          plannedEndDate: '2026-06-15',
          academicYear: '2025-2026',
          
          expenses: [
            { name: 'Program Fees', amount: '8500.00', isEstimated: true, frequency: 'one_time', locationDependent: false },
            { name: 'Airfare', amount: '1800.00', isEstimated: true, frequency: 'one_time', locationDependent: true },
            { name: 'Housing in Tokyo', amount: '5200.00', isEstimated: true, frequency: 'one_time', locationDependent: true },
            { name: 'Living Expenses', amount: '2500.00', isEstimated: true, frequency: 'one_time', locationDependent: true }
          ],
          
          fundingSources: [
            { sourceName: 'Study Abroad Scholarship', sourceType: 'scholarship', amount: '5000.00', probabilityPercentage: 60, renewable: false, applicationStatus: 'not_applied' },
            { sourceName: 'Family Support', sourceType: 'family', amount: '8000.00', probabilityPercentage: 85, renewable: false, applicationStatus: 'discussed' },
            { sourceName: 'Personal Savings', sourceType: 'savings', amount: '5000.00', probabilityPercentage: 100, renewable: false, applicationStatus: 'confirmed', confirmedAmount: '3500.00' }
          ]
        }
      ];

    case 'user2@stp.com':
      return [
        {
          title: 'Master\'s Degree in Data Science',
          description: 'Graduate degree in Data Science with specialization in healthcare analytics',
          goalType: 'education',
          targetAmount: '72000.00',
          currentAmount: '18000.00',
          deadline: new Date(baseDate.getFullYear() + 2, 5, 15),
          priority: 'high',
          
          educationLevel: 'graduate',
          schoolType: 'private_university',
          programType: 'Data Science',
          creditHoursPerTerm: 12,
          termsPerYear: 2,
          programDurationYears: '2.0',
          
          targetState: 'New York',
          residencyStatus: 'out_of_state',
          
          estimatedEFC: 25000,
          pellEligible: false,
          stateAidEligible: false,
          familyIncomeRange: '$80,000-$100,000',
          
          plannedStartDate: '2024-08-20',
          plannedEndDate: '2026-05-15',
          academicYear: '2024-2025',
          
          expenses: [
            { name: 'Graduate Tuition', amount: '28000.00', isEstimated: true, frequency: 'annual', creditHours: 24, locationDependent: false },
            { name: 'NYC Housing', amount: '20000.00', isEstimated: true, frequency: 'annual', locationDependent: true },
            { name: 'Research Materials & Software', amount: '1500.00', isEstimated: true, frequency: 'annual', locationDependent: false },
            { name: 'Transportation (Subway)', amount: '1400.00', isEstimated: true, frequency: 'annual', locationDependent: true },
            { name: 'Conference & Networking', amount: '3100.00', isEstimated: true, frequency: 'annual', locationDependent: false }
          ],
          
          fundingSources: [
            { sourceName: 'Graduate Research Assistantship', sourceType: 'assistantship', amount: '18000.00', probabilityPercentage: 75, renewable: true, applicationStatus: 'pending' },
            { sourceName: 'Healthcare Analytics Fellowship', sourceType: 'fellowship', amount: '15000.00', probabilityPercentage: 40, renewable: true, applicationStatus: 'applied' },
            { sourceName: 'Graduate Student Loans', sourceType: 'federal_loan', amount: '25000.00', probabilityPercentage: 95, renewable: true, applicationStatus: 'approved' },
            { sourceName: 'Family Contribution', sourceType: 'family', amount: '14000.00', probabilityPercentage: 100, renewable: true, applicationStatus: 'confirmed', confirmedAmount: '14000.00' }
          ]
        },
        {
          title: 'Professional Development Fund',
          description: 'Certifications, conferences, and skill development for career advancement',
          goalType: 'career_development',
          targetAmount: '8500.00',
          currentAmount: '2200.00',
          deadline: new Date(baseDate.getFullYear() + 1, 12, 31),
          priority: 'medium',
          
          educationLevel: 'professional',
          schoolType: 'online_certification',
          programType: 'Professional Development',
          creditHoursPerTerm: 0,
          termsPerYear: 1,
          programDurationYears: '1.0',
          
          targetState: 'New York',
          residencyStatus: 'resident',
          
          estimatedEFC: 25000,
          pellEligible: false,
          stateAidEligible: false,
          familyIncomeRange: '$80,000-$100,000',
          
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2024-12-31',
          academicYear: '2024',
          
          expenses: [
            { name: 'AWS Certification Path', amount: '2500.00', isEstimated: true, frequency: 'one_time', locationDependent: false },
            { name: 'Python for Data Science Bootcamp', amount: '1800.00', isEstimated: true, frequency: 'one_time', locationDependent: false },
            { name: 'PyData Conference NYC', amount: '1200.00', isEstimated: true, frequency: 'annual', locationDependent: true },
            { name: 'O\'Reilly Learning Platform', amount: '600.00', isEstimated: true, frequency: 'annual', locationDependent: false },
            { name: 'Networking Events & Meetups', amount: '800.00', isEstimated: true, frequency: 'annual', locationDependent: true }
          ],
          
          fundingSources: [
            { sourceName: 'Employer Professional Development Fund', sourceType: 'employer', amount: '3000.00', probabilityPercentage: 80, renewable: true, applicationStatus: 'discussed' },
            { sourceName: 'Personal Investment', sourceType: 'savings', amount: '5500.00', probabilityPercentage: 100, renewable: false, applicationStatus: 'confirmed', confirmedAmount: '2200.00' }
          ]
        }
      ];

    case 'user3@stp.com':
      return [
        {
          title: 'Community College Transfer Program',
          description: 'Complete associate degree and transfer to 4-year university for engineering',
          goalType: 'education',
          targetAmount: '35000.00',
          currentAmount: '8500.00',
          deadline: new Date(baseDate.getFullYear() + 3, 5, 15),
          priority: 'high',
          
          educationLevel: 'undergraduate',
          schoolType: 'community_college',
          programType: 'Engineering Transfer',
          creditHoursPerTerm: 14,
          termsPerYear: 2,
          programDurationYears: '3.0',
          
          targetState: 'Texas',
          residencyStatus: 'in_state',
          
          estimatedEFC: 3500,
          pellEligible: true,
          stateAidEligible: true,
          familyIncomeRange: '$25,000-$40,000',
          
          plannedStartDate: '2024-08-26',
          plannedEndDate: '2027-05-15',
          academicYear: '2024-2025',
          
          expenses: [
            { name: 'Community College Tuition', amount: '4200.00', isEstimated: true, frequency: 'annual', creditHours: 28, locationDependent: true },
            { name: 'University Transfer Tuition (2 years)', amount: '22000.00', isEstimated: true, frequency: 'one_time', creditHours: 56, locationDependent: true },
            { name: 'Books & Engineering Supplies', amount: '3500.00', isEstimated: true, frequency: 'annual', locationDependent: false },
            { name: 'Transportation (Commuter)', amount: '2400.00', isEstimated: true, frequency: 'annual', locationDependent: true },
            { name: 'Lab Fees & Equipment', amount: '1800.00', isEstimated: true, frequency: 'annual', locationDependent: false }
          ],
          
          fundingSources: [
            { sourceName: 'Maximum Pell Grant', sourceType: 'federal_grant', amount: '7400.00', probabilityPercentage: 100, renewable: true, applicationStatus: 'approved', confirmedAmount: '7400.00' },
            { sourceName: 'Texas Grant Program', sourceType: 'state_grant', amount: '4500.00', probabilityPercentage: 85, renewable: true, applicationStatus: 'pending' },
            { sourceName: 'Work Study Program', sourceType: 'work_study', amount: '4500.00', probabilityPercentage: 90, renewable: true, applicationStatus: 'approved', confirmedAmount: '1500.00' },
            { sourceName: 'Family Savings', sourceType: 'family', amount: '3500.00', probabilityPercentage: 100, renewable: false, applicationStatus: 'confirmed', confirmedAmount: '3500.00' },
            { sourceName: 'Engineering Scholarship', sourceType: 'scholarship', amount: '8000.00', probabilityPercentage: 45, renewable: true, applicationStatus: 'applied' }
          ]
        },
        {
          title: 'Emergency Fund for Education',
          description: 'Safety net for unexpected educational expenses and living costs',
          goalType: 'emergency_fund',
          targetAmount: '12000.00',
          currentAmount: '4200.00',
          deadline: new Date(baseDate.getFullYear() + 1, 6, 1),
          priority: 'high',
          
          educationLevel: 'undergraduate',
          schoolType: 'community_college',
          programType: 'Financial Security',
          creditHoursPerTerm: 0,
          termsPerYear: 1,
          programDurationYears: '1.0',
          
          targetState: 'Texas',
          residencyStatus: 'in_state',
          
          estimatedEFC: 3500,
          pellEligible: true,
          stateAidEligible: true,
          familyIncomeRange: '$25,000-$40,000',
          
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2025-06-01',
          academicYear: '2024-2025',
          
          expenses: [
            { name: 'Emergency Tuition Coverage', amount: '4000.00', isEstimated: true, frequency: 'emergency', locationDependent: false },
            { name: 'Unexpected Living Expenses', amount: '3500.00', isEstimated: true, frequency: 'emergency', locationDependent: true },
            { name: 'Medical/Health Emergencies', amount: '2500.00', isEstimated: true, frequency: 'emergency', locationDependent: false },
            { name: 'Technology Replacement Fund', amount: '2000.00', isEstimated: true, frequency: 'emergency', locationDependent: false }
          ],
          
          fundingSources: [
            { sourceName: 'Part-time Job Savings', sourceType: 'employment', amount: '6000.00', probabilityPercentance: 85, renewable: true, applicationStatus: 'active', confirmedAmount: '2400.00' },
            { sourceName: 'Tax Refund', sourceType: 'government', amount: '2800.00', probabilityPercentage: 95, renewable: true, applicationStatus: 'expected' },
            { sourceName: 'Family Emergency Support', sourceType: 'family', amount: '3200.00', probabilityPercentage: 70, renewable: false, applicationStatus: 'discussed' }
          ]
        }
      ];

    default:
      return [];
  }
}