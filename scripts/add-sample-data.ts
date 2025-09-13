import { db } from '@/lib/db/drizzle';
import { users, scholarships, applications, financialGoals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Add Sample Data to Existing Users
 * 
 * This script adds scholarships and financial goals to existing test users
 * without needing to clear the database first.
 */

async function addSampleDataToUsers() {
  console.log("🎓 Adding sample data to existing users...");
  
  try {
    // Find the test users
    const testUsers = await db
      .select()
      .from(users)
      .where(
        // Check for any of our test emails
        eq(users.email, 'user1@stp.com')
      );
    
    // Also get user2 and user3
    const user2 = await db.select().from(users).where(eq(users.email, 'user2@stp.com'));
    const user3 = await db.select().from(users).where(eq(users.email, 'user3@stp.com'));
    
    const allUsers = [...testUsers, ...user2, ...user3];
    
    if (allUsers.length === 0) {
      console.log("❌ No test users found. Please create them first through the web interface:");
      console.log("   Go to http://localhost:3000/sign-up");
      console.log("   Create: user1@stp.com, user2@stp.com, user3@stp.com");
      return;
    }
    
    console.log(`✅ Found ${allUsers.length} test users`);
    
    // Scholarship templates
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
      },
      {
        title: "Healthcare Heroes Scholarship",
        provider: "Medical Education Alliance",
        amount: "8000.00",
        description: "Recognizing future healthcare professionals",
        eligibilityRequirements: "Healthcare major, volunteer experience"
      },
      {
        title: "Technology Innovation Fellowship",
        provider: "Digital Future Institute",
        amount: "10000.00",
        description: "Premier fellowship for outstanding CS students",
        eligibilityRequirements: "Computer Science major, research project"
      }
    ];
    
    // Financial goal templates
    const goalTemplates = [
      { title: "Undergraduate Tuition", amount: "25000.00", type: "education" },
      { title: "Textbooks and Supplies", amount: "1500.00", type: "education" },
      { title: "Housing and Meals", amount: "12000.00", type: "living" },
      { title: "Emergency Fund", amount: "3000.00", type: "emergency" },
      { title: "Study Abroad Program", amount: "8000.00", type: "travel" },
      { title: "Graduate School Prep", amount: "5000.00", type: "education" },
      { title: "Professional Development", amount: "2000.00", type: "career" }
    ];
    
    let totalScholarships = 0;
    let totalGoals = 0;
    let totalApplications = 0;
    
    // Create data for each user
    for (let userIndex = 0; userIndex < allUsers.length; userIndex++) {
      const user = allUsers[userIndex];
      console.log(`\\n📚 Creating data for ${user.name} (${user.email})...`);
      
      // Create 6-10 scholarships per user
      const numScholarships = 6 + Math.floor(Math.random() * 5);
      console.log(`  Creating ${numScholarships} scholarships...`);
      
      const userScholarships = [];
      
      for (let i = 0; i < numScholarships; i++) {
        const template = scholarshipTemplates[i % scholarshipTemplates.length];
        
        // Add variation to amounts (±20%)
        const baseAmount = parseFloat(template.amount);
        const variation = (Math.random() - 0.5) * 0.4;
        const adjustedAmount = (baseAmount * (1 + variation)).toFixed(2);
        
        // Random deadline 1-10 months from now
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 1 + Math.floor(Math.random() * 9));
        
        const [scholarship] = await db.insert(scholarships).values({
          title: `${template.title} ${userIndex + 1}-${i + 1}`,
          description: template.description,
          amount: adjustedAmount,
          provider: template.provider,
          providerWebsite: `https://${template.provider.toLowerCase().replace(/\\s+/g, '')}.org`,
          eligibilityRequirements: template.eligibilityRequirements,
          applicationDeadline: deadline,
          awardDate: new Date(deadline.getTime() + 30 * 24 * 60 * 60 * 1000),
          educationLevel: user.educationLevel || 'undergraduate',
          fieldOfStudy: user.email.includes('user1') ? 'Computer Science' :
                       user.email.includes('user2') ? 'Environmental Science' :
                       'Business',
          gpaRequirement: "3.00",
          residencyRequirements: "US enrollment required",
          status: 'active',
          isRenewable: Math.random() > 0.6,
          applicationInstructions: "Complete online application and submit required documents",
          contactEmail: `contact@${template.provider.toLowerCase().replace(/\\s+/g, '')}.org`,
          tags: JSON.stringify(['merit-based', 'test-data']),
          createdBy: user.id
        }).returning();
        
        userScholarships.push(scholarship);
        totalScholarships++;
        
        // Create applications for 60-80% of scholarships
        if (Math.random() > 0.25) {
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
            notes: status === 'accepted' ? '🎉 Congratulations! Award notification sent.' :
                   status === 'rejected' ? '📋 Thank you for your application. Please consider other opportunities.' :
                   status === 'under_review' ? '🔍 Application currently under review by selection committee.' :
                   null,
            applicationData: JSON.stringify({
              personalStatement: `This scholarship aligns perfectly with my educational goals in ${user.email.includes('user1') ? 'Computer Science' : user.email.includes('user2') ? 'Environmental Engineering' : 'Business Administration'}. I am committed to academic excellence and making a positive impact in my field.`,
              academicAchievements: `Current GPA: ${(3.0 + Math.random() * 1.0).toFixed(2)}, Honor Roll recognition`,
              communityService: "Active volunteer at local community center, peer tutoring program participant",
              careerGoals: `Pursuing a career in ${user.email.includes('user1') ? 'software development and technology innovation' : user.email.includes('user2') ? 'environmental sustainability and green technology' : 'business leadership and entrepreneurship'}`
            })
          });
          
          totalApplications++;
        }
      }
      
      // Create 3-6 financial goals per user
      const numGoals = 3 + Math.floor(Math.random() * 4);
      console.log(`  Creating ${numGoals} financial goals...`);
      
      for (let i = 0; i < numGoals; i++) {
        const template = goalTemplates[i % goalTemplates.length];
        
        // Add variation to amounts (±30%)
        const baseAmount = parseFloat(template.amount);
        const variation = (Math.random() - 0.5) * 0.6;
        const targetAmount = Math.max(500, baseAmount * (1 + variation)).toFixed(2);
        
        // Random progress (0-60% complete)
        const progressPercent = Math.random() * 0.6;
        const currentAmount = (parseFloat(targetAmount) * progressPercent).toFixed(2);
        
        // Deadline 6-24 months from now
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 6 + Math.floor(Math.random() * 18));
        
        await db.insert(financialGoals).values({
          userId: user.id,
          title: `${template.title} - ${user.name}`,
          description: `Financial planning for ${template.title.toLowerCase()} to support educational journey`,
          goalType: template.type as any,
          targetAmount,
          currentAmount,
          deadline,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: 'active',
          educationLevel: user.educationLevel,
          targetState: user.email.includes('user1') ? 'Texas' :
                      user.email.includes('user2') ? 'Colorado' : 'Oregon',
          targetCountry: 'United States',
          createdViaTemplate: 'test_sample_data',
          calculationMethod: 'manual_entry'
        });
        
        totalGoals++;
      }
      
      console.log(`  ✅ Created ${numScholarships} scholarships and ${numGoals} goals for ${user.name}`);
    }
    
    console.log("\\n🎉 Sample data creation completed successfully!");
    console.log("\\n📊 Summary:");
    console.log(`👥 Users with data: ${allUsers.length}`);
    console.log(`🎓 Total scholarships created: ${totalScholarships}`);
    console.log(`📝 Total applications created: ${totalApplications}`);
    console.log(`💰 Total financial goals created: ${totalGoals}`);
    console.log("\\n🔑 You can now login with:");
    console.log("  user1@stp.com / password123 (Alex Chen)");
    console.log("  user2@stp.com / password123 (Maria Rodriguez)");
    console.log("  user3@stp.com / password123 (Jordan Williams)");
    console.log("\\nEach user now has comprehensive test data including scholarships, applications, and financial goals!");
    
  } catch (error) {
    console.error("❌ Error adding sample data:", error);
    throw error;
  }
}

addSampleDataToUsers().catch(console.error);