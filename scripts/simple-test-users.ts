import { db } from '@/lib/db/drizzle';
import { users, scholarships, applications, financialGoals } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

/**
 * Simple Test Users Creation Script
 * Creates 3 test users without clearing existing data first
 */

async function createTestUsers() {
  console.log("🚀 Creating test users...");
  
  try {
    // First, delete existing test users if they exist
    console.log("🧹 Cleaning up existing test users...");
    await db.delete(users).where(eq(users.email, 'user1@stp.com'));
    await db.delete(users).where(eq(users.email, 'user2@stp.com'));
    await db.delete(users).where(eq(users.email, 'user3@stp.com'));
    
    const testUsersData = [
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
        state: "Texas"
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
        state: "Colorado"
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
        state: "Oregon"
      }
    ];
    
    const createdUsers = [];
    
    for (const userData of testUsersData) {
      console.log(`Creating user: ${userData.name} (${userData.email})`);
      
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
        country: "United States",
        isActive: true,
        emailVerified: true,
      }).returning();
      
      console.log(`✅ Created: ${user.name}`);
      createdUsers.push(user);
    }
    
    console.log("\\n🎓 Creating sample scholarships for each user...");
    
    const scholarshipTemplates = [
      {
        title: "Academic Excellence Scholarship",
        provider: "University Foundation",
        amount: "5000.00",
        description: "Merit-based scholarship for outstanding academic achievement",
        eligibilityRequirements: "Minimum 3.5 GPA, full-time enrollment"
      },
      {
        title: "STEM Innovation Grant", 
        provider: "Tech Education Foundation",
        amount: "7500.00",
        description: "Supporting future STEM leaders",
        eligibilityRequirements: "STEM major, minimum 3.0 GPA"
      },
      {
        title: "Community Leadership Award",
        provider: "Civic Foundation", 
        amount: "3000.00",
        description: "Recognizing community service and leadership",
        eligibilityRequirements: "Demonstrated community service, leadership experience"
      },
      {
        title: "First Generation College Grant",
        provider: "Educational Opportunity Fund",
        amount: "4000.00", 
        description: "Supporting first-generation college students",
        eligibilityRequirements: "First generation college student, financial need"
      },
      {
        title: "Business Innovation Scholarship",
        provider: "Entrepreneurship Institute",
        amount: "6000.00",
        description: "For future business leaders and entrepreneurs", 
        eligibilityRequirements: "Business major, minimum 3.2 GPA"
      },
      {
        title: "Environmental Sustainability Grant",
        provider: "Green Future Foundation",
        amount: "5500.00",
        description: "Supporting environmental science students",
        eligibilityRequirements: "Environmental focus, sustainability project"
      }
    ];
    
    // Create 6-8 scholarships per user
    for (let userIndex = 0; userIndex < createdUsers.length; userIndex++) {
      const user = createdUsers[userIndex];
      const numScholarships = 6 + Math.floor(Math.random() * 3); // 6-8 scholarships
      
      console.log(`  Creating ${numScholarships} scholarships for ${user.name}...`);
      
      for (let i = 0; i < numScholarships; i++) {
        const template = scholarshipTemplates[i % scholarshipTemplates.length];
        
        // Add variation to amounts
        const baseAmount = parseFloat(template.amount);
        const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
        const adjustedAmount = (baseAmount * (1 + variation)).toFixed(2);
        
        // Random deadline 1-8 months from now
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 1 + Math.floor(Math.random() * 7));
        
        const [scholarship] = await db.insert(scholarships).values({
          title: `${template.title} ${userIndex + 1}-${i + 1}`,
          description: template.description,
          amount: adjustedAmount,
          provider: template.provider,
          providerWebsite: `https://${template.provider.toLowerCase().replace(/\\s+/g, '')}.org`,
          eligibilityRequirements: template.eligibilityRequirements,
          applicationDeadline: deadline,
          awardDate: new Date(deadline.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days after deadline
          educationLevel: user.educationLevel,
          fieldOfStudy: user.major?.includes('Computer') ? 'Computer Science' : 
                       user.major?.includes('Environmental') ? 'Environmental Science' :
                       user.major?.includes('Business') ? 'Business' : 'Any',
          gpaRequirement: "3.00",
          residencyRequirements: "US enrollment required",
          status: 'active',
          isRenewable: Math.random() > 0.6, // 40% renewable
          applicationInstructions: "Complete online application and submit required documents",
          contactEmail: `contact@${template.provider.toLowerCase().replace(/\\s+/g, '')}.org`,
          tags: JSON.stringify(['merit-based', 'general']),
          createdBy: user.id
        }).returning();
        
        // Create some applications in different statuses
        if (Math.random() > 0.3) { // 70% chance of application
          const statuses = ['draft', 'submitted', 'under_review', 'accepted', 'rejected'] as const;
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          let submittedAt = null;
          let awardAmount = null;
          
          if (status !== 'draft') {
            submittedAt = new Date();
            submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 30));
            
            if (status === 'accepted') {
              awardAmount = (parseFloat(scholarship.amount) * (0.5 + Math.random() * 0.5)).toFixed(2);
            }
          }
          
          await db.insert(applications).values({
            userId: user.id,
            scholarshipId: scholarship.id,
            status,
            submittedAt,
            awardAmount,
            notes: status === 'accepted' ? 'Congratulations!' : 
                   status === 'rejected' ? 'Thank you for applying' : null,
            applicationData: JSON.stringify({
              personalStatement: "This scholarship would help achieve my educational goals.",
              gpa: user.gpa
            })
          });
        }
      }
    }
    
    console.log("\\n💰 Creating sample financial goals...");
    
    const goalTemplates = [
      { title: "Undergraduate Tuition", amount: "25000.00", type: "education" },
      { title: "Textbooks and Supplies", amount: "1500.00", type: "education" },
      { title: "Housing and Meals", amount: "12000.00", type: "living" },
      { title: "Emergency Fund", amount: "3000.00", type: "emergency" },
      { title: "Study Abroad Program", amount: "8000.00", type: "travel" }
    ];
    
    for (const user of createdUsers) {
      console.log(`  Creating financial goals for ${user.name}...`);
      
      // Each user gets 3-5 goals
      const numGoals = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numGoals; i++) {
        const template = goalTemplates[i % goalTemplates.length];
        
        // Add variation to amounts
        const baseAmount = parseFloat(template.amount);
        const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
        const targetAmount = Math.max(500, baseAmount * (1 + variation)).toFixed(2);
        
        // Random progress (0-50% complete)
        const progressPercent = Math.random() * 0.5;
        const currentAmount = (parseFloat(targetAmount) * progressPercent).toFixed(2);
        
        // Deadline 6-18 months from now
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 6 + Math.floor(Math.random() * 12));
        
        await db.insert(financialGoals).values({
          userId: user.id,
          title: `${template.title} - ${user.name}`,
          description: `Financial goal for ${template.title.toLowerCase()} expenses`,
          goalType: template.type as any,
          targetAmount,
          currentAmount,
          deadline,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: 'active',
          educationLevel: user.educationLevel,
          targetState: user.state,
          targetCountry: 'United States',
          createdViaTemplate: 'test_data',
          calculationMethod: 'manual_entry'
        });
      }
    }
    
    console.log("\\n🎉 Test data creation completed successfully!");
    console.log("\\n📊 Summary:");
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`🎓 Scholarships: ~6-8 per user`);
    console.log(`📝 Applications: ~70% coverage with mixed statuses`);
    console.log(`💰 Financial goals: ~3-5 per user`);
    console.log("\\n🔑 Login Credentials:");
    console.log("  user1@stp.com / password123 (Alex Chen - CS Undergrad)");
    console.log("  user2@stp.com / password123 (Maria Rodriguez - Env Eng Graduate)");
    console.log("  user3@stp.com / password123 (Jordan Williams - Business Undergrad)");
    
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    throw error;
  }
}

createTestUsers().catch(console.error);