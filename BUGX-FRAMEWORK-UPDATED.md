# BugX Framework - Enhanced with Legacy Compatibility Analysis

## Phase 0: Reality Check (MANDATORY)

### Step 1: Verify the Issue Actually Exists
- Never assume the problem description is accurate
- Reproduce the issue independently 
- Document exact error messages and conditions
- Confirm the issue persists across different scenarios

### Step 2: Identify Root Cause Through Architecture Validation
- **INFINITE LOOP DIAGNOSTIC PROTOCOL**: Systematic analysis for persistent re-rendering issues
  - React useEffect dependency arrays causing cascading updates
  - State setters triggering other state setters in useEffect chains
  - Props changing on every render due to non-memoized objects/functions
  - SWR/API calls triggering state updates that cause re-fetching
  - Component re-mounting due to key changes or parent re-renders
  - Context value changes causing all consumers to re-render
  - Circular data dependencies (A depends on B, B depends on A)
- **LEGACY COMPATIBILITY ANALYSIS**: Check for mismatches between old and new system components
  - Authentication token formats (JWT vs session cookies)
  - Database schema changes (missing columns, data types)
  - API endpoint changes (parameter formats, response structures)
  - Client-server architecture mismatches (SSR vs CSR)
  - Session management incompatibilities
- Examine system interactions and data flow
- Look for circular dependencies or infinite loops
- Identify performance bottlenecks and resource conflicts

### Step 3: Classify the Problem Type
- **INFINITE_LOOP**: React re-rendering loops or cascading state updates
- **FIX_EXISTING**: Bug in current code requiring direct fixes
- **LEGACY_INCOMPATIBILITY**: Outdated data/accounts incompatible with new architecture
- **ARCHITECTURE_MISMATCH**: System design conflicts requiring structural changes
- **DATA_CORRUPTION**: Invalid or corrupted data causing system failures
- **PERFORMANCE_DEGRADATION**: Resource exhaustion or optimization issues

### Step 4: Apply Systematic Credit Protection Approach
- **For INFINITE_LOOP**: Identify and fix root cause - memoize values, fix dependencies, break circular updates
- **For LEGACY_INCOMPATIBILITY**: Nuclear option - wipe and recreate affected data
- **For FIX_EXISTING**: Targeted code fixes with proper testing
- **For ARCHITECTURE_MISMATCH**: Systematic refactoring with migration strategy
- **For DATA_CORRUPTION**: Data cleanup and validation implementation
- Never make assumptions about the cause
- Test each fix independently
- Verify resolution before moving to next issue

## Phase 1: Infinite Loop Analysis Protocol

### Immediate Diagnostics
1. **Error Pattern Recognition**
   - "Maximum update depth exceeded" - React infinite re-render
   - "Too many re-renders" - React state update loops
   - Console flooding with repeated logs - Component mounting/unmounting loops
   - High CPU usage in browser - Continuous calculation loops

2. **Source Location Identification**
   - Check React DevTools Profiler for hot components
   - Look for useEffect without proper dependencies
   - Find state setters called within render cycles
   - Identify components that re-mount frequently

3. **Critical Dependency Analysis**
   - **useEffect dependencies**: Objects/arrays created inline causing new references
   - **useMemo/useCallback dependencies**: Missing or incorrect dependency arrays
   - **Props drilling**: Parent re-rendering due to changing props
   - **Context providers**: Values changing on every render

### Root Cause Categories

#### A. State Update Cascades
```typescript
// ❌ INFINITE LOOP PATTERN
useEffect(() => {
  setStateA(computeFromB(stateB));
}, [stateB]);

useEffect(() => {
  setStateB(computeFromA(stateA));
}, [stateA]); // Circular dependency!

// ✅ FIXED PATTERN
const derivedValue = useMemo(() => {
  return computeFromB(stateB);
}, [stateB]);
```

#### B. Non-Memoized Dependencies
```typescript
// ❌ INFINITE LOOP PATTERN
const fetchData = () => fetch('/api/data'); // New function every render
useEffect(() => {
  fetchData().then(setData);
}, [fetchData]); // Always different reference!

// ✅ FIXED PATTERN
const fetchData = useCallback(() => fetch('/api/data'), []);
useEffect(() => {
  fetchData().then(setData);
}, [fetchData]);
```

#### C. SWR/API Refetch Loops
```typescript
// ❌ INFINITE LOOP PATTERN
const { data } = useSWR('/api/user', fetcher);
useEffect(() => {
  if (data) {
    setUser(data); // Triggers re-render, may cause SWR to refetch
  }
}, [data]);

// ✅ FIXED PATTERN
const { data } = useSWR('/api/user', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 5000
});
```

### Systematic Fix Protocol

1. **Identify Loop Source** (5 credits max)
   - Add console.log with unique identifiers in suspected components
   - Use React DevTools to track re-render frequency
   - Check dependency arrays in all hooks

2. **Apply Targeted Fix** (10 credits max)
   - Memoize objects and functions that change unnecessarily
   - Fix incorrect useEffect dependencies
   - Break circular state update chains
   - Add proper keys to lists to prevent re-mounting

3. **Verify Resolution** (5 credits max)
   - Confirm error no longer appears in console
   - Check React DevTools shows stable render count
   - Test with user interactions to ensure stability

## Common Legacy Compatibility Issues

### Authentication & Session Management
- **Symptom**: Infinite loops, "Maximum update depth exceeded"
- **Root Cause**: Mixed authentication systems (legacy sessions + new JWT)
- **Solution**: Complete account recreation or session migration

### Database Schema Evolution  
- **Symptom**: Missing columns, type mismatches, constraint violations
- **Root Cause**: Database migrations not applied or partially completed
- **Solution**: Fresh database with current schema + data migration

### API Contract Changes
- **Symptom**: Unexpected response formats, missing fields
- **Root Cause**: Client expecting old API responses, server providing new format
- **Solution**: API versioning or client update to match new contracts

### Client-Server Architecture Misalignment
- **Symptom**: Hydration mismatches, duplicate requests, state conflicts
- **Root Cause**: SSR/CSR expectations don't match actual implementation
- **Solution**: Unified state management and consistent rendering approach

## BugX Success Criteria
- Issue must be completely resolved, not just mitigated
- Root cause must be identified and documented
- Solution must prevent similar issues in the future
- System performance must be equal or better than before
- No new issues should be introduced by the fix

## Example: Authentication Legacy Compatibility

**Problem**: Infinite render loops on dashboard load
**BugX Analysis**:
1. **Verify**: Confirmed infinite "Maximum update depth exceeded" errors
2. **Root Cause**: Legacy session tokens + new JWT verification creating timing conflicts
3. **Classify**: LEGACY_INCOMPATIBILITY - old authentication incompatible with new backend
4. **Solution**: Nuclear option - delete all legacy accounts, recreate with new authentication

**Result**: Clean authentication state, stable performance, no infinite loops