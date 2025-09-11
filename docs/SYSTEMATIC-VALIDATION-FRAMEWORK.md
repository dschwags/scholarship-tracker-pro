# Systematic Validation Framework

## Pre-Change Validation (Reference Site-Wide Logic)

### Step 1: Diagram Consultation
Before making ANY change, I will:

```bash
1. Open docs/SITE-WIDE-CONDITIONAL-LOGIC-DIAGRAM.md
2. Locate the component/system I'm changing
3. Identify ALL dependencies listed in the diagram
4. Note the "Critical Points" and "Failure Modes"
5. Plan validation tests for each dependency
```

### Step 2: State Path Tracing
Using the diagram, trace the expected flow:
```
User Action → State Change → UI Update → Dependencies
```

Example for Password Toggle:
```
Site Logic Reference: "Login Form → Password Input → Eye/EyeOff icons → CSS z-index for visibility"
Dependencies: lucide-react imports, CSS positioning, button event handlers
Critical Points: Z-index conflicts, icon visibility
```

## During-Change Validation (Live Updates)

### Step 3: Real-Time Testing
For each change, test the EXACT flow from the diagram:

```bash
# Authentication Flow Test
curl -s http://localhost:3000/api/user | jq '.email // "NO USER"'
# Expected from diagram: Should return email or "NO USER"

# Session Cookie Test  
curl -s -c cookies.txt -b cookies.txt http://localhost:3000/sign-in
curl -s -b cookies.txt http://localhost:3000/api/user
# Expected from diagram: Cookie should persist across requests

# UI Component Test
curl -s http://localhost:3000/sign-in | grep -c "eye\|Eye"
# Expected from diagram: Should find eye icon references
```

### Step 4: Diagram Updates (Live)
As I discover new dependencies or behaviors, immediately update:
```
- Add new state transitions found
- Update failure modes discovered  
- Add new validation commands that work
- Note credit-saving shortcuts found
```

## Post-Change Validation (Comprehensive)

### Step 5: Full State Flow Validation
Test the COMPLETE flow shown in diagram:

```mermaid
User Access → Session Check → UI State → Component Render
```

### Step 6: Regression Testing
Check ALL related flows in the diagram:
```bash
# If I changed authentication, test:
- User menu display
- Dashboard access  
- Settings navigation
- Any other auth-dependent features
```

## Validation Commands Library

### Authentication State Validation
```bash
# Test session existence (from diagram: "Session Cookie Exists?")
grep "Session cookie exists" <(get_run_project_output 30 5) | tail -3

# Test user menu state (from diagram: "Show User Menu with Name")  
curl -s http://localhost:3000/api/user | jq -r '.name // "NO NAME"'

# Test authentication persistence (from diagram: "Cookie Path: MUST be path:/")
curl -s -I http://localhost:3000/api/user | grep -i "set-cookie.*path"
```

### UI Component Validation  
```bash
# Test password toggle visibility (from diagram: "CSS z-index and positioning")
curl -s http://localhost:3000/sign-in | grep -A5 -B5 'type.*password' | grep -c 'eye\|Eye'

# Test financial goals context (from diagram: "useGoals() context")
grep -r "useGoals" components/dashboard/ | wc -l
```

### State Context Validation
```bash
# Test context connections (from diagram: "Goals Context Connected?")
grep -A10 -B10 "useGoals" components/goals/financial-goals-modal.tsx

# Test shared state vs local state (from diagram: "Must use shared context")
grep -c "useState.*goals\|goals.*useState" components/ -R
```

## Diagram Update Protocol

### When to Update the Diagram
- ✅ Found new dependency not documented
- ✅ Discovered new failure mode  
- ✅ Added new validation command that works
- ✅ Changed component architecture
- ✅ Fixed a state flow issue

### How to Update  
1. **Add to Component State Map**: New components and their dependencies
2. **Update State Flow**: New transitions or conditions
3. **Add to Validation Commands**: New working test commands  
4. **Update Credit-Saving Rules**: New patterns discovered

## Example: Enhanced Validation for Password Toggle

### Pre-Change (Consult Diagram)
```
From Site Logic: "Password Toggle → Dependencies: Eye/EyeOff icons → Critical: CSS z-index"
Plan: Test icon import, CSS rendering, button visibility
```

### During Change
```bash
# Test 1: Icon import validation
grep "Eye.*EyeOff" app/\(login\)/login.tsx
# Expected: Should find both imports

# Test 2: Component rendering  
run_project
curl -s http://localhost:3000/sign-in | grep -A10 'type.*password'
# Expected: Should see password input and button structure

# Test 3: CSS validation
curl -s http://localhost:3000/sign-in | grep -c 'absolute.*right-0'
# Expected: Should find positioning classes
```

### Post-Change (Update Diagram)
```
Add to diagram: "Password Toggle Validation Commands" 
Update: "Known working tests for icon visibility"
Add: "CSS class patterns that work for positioning"
```

## Integration with Task Management

### Task Status Requires Diagram Validation
- **in_progress**: Must reference diagram for dependencies
- **validation**: Must run diagram-specified tests  
- **completed**: Must update diagram with findings

### Example Task with Diagram Integration
```
Task: Fix password visibility toggle
Diagram Reference: Section "Login Form → Password Input → Critical: CSS z-index"
Pre-Change Plan: Test icon imports, CSS positioning, event handlers
Validation Commands: [list from diagram]
Post-Change Update: Add working CSS pattern to diagram
```

This framework ensures I actually USE the diagram systematically instead of just creating it once.