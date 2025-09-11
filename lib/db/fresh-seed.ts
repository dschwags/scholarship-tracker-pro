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

async function freshSeed() {
  console.log('🔥 Fresh Database Seeding - Clearing Legacy Data...');
  
  // Clear all existing data in reverse dependency order
  console.log('🧹 Clearing existing data...');
  await db.delete(activityLogs);
  await db.delete(applicationRequirements);
  await db.delete(requirements);
  await db.delete(savedScholarships);
  await db.delete(notifications);
  await db.delete(userConnections);
  await db.delete(applications);
  await db.delete(scholarships);
  await db.delete(users);
  console.log('✅ All existing data cleared');

  // Create 3 fresh users with same password "1P@ssword"
  const standardPassword = await hashPassword('1P@ssword');
  
  const freshUsers: NewUser[] = [
    {
      name: 'Alex Johnson',
      email: 'alex@stp.com',
      passwordHash: standardPassword,
      role: 'student',
      phone: '7346786800',
      educationLevel: 'undergraduate',
      gpa: 3.75,
      graduationYear: 2025,
      school: 'University of Michigan',
      major: 'Computer Science',
      city: 'Ann Arbor',
      state: 'Michigan',
      zipCode: '48104',
      country: 'United States',
      isActive: true,
      emailVerified: true,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false,
          deadlineReminders: true,
          applicationUpdates: true,
          newScholarships: true
        },
        privacy: {
          showProfile: true,
          allowMessages: true,
          dataSharing: false
        },
        goalSettings: {
          autoCalculateNeed: true,
          includeOtherAid: false,
          targetAmount: 25000,
          academicYear: '2024-2025'
        }
      }
    },
    {
      name: 'Sarah Martinez',
      email: 'sarah@stp.com', 
      passwordHash: standardPassword,
      role: 'student',
      phone: '7346786801',
      educationLevel: 'graduate',
      gpa: 3.85,
      graduationYear: 2026,
      school: 'Stanford University',
      major: 'Biomedical Engineering',
      city: 'Palo Alto',
      state: 'California',
      zipCode: '94305',
      country: 'United States',
      isActive: true,
      emailVerified: true,
      preferences: {
        notifications: {
          email: true,
          push: false,
          sms: true,
          deadlineReminders: true,
          applicationUpdates: true,
          newScholarships: false
        },
        privacy: {
          showProfile: false,
          allowMessages: true,
          dataSharing: true
        },
        goalSettings: {
          autoCalculateNeed: false,
          includeOtherAid: true,
          targetAmount: 40000,
          academicYear: '2024-2025'
        }
      }
    },
    {
      name: 'David Kim',
      email: 'david@stp.com',
      passwordHash: standardPassword,
      role: 'parent',
      phone: '7346786802',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78701',
      country: 'United States',
      isActive: true,
      emailVerified: true,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true,
          deadlineReminders: true,
          applicationUpdates: true,
          newScholarships: true
        },
        privacy: {
          showProfile: true,
          allowMessages: false,
          dataSharing: false
        },
        goalSettings: {
          autoCalculateNeed: true,
          includeOtherAid: true,
          targetAmount: 30000,
          academicYear: '2024-2025'
        }
      }
    }
  ];

  const insertedUsers = await db.insert(users).values(freshUsers).returning();
  console.log(`✅ Created ${insertedUsers.length} fresh users with standard password`);

  // Create 10 scholarships with diverse amounts and statuses
  // Distribute ownership among users: Alex gets 8, Sarah gets 1, David gets 1
  const freshScholarships: NewScholarship[] = [
    {
      title: 'Tech Innovation Excellence Award',
      description: 'Supporting next-generation technology innovators and entrepreneurs in computer science and engineering.',
      amount: 8500.00,
      provider: 'Silicon Valley Tech Foundation',
      providerWebsite: 'https://svtechfoundation.org',
      eligibilityRequirements: 'Must be pursuing CS/Engineering, 3.5+ GPA, demonstrate innovation project',
      applicationDeadline: new Date('2024-12-20'),
      awardDate: new Date('2025-02-01'),
      educationLevel: 'undergraduate',
      fieldOfStudy: 'Technology',
      gpaRequirement: 3.5,
      residencyRequirements: 'US citizens and permanent residents',
      status: 'active',
      isRenewable: true,
      renewalRequirements: 'Maintain 3.5 GPA and submit annual innovation project',
      applicationInstructions: 'Submit portfolio, transcripts, 500-word innovation essay',
      contactEmail: 'awards@svtechfoundation.org',
      tags: ["Technology", "Innovation", "STEM", "Renewable"],
      createdBy: insertedUsers[0].id // Alex Johnson
    },
    {
      title: 'Medical Research Pioneers Grant',
      description: 'Funding exceptional students pursuing medical research and biomedical sciences.',
      amount: 12000.00,
      provider: 'National Medical Research Institute',
      providerWebsite: 'https://nmri.org',
      eligibilityRequirements: 'Pre-med or biomedical majors, research experience, 3.7+ GPA',
      applicationDeadline: new Date('2024-11-15'),
      awardDate: new Date('2025-01-10'),
      educationLevel: 'graduate',
      fieldOfStudy: 'Medicine',
      gpaRequirement: 3.7,
      residencyRequirements: 'No restrictions',
      status: 'active',
      isRenewable: false,
      applicationInstructions: 'Research proposal, CV, three faculty recommendations',
      contactEmail: 'grants@nmri.org',
      tags: ["Medical", "Research", "Graduate", "Merit"],
      createdBy: insertedUsers[0].id // Alex Johnson
    },
    {
      title: 'First-Generation College Success Scholarship',
      description: 'Supporting first-generation college students in achieving their academic dreams.',
      amount: 4500.00,
      provider: 'Education Equity Alliance',
      providerWebsite: 'https://eqalliance.edu',
      eligibilityRequirements: 'First-generation college student, financial need, 3.0+ GPA',
      applicationDeadline: new Date('2025-01-31'),
      awardDate: new Date('2025-03-15'),
      educationLevel: 'undergraduate',
      gpaRequirement: 3.0,
      residencyRequirements: 'US students only',
      status: 'active',
      isRenewable: true,
      renewalRequirements: 'Maintain satisfactory academic progress',
      applicationInstructions: 'Personal statement, FAFSA, academic transcripts',
      contactEmail: 'scholarships@eqalliance.edu',
      tags: ["First-Generation", "Need-Based", "Equity", "Renewable"],
      createdBy: insertedUsers[0].id // Alex Johnson
    },
    {
      title: 'Environmental Sustainability Leadership Award',
      description: 'Recognizing students leading environmental sustainability initiatives in their communities.',
      amount: 6750.00,
      provider: 'Green Future Foundation',
      providerWebsite: 'https://greenfuture.org',
      eligibilityRequirements: 'Environmental studies/science major, sustainability project leadership',
      applicationDeadline: new Date('2024-10-30'),
      awardDate: new Date('2024-12-15'),
      educationLevel: 'undergraduate',
      fieldOfStudy: 'Environmental Science',
      gpaRequirement: 3.25,
      residencyRequirements: 'Global applicants welcome',
      status: 'closed',
      isRenewable: false,
      applicationInstructions: 'Project portfolio, impact documentation, sustainability essay',
      contactEmail: 'awards@greenfuture.org',
      tags: ["Environmental", "Leadership", "Sustainability", "Global"],
      createdBy: insertedUsers[0].id // Alex Johnson
    },
    {
      title: 'Minority in Business Excellence Scholarship',
      description: 'Supporting underrepresented minorities pursuing business and entrepreneurship degrees.',
      amount: 7500.00,
      provider: 'Diverse Business Leaders Coalition',
      providerWebsite: 'https://dblc.org',
      eligibilityRequirements: 'Underrepresented minority, business major, leadership experience',
      applicationDeadline: new Date('2025-02-28'),
      awardDate: new Date('2025-04-01'),
      educationLevel: 'undergraduate',
      fieldOfStudy: 'Business',
      gpaRequirement: 3.3,
      residencyRequirements: 'US citizens and permanent residents',
      status: 'active',
      isRenewable: true,
      renewalRequirements: 'Maintain GPA and complete mentorship program',
      applicationInstructions: 'Business plan, leadership examples, diversity essay',
      contactEmail: 'scholarships@dblc.org',
      tags: ["Diversity", "Business", "Leadership", "Mentorship"],
      createdBy: insertedUsers[0].id // Alex Johnson
    },
    {
      title: 'Arts and Creative Expression Grant',
      description: 'Funding creative students in visual arts, music, theater, and digital media programs.',
      amount: 5250.00,
      provider: 'National Arts Education Foundation',
      providerWebsite: 'https://naef.arts',
      eligibilityRequirements: 'Arts major, portfolio submission, creative project proposal',
      applicationDeadline: new Date('2025-03-15'),
      awardDate: new Date('2025-05-01'),
      educationLevel: 'undergraduate',
      fieldOfStudy: 'Arts',
      gpaRequirement: 2.8,
      residencyRequirements: 'No restrictions',
      status: 'active',
      isRenewable: false,
      applicationInstructions: 'Portfolio, artist statement, creative project proposal',
      contactEmail: 'grants@naef.arts',
      tags: ["Arts", "Creative", "Portfolio", "Expression"],
      createdBy: insertedUsers[0].id // Alex Johnson
    },
    {
      title: 'Community College Transfer Excellence Award',
      description: 'Supporting exceptional community college students transferring to 4-year universities.',
      amount: 9200.00,
      provider: 'Transfer Student Success Network',
      providerWebsite: 'https://tssn.edu',
      eligibilityRequirements: 'Community college transfer, 3.6+ GPA, financial need demonstration',
      applicationDeadline: new Date('2024-09-30'),
      awardDate: new Date('2024-11-01'),
      educationLevel: 'undergraduate',
      gpaRequirement: 3.6,
      residencyRequirements: 'State residents only',
      status: 'closed',
      isRenewable: true,
      renewalRequirements: 'Maintain transfer institution GPA above 3.5',
      applicationInstructions: 'Transcripts from both institutions, transfer essay, financial documents',
      contactEmail: 'transfers@tssn.edu',
      tags: ["Transfer", "Community College", "Merit", "Need-Based"],
      createdBy: insertedUsers[0].id // Alex Johnson (7th scholarship)
    },
    {
      title: 'Rural Student Achievement Scholarship',
      description: 'Supporting students from rural communities pursuing higher education opportunities.',
      amount: 3800.00,
      provider: 'Rural Education Initiative',
      providerWebsite: 'https://ruraledu.org',
      eligibilityRequirements: 'From rural community (population <50K), any major, 3.2+ GPA',
      applicationDeadline: new Date('2024-08-15'),
      awardDate: new Date('2024-09-30'),
      educationLevel: 'undergraduate',
      gpaRequirement: 3.2,
      residencyRequirements: 'Rural US communities only',
      status: 'expired',
      isRenewable: true,
      renewalRequirements: 'Maintain academic standing and rural community connection',
      applicationInstructions: 'Community verification, academic records, rural impact essay',
      contactEmail: 'scholarships@ruraledu.org',
      tags: ["Rural", "Community", "Geographic", "Renewable"],
      createdBy: insertedUsers[0].id // Alex Johnson (8th scholarship)
    },
    {
      title: 'International Student Global Leaders Fund',
      description: 'Empowering international students to become global leaders in their fields of study.',
      amount: 15000.00,
      provider: 'Global Education Alliance',
      providerWebsite: 'https://globaledu.alliance',
      eligibilityRequirements: 'International student visa status, leadership experience, 3.8+ GPA',
      applicationDeadline: new Date('2025-01-15'),
      awardDate: new Date('2025-03-01'),
      educationLevel: 'graduate',
      gpaRequirement: 3.8,
      residencyRequirements: 'International students only',
      status: 'active',
      isRenewable: true,
      renewalRequirements: 'Maintain visa status, GPA, and complete global leadership program',
      applicationInstructions: 'Visa documentation, leadership portfolio, global impact essay',
      contactEmail: 'international@globaledu.alliance',
      tags: ["International", "Leadership", "Graduate", "Global"],
      createdBy: insertedUsers[1].id // Sarah Martinez
    },
    {
      title: 'Veterans Education Advancement Grant',
      description: 'Supporting military veterans and their families in pursuing higher education goals.',
      amount: 11500.00,
      provider: 'Veterans Education Foundation',
      providerWebsite: 'https://vetedfoundation.org',
      eligibilityRequirements: 'Military veteran or military family member, any field of study',
      applicationDeadline: new Date('2025-04-30'),
      awardDate: new Date('2025-06-15'),
      educationLevel: 'undergraduate',
      gpaRequirement: 2.5,
      residencyRequirements: 'US veterans and families only',
      status: 'upcoming',
      isRenewable: true,
      renewalRequirements: 'Maintain enrollment and military connection',
      applicationInstructions: 'Military service verification, enrollment confirmation, service essay',
      contactEmail: 'veterans@vetedfoundation.org',
      tags: ["Veterans", "Military", "Family", "Service"],
      createdBy: insertedUsers[2].id // David Kim
    }
  ];

  const insertedScholarships = await db.insert(scholarships).values(freshScholarships).returning();
  console.log(`✅ Created ${insertedScholarships.length} diverse scholarships with various statuses`);

  // Create applications in different stages for each user (6-10 each)
  const freshApplications: NewApplication[] = [];
  
  // Alex Johnson - 8 applications
  const alexApps = [
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[0].id,
      status: 'submitted' as const,
      submittedAt: new Date('2024-10-15'),
      statusUpdatedAt: new Date('2024-10-15'),
      notes: 'Strong tech portfolio submitted, waiting for review'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[2].id,
      status: 'draft' as const,
      statusUpdatedAt: new Date('2024-10-20'),
      notes: 'Working on personal statement for first-generation scholarship'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[4].id,
      status: 'under_review' as const,
      submittedAt: new Date('2024-09-30'),
      statusUpdatedAt: new Date('2024-10-05'),
      notes: 'Application under committee review, expecting decision soon'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[6].id,
      status: 'accepted' as const,
      submittedAt: new Date('2024-08-20'),
      statusUpdatedAt: new Date('2024-09-15'),
      decisionDate: new Date('2024-09-15'),
      awardAmount: 9200.00,
      notes: 'Accepted! Transfer excellence award confirmed'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[7].id,
      status: 'rejected' as const,
      submittedAt: new Date('2024-07-10'),
      statusUpdatedAt: new Date('2024-08-01'),
      decisionDate: new Date('2024-08-01'),
      notes: 'Did not meet rural community requirement'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[5].id,
      status: 'submitted' as const,
      submittedAt: new Date('2024-10-25'),
      statusUpdatedAt: new Date('2024-10-25'),
      notes: 'Arts portfolio submitted, includes digital media projects'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[3].id,
      status: 'rejected' as const,
      submittedAt: new Date('2024-08-15'),
      statusUpdatedAt: new Date('2024-09-01'),
      notes: 'Withdrew due to deadline conflict with other opportunities'
    },
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[9].id,
      status: 'draft' as const,
      statusUpdatedAt: new Date('2024-10-28'),
      notes: 'Veterans grant application in progress, gathering documents'
    }
  ];

  // Sarah Martinez - 7 applications
  const sarahApps = [
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[1].id,
      status: 'accepted' as const,
      submittedAt: new Date('2024-09-01'),
      statusUpdatedAt: new Date('2024-10-01'),
      decisionDate: new Date('2024-10-01'),
      awardAmount: 12000.00,
      notes: 'Medical research grant approved! Starting research project'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[8].id,
      status: 'submitted' as const,
      submittedAt: new Date('2024-10-10'),
      statusUpdatedAt: new Date('2024-10-10'),
      notes: 'International leadership application submitted with global health focus'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[0].id,
      status: 'under_review' as const,
      submittedAt: new Date('2024-10-05'),
      statusUpdatedAt: new Date('2024-10-12'),
      notes: 'Tech innovation application being reviewed by committee'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[3].id,
      status: 'rejected' as const,
      submittedAt: new Date('2024-08-25'),
      statusUpdatedAt: new Date('2024-09-10'),
      decisionDate: new Date('2024-09-10'),
      notes: 'Environmental scholarship - project did not align with sustainability focus'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[2].id,
      status: 'submitted' as const,
      submittedAt: new Date('2024-10-20'),
      statusUpdatedAt: new Date('2024-10-20'),
      notes: 'First-generation scholarship submitted, emphasizing medical career goals'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[5].id,
      status: 'draft' as const,
      statusUpdatedAt: new Date('2024-10-26'),
      notes: 'Arts grant application in draft - exploring medical illustration angle'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[4].id,
      status: 'waitlisted' as const,
      submittedAt: new Date('2024-09-15'),
      statusUpdatedAt: new Date('2024-10-01'),
      notes: 'Business scholarship waitlisted, waiting for final decision'
    }
  ];

  // David Kim - 6 applications (as parent helping child)
  const davidApps = [
    {
      userId: insertedUsers[2].id,
      scholarshipId: insertedScholarships[2].id,
      status: 'submitted' as const,
      submittedAt: new Date('2024-10-18'),
      statusUpdatedAt: new Date('2024-10-18'),
      notes: 'Submitted for child - first-generation college application'
    },
    {
      userId: insertedUsers[2].id,
      scholarshipId: insertedScholarships[4].id,
      status: 'draft' as const,
      statusUpdatedAt: new Date('2024-10-25'),
      notes: 'Preparing business scholarship application for child'
    },
    {
      userId: insertedUsers[2].id,
      scholarshipId: insertedScholarships[6].id,
      status: 'accepted' as const,
      submittedAt: new Date('2024-08-10'),
      statusUpdatedAt: new Date('2024-09-05'),
      decisionDate: new Date('2024-09-05'),
      awardAmount: 9200.00,
      notes: 'Transfer student scholarship approved for child'
    },
    {
      userId: insertedUsers[2].id,
      scholarshipId: insertedScholarships[7].id,
      status: 'submitted' as const,
      submittedAt: new Date('2024-08-05'),
      statusUpdatedAt: new Date('2024-08-05'),
      notes: 'Rural student scholarship - from small Texas town'
    },
    {
      userId: insertedUsers[2].id,
      scholarshipId: insertedScholarships[0].id,
      status: 'under_review' as const,
      submittedAt: new Date('2024-10-01'),
      statusUpdatedAt: new Date('2024-10-08'),
      notes: 'Tech scholarship under review - child studying computer engineering'
    },
    {
      userId: insertedUsers[2].id,
      scholarshipId: insertedScholarships[9].id,
      status: 'draft' as const,
      statusUpdatedAt: new Date('2024-10-22'),
      notes: 'Veterans scholarship - utilizing spouse military service'
    }
  ];

  freshApplications.push(...alexApps, ...sarahApps, ...davidApps);
  
  const insertedApplications = await db.insert(applications).values(freshApplications).returning();
  console.log(`✅ Created ${insertedApplications.length} applications across various stages`);

  // Create some saved scholarships
  const savedScholarshipData: NewSavedScholarship[] = [
    {
      userId: insertedUsers[0].id,
      scholarshipId: insertedScholarships[8].id,
      notes: 'International scholarship - good backup option'
    },
    {
      userId: insertedUsers[1].id,
      scholarshipId: insertedScholarships[7].id,
      notes: 'Rural scholarship might not apply but keeping for reference'
    },
    {
      userId: insertedUsers[2].id,
      scholarshipId: insertedScholarships[5].id,
      notes: 'Arts scholarship for child\'s creative interests'
    }
  ];

  const insertedSavedScholarships = await db.insert(savedScholarships).values(savedScholarshipData).returning();
  console.log(`✅ Created ${insertedSavedScholarships.length} saved scholarships`);

  // Create some notifications
  const notificationData: NewNotification[] = [
    {
      userId: insertedUsers[0].id,
      title: 'Application Accepted!',
      message: 'Your Transfer Excellence Award application has been accepted. Congratulations!',
      type: 'status_update',
      isRead: false
    },
    {
      userId: insertedUsers[1].id,
      title: 'Medical Research Grant Approved',
      message: 'Your Medical Research Pioneers Grant has been approved for $12,000.',
      type: 'status_update',
      isRead: true
    },
    {
      userId: insertedUsers[2].id,
      title: 'Application Deadline Reminder',
      message: 'First-Generation College Success Scholarship deadline is in 7 days.',
      type: 'deadline_reminder',
      isRead: false
    }
  ];

  const insertedNotifications = await db.insert(notifications).values(notificationData).returning();
  console.log(`✅ Created ${insertedNotifications.length} notifications`);

  console.log('\n🎉 Fresh Database Seeding Complete!');
  console.log('\n🔐 STANDARDIZED LOGIN CREDENTIALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email: alex@stp.com     🔑 Password: 1P@ssword');
  console.log('📧 Email: sarah@stp.com    🔑 Password: 1P@ssword');  
  console.log('📧 Email: david@stp.com    🔑 Password: 1P@ssword');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n👤 USER PROFILES:');
  console.log('🎓 Alex Johnson (alex@stp.com)');
  console.log('   Role: Student (Undergraduate)');
  console.log('   School: University of Michigan - Computer Science');
  console.log('   GPA: 3.75 | Graduation: 2025');
  console.log('   Applications: 8 (1 Accepted, 2 Submitted, 1 In Review, 2 Draft, 1 Rejected, 1 Withdrawn)');

  console.log('\n🩺 Sarah Martinez (sarah@stp.com)');
  console.log('   Role: Student (Graduate)');
  console.log('   School: Stanford University - Biomedical Engineering');
  console.log('   GPA: 3.85 | Graduation: 2026');
  console.log('   Applications: 7 (1 Accepted, 2 Submitted, 1 In Review, 1 Draft, 1 Rejected, 1 Waitlisted)');

  console.log('\n👨‍👩‍👧‍👦 David Kim (david@stp.com)');
  console.log('   Role: Parent');
  console.log('   Location: Austin, Texas');
  console.log('   Applications: 6 (1 Accepted, 2 Submitted, 1 In Review, 2 Draft)');

  console.log('\n📊 DATABASE STATISTICS:');
  console.log(`   🏆 ${insertedScholarships.length} Scholarships ($${insertedScholarships.reduce((sum, s) => sum + s.amount, 0).toLocaleString()} total value)`);
  console.log(`   📝 ${insertedApplications.length} Applications across various stages`);
  console.log(`   💾 ${insertedSavedScholarships.length} Saved Scholarships`);
  console.log(`   🔔 ${insertedNotifications.length} Notifications`);
  
  console.log('\n🔄 SCHOLARSHIP STATUS DISTRIBUTION:');
  const statusCounts = insertedScholarships.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status.toUpperCase()}: ${count} scholarships`);
  });

  console.log('\n✨ Ready for fresh authentication testing!');
}

freshSeed()
  .catch((error) => {
    console.error('❌ Fresh seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n🏁 Fresh seed process finished. Exiting...');
    process.exit(0);
  });