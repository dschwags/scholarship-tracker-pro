import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { 
  users, 
  scholarships, 
  applications, 
  requirements,
  applicationRequirements,
  savedScholarships,
  type NewScholarship,
  type NewApplication,
  type NewRequirement,
  type NewApplicationRequirement,
  type NewSavedScholarship
} from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

// Sample scholarship data
const sampleScholarships = [
  {
    title: "Merit-Based Academic Excellence Scholarship",
    description: "A prestigious scholarship awarded to students with outstanding academic achievements and leadership potential. This scholarship supports students pursuing their undergraduate or graduate degrees in any field of study.",
    amount: "5000.00",
    provider: "Academic Excellence Foundation",
    providerWebsite: "https://academicexcellence.org",
    eligibilityRequirements: "Minimum 3.5 GPA, demonstrated leadership experience, full-time enrollment, U.S. citizen or permanent resident",
    applicationDeadline: new Date('2025-03-15'),
    awardDate: new Date('2025-05-01'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Any",
    gpaRequirement: "3.50",
    residencyRequirements: "U.S. citizen or permanent resident",
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Maintain 3.5 GPA and full-time enrollment",
    applicationInstructions: "Submit online application with essay, transcripts, and two letters of recommendation",
    contactEmail: "scholarships@academicexcellence.org",
    contactPhone: "(555) 123-4567",
    tags: ["merit-based", "academic", "renewable", "leadership"]
  },
  {
    title: "STEM Innovation Grant",
    description: "Supporting the next generation of STEM leaders through financial assistance for students pursuing degrees in Science, Technology, Engineering, or Mathematics.",
    amount: "7500.00",
    provider: "STEM Future Foundation",
    providerWebsite: "https://stemfuture.org",
    eligibilityRequirements: "STEM major, minimum 3.2 GPA, demonstrated interest in innovation or research",
    applicationDeadline: new Date('2025-02-28'),
    awardDate: new Date('2025-04-15'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "STEM",
    gpaRequirement: "3.20",
    residencyRequirements: "No restrictions",
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: false,
    applicationInstructions: "Submit research proposal or innovation project description along with standard application materials",
    contactEmail: "grants@stemfuture.org",
    tags: ["STEM", "innovation", "research", "technology"]
  },
  {
    title: "Community Service Leadership Award",
    description: "Recognizing students who have made significant contributions to their communities through volunteer work and service projects.",
    amount: "3000.00",
    provider: "Community Impact Alliance",
    providerWebsite: "https://communityimpact.org",
    eligibilityRequirements: "Minimum 100 hours of community service, demonstrated leadership in service projects, minimum 3.0 GPA",
    applicationDeadline: new Date('2025-04-01'),
    awardDate: new Date('2025-06-01'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Any",
    gpaRequirement: "3.00",
    residencyRequirements: "Local community members preferred",
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Continue community service activities and maintain GPA",
    applicationInstructions: "Provide detailed description of service activities and impact on community",
    contactEmail: "awards@communityimpact.org",
    tags: ["community-service", "leadership", "volunteer", "renewable"]
  },
  {
    title: "First-Generation College Student Scholarship",
    description: "Supporting students who are the first in their family to attend college, providing both financial assistance and mentorship opportunities.",
    amount: "4000.00",
    provider: "First Generation Success Network",
    providerWebsite: "https://firstgensuccess.org",
    eligibilityRequirements: "First-generation college student, financial need demonstrated, minimum 2.8 GPA",
    applicationDeadline: new Date('2025-03-30'),
    awardDate: new Date('2025-05-15'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Any",
    gpaRequirement: "2.80",
    residencyRequirements: "U.S. residents",
    demographicRequirements: "First-generation college student",
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Maintain academic progress and participate in mentorship program",
    applicationInstructions: "Include family education background and personal statement about college goals",
    contactEmail: "scholarships@firstgensuccess.org",
    tags: ["first-generation", "need-based", "mentorship", "support"]
  },
  {
    title: "Business Leadership Excellence Award",
    description: "For students pursuing business degrees who demonstrate exceptional leadership potential and entrepreneurial spirit.",
    amount: "6000.00",
    provider: "Business Leaders of Tomorrow",
    providerWebsite: "https://businessleaders.org",
    eligibilityRequirements: "Business major, leadership experience, minimum 3.3 GPA, entrepreneurial project or internship experience",
    applicationDeadline: new Date('2025-02-15'),
    awardDate: new Date('2025-04-01'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Business",
    gpaRequirement: "3.30",
    residencyRequirements: null,
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: false,
    applicationInstructions: "Submit business plan or describe entrepreneurial project along with application",
    contactEmail: "scholarships@businessleaders.org",
    tags: ["business", "leadership", "entrepreneurship", "competitive"]
  },
  {
    title: "Graduate Research Fellowship",
    description: "Supporting graduate students conducting innovative research in their field of study, with emphasis on projects that benefit society.",
    amount: "10000.00",
    provider: "Advanced Research Institute",
    providerWebsite: "https://advancedresearch.edu",
    eligibilityRequirements: "Graduate student, active research project, faculty recommendation, minimum 3.7 GPA",
    applicationDeadline: new Date('2025-01-31'),
    awardDate: new Date('2025-03-15'),
    educationLevel: 'graduate' as const,
    fieldOfStudy: "Any",
    gpaRequirement: "3.70",
    residencyRequirements: null,
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Demonstrate research progress and maintain GPA",
    applicationInstructions: "Submit detailed research proposal and progress report",
    contactEmail: "fellowships@advancedresearch.edu",
    tags: ["graduate", "research", "fellowship", "high-value"]
  },
  {
    title: "Creative Arts Scholarship",
    description: "Supporting students pursuing degrees in visual arts, music, theater, creative writing, or other artistic disciplines.",
    amount: "3500.00",
    provider: "Arts Education Foundation",
    providerWebsite: "https://artseducation.org",
    eligibilityRequirements: "Arts major, portfolio submission, minimum 3.0 GPA, demonstrated artistic talent",
    applicationDeadline: new Date('2025-03-01'),
    awardDate: new Date('2025-04-30'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Arts",
    gpaRequirement: "3.00",
    residencyRequirements: null,
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: false,
    applicationInstructions: "Submit portfolio of recent work along with artist statement",
    contactEmail: "scholarships@artseducation.org",
    tags: ["arts", "creative", "portfolio", "talent-based"]
  },
  {
    title: "Environmental Sustainability Scholarship",
    description: "For students committed to environmental conservation and sustainability, supporting studies in environmental science, policy, or related fields.",
    amount: "4500.00",
    provider: "Green Future Coalition",
    providerWebsite: "https://greenfuture.org",
    eligibilityRequirements: "Environmental focus in studies, sustainability project experience, minimum 3.2 GPA",
    applicationDeadline: new Date('2025-04-15'),
    awardDate: new Date('2025-06-15'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Environmental Studies",
    gpaRequirement: "3.20",
    residencyRequirements: null,
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Continue environmental focus and maintain academic standards",
    applicationInstructions: "Describe environmental project or commitment to sustainability",
    contactEmail: "awards@greenfuture.org",
    tags: ["environmental", "sustainability", "green", "conservation"]
  },
  {
    title: "Technology Innovation Scholarship",
    description: "Supporting students developing innovative technology solutions that address real-world problems.",
    amount: "8000.00",
    provider: "Tech Innovators Guild",
    providerWebsite: "https://techinnovators.org",
    eligibilityRequirements: "Computer Science or related major, innovative project portfolio, minimum 3.4 GPA",
    applicationDeadline: new Date('2025-02-01'),
    awardDate: new Date('2025-03-30'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Computer Science",
    gpaRequirement: "3.40",
    residencyRequirements: null,
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: false,
    applicationInstructions: "Submit portfolio of technology projects and innovation proposal",
    contactEmail: "scholarships@techinnovators.org",
    tags: ["technology", "innovation", "computer-science", "high-value"]
  },
  {
    title: "Medical Field Excellence Scholarship",
    description: "Supporting pre-med and medical students who demonstrate exceptional academic performance and commitment to healthcare.",
    amount: "6500.00",
    provider: "Healthcare Future Foundation",
    providerWebsite: "https://healthcarefuture.org",
    eligibilityRequirements: "Pre-med or medical major, healthcare volunteer experience, minimum 3.6 GPA",
    applicationDeadline: new Date('2025-01-15'),
    awardDate: new Date('2025-03-01'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Pre-Medicine",
    gpaRequirement: "3.60",
    residencyRequirements: null,
    demographicRequirements: null,
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Maintain GPA and continue healthcare involvement",
    applicationInstructions: "Include healthcare experience and statement of medical career goals",
    contactEmail: "scholarships@healthcarefuture.org",
    tags: ["medical", "healthcare", "pre-med", "competitive"]
  },
  {
    title: "Parent and Family Support Scholarship",
    description: "Designed for parents pursuing education while supporting their families, recognizing the unique challenges they face.",
    amount: "2500.00",
    provider: "Family Education Support Network",
    providerWebsite: "https://familyeducation.org",
    eligibilityRequirements: "Parent of dependent children, enrolled in degree program, financial need demonstrated",
    applicationDeadline: new Date('2025-05-01'),
    awardDate: new Date('2025-07-01'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Any",
    gpaRequirement: "2.50",
    residencyRequirements: null,
    demographicRequirements: "Parent of dependent children",
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Maintain enrollment and demonstrate continued need",
    applicationInstructions: "Describe family situation and educational goals",
    contactEmail: "support@familyeducation.org",
    tags: ["parent", "family", "need-based", "support"]
  },
  {
    title: "Veterans Education Advancement Award",
    description: "Honoring military veterans pursuing higher education, providing both financial support and career transition assistance.",
    amount: "5500.00",
    provider: "Veterans Education Alliance",
    providerWebsite: "https://veteranseducation.org",
    eligibilityRequirements: "Military veteran status, honorable discharge, enrolled in degree program, minimum 2.8 GPA",
    applicationDeadline: new Date('2025-03-15'),
    awardDate: new Date('2025-05-15'),
    educationLevel: 'undergraduate' as const,
    fieldOfStudy: "Any",
    gpaRequirement: "2.80",
    residencyRequirements: "U.S. veterans",
    demographicRequirements: "Military veteran",
    status: 'active' as const,
    isRenewable: true,
    renewalRequirements: "Maintain academic progress",
    applicationInstructions: "Include military service record and career transition goals",
    contactEmail: "scholarships@veteranseducation.org",
    tags: ["veterans", "military", "transition", "support"]
  }
];

// Sample requirements for each scholarship type
const requirementTemplates = {
  standard: [
    { type: 'essay' as const, title: 'Personal Statement', description: 'Write a 500-word essay about your academic and career goals', wordLimit: 500 },
    { type: 'transcript' as const, title: 'Official Transcripts', description: 'Submit official transcripts from all institutions attended' },
    { type: 'recommendation_letter' as const, title: 'Letter of Recommendation', description: 'One letter from a teacher, professor, or mentor' }
  ],
  research: [
    { type: 'essay' as const, title: 'Research Proposal', description: 'Detailed description of your research project and its significance', wordLimit: 1000 },
    { type: 'transcript' as const, title: 'Graduate Transcripts', description: 'Official graduate school transcripts' },
    { type: 'recommendation_letter' as const, title: 'Faculty Recommendation', description: 'Letter from faculty advisor or research supervisor' },
    { type: 'other' as const, title: 'Research Portfolio', description: 'Portfolio of previous research work and publications' }
  ],
  creative: [
    { type: 'portfolio' as const, title: 'Artistic Portfolio', description: 'Submit 5-10 examples of your best creative work' },
    { type: 'essay' as const, title: 'Artist Statement', description: 'Describe your artistic vision and influences', wordLimit: 750 },
    { type: 'transcript' as const, title: 'Academic Transcripts', description: 'Official transcripts showing arts coursework' }
  ],
  service: [
    { type: 'essay' as const, title: 'Community Service Essay', description: 'Describe your community service activities and their impact', wordLimit: 600 },
    { type: 'other' as const, title: 'Service Verification', description: 'Documentation of volunteer hours and activities' },
    { type: 'recommendation_letter' as const, title: 'Service Supervisor Letter', description: 'Letter from volunteer supervisor or community leader' }
  ]
};

async function createScholarshipsAndRequirements() {
  console.log('🎓 Creating sample scholarships and requirements...\n');
  
  const createdScholarships = [];
  
  for (const scholarshipData of sampleScholarships) {
    // Create scholarship
    const newScholarship: NewScholarship = {
      ...scholarshipData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [scholarship] = await db.insert(scholarships).values(newScholarship).returning();
    createdScholarships.push(scholarship);
    
    console.log(`✅ Created scholarship: ${scholarship.title}`);
    
    // Determine requirement type based on scholarship
    let reqType = 'standard';
    if (scholarship.title.toLowerCase().includes('research') || scholarship.educationLevel === 'graduate') {
      reqType = 'research';
    } else if (scholarship.title.toLowerCase().includes('arts') || scholarship.title.toLowerCase().includes('creative')) {
      reqType = 'creative';
    } else if (scholarship.title.toLowerCase().includes('service') || scholarship.title.toLowerCase().includes('community')) {
      reqType = 'service';
    }
    
    // Create requirements for this scholarship
    const requirementList = requirementTemplates[reqType];
    for (let i = 0; i < requirementList.length; i++) {
      const req = requirementList[i];
      const newRequirement: NewRequirement = {
        scholarshipId: scholarship.id,
        type: req.type,
        title: req.title,
        description: req.description,
        isRequired: true,
        wordLimit: req.wordLimit || null,
        order: i + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(requirements).values(newRequirement);
    }
    
    console.log(`   📋 Added ${requirementList.length} requirements`);
  }
  
  console.log(`\n✅ Created ${createdScholarships.length} scholarships with requirements\n`);
  return createdScholarships;
}

async function createApplicationsForUsers(createdScholarships: any[]) {
  console.log('📝 Creating sample applications for test users...\n');
  
  // Get our test users
  const testUsers = await db
    .select()
    .from(users)
    .where(sql`${users.email} IN ('user1@stp.com', 'user2@stp.com', 'user3@stp.com')`);
  
  if (testUsers.length === 0) {
    console.log('❌ No test users found');
    return;
  }
  
  // Application statuses to simulate different stages
  const applicationStatuses = ['draft', 'submitted', 'under_review', 'accepted', 'rejected'] as const;
  
  for (const user of testUsers) {
    console.log(`👤 Creating applications for ${user.name} (${user.email})`);
    
    // Create 8-12 applications per user
    const numApplications = Math.floor(Math.random() * 5) + 8; // 8-12 applications
    const userScholarships = createdScholarships
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, numApplications); // Take random subset
    
    for (let i = 0; i < userScholarships.length; i++) {
      const scholarship = userScholarships[i];
      
      // Assign realistic status based on deadlines
      let status: typeof applicationStatuses[number] = 'draft';
      const now = new Date();
      const deadline = new Date(scholarship.applicationDeadline);
      
      if (deadline < now) {
        // Past deadline - more likely to be submitted/reviewed/decided
        const rand = Math.random();
        if (rand < 0.1) status = 'draft'; // 10% still draft (missed deadline)
        else if (rand < 0.3) status = 'submitted'; // 20% submitted
        else if (rand < 0.5) status = 'under_review'; // 20% under review  
        else if (rand < 0.75) status = 'accepted'; // 25% accepted
        else status = 'rejected'; // 25% rejected
      } else {
        // Future deadline - more likely to be draft/submitted
        const rand = Math.random();
        if (rand < 0.6) status = 'draft'; // 60% draft
        else if (rand < 0.9) status = 'submitted'; // 30% submitted
        else status = 'under_review'; // 10% under review
      }
      
      const submittedAt = status !== 'draft' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null; // Random date in last 30 days
      
      const newApplication: NewApplication = {
        userId: user.id,
        scholarshipId: scholarship.id,
        status: status,
        submittedAt: submittedAt,
        statusUpdatedAt: submittedAt || new Date(),
        notes: `Application for ${scholarship.title} - ${status}`,
        applicationData: {
          personalInfo: {
            name: user.name,
            email: user.email,
            school: user.school
          },
          responses: {}
        },
        awardAmount: status === 'accepted' ? scholarship.amount : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [application] = await db.insert(applications).values(newApplication).returning();
      
      // Create some saved scholarships (bookmarks) for variety
      if (Math.random() < 0.3) { // 30% chance to save scholarship
        const savedScholarship: NewSavedScholarship = {
          userId: user.id,
          scholarshipId: scholarship.id,
          notes: `Interested in ${scholarship.title} - good fit for my goals`,
          createdAt: new Date()
        };
        await db.insert(savedScholarships).values(savedScholarship);
      }
      
      console.log(`   📄 ${scholarship.title} - ${status}`);
    }
    
    console.log(`   ✅ Created ${userScholarships.length} applications\n`);
  }
}

async function populateTestData() {
  try {
    console.log('🚀 Starting sample data population...\n');
    
    const createdScholarships = await createScholarshipsAndRequirements();
    await createApplicationsForUsers(createdScholarships);
    
    console.log('🎉 Sample data population completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${sampleScholarships.length} scholarships created`);
    console.log(`   • Requirements added for each scholarship`);
    console.log(`   • 8-12 applications created per test user`);
    console.log(`   • Realistic application statuses assigned`);
    console.log(`   • Some scholarships saved as bookmarks`);
    console.log('\n🔗 Ready for testing at: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
populateTestData();