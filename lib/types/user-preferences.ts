// User Preferences Types
export interface UserPreferences {
  // Account & Privacy Settings
  profile: {
    displayName?: string;
    bio?: string;
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showGPA: boolean;
    showSchool: boolean;
  };

  // Notification Settings
  notifications: {
    email: {
      enabled: boolean;
      deadlineReminders: boolean;
      applicationUpdates: boolean;
      newScholarships: boolean;
      weeklyDigest: boolean;
      marketing: boolean;
    };
    push: {
      enabled: boolean;
      deadlineReminders: boolean;
      applicationUpdates: boolean;
      newScholarships: boolean;
    };
    inApp: {
      enabled: boolean;
      deadlineReminders: boolean;
      applicationUpdates: boolean;
      newScholarships: boolean;
    };
    reminderTiming: {
      deadlineWarning: number; // days before deadline
      followUpReminders: boolean;
      customTimes: string[]; // ['09:00', '18:00']
    };
  };

  // Financial Settings
  financial: {
    currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
    privacy: {
      showAmounts: boolean;
      showGoals: boolean;
      anonymizeExports: boolean;
    };
    goalSettings: {
      autoCalculateNeed: boolean;
      includeOtherAid: boolean;
      trackingCategories: string[];
    };
    exportDefaults: {
      format: 'html' | 'pdf' | 'txt' | 'rtf';
      includePersonalData: boolean;
      includeFinancialData: boolean;
      includeApplicationProgress: boolean;
    };
  };

  // Display & Interface Settings
  interface: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'es' | 'fr';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    dashboardLayout: 'compact' | 'detailed' | 'cards';
    defaultView: 'dashboard' | 'scholarships' | 'applications';
  };

  // Security Settings
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    loginAlerts: boolean;
    requirePasswordForSensitive: boolean;
    allowedDevices: string[];
  };

  // Accessibility Settings
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
  };
}

// Default preferences for new users
export const defaultUserPreferences: UserPreferences = {
  profile: {
    profileVisibility: 'private',
    showEmail: false,
    showGPA: false,
    showSchool: true,
  },
  notifications: {
    email: {
      enabled: true,
      deadlineReminders: true,
      applicationUpdates: true,
      newScholarships: true,
      weeklyDigest: false,
      marketing: false,
    },
    push: {
      enabled: false,
      deadlineReminders: true,
      applicationUpdates: true,
      newScholarships: false,
    },
    inApp: {
      enabled: true,
      deadlineReminders: true,
      applicationUpdates: true,
      newScholarships: true,
    },
    reminderTiming: {
      deadlineWarning: 7,
      followUpReminders: true,
      customTimes: ['09:00', '17:00'],
    },
  },
  financial: {
    currency: 'USD',
    privacy: {
      showAmounts: true,
      showGoals: true,
      anonymizeExports: false,
    },
    goalSettings: {
      autoCalculateNeed: true,
      includeOtherAid: true,
      trackingCategories: ['tuition', 'books', 'living', 'other'],
    },
    exportDefaults: {
      format: 'html',
      includePersonalData: true,
      includeFinancialData: true,
      includeApplicationProgress: true,
    },
  },
  interface: {
    theme: 'system',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    dashboardLayout: 'detailed',
    defaultView: 'dashboard',
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 60,
    loginAlerts: true,
    requirePasswordForSensitive: false,
    allowedDevices: [],
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderOptimized: false,
  },
};

// Password change request type
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Email change request type
export interface EmailChangeRequest {
  newEmail: string;
  password: string;
}

// Account security info
export interface AccountSecurity {
  lastPasswordChange: Date;
  loginHistory: LoginRecord[];
  activeDevices: Device[];
  securityEvents: SecurityEvent[];
}

export interface LoginRecord {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastUsed: Date;
  isCurrent: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'password_change' | 'email_change' | 'login_failed' | 'device_added' | '2fa_enabled';
  timestamp: Date;
  description: string;
  ipAddress: string;
}

// Settings validation schemas
export const emailValidation = {
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  maxLength: 255,
};