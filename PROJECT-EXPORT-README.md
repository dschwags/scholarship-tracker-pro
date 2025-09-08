# 🎓 Scholarship Tracker Pro - Complete Project Export

**Export Date:** September 8, 2025  
**Project Status:** Active Development - Financial Planning System Rebuild Phase  
**Credits Available:** 50 limited-time + 100 daily refresh  

---

## 📚 TABLE OF CONTENTS

1. [AI Reference Documentation](#ai-reference-documentation)
2. [Human-Readable Project Overview](#human-readable-project-overview)
3. [Current System Architecture](#current-system-architecture)
4. [Known Issues & Bugs](#known-issues--bugs)
5. [Future Development Roadmap](#future-development-roadmap)
6. [Conditional Logic Diagrams](#conditional-logic-diagrams)
7. [File Structure Guide](#file-structure-guide)

---

## 🤖 AI REFERENCE DOCUMENTATION

### **System Context for AI Assistants**

This is a Next.js 15 (Turbopack) scholarship tracking application with the following technical stack:
- **Frontend:** React 18, TypeScript, TailwindCSS
- **Backend:** Next.js API routes, Drizzle ORM
- **Database:** PostgreSQL (production), SQLite (development)
- **Authentication:** Custom session-based auth
- **UI Components:** shadcn/ui + custom components
- **Key Features:** Dark mode, parent-student linking, financial planning, scholarship tracking

### **Current Development Context**

**CRITICAL:** The financial planning system is in a broken state and requires complete rebuild. User has experienced repeated "fix one thing, break another" cycles. Template system exists but doesn't function - selecting "Technology & Equipment" still shows generic college expenses instead of tech-specific categories.

**Working Systems:**
- Authentication & user management ✅
- Scholarship CRUD operations ✅  
- Dashboard & statistics ✅
- Parent-student linking ✅
- Export/Import functionality ✅
- Settings management ✅
- Dark mode theming ✅

**Broken/Incomplete Systems:**
- Financial planning template system ❌
- Simple Goal vs Detailed Breakdown logic ❌
- Planning Mode access (only works via Calculation Method dropdown) ❌
- Custom field persistence ❌
- Conditional registration fields ❌

### **Code Quality Issues**

**File Status:**
- `enhanced-financial-form.tsx` - Recently rebuilt, functional but incomplete
- `enhanced-financial-form-broken.tsx` - Backup of previous broken version
- `financial-goals-modal.tsx` - Needs template integration fixes
- `goals-types.ts` - Has new template configs but not fully connected

**Development Patterns:**
- Use `search_replace_batch` for large files (>200 lines)
- Use `write_file` for small files or major restructuring
- Always `read_file` before editing to understand current state
- Check `lint_diagnostic` after changes
- Test with `run_project` before marking tasks complete

**Common Pitfalls:**
- JSX parsing errors with improper comment structure
- Template selection not triggering expense category changes
- State management conflicts between different calculation methods
- Dark mode CSS specificity issues
- Missing imports after component restructuring

### **AI Task Planning Guidelines**

1. **Always use task_update tool** for complex multi-step work
2. **Mark tasks in_progress before starting** work
3. **Complete tasks fully** before marking as completed
4. **Test functionality** with run_project before completion
5. **Document any new patterns** discovered during implementation

### **Key Technical Constraints**

- **Turbopack JSX Parser:** Sensitive to comment structure, avoid complex JSX comments
- **Next.js 15:** Uses new caching patterns, be aware of route handlers
- **Dark Mode:** Uses CSS custom properties, ensure dark: variants work
- **TypeScript:** Strict mode enabled, fix type errors immediately
- **Database:** Drizzle ORM with PostgreSQL schemas, migrations required for schema changes

---

## 👥 HUMAN-READABLE PROJECT OVERVIEW

### **What This App Does**

Scholarship Tracker Pro helps high school and college students:
- **Track scholarship applications** and deadlines
- **Plan their education funding** with detailed breakdowns
- **Connect with parents/counselors** for collaborative planning
- **Export their data** for sharing or backup
- **Set financial goals** and track progress

### **What's Working Well**

✅ **Student can create an account** and log in securely  
✅ **Add scholarships** with all the details (amount, deadline, requirements)  
✅ **See their dashboard** with stats and progress tracking  
✅ **Switch between light/dark themes** smoothly  
✅ **Export their scholarship data** to PDF or share templates  
✅ **Link with parents** for collaborative tracking  
✅ **Manage account settings** and preferences  

### **What's Currently Broken**

❌ **Financial planning is confusing** - templates don't work as expected  
❌ **"Technology & Equipment" template** shows generic college expenses instead of laptop/software costs  
❌ **Simple Goal vs Detailed Breakdown** - user can't easily switch between modes  
❌ **Custom fields disappear** - users can't reliably add their own expense categories  
❌ **Registration process lacks intelligence** - doesn't adapt to user type (student/counselor/parent)  

### **What We're Planning to Build**

🚀 **Smarter Financial Planning**
- Templates that actually change what expenses you see
- AI suggestions for expenses based on your major/situation
- Easy switching between "quick goal" and "detailed planning"
- Ability to add your own custom categories that stick around

🚀 **Better User Experience**
- Registration that adapts to whether you're a student, parent, or counselor
- Clear visual organization with color-coded sections
- Help tooltips throughout the interface
- Mobile-friendly responsive design

🚀 **Advanced Features**
- Usage monitoring for AI services to avoid surprise costs
- Smart caching to minimize AI API calls
- Collaborative planning with real-time updates
- Advanced export options with custom formatting

---

## 🏗️ CURRENT SYSTEM ARCHITECTURE

### **Database Schema (PostgreSQL)**

```sql
-- Core tables
users (id, name, email, role, preferences, auth_data)
scholarships (id, user_id, title, amount, deadline, status, requirements)
financial_goals (id, user_id, title, target_amount, current_amount, breakdown)
user_connections (parent_id, student_id, status, permissions)

-- Supporting tables  
user_sessions (session_id, user_id, expires_at)
password_resets (token, user_id, expires_at)
export_logs (id, user_id, export_type, created_at)
```

### **Component Architecture**

```
app/
├── (login)/           # Authentication pages
├── dashboard/         # Main dashboard
├── settings/          # User settings
├── api/              # Backend API routes
└── [other-routes]/   # Additional app pages

components/
├── auth/             # Login/signup components
├── dashboard/        # Dashboard sections & widgets
├── goals/            # Financial planning (NEEDS REBUILD)
├── scholarship/      # Scholarship management
├── settings/         # Settings panels
├── ui/              # Reusable UI components
└── [other-dirs]/    # Supporting components

lib/
├── auth/            # Authentication logic
├── db/              # Database queries & schema
├── actions/         # Server actions
└── utils/           # Helper functions
```

### **Key Technical Decisions**

- **Session-based auth** instead of JWT for better security
- **Server components** for dashboard data fetching
- **Client components** for interactive forms
- **Drizzle ORM** for type-safe database queries
- **TailwindCSS** with CSS custom properties for theming
- **shadcn/ui** for consistent component library

---

## 🐛 KNOWN ISSUES & BUGS

### **Critical Issues (Blocking User Experience)**

1. **Template System Non-Functional**
   - **Issue:** Selecting "Technology & Equipment" template shows generic expenses (Tuition, Housing) instead of tech-specific categories (Laptop, Software)
   - **Root Cause:** Template selection stores value but doesn't trigger expense category regeneration
   - **Files Affected:** `enhanced-financial-form.tsx`, `goals-types.ts`
   - **Status:** Partially fixed - template configs exist but not connected to UI rendering

2. **Planning Mode Access Broken**
   - **Issue:** Planning Mode buttons don't work, only accessible via "Calculation Method" dropdown
   - **Root Cause:** Planning Mode logic was disabled during previous fixes
   - **User Quote:** "Simple goals IS ONLY available via calculation method"
   - **Status:** Hidden Planning Mode section to avoid confusion

3. **Calculation Method Default Wrong**
   - **Issue:** Form defaults to "Simple Goal" when users expect "Detailed Breakdown"
   - **Root Cause:** `formData.calculationMethod || 'manual-total'` should be `'detailed-breakdown'`
   - **Status:** FIXED in recent session

### **Medium Priority Issues**

4. **Custom Fields Don't Persist**
   - **Issue:** Users can add custom expense categories but they disappear on refresh
   - **Root Cause:** No database persistence for user-defined fields
   - **Status:** Feature exists but not connected to backend storage

5. **Registration Form Not Adaptive**
   - **Issue:** All users see same fields regardless of role (Student/Parent/Counselor)
   - **Root Cause:** No conditional logic implemented for different user types
   - **Status:** Mockups exist but not implemented

6. **Mobile Responsiveness Issues**
   - **Issue:** Financial planning form difficult to use on mobile devices
   - **Root Cause:** Fixed widths and desktop-first design approach
   - **Status:** Partially responsive but needs optimization

### **Low Priority Issues**

7. **Dark Mode Inconsistencies**
   - **Issue:** Some components don't properly adapt to dark theme
   - **Root Cause:** Missing `dark:` variants in TailwindCSS classes
   - **Status:** Most components work, occasional edge cases

8. **Export PDF Formatting**
   - **Issue:** Exported PDFs sometimes have layout issues
   - **Root Cause:** CSS media queries not optimized for print
   - **Status:** Functional but could be improved

### **Performance Issues**

9. **Dashboard Loading Speed**
   - **Issue:** Dashboard can be slow with large numbers of scholarships
   - **Root Cause:** No pagination or virtualization
   - **Status:** Acceptable for current user base but will need optimization

10. **Real-time Updates**
    - **Issue:** Parent-student collaboration doesn't update in real-time
    - **Root Cause:** No WebSocket or polling mechanism
    - **Status:** Manual refresh required

---

## 🚀 FUTURE DEVELOPMENT ROADMAP

### **Phase 1: Financial Planning System Rebuild (18-22 credits)**

**Timeline:** Next 3-4 days with daily credit refresh  
**Status:** Planned, ready to start  

#### **1.1 Planning & Architecture (2-3 credits)**
- Create complete conditional logic diagrams
- Design new component architecture
- Define visual design specifications
- Map integration points with existing system

#### **1.2 Core System Rebuild (8-10 credits)**
- **New Template Engine**
  ```
  Template Selection → Dynamic Expense Categories
  
  "Technology & Equipment" → [Laptop, Software, Accessories, Maintenance]
  "Study Abroad" → [Program Fees, Travel, Housing, Visa]
  "Books & Supplies" → [Textbooks, Lab Fees, Digital Resources]
  ```

- **Calculation Method Logic**
  ```
  User Choice → Form Mode
  
  "Enter Total Amount" → Simple Goal (Target $ + Current $ = Gap)
  "Detailed Breakdown" → Full Planning (Categories + Funding = Analysis)
  ```

- **Custom Field System**
  ```
  User Input → Database Storage → Template Persistence
  
  Allow users to:
  - Add custom expense categories
  - Define personal funding sources  
  - Save as personal templates for reuse
  ```

#### **1.3 Enhanced User Experience (4-5 credits)**
- Color-coded visual sections (Light Yellow/Orange/Purple as requested)
- Comprehensive help system with ? tooltips
- Mobile-responsive design optimization
- Dark mode consistency improvements

#### **1.4 Integration & Testing (3-4 credits)**
- Connect new system to existing dashboard
- Comprehensive testing of all user flows
- Performance optimization
- Documentation updates

### **Phase 2: AI Integration & Smart Features (6-8 credits)**

**Timeline:** Following financial planning rebuild completion

#### **2.1 Smart Suggestions System (3-4 credits)**
- **Hybrid AI Approach**
  ```
  User Context Analysis → Suggestion Generation
  
  Input: "High School Student, Engineering Major"
  Output: [Lab Equipment Fee, Graphing Calculator, Engineering Software]
  
  Cost: $0 using free tiers (Google Gemini Flash + Hugging Face)
  ```

- **Usage Monitoring Dashboard**
  ```
  AI Service Tracking → Alert System → Fallback Logic
  
  Monitor: API call counts, token usage, rate limits
  Alert: Email + browser notifications at 50%, 75%, 90% usage
  Fallback: Switch services or use rule-based suggestions
  ```

#### **2.2 Advanced Conditional Logic (2-3 credits)**
- **Registration Flow Enhancement**
  ```
  Role Selection → Dynamic Fields
  
  Student → Education level → Contextual school fields
  Parent → No education fields, child linking
  Counselor → Institution/Organization field
  ```

- **Context-Aware Templates**
  ```
  User Profile → Smart Template Selection
  
  "Graduate Student + Psychology" → Thesis/Research templates
  "High School + Rural Area" → Local scholarship focus
  "Transfer Student + Engineering" → Transfer-specific planning
  ```

#### **2.3 Collaboration Features (1-2 credits)**
- Real-time updates for parent-student shared goals
- Counselor dashboard for managing multiple students
- Notification system for deadline reminders

### **Phase 3: Advanced Features & Optimization (4-6 credits)**

**Timeline:** After core systems stabilized

#### **3.1 Advanced Analytics**
- Success rate tracking and predictions
- Scholarship recommendation engine
- Financial planning outcome analysis

#### **3.2 External Integrations**
- FAFSA data import capability
- College Board API integration
- Third-party scholarship database connections

#### **3.3 Enterprise Features**
- Multi-school counselor management
- Bulk student operations
- Advanced reporting and insights

---

## 🗺️ CONDITIONAL LOGIC DIAGRAMS

### **Financial Planning System Logic**

```
START: User Opens Financial Planning
│
├── Template Selection
│   ├── "Technology & Equipment"
│   │   └── Expenses: [💻 Laptop, 🔧 Software, ⌨️ Accessories, 🛠️ Maintenance]
│   │   └── Funding: [Scholarships, Family, Employment]
│   │
│   ├── "Study Abroad"
│   │   └── Expenses: [🌍 Program Fees, ✈️ Travel, 🏠 Housing, 📋 Visa]
│   │   └── Funding: [Scholarships, Family, State Grants]
│   │
│   ├── "Books & Supplies"
│   │   └── Expenses: [📚 Textbooks, ✏️ Supplies, 🧪 Lab Fees, 💻 Digital]
│   │   └── Funding: [Scholarships, Family]
│   │
│   └── "Custom/Default"
│       └── Expenses: [🎓 Tuition, 🏠 Housing, 🚗 Transport, 👤 Personal, 📚 Other]
│       └── Funding: [Federal Aid, State Grants, Scholarships, Family]
│
├── Calculation Method Choice
│   ├── "Enter Total Amount" (Simple Goal)
│   │   ├── Input: Target Amount ($)
│   │   ├── Input: Current Amount ($)
│   │   └── Output: Gap Calculation + Basic Recommendations
│   │
│   └── "Detailed Expense & Funding Breakdown"
│       ├── Expense Builder (Template-Driven)
│       │   ├── Required Categories (from template)
│       │   ├── "Add More" for applicable categories
│       │   └── Custom Category Creation
│       │
│       ├── Funding Builder
│       │   ├── Federal Aid (Pell Grant, Loans, Work Study)
│       │   ├── State Grants (with Add More)
│       │   ├── Scholarships (dynamic list)
│       │   ├── Family & Friends Support
│       │   └── Custom Funding Sources
│       │
│       └── Real-time Analysis
│           ├── Total Expenses vs Total Funding
│           ├── Remaining Gap Calculation
│           ├── Recommendation Engine
│           └── Action Item Generation
│
└── Save Options
    ├── Save as Personal Goal
    ├── Share with Parent/Counselor
    ├── Export to PDF
    └── Save as Personal Template
```

### **User Registration Conditional Logic**

```
START: User Begins Registration
│
├── Role Selection
│   ├── "Student"
│   │   ├── Education Level Dropdown
│   │   │   ├── "Currently enrolled (specify school below)"
│   │   │   │   └── SHOW: "Current Institution" field
│   │   │   │   └── PLACEHOLDER: "Enter your current school or university name"
│   │   │   │
│   │   │   ├── "Accepted/Planning to attend (specify school below)"
│   │   │   │   └── SHOW: "Future Institution" field
│   │   │   │   └── PLACEHOLDER: "Enter the school you'll be attending"
│   │   │   │
│   │   │   ├── "Applying to multiple schools"
│   │   │   │   └── HIDE: Institution field
│   │   │   │   └── NOTE: "You can add schools later in your profile"
│   │   │   │
│   │   │   ├── "Community college planning 4-year transfer"
│   │   │   │   └── SHOW: "Current Institution" field
│   │   │   │   └── PLACEHOLDER: "Enter your current community college name"
│   │   │   │
│   │   │   ├── "Military/Veteran pursuing education"
│   │   │   │   └── HIDE: Institution field
│   │   │   │   └── SHOW: Veteran-specific resources note
│   │   │   │
│   │   │   ├── "Adult learner/Returning to school"
│   │   │   │   └── HIDE: Institution field
│   │   │   │   └── SHOW: Adult learner resources note
│   │   │   │
│   │   │   ├── "Working toward specific funding goal"
│   │   │   │   └── HIDE: Institution field
│   │   │   │
│   │   │   ├── "Exploring options to maximize scholarships"
│   │   │   │   └── HIDE: Institution field
│   │   │   │
│   │   │   └── "Other (please describe)"
│   │   │       └── SHOW: Description text field
│   │   │       └── PLACEHOLDER: "Please describe your situation/goal/path"
│   │   │
│   │   └── Standard Fields: [Name, Email, Password, Phone]
│   │
│   ├── "Parent"
│   │   ├── HIDE: Education Level, Institution fields
│   │   ├── SHOW: Standard Fields + Child Linking invitation
│   │   └── NOTE: "You'll be able to link with your student after account creation"
│   │
│   └── "Counselor"
│       ├── HIDE: Education Level field
│       ├── SHOW: "Institution/Organization" field
│       ├── PLACEHOLDER: "Enter your school, organization, or institution name"
│       └── SHOW: Standard Fields
│
└── Account Creation
    ├── Validation Based on Selected Fields
    ├── Welcome Email (Role-Specific)
    └── Redirect to Role-Appropriate Dashboard
```

### **AI Smart Suggestions Logic**

```
START: User Requests Field Suggestions
│
├── Context Analysis
│   ├── User Profile Data
│   │   ├── Education Level (High School, College, Graduate)
│   │   ├── Field of Study/Major
│   │   ├── Location (for local opportunities)
│   │   └── Selected Template
│   │
│   ├── Cache Check
│   │   ├── CACHE HIT → Return Cached Suggestions (0 API calls)
│   │   └── CACHE MISS → Proceed to AI Generation
│   │
│   └── AI Service Selection
│       ├── Primary: Google Gemini Flash (1,500 requests/day free)
│       ├── Secondary: Hugging Face (1,000 requests/month free)
│       └── Fallback: Rule-based suggestions (unlimited, $0)
│
├── Suggestion Generation
│   ├── Engineering Student Context
│   │   ├── Expenses: [Lab Equipment, Software Licenses, Certification Fees]
│   │   ├── Funding: [STEM Scholarships, Engineering Society Grants]
│   │   └── Tips: ["Look into IEEE scholarships", "Check with engineering department"]
│   │
│   ├── Art Student Context
│   │   ├── Expenses: [Art Supplies, Portfolio Development, Exhibition Costs]
│   │   ├── Funding: [Arts Council Grants, Creative Foundation Scholarships]
│   │   └── Tips: ["Document your portfolio digitally", "Join local art societies"]
│   │
│   └── Graduate Student Context
│       ├── Expenses: [Research Materials, Conference Travel, Thesis Costs]
│       ├── Funding: [Research Assistantships, Graduate Fellowships]
│       └── Tips: ["Talk to your advisor about funding", "Apply for conference grants"]
│
├── Usage Monitoring
│   ├── Track API Calls per Service
│   ├── Monitor Token Usage
│   ├── Alert at 50%, 75%, 90% of limits
│   └── Auto-switch services when approaching limits
│
└── Output Processing
    ├── Format for UI Display
    ├── Cache Popular Results
    ├── Log User Acceptance Rates
    └── Improve Suggestions Based on Usage Patterns
```

---

## 📁 FILE STRUCTURE GUIDE

### **Core Application Files**

```
app/
├── layout.tsx                 # Root layout with theme provider
├── page.tsx                   # Landing page
├── globals.css               # Global styles + dark mode CSS variables
├── dashboard/page.tsx        # Main dashboard (WORKING)
├── settings/page.tsx         # User settings (WORKING)
└── api/
    ├── scholarships/route.ts  # Scholarship CRUD API (WORKING)
    └── user/route.ts         # User management API (WORKING)
```

### **Component Organization**

```
components/
├── auth/                     # Authentication components (WORKING)
│   ├── enhanced-login.tsx    # Login form with validation
│   ├── forgot-password-form.tsx
│   └── reset-password-form.tsx
│
├── dashboard/                # Dashboard components (WORKING)
│   ├── main-dashboard.tsx    # Primary dashboard component
│   └── sections/            # Dashboard sections
│       ├── financial-progress.tsx
│       └── scholarship-table.tsx
│
├── goals/                    # Financial planning (NEEDS REBUILD)
│   ├── enhanced-financial-form.tsx        # Recently rebuilt, partially working
│   ├── enhanced-financial-form-broken.tsx # Backup of broken version
│   ├── financial-goals-modal.tsx          # Modal wrapper (needs template integration)
│   └── goals-types.ts                     # Type definitions + new template configs
│
├── scholarship/              # Scholarship management (WORKING)
│   ├── scholarship-creation-form.tsx      # Create/edit scholarships
│   └── scholarship-detail-modal.tsx       # View scholarship details
│
├── settings/                 # Settings panels (WORKING)
│   ├── account-settings.tsx
│   ├── financial-settings.tsx
│   └── [other-settings].tsx
│
└── ui/                      # Reusable UI components (WORKING)
    ├── button.tsx           # shadcn/ui button component
    ├── card.tsx            # shadcn/ui card component
    ├── input.tsx           # shadcn/ui input component
    └── [other-ui].tsx      # Additional UI components
```

### **Backend & Database Files**

```
lib/
├── db/
│   ├── schema.ts            # Database schema definitions (Drizzle ORM)
│   ├── queries.ts           # Database query functions
│   ├── drizzle.ts          # Database connection setup
│   └── migrations/         # Database migration files
│
├── auth/
│   ├── session.ts          # Session management logic
│   ├── middleware.ts       # Auth middleware for API routes
│   └── roles.ts           # User role definitions
│
├── actions/                # Server actions
│   ├── user-management.ts  # User CRUD operations
│   └── user-settings.ts   # Settings management
│
└── utils/
    ├── utils.ts           # General utility functions
    └── password-validation.ts # Password strength validation
```

### **Configuration Files**

```
Root Directory:
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.js      # TailwindCSS configuration
├── drizzle.config.ts       # Database configuration
├── .env                    # Environment variables (local)
├── .env.example           # Environment template
└── middleware.ts          # Next.js middleware for auth
```

### **Documentation Files**

```
docs/
├── DEVELOPMENT-KNOWLEDGE-BASE.md    # Technical documentation
├── UI-DESIGN-STANDARDS.md          # Design system guidelines
├── CONDITIONAL-LOGIC-FLOW-DIAGRAM.md # Logic flow documentation
└── playbooks/                      # Development playbooks
    ├── component-architecture-patterns.md
    └── dark-mode-css-debugging-methodology.md
```

### **File Status Legend**

- ✅ **WORKING** - Fully functional, well-tested
- ⚠️ **PARTIAL** - Working but with known limitations
- ❌ **BROKEN** - Non-functional, needs rebuild
- 📝 **NEEDS UPDATE** - Functional but requires updates for new features

---

## 🎯 IMPLEMENTATION PRIORITIES

### **Immediate (Next Session)**
1. **Financial Planning System Rebuild** - User's primary pain point
2. **Template Functionality** - Make "Technology & Equipment" actually work
3. **Calculation Method Logic** - Fix Simple Goal vs Detailed Breakdown

### **Short Term (Next Week)**
1. **Custom Field Persistence** - Save user-defined categories
2. **Registration Conditional Logic** - Adaptive forms for different user types
3. **Mobile Responsiveness** - Optimize for mobile users

### **Medium Term (Next Month)**
1. **AI Smart Suggestions** - Add intelligent field suggestions
2. **Advanced Analytics** - Success tracking and predictions
3. **Collaboration Features** - Real-time parent-student updates

### **Long Term (Next Quarter)**
1. **External Integrations** - FAFSA, College Board APIs
2. **Enterprise Features** - Multi-school management
3. **Advanced Export Options** - Custom formatting and templates

---

## 🔧 DEVELOPMENT NOTES FOR AI ASSISTANTS

### **Before Starting Any Work:**
1. Read current task list with `task_read`
2. Check project status with `run_project` 
3. Understand file structure with `file_tree`
4. Read relevant files with `read_file` before editing

### **When Working with Financial Planning:**
- The system is in transition - new template configs exist but aren't connected
- Always test template selection changes immediately
- Check both Simple Goal and Detailed Breakdown modes
- Verify $ currency symbols display correctly
- Test "Add More" functionality for applicable categories

### **Common Patterns:**
- Use `task_update` for multi-step tasks
- Mark tasks `in_progress` before starting
- Use `search_replace_batch` for large files
- Use `write_file` for complete rewrites or new files
- Test with `run_project` before marking tasks complete

### **Key Variables to Remember:**
- User has 50 limited-time credits + 100 daily refresh
- Project uses Next.js 15 with Turbopack
- Dark mode uses CSS custom properties
- Database uses Drizzle ORM with PostgreSQL
- Financial planning needs complete rebuild (18-22 credits estimated)

---

**Last Updated:** September 8, 2025  
**Next Planned Update:** After financial planning system rebuild completion  
**Current Credit Status:** 50 available + 100 daily refresh