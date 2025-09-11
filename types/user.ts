// User type that matches the database schema exactly
export interface DatabaseUser {
  id: number
  name: string | null
  email: string
  passwordHash: string
  role: 'student' | 'parent' | 'counselor' | 'admin'
  profilePicture: string | null
  phone: string | null
  dateOfBirth: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  educationLevel: string | null
  educationalStatus: string | null
  educationalDescription: string | null
  gpa: string | null  // decimal returns as string
  graduationYear: number | null  // integer returns as number
  school: string | null
  major: string | null
  isActive: boolean | null
  emailVerified: boolean | null
  preferences: any | null
  resetToken: string | null
  resetTokenExpiry: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

// User type for components (subset of database fields)
export interface ComponentUser {
  id: number
  name?: string | null
  email: string
  role: string
  phone?: string | null
  educationLevel?: string | null
  gpa?: string | null  // decimal type returns string from database
  graduationYear?: number | null  // integer type returns number from database
  school?: string | null
  major?: string | null
  educationalStatus?: string | null
  educationalDescription?: string | null
}