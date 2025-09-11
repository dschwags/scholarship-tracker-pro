// Complete Sample Data Structure for Dashboard Testing

export const SAMPLE_SCHOLARSHIPS = [
  { 
    id: 1,
    title: "Merit Excellence Scholarship", 
    provider: "State University", 
    amount: 15000, 
    deadline: "2025-03-14", 
    status: "in progress", 
    completion: 85, 
    completionText: "5/6 completed", 
    category: "Merit",
    organizationUrl: "https://www.stateuniversity.edu/scholarships",
    applicationUrl: "https://apply.stateuniversity.edu/merit-excellence"
  },
  { 
    id: 2,
    title: "STEM Innovation Grant", 
    provider: "Tech Foundation", 
    amount: 8000, 
    deadline: "2025-02-28", 
    status: "submitted", 
    completion: 100, 
    completionText: "4/4 completed", 
    category: "STEM",
    organizationUrl: "https://www.techfoundation.org",
    applicationUrl: "https://grants.techfoundation.org/stem-innovation"
  },
  { 
    id: 3,
    title: "Community Service Award", 
    provider: "Local Community", 
    amount: 5000, 
    deadline: "2025-03-31", 
    status: "not started", 
    completion: 0, 
    completionText: "0/5 completed", 
    category: "Service",
    organizationUrl: "https://www.localcommunity.org/scholarships",
    applicationUrl: "https://apply.localcommunity.org/service-award"
  },
  { 
    id: 4,
    title: "Athletics Scholarship", 
    provider: "College Sports", 
    amount: 12000, 
    deadline: "2024-12-29", 
    status: "awarded", 
    completion: 100, 
    completionText: "3/3 completed", 
    category: "Athletics",
    organizationUrl: "https://www.collegesports.edu",
    applicationUrl: "https://recruiting.collegesports.edu/athletics-scholarship"
  },
  { 
    id: 5,
    title: "Need-Based Financial Aid", 
    provider: "Federal Aid", 
    amount: 7500, 
    deadline: "2025-05-14", 
    status: "in progress", 
    completion: 60, 
    completionText: "5/8 completed", 
    category: "Need-Based",
    organizationUrl: "https://www.federalaid.gov",
    applicationUrl: "https://fafsa.gov/need-based-aid"
  },
  { 
    id: 6,
    title: "Academic Excellence Award", 
    provider: "Private Foundation", 
    amount: 10000, 
    deadline: "2024-11-15", 
    status: "rejected", 
    completion: 100, 
    completionText: "5/5 completed", 
    category: "Merit",
    organizationUrl: "https://www.privatefoundation.org",
    applicationUrl: "https://apply.privatefoundation.org/academic-excellence"
  },
  { 
    id: 7,
    title: "Diversity & Inclusion Grant", 
    provider: "Diversity Foundation", 
    amount: 6000, 
    deadline: "2025-04-15", 
    status: "in progress", 
    completion: 40, 
    completionText: "2/5 completed", 
    category: "Diversity",
    organizationUrl: "https://www.diversityfoundation.org",
    applicationUrl: "https://grants.diversityfoundation.org/inclusion"
  },
  { 
    id: 8,
    title: "Research Excellence Fellowship", 
    provider: "Research Institute", 
    amount: 20000, 
    deadline: "2025-06-30", 
    status: "not started", 
    completion: 0, 
    completionText: "0/8 completed", 
    category: "Research",
    organizationUrl: "https://www.researchinstitute.edu",
    applicationUrl: "https://fellowships.researchinstitute.edu/excellence"
  }
];

export const CALCULATED_STATS = {
  applications: {
    total: 8,
    submitted: 1,
    draft: 2,
    accepted: 1,
    rejected: 1,
    inProgress: 3
  },
  funding: {
    won: 0,
    potential: 0,
    total: 0
  },
  successRate: 50, // 1 awarded out of 2 completed applications
  completionData: {
    totalRequirements: 40,
    completedRequirements: 24,
    averageCompletion: 60
  }
};

export const UNICODE_ICONS = {
  quickView: "⊙⊙",
  edit: "⟲", 
  amountWon: "⛁",
  fundingGap: "⛗",
  externalLink: "⬈"
};

export const STATUS_COLORS = {
  awarded: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700",
  submitted: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",
  "in progress": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
  "not started": "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
};