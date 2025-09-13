import { db } from '@/lib/db/drizzle';
import { 
  users, 
  scholarships, 
  applications, 
  requirements,
  applicationRequirements,
  userConnections,
  notifications,
  savedScholarships,
  documents
} from '@/lib/db/schema';
import { financialGoals, goalExpenses } from '@/lib/db/schema-financial-goals';
import { hashPassword } from '@/lib/auth/session';

/**
 * Test Data Creation Script
 * 
 * This script will:
 * 1. Delete all existing users and related data
 * 2. Create 3 new test users with specified credentials
 * 3. Generate realistic financial goals for each user
 * 4. Create 6-12 sample scholarships per user
 * 5. Create some applications to show different statuses
 */

// Sample scholarship data templates
const scholarshipTemplates = [
  {
    title: "Academic Excellence Scholarship",
    provider: "University Foundation",
    amount: "5000.00",
    description: "Merit-based scholarship for students with outstanding academic achievement. Recognizes dedication to learning and academic excellence across all disciplines.",
    eligibilityRequirements: "Minimum 3.5 GPA, full-time enrollment, demonstration of leadership or community service",
    fieldOfStudy: "Any",
    gpaRequirement: "3.50",
    tags: ["merit-based", "academic", "general"]
  },
  {
    title: "STEM Innovation Grant",
    provider: "Tech Education Foundation", 
    amount: "7500.00",
    description: "Supporting the next generation of STEM leaders through financial assistance for students pursuing science, technology, engineering, or mathematics degrees.",
    eligibilityRequirements: "STEM major, minimum 3.0 GPA, demonstrated interest in innovation or research",
    fieldOfStudy: "STEM",
    gpaRequirement: "3.00",
    tags: ["STEM", "technology", "innovation"]
  },
  {
    title: "Community Leadership Award",
    provider: "Civic Foundation",
    amount: "3000.00", 
    description: "Recognizing students who have made significant contributions to their communities through volunteer work, leadership roles, or social impact initiatives.",
    eligibilityRequirements: "Demonstrated community service (minimum 100 hours), leadership experience, essay required",
    fieldOfStudy: "Any",
    gpaRequirement: "2.75",
    tags: ["community-service", "leadership", "civic"]
  },
  {
    title: "First Generation College Student Grant",
    provider: "Educational Opportunity Fund",
    amount: "4000.00",
    description: "Supporting first-generation college students in pursuing higher education by providing financial assistance and recognizing their pioneering spirit.",
    eligibilityRequirements: "First generation college student, financial need demonstration, minimum 2.5 GPA",
    fieldOfStudy: "Any",
    gpaRequirement: "2.50", 
    tags: ["first-generation", "need-based", "access"]
  },
  {
    title: "Business Innovation Scholarship",
    provider: "Entrepreneurship Institute",
    amount: "6000.00",
    description: "Fostering the next generation of business leaders and entrepreneurs through financial support for business, economics, and entrepreneurship students.",
    eligibilityRequirements: "Business-related major, business plan or entrepreneurship project, minimum 3.2 GPA",
    fieldOfStudy: "Business",
    gpaRequirement: "3.20",
    tags: ["business", "entrepreneurship", "innovation"]
  },
  {
    title: "Arts and Creativity Grant",
    provider: "Cultural Arts Foundation",
    amount: "2500.00",
    description: "Celebrating creative expression and artistic talent by supporting students pursuing degrees in visual arts, performing arts, music, or creative writing.",
    eligibilityRequirements: "Arts-related major, portfolio submission, creative project or performance",
    fieldOfStudy: "Arts",
    gpaRequirement: "2.75",
    tags: ["arts", "creativity", "cultural"]
  },
  {
    title: "Environmental Sustainability Scholarship",
    provider: "Green Future Foundation",
    amount: "5500.00",
    description: "Supporting students committed to environmental protection and sustainability through education in environmental science, policy, or related fields.",
    eligibilityRequirements: "Environmental focus in studies, sustainability project or volunteer work, minimum 3.0 GPA",
    fieldOfStudy: "Environmental Science",
    gpaRequirement: "3.00",
    tags: ["environmental", "sustainability", "green"]
  },
  {
    title: "Healthcare Heroes Scholarship",
    provider: "Medical Education Alliance",
    amount: "8000.00",
    description: "Recognizing future healthcare professionals who demonstrate compassion, dedication, and commitment to serving others in medical and health-related fields.",
    eligibilityRequirements: "Healthcare-related major, volunteer experience in healthcare setting, minimum 3.3 GPA",
    fieldOfStudy: "Healthcare",
    gpaRequirement: "3.30",
    tags: ["healthcare", "medical", "service"]
  },
  {
    title: "Rural Student Success Grant",
    provider: "Rural Education Initiative",
    amount: "3500.00",
    description: "Supporting students from rural communities in accessing higher education opportunities and pursuing their academic dreams despite geographic challenges.",
    eligibilityRequirements: "Rural background (town under 50,000), financial need, commitment to community service",
    fieldOfStudy: "Any",
    gpaRequirement: "2.50",
    tags: ["rural", "geographic", "access"]
  },
  {
    title: "Technology Innovation Fellowship",
    provider: "Digital Future Institute",
    amount: "10000.00",
    description: "Premier fellowship for outstanding computer science and information technology students pursuing cutting-edge research and development projects.",
    eligibilityRequirements: "Computer Science or IT major, research project or internship, minimum 3.7 GPA, faculty recommendation",
    fieldOfStudy: "Computer Science",
    gpaRequirement: "3.70",
    tags: ["technology", "research", "fellowship", "competitive"]
  },
  {
    title: "Social Justice Advocate Award",
    provider: "Justice and Equity Foundation",
    amount: "4500.00",
    description: "Recognizing students who champion social justice, equity, and human rights through their academic work, activism, or community engagement.",
    eligibilityRequirements: "Demonstrated commitment to social justice, essay on advocacy work, minimum 3.0 GPA",
    fieldOfStudy: "Social Sciences",
    gpaRequirement: "3.00",
    tags: ["social-justice", "advocacy", "equity"]
  },
  {
    title: "International Student Excellence Award",
    provider: "Global Education Consortium",
    amount: "6500.00",
    description: "Supporting international students in their pursuit of American higher education while celebrating the diversity and global perspectives they bring to campus.",
    eligibilityRequirements: "International student status, cultural exchange participation, minimum 3.4 GPA, English proficiency",
    fieldOfStudy: "Any",
    gpaRequirement: "3.40",
    tags: ["international", "diversity", "global"]
  }
];

// Financial goal templates based on different education levels and situations
const financialGoalTemplates = [
  {
    title: "Undergraduate Tuition and Fees",
    description: "Covering tuition, mandatory fees, and academic costs for bachelor's degree program",
    goalType: "education" as const,
    targetAmount: "45000.00",
    educationLevel: "undergraduate",
    createdViaTemplate: "undergraduate_comprehensive"
  },
  {
    title: "On-Campus Housing and Meals",
    description: "Dormitory housing and meal plan costs for full academic year",
    goalType: "living" as const,
    targetAmount: "15000.00",
    educationLevel: "undergraduate", 
    createdViaTemplate: "housing_on_campus"
  },
  {
    title: "Textbooks and Academic Materials",
    description: "Required textbooks, software, lab materials, and academic supplies",
    goalType: "education" as const,
    targetAmount: "1500.00",
    educationLevel: "undergraduate",
    createdViaTemplate: "academic_materials"
  },
  {
    title: "Graduate School Tuition",
    description: "Master's degree program tuition and fees for specialized education",
    goalType: "education" as const,
    targetAmount: "35000.00",
    educationLevel: "graduate",
    createdViaTemplate: "graduate_program"
  },
  {
    title: "Emergency Fund for College",
    description: "Emergency savings for unexpected expenses during college years",
    goalType: "emergency" as const,
    targetAmount: "5000.00",
    educationLevel: "undergraduate",
    createdViaTemplate: "emergency_fund"
  },
  {
    title: "Study Abroad Program",
    description: "International study experience including program fees, travel, and living expenses",
    goalType: "travel" as const,
    targetAmount: "12000.00",
    educationLevel: "undergraduate",
    createdViaTemplate: "study_abroad"
  },
  {
    title: "Professional Development and Internships",
    description: "Career-building activities, unpaid internships, and professional development",
    goalType: "career" as const,
    targetAmount: "3000.00",
    educationLevel: "undergraduate",
    createdViaTemplate: "career_development"
  },
  {
    title: "Research Project Funding",
    description: "Independent research project, conference presentations, and academic publications",
    goalType: "research" as const,
    targetAmount: "2500.00",
    educationLevel: "graduate",
    createdViaTemplate: "research_project"
  }
];

async function clearAllData() {
  console.log("🗑️ Clearing all existing data...");
  
  const { sql } = await import('drizzle-orm');
  
  try {
    // Get all table names
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT LIKE '__drizzle%'
    `);
    
    console.log(`  Found ${tables.length} tables to clear`);
    
    // Truncate all tables with CASCADE to handle foreign keys
    for (const table of tables) {
      const tableName = table.tablename;
      console.log(`  - Clearing table ${tableName}`);
      await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`));
    }
    
    console.log("✅ All existing data cleared");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  }
}

async function createTestUsers() {
  console.log("👥 Creating test users...");
  
  const testUsers = [
    {
      name: "Alex Chen",
      email: "user1@stp.com",
      password: "password123",
      role: "student" as const,
      educationLevel: "undergraduate" as const,
      major: "Computer Science",
      school: "State University",
      gpa: "3.75",
      graduationYear: 2026,
      city: "Austin", 
      state: "Texas",
      country: "United States"
    },
    {
      name: "Maria Rodriguez",
      email: "user2@stp.com", 
      password: "password123",
      role: "student" as const,
      educationLevel: "graduate" as const,
      major: "Environmental Engineering",
      school: "Tech Institute",
      gpa: "3.85",
      graduationYear: 2025,
      city: "Denver",
      state: "Colorado", 
      country: "United States"
    },
    {
      name: "Jordan Williams",
      email: "user3@stp.com",
      password: "password123", 
      role: "student" as const,
      educationLevel: "undergraduate" as const,
      major: "Business Administration",
      school: "Community College",
      gpa: "3.45",
      graduationYear: 2027,
      city: "Portland",
      state: "Oregon",
      country: "United States"
    }
  ];
  
  const createdUsers = [];
  
  for (const userData of testUsers) {
    const passwordHash = await hashPassword(userData.password);
    
    const [user] = await db.insert(users).values({
      name: userData.name,
      email: userData.email,
      passwordHash,
      role: userData.role,
      educationLevel: userData.educationLevel,
      major: userData.major,
      school: userData.school,
      gpa: userData.gpa,
      graduationYear: userData.graduationYear,
      city: userData.city,
      state: userData.state,
      country: userData.country,
      isActive: true,
      emailVerified: true,
    }).returning();
    
    console.log(`✅ Created user: ${user.name} (${user.email})`);
    createdUsers.push(user);
  }
  
  return createdUsers;
}

async function createFinancialGoals(userId: number, userIndex: number) {
  console.log(`💰 Creating financial goals for user ${userId}...`);
  
  // Each user gets different combinations of goals
  const goalCombinations = [
    // User 1: Undergraduate focused
    [0, 1, 2, 4, 6], // Undergrad tuition, housing, books, emergency, career dev
    // User 2: Graduate focused  
    [3, 2, 4, 7, 5], // Grad tuition, books, emergency, research, study abroad
    // User 3: Community college transitioning
    [0, 2, 4, 6, 5]  // Undergrad tuition, books, emergency, career dev, study abroad
  ];
  
  const selectedGoals = goalCombinations[userIndex];
  const createdGoals = [];
  
  for (const goalIndex of selectedGoals) {
    const template = financialGoalTemplates[goalIndex];
    
    // Add some variation to amounts and dates
    const baseAmount = parseFloat(template.targetAmount);
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const adjustedAmount = (baseAmount * (1 + variation)).toFixed(2);
    
    // Random progress (0-60% complete)
    const progressPercent = Math.random() * 0.6;
    const currentAmount = (parseFloat(adjustedAmount) * progressPercent).toFixed(2);
    
    // Deadline 6-24 months from now
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 6 + Math.floor(Math.random() * 18));
    
    const [goal] = await db.insert(financialGoals).values({
      userId,
      title: template.title,
      description: template.description,
      goalType: template.goalType,
      targetAmount: adjustedAmount,
      currentAmount,
      deadline,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      status: 'active',
      educationLevel: template.educationLevel,
      createdViaTemplate: template.createdViaTemplate,
      calculationMethod: 'template_based',
      targetState: ['Texas', 'Colorado', 'Oregon'][userIndex],
      targetCountry: 'United States',
      residencyStatus: 'in_state',
      pellEligible: Math.random() > 0.5,
      stateAidEligible: Math.random() > 0.3,
      familyIncomeRange: ['under_30k', '30k_60k', '60k_100k'][Math.floor(Math.random() * 3)]
    }).returning();
    
    console.log(`  ✅ Created goal: ${goal.title} - $${goal.targetAmount}`);
    createdGoals.push(goal);
  }
  
  return createdGoals;
}

async function createScholarships(users: any[]) {
  console.log("🎓 Creating scholarships...");
  
  const createdScholarships = [];
  
  // Create scholarships for each user (some will be shared)
  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];
    const scholarshipCount = 8 + Math.floor(Math.random() * 5); // 8-12 scholarships per user
    
    console.log(`  Creating ${scholarshipCount} scholarships for ${user.name}...`);
    
    for (let i = 0; i < scholarshipCount; i++) {
      const template = scholarshipTemplates[i % scholarshipTemplates.length];
      
      // Add variation to amounts
      const baseAmount = parseFloat(template.amount);
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const adjustedAmount = Math.max(1000, baseAmount * (1 + variation)).toFixed(2);
      
      // Random deadline 1-12 months from now
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 1 + Math.floor(Math.random() * 11));
      
      // Random award date 1-3 months after deadline
      const awardDate = new Date(deadline);
      awardDate.setMonth(awardDate.getMonth() + 1 + Math.floor(Math.random() * 2));
      
      const [scholarship] = await db.insert(scholarships).values({
        title: `${template.title} ${userIndex + 1}-${i + 1}`,
        description: template.description,
        amount: adjustedAmount,
        provider: template.provider,
        providerWebsite: `https://${template.provider.toLowerCase().replace(/\s+/g, '')}.org`,
        eligibilityRequirements: template.eligibilityRequirements,
        applicationDeadline: deadline,
        awardDate,
        educationLevel: user.educationLevel,
        fieldOfStudy: template.fieldOfStudy,
        gpaRequirement: template.gpaRequirement,
        residencyRequirements: "Must be enrolled in accredited institution within the United States",
        status: 'active',
        isRenewable: Math.random() > 0.7, // 30% chance of renewable
        applicationInstructions: "Complete online application, submit required documents, and write personal statement addressing eligibility criteria.",
        contactEmail: `scholarships@${template.provider.toLowerCase().replace(/\s+/g, '')}.org`,
        tags: JSON.stringify(template.tags),
        createdBy: user.id
      }).returning();
      
      createdScholarships.push({ scholarship, userId: user.id });
    }
  }
  
  console.log(`✅ Created ${createdScholarships.length} total scholarships`);
  return createdScholarships;
}

async function createApplications(scholarships: any[], users: any[]) {
  console.log("📝 Creating scholarship applications...");
  
  const applicationStatuses = ['draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'];
  const createdApplications = [];
  
  for (const user of users) {
    // Each user applies to 60-80% of available scholarships
    const userScholarships = scholarships.filter(s => s.userId === user.id);
    const applicationCount = Math.floor(userScholarships.length * (0.6 + Math.random() * 0.2));
    
    console.log(`  Creating ${applicationCount} applications for ${user.name}...`);
    
    for (let i = 0; i < applicationCount; i++) {
      const { scholarship } = userScholarships[i];
      const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)] as any;
      
      let submittedAt = null;
      let statusUpdatedAt = null;
      let decisionDate = null;
      let awardAmount = null;
      
      if (status !== 'draft') {
        submittedAt = new Date();
        submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 30));
        statusUpdatedAt = new Date(submittedAt);
        statusUpdatedAt.setDate(statusUpdatedAt.getDate() + Math.floor(Math.random() * 14));
        
        if (status === 'accepted') {
          decisionDate = new Date(statusUpdatedAt);
          // Award 50-100% of scholarship amount
          awardAmount = (parseFloat(scholarship.amount) * (0.5 + Math.random() * 0.5)).toFixed(2);
        } else if (status === 'rejected') {
          decisionDate = new Date(statusUpdatedAt);
        }
      }
      
      const [application] = await db.insert(applications).values({
        userId: user.id,
        scholarshipId: scholarship.id,
        status,
        submittedAt,
        statusUpdatedAt,
        decisionDate,
        awardAmount,
        notes: status === 'accepted' ? 'Congratulations! Award notification sent.' : 
               status === 'rejected' ? 'Thank you for your application. Please apply to other opportunities.' :
               status === 'waitlisted' ? 'Currently on waitlist. Will notify if position becomes available.' :
               null,
        applicationData: JSON.stringify({
          personalStatement: "This scholarship would help me achieve my educational goals and make a positive impact in my community.",
          academicAchievements: `Current GPA: ${user.gpa}, Dean's List recognition`,
          communityService: "Volunteer at local community center, tutor students in mathematics",
          careerGoals: `Pursuing career in ${user.major} to contribute to innovative solutions`
        })
      }).returning();
      
      createdApplications.push(application);
    }
  }
  
  console.log(`✅ Created ${createdApplications.length} applications`);
  return createdApplications;
}

async function createSampleRequirements(scholarships: any[]) {
  console.log("📋 Creating scholarship requirements...");
  
  const requirementTypes = [
    { type: 'essay', title: 'Personal Statement', description: 'Write a 500-word essay about your educational goals and how this scholarship will help you achieve them.' },
    { type: 'transcript', title: 'Official Transcript', description: 'Submit official academic transcripts from all institutions attended.' },
    { type: 'recommendation_letter', title: 'Letter of Recommendation', description: 'One letter of recommendation from a teacher, professor, or mentor.' },
    { type: 'financial_document', title: 'FAFSA', description: 'Submit completed FAFSA form demonstrating financial need.' }
  ];
  
  let totalRequirements = 0;
  
  for (const { scholarship } of scholarships.slice(0, 20)) { // Add requirements to first 20 scholarships
    const numRequirements = 2 + Math.floor(Math.random() * 3); // 2-4 requirements per scholarship
    
    for (let i = 0; i < numRequirements; i++) {
      const reqTemplate = requirementTypes[i % requirementTypes.length];
      
      await db.insert(requirements).values({
        scholarshipId: scholarship.id,
        type: reqTemplate.type as any,
        title: reqTemplate.title,
        description: reqTemplate.description,
        isRequired: Math.random() > 0.1, // 90% chance of being required
        wordLimit: reqTemplate.type === 'essay' ? 500 : null,
        order: i
      });
      
      totalRequirements++;
    }
  }
  
  console.log(`✅ Created ${totalRequirements} requirements`);
}

async function main() {
  try {
    console.log("🚀 Starting test data creation process...");
    console.log("=====================================");
    
    // Step 1: Clear all existing data
    await clearAllData();
    
    // Step 2: Create test users
    const testUsers = await createTestUsers();
    
    // Step 3: Create financial goals for each user
    for (let i = 0; i < testUsers.length; i++) {
      await createFinancialGoals(testUsers[i].id, i);
    }
    
    // Step 4: Create scholarships
    const scholarships = await createScholarships(testUsers);
    
    // Step 5: Create applications
    await createApplications(scholarships, testUsers);
    
    // Step 6: Create requirements for some scholarships
    await createSampleRequirements(scholarships);
    
    console.log("=====================================");
    console.log("✅ Test data creation completed successfully!");
    console.log("");
    console.log("📊 Summary:");
    console.log(`👥 Users created: ${testUsers.length}`);
    console.log(`🎓 Scholarships created: ${scholarships.length}`);
    console.log("💰 Financial goals: ~5 per user");
    console.log("📝 Applications: ~60-80% coverage per user");
    console.log("");
    console.log("🔑 Test Login Credentials:");
    console.log("  user1@stp.com / password123 (Alex Chen - CS Undergrad)");
    console.log("  user2@stp.com / password123 (Maria Rodriguez - Env Eng Graduate)");
    console.log("  user3@stp.com / password123 (Jordan Williams - Business Undergrad)");
    console.log("");
    console.log("🌟 Each user has:");
    console.log("  • 5 diverse financial goals with varying progress");
    console.log("  • 8-12 scholarships with realistic amounts and deadlines");
    console.log("  • Multiple applications in different statuses");
    console.log("  • Geographic and demographic diversity");
    
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    throw error;
  }
}

// Run the script
main().catch(console.error);