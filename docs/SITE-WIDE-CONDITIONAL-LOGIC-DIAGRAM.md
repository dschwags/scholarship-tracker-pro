# Site-Wide Conditional Logic Diagram

## Authentication State Flow

```mermaid
graph TD
    A[User Access] --> B{Session Cookie Exists?}
    B -->|Yes| C[Verify JWT Token]
    B -->|No| D[Redirect to /sign-in]
    
    C -->|Valid| E[User Authenticated]
    C -->|Invalid/Expired| F[Clear Cookie] --> D
    
    E --> G{Check User Menu State}
    G --> H[Show User Menu with Name]
    
    D --> I[Show EnhancedLogin Component (/sign-in)]
    I --> J{Password Toggle Visible?}
    J -->|No| K[WRONG COMPONENT - Check components/auth/enhanced-login.tsx]
    J -->|Yes| L[Login Process]
    
    L --> M{Login Success?}
    M -->|Yes| N[Set Session Cookie with path:/]
    M -->|No| O[Show Error]
    
    N --> P[Redirect to Dashboard]
```

## Dashboard State Flow

```mermaid
graph TD
    A[Dashboard Load] --> B{Session Valid?}
    B -->|No| C[Redirect to Sign In]
    B -->|Yes| D[Fetch User Data]
    
    D --> E[Load Scholarships]
    D --> F[Load Financial Goals]
    
    F --> G{Goals Context Connected?}
    G -->|No| H[Financial Goals Modal Shows "No goals yet"]
    G -->|Yes| I[Display Existing Goals]
    
    E --> J[Show Dashboard Content]
```

## Critical State Dependencies

### 1. Session Management
- **Cookie Path**: MUST be `path: '/'` for all routes
- **Cookie Scope**: HttpOnly, Secure, SameSite: 'lax'
- **Expiration**: 24 hours
- **Critical Points**: Sign-out accidentally triggered
- **DISCOVERED**: POST /settings causing session deletion - specific pattern found
- **Pattern**: GET /settings works → unknown POST trigger → session cookie deleted
- **INVESTIGATION**: All 3 settings forms have proper onSubmit handlers (profile, password, email)
- **MYSTERY**: POST /settings not from form submissions - must be from another source

### 2. User Menu State
- **Dependencies**: `/api/user` endpoint success
- **Triggers**: SWR revalidation on route changes
- **Failure Mode**: Shows "Sign In/Sign Up" instead of user info
- **CONFIRMED DIAGNOSIS**: SWR cache staleness, not session loss
- **USER CONFIRMED FIXES**: Page refresh, navigation clicks, waiting all work
- **ROOT CAUSE**: SWR not revalidating `/api/user` consistently on route changes
- **FIX ATTEMPTED**: Enhanced SWR config - refreshInterval: 30000, dedupingInterval: 500, keepPreviousData: true
- **USER VALIDATION RESULT**: ❌ FAILED - Session still being deleted, POST /dashboard still clearing cookies
- **STATUS**: Root cause still unknown - not SWR cache issue

### 3. Financial Goals Modal
- **Dependencies**: `useGoals()` context
- **Critical**: Must use shared context, not local state
- **Failure Mode**: Shows "No financial goals yet" despite existing data

### 4. Password Toggle ✅ RESOLVED
- **CRITICAL DISCOVERY**: Was debugging WRONG component (app/(login)/login.tsx)
- **ACTUAL COMPONENT**: components/auth/enhanced-login.tsx (used by /sign-in)
- **ROOT CAUSE**: Architecture documentation was incorrect
- **FIX APPLIED**: Modified correct component with Eye/EyeOff toggle
- **USER VALIDATION RESULT**: ✅ SUCCESS - Password toggle working
- **LESSON**: Always verify component usage with Phase 0 Reality Check

## BugX Validation Checklist

### Pre-Task Validation
- [ ] Check authentication state is stable
- [ ] Verify no forms accidentally trigger sign-out
- [ ] Confirm context connections are intact
- [ ] Test critical user flows

### Post-Task Validation  
- [ ] Run project and test each affected component
- [ ] Check browser console for errors
- [ ] Verify no regressions in unrelated features
- [ ] Test edge cases (logout/login cycle)

### Emergency Rollback Triggers
- [ ] Session cookies being deleted unexpectedly
- [ ] User menu showing sign-in buttons after login
- [ ] Financial goals modal losing data connection
- [ ] Any form submission causing logout

## Component State Map

```
Header (UserMenu)
├── Depends on: /api/user SWR hook
├── Session State: Via cookies()
└── Critical: Must not trigger signOut accidentally

Dashboard
├── Financial Goals Modal
│   ├── Depends on: useGoals() context  
│   └── Critical: Must use shared state
├── Scholarship Table
└── Stats Section

Settings
├── Account Settings
├── Financial Settings
└── Security Settings
    └── Critical: Form submissions must not clear session

EnhancedLogin Form (components/auth/enhanced-login.tsx)
├── Password Input ✅ WORKING
│   ├── Depends on: Eye/EyeOff icons ✅ IMPORTED
│   └── Toggle Button: useState + dynamic type switching ✅ IMPLEMENTED
└── Authentication Action
    └── Critical: Must set session with path: '/'

🚨 ORPHANED: app/(login)/login.tsx - NOT USED BY ANY ROUTE
```

## Quick Debug Commands

```bash
# ✅ CORRECTED: Check password toggle in actual component
curl -s http://localhost:3000/sign-in | grep -A10 -B5 "password"

# ✅ NEW: Verify correct component is being used
grep -r "EnhancedLogin" app/(login)/

# ✅ CRITICAL: Check for orphaned components
grep -r "import.*Login" app/ components/

# Test session endpoint  
curl -s http://localhost:3000/api/user

# Check authentication flow
grep -r "Session cookie exists" <(get_run_project_output 100 5)

# Check for settings POST trigger (DISCOVERED)
grep -A5 -B5 "POST /settings" <(get_run_project_output 100 5)

# Monitor session deletion pattern (DISCOVERED)
grep -A3 -B3 "Session cookie exists: false" <(get_run_project_output 100 5)

# Verify financial goals context
grep -r "useGoals" components/
```

## Credit-Saving Rules

1. **ALWAYS** test the actual issue first before claiming it's fixed
2. **VERIFY** each component in isolation before integration testing
3. **CHECK** for regressions in related components
4. **USE** this diagram to trace dependencies before making changes
5. **RUN** BugX validation after every critical change

## Known Anti-Patterns

❌ **Don't**: Claim fixes without testing in browser
❌ **Don't**: Make changes without understanding dependencies  
❌ **Don't**: Skip regression testing on related components
❌ **Don't**: Assume local state works when context is needed

✅ **Do**: Test each fix in isolation
✅ **Do**: Trace dependencies using this diagram
✅ **Do**: Run full validation before claiming completion
✅ **Do**: Check logs for unexpected session deletions