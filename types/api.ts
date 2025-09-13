// Shared API types that don't depend on database schema imports
// This prevents client-side components from importing server-side database code

export interface ApiUser {
  id: number;
  name: string | null;
  email: string;
  role: string;
  profilePicture?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  educationLevel?: string | null;
  educationalStatus?: string | null;
  educationalDescription?: string | null;
  gpa?: number | null;
  graduationYear?: number | null;
  school?: string | null;
  major?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ApiScholarship {
  id: number;
  title: string;
  description: string | null;
  amount: string;
  currency: string;
  provider: string | null;
  applicationDeadline: Date;
  status: string;
  createdAt: Date;
}

export interface DashboardStats {
  applications: {
    total: number;
    submitted: number;
    draft: number;
    accepted: number;
    rejected: number;
  };
  scholarships: {
    saved: number;
    available: number;
  };
  funding: {
    total: number;
    won: number;
    potential: number;
  };
  successRate: number;
  upcomingDeadlines: number;
}

export interface WelcomeStats {
  applications: number;
  totalTracked: number;
  collaborators: number;
}

export interface RecentActivity {
  id: number;
  type: 'application' | 'scholarship' | 'status' | 'deadline';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export interface DashboardApiResponse {
  userScholarships: ApiScholarship[];
  stats: DashboardStats;
  welcomeStats: WelcomeStats;
  recentActivity: RecentActivity[];
  user: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
}

export interface SettingsApiResponse {
  user: ApiUser;
  preferences: any;
}

export interface SessionUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}