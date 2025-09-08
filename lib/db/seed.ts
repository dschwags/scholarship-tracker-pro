import { db } from './drizzle';
import { 
  users, 
  scholarships,
  applications,
  requirements,
  applicationRequirements,
  notifications,
  savedScholarships,
  userConnections,
  activityLogs, 
  type NewUser, 
  type NewScholarship,
  type NewApplication,
  type NewRequirement,
  type NewApplicationRequirement,
  type NewNotification,
  type NewSavedScholarship,
  type NewUserConnection,
  type NewActivityLog, 
  ActivityType 
} from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  console.log('🌱 Seeding Scholarship Tracker Pro database...');

  // Create sample users with different roles
  const sampleUsers: NewUser[] = [
    {
      name: 'Emily Rodriguez',
      email: 'emily.student@stp.com',
      passwordHash: await hashPassword('student123'),
      role: 'student',
      phone: '(555) 123-4567',
      educationLevel: 'undergraduate',
      gpa: 3.85,
      graduationYear: 2025,
      school: 'University of California, Berkeley',
      major: 'Computer Science',
      city: 'Berkeley',
      state: 'California',
      zipCode: '94720',
      isActive: true,
      emailVerified: true
    },
    {
      name: 'Marcus Thompson',
      email: 'marcus.student@stp.com',
      passwordHash: await hashPassword('student123'),
      role: 'student',
      phone: '(555) 234-5678',
      educationLevel: 'high_school',
      gpa: 3.92,
      graduationYear: 2025,
      school: 'Lincoln High School',
      city: 'Seattle',
      state: 'Washington',
      zipCode: '98101',
      isActive: true,
      emailVerified: true
    },
    {
      name: 'Sarah Chen',
      email: 'sarah.parent@stp.com',
      passwordHash: await hashPassword('parent123'),
      role: 'parent',
      phone: '(555) 345-6789',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102',
      isActive: true,
      emailVerified: true
    },
    {
      name: 'Dr. Michael Williams',
      email: 'michael.counselor@stp.com',
      passwordHash: await hashPassword('counselor123'),
      role: 'counselor',
      phone: '(555) 456-7890',
      school: 'Washington High School',
      city: 'Portland',
      state: 'Oregon',
      zipCode: '97201',
      isActive: true,
      emailVerified: true
    },
    {
      name: 'Jennifer Davis',
      email: 'jennifer.grad@stp.com',
      passwordHash: await hashPassword('student123'),
      role: 'student',
      phone: '(555) 567-8901',
      educationLevel: 'graduate',
      gpa: 3.78,
      graduationYear: 2025,
      school: 'Stanford University',
      major: 'Biomedical Engineering',
      city: 'Stanford',
      state: 'California',
      zipCode: '94305',
      isActive: true,
      emailVerified: true
    }
  ];

  const insertedUsers = await db.insert(users).values(sampleUsers).returning();
  console.log(`✅ Created ${insertedUsers.length} users`);

  // Create sample scholarships
  const sampleScholarships: NewScholarship[] = [
    {
      title: 'STEM Excellence Award',
      description: 'Supporting outstanding students pursuing degrees in Science, Technology, Engineering, and Mathematics fields.',
      amount: 5000.00,
      provider: 'National STEM Foundation',
      providerWebsite: 'https://stemsf.org',
      eligibilityRequirements: 'Must be enrolled in a STEM program, maintain 3.5+ GPA, demonstrate financial need',
      applicationDeadline: new Date('2024-12-15'),
      awardDate: new Date('2025-01-30'),
      educationLevel: 'undergraduate',
      fieldOfStudy: 'STEM',
      gpaRequirement: 3.5,
      residencyRequirements: 'US citizens or permanent residents',
      status: 'active',
      isRenewable: true,
      renewalRequirements: 'Maintain 3.5 GPA and full-time enrollment',
      applicationInstructions: 'Submit transcripts, essay, and two letters of recommendation',
      contactEmail: 'awards@stemsf.org',
      tags: ["STEM", "Undergraduate", "Renewable", "Merit"]
    },
    {
      title: 'Community Leadership Scholarship',
      description: 'Recognizing students who have demonstrated exceptional leadership in their communities.',
      amount: 3000.00,
      provider: 'Civic Leaders Foundation',
      providerWebsite: 'https://civicleaders.org',
      eligibilityRequirements: 'Demonstrated community service, leadership roles, minimum 3.0 GPA',
      applicationDeadline: new Date('2024-11-30'),
      awardDate: new Date('2025-01-15'),
      educationLevel: 'undergraduate',
      gpaRequirement: 3.0,
      residencyRequirements: 'No restrictions',
      status: 'active',
      isRenewable: false,
      applicationInstructions: 'Submit community service portfolio and leadership essay',
      contactEmail: 'scholarships@civicleaders.org',
      tags: ["Leadership", "Community Service", "Merit"]
    },
    {
      title: 'First-Generation College Student Grant',
      description: 'Supporting first-generation college students in achieving their educational goals.',
      amount: 7500.00,
      provider: 'Education Access Foundation',
      providerWebsite: 'https://edaccess.org',
      eligibilityRequirements: 'First in family to attend college, financial need demonstrated',
      applicationDeadline: new Date('2025-01-31'),
      awardDate: new Date('2025-03-01'),
      educationLevel: 'undergraduate',
      gpaRequirement: 2.5,
      residencyRequirements: 'US citizens only',
      demographicRequirements: 'First-generation college students',
      status: 'active',
      isRenewable: true,
      renewalRequirements: 'Maintain satisfactory academic progress',
      applicationInstructions: 'Complete FAFSA, submit family income documentation',
      contactEmail: 'grants@edaccess.org',
      tags: ["First-Generation", "Need-Based", "Renewable"]
    },
    {
      title: 'Women in Technology Scholarship',
      description: 'Empowering women to pursue careers in technology and computer science.',
      amount: 4000.00,
      provider: 'Tech Women United',
      providerWebsite: 'https://techwomenunited.org',
      eligibilityRequirements: 'Female students in technology-related fields, minimum 3.2 GPA',
      applicationDeadline: new Date('2024-10-15'),
      awardDate: new Date('2024-12-01'),
      educationLevel: 'undergraduate',
      fieldOfStudy: 'Technology',
      gpaRequirement: 3.2,
      demographicRequirements: 'Female students',
      status: 'expired',
      isRenewable: false,
      applicationInstructions: 'Submit project portfolio and career goals essay',
      contactEmail: 'scholarships@techwomenunited.org',
      tags: ["Women", "Technology", "Merit"]
    },
    {
      title: 'Graduate Research Fellowship',
      description: 'Supporting graduate students conducting innovative research projects.',
      amount: 15000.00,
      provider: 'National Research Council',
      providerWebsite: 'https://nrc.gov',
      eligibilityRequirements: 'Enrolled in graduate program, active research project, faculty endorsement',
      applicationDeadline: new Date('2025-03-01'),
      awardDate: new Date('2025-05-01'),
      educationLevel: 'graduate',
      gpaRequirement: 3.7,
      status: 'upcoming',
      isRenewable: true,
      renewalRequirements: 'Satisfactory research progress and annual report',
      applicationInstructions: 'Submit research proposal, CV, and three faculty recommendations',
      contactEmail: 'fellowships@nrc.gov',
      tags: ["Graduate", "Research", "High-Value", "Renewable"]
    }
  ];

  const insertedScholarships = await db.insert(scholarships).values(sampleScholarships).returning();
  console.log(`✅ Created ${insertedScholarships.length} scholarships`);

  // Create requirements for scholarships
  const sampleRequirements: NewRequirement[] = [
    // STEM Excellence Award requirements
    {
      scholarshipId: insertedScholarships[0].id,
      type: 'transcript',
      title: 'Official Transcripts',
      description: 'Submit official transcripts from all attended institutions',
      isRequired: true,
      instructions: 'Request official transcripts to be sent directly from your institution'
    },
    {
      scholarshipId: insertedScholarships[0].id,
      type: 'essay',
      title: 'Personal Statement',
      description: 'Essay describing your STEM interests and career goals',
      isRequired: true,
      wordLimit: 1000,
      instructions: 'Describe your passion for STEM and how this scholarship will help achieve your goals'
    },
    {
      scholarshipId: insertedScholarships[0].id,
      type: 'recommendation_letter',
      title: 'Faculty Recommendations',
      description: 'Two letters of recommendation from STEM faculty',
      isRequired: true,
      instructions: 'Letters should address your academic ability and potential in STEM fields'
    },
    // Community Leadership Scholarship requirements
    {
      scholarshipId: insertedScholarships[1].id,
      type: 'essay',
      title: 'Leadership Essay',
      description: 'Describe your community leadership experiences',
      isRequired: true,
      wordLimit: 750,
      instructions: 'Provide specific examples of your leadership impact in the community'
    },
    {
      scholarshipId: insertedScholarships[1].id,
      type: 'other',
      title: 'Service Portfolio',
      description: 'Documentation of community service activities',
      isRequired: true,
      instructions: 'Include certificates, photos, and testimonials from service organizations'
    }
  ];

  const insertedRequirements = await db.insert(requirements).values(sampleRequirements).returning();
  console.log(`✅ Created ${insertedRequirements.length} requirements`);

  // Create sample applications
  const sampleApplications: NewApplication[] = [
    // Emily's applications
    {
      userId: insertedUsers[0].id, // Emily Rodriguez
      scholarshipId: insertedScholarships[0].id, // STEM Excellence Award
      status: 'submitted',
      submittedAt: new Date('2024-10-15'),
      statusUpdatedAt: new Date('2024-10-15'),
      notes: 'Strong candidate with excellent GPA and research experience'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[1].id, // Community Leadership
      status: 'accepted',
      submittedAt: new Date('2024-09-20'),
      statusUpdatedAt: new Date('2024-11-01'),
      decisionDate: new Date('2024-11-01'),
      awardAmount: 3000.00,
      notes: 'Excellent leadership portfolio and community impact'
    },
    // Marcus's applications
    {
      userId: insertedUsers[1].id, // Marcus Thompson
      scholarshipId: insertedScholarships[2].id, // First-Generation Grant
      status: 'draft',
      notes: 'Working on completing financial documentation'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[1].id, // Community Leadership
      status: 'under_review',
      submittedAt: new Date('2024-11-01'),
      statusUpdatedAt: new Date('2024-11-01'),
      notes: 'Application under committee review'
    },
    // Jennifer's applications
    {
      userId: insertedUsers[4].id, // Jennifer Davis
      scholarshipId: insertedScholarships[4].id, // Graduate Research Fellowship
      status: 'draft',
      notes: 'Preparing research proposal with faculty advisor'
    }
  ];

  const insertedApplications = await db.insert(applications).values(sampleApplications).returning();
  console.log(`✅ Created ${insertedApplications.length} applications`);

  // Create sample saved scholarships
  const sampleSavedScholarships: NewSavedScholarship[] = [
    {
      userId: insertedUsers[0].id, // Emily
      scholarshipId: insertedScholarships[2].id, // First-Generation Grant
      notes: 'Might be eligible if family income qualifies'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[4].id, // Graduate Research Fellowship
      notes: 'For future graduate school applications'
    },
    {
      userId: insertedUsers[1].id, // Marcus
      scholarshipId: insertedScholarships[0].id, // STEM Excellence
      notes: 'Need to improve GPA to meet requirements'
    }
  ];

  const insertedSavedScholarships = await db.insert(savedScholarships).values(sampleSavedScholarships).returning();
  console.log(`✅ Created ${insertedSavedScholarships.length} saved scholarships`);

  // Create sample notifications
  const sampleNotifications: NewNotification[] = [
    {
      userId: insertedUsers[0].id, // Emily
      type: 'status_update',
      title: 'Application Status Update',
      message: 'Your Community Leadership Scholarship application has been accepted! Congratulations!',
      isRead: false
    },
    {
      userId: insertedUsers[0].id,
      type: 'deadline_reminder',
      title: 'Deadline Reminder',
      message: 'STEM Excellence Award deadline is approaching in 7 days',
      isRead: false,
      scheduledFor: new Date('2024-12-08')
    },
    {
      userId: insertedUsers[1].id, // Marcus
      type: 'new_scholarship',
      title: 'New Scholarship Match',
      message: 'A new scholarship matching your profile has been added: First-Generation College Student Grant',
      isRead: true
    }
  ];

  const insertedNotifications = await db.insert(notifications).values(sampleNotifications).returning();
  console.log(`✅ Created ${insertedNotifications.length} notifications`);

  // Create user connections (parent-child, counselor-student)
  const sampleConnections: NewUserConnection[] = [
    {
      parentUserId: insertedUsers[2].id, // Sarah Chen (parent)
      childUserId: insertedUsers[0].id, // Emily Rodriguez (student)
      connectionType: 'parent',
      permissions: { canViewApplications: true, canReceiveNotifications: true }
    },
    {
      parentUserId: insertedUsers[3].id, // Dr. Michael Williams (counselor)
      childUserId: insertedUsers[1].id, // Marcus Thompson (student)
      connectionType: 'counselor',
      permissions: { canViewApplications: true, canEditApplications: true, canViewAnalytics: true }
    }
  ];

  const insertedConnections = await db.insert(userConnections).values(sampleConnections).returning();
  console.log(`✅ Created ${insertedConnections.length} user connections`);

  // Create sample activity logs
  const sampleLogs: NewActivityLog[] = [
    ...insertedUsers.map(user => ({
      userId: user.id,
      action: ActivityType.SIGN_UP,
      ipAddress: '127.0.0.1',
      metadata: { userAgent: 'Seed Script', role: user.role }
    })),
    {
      userId: insertedUsers[0].id,
      action: ActivityType.APPLICATION_SUBMITTED,
      entityType: 'application',
      entityId: insertedApplications[0].id,
      ipAddress: '192.168.1.100',
      metadata: { scholarshipTitle: 'STEM Excellence Award' }
    },
    {
      userId: insertedUsers[0].id,
      action: ActivityType.APPLICATION_STATUS_CHANGED,
      entityType: 'application',
      entityId: insertedApplications[1].id,
      ipAddress: '192.168.1.100',
      metadata: { status: 'accepted', scholarshipTitle: 'Community Leadership Scholarship' }
    },
    {
      userId: insertedUsers[1].id,
      action: ActivityType.SCHOLARSHIP_SAVED,
      entityType: 'scholarship',
      entityId: insertedScholarships[0].id,
      ipAddress: '10.0.0.50',
      metadata: { scholarshipTitle: 'STEM Excellence Award' }
    }
  ];

  const insertedLogs = await db.insert(activityLogs).values(sampleLogs).returning();
  console.log(`✅ Created ${insertedLogs.length} activity logs`);

  console.log('\n🎉 Scholarship Tracker Pro database seeded successfully!');
  console.log('\n📋 Sample User Accounts Created:');
  console.log('\n👨‍🎓 STUDENTS:');
  console.log('  • emily.student@stp.com (password: student123)');
  console.log('    - Role: Student (Undergraduate)');
  console.log('    - School: UC Berkeley, Computer Science');
  console.log('    - GPA: 3.85, Expected Graduation: 2025');
  console.log('\n  • marcus.student@stp.com (password: student123)');
  console.log('    - Role: Student (High School Senior)');
  console.log('    - School: Lincoln High School');
  console.log('    - GPA: 3.92, Expected Graduation: 2025');
  console.log('\n  • jennifer.grad@stp.com (password: student123)');
  console.log('    - Role: Student (Graduate)');
  console.log('    - School: Stanford University, Biomedical Engineering');
  console.log('    - GPA: 3.78, Expected Graduation: 2025');
  console.log('\n👨‍👩‍👧‍👦 PARENT:');
  console.log('  • sarah.parent@stp.com (password: parent123)');
  console.log('    - Role: Parent (Connected to Emily)');
  console.log('    - Can view Emily\'s applications and progress');
  console.log('\n👨‍🏫 COUNSELOR:');
  console.log('  • michael.counselor@stp.com (password: counselor123)');
  console.log('    - Role: School Counselor (Connected to Marcus)');
  console.log('    - Can view and edit Marcus\'s applications');
  console.log('\n🏆 SAMPLE DATA INCLUDED:');
  console.log('  • 5 Scholarships with various statuses and requirements');
  console.log('  • 5 Applications with different stages (draft, submitted, accepted)');
  console.log('  • Realistic requirements (essays, transcripts, recommendations)');
  console.log('  • User connections (parent-child, counselor-student)');
  console.log('  • Notifications and activity logs');
  console.log('  • Saved scholarships and user preferences');
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\nSeed process finished. Exiting...');
    process.exit(0);
  });