// Password validation utilities

export const passwordValidation = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

const commonPasswords = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
]

export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < passwordValidation.minLength) {
    errors.push(`Password must be at least ${passwordValidation.minLength} characters long`)
  }

  if (passwordValidation.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (passwordValidation.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (passwordValidation.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (passwordValidation.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Please choose a less common password')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get password requirements for UI
export function getPasswordRequirements() {
  return {
    minLength: passwordValidation.minLength,
    requirements: [
      'At least 8 characters long',
      'Contains uppercase letter (A-Z)',
      'Contains lowercase letter (a-z)',
      'Contains at least one number (0-9)',
      'Contains special character (!@#$%^&*)',
      'Not a common password'
    ]
  }
}