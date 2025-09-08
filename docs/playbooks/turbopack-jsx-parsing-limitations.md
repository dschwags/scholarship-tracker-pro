# Turbopack JSX Parsing Limitations & Solutions

## Overview
This playbook documents critical JSX parsing limitations in Next.js 15 with Turbopack and proven solutions to avoid compilation errors.

## The Problem
**Error Signature:**
```
Turbopack error: Unexpected token 'div'. Expected jsx identifier
```

**Root Cause:** Turbopack has difficulty parsing complex React Fragment nesting patterns, particularly when:
1. Using `<React.Fragment>` or `<>` inside `.map()` functions
2. Nested fragments contain multiple conditional rendering blocks
3. Complex JSX structures exceed Turbopack's parser threshold

## Real-World Example That Fails
```jsx
// ❌ This pattern causes Turbopack parsing errors
{scholarships.map(scholarship => (
  <React.Fragment key={scholarship.id}>
    <div className="scholarship-row">
      {/* Complex nested content */}
      {expandedView === scholarship.id && (
        <div className="expanded-panel">
          {/* More complex JSX */}
        </div>
      )}
    </div>
  </React.Fragment>
))}
```

## Proven Solutions

### 1. Component Architecture Approach (Recommended)
Break monolithic components into focused, single-responsibility components:

```jsx
// ✅ Extract complex JSX into separate components
import { ScholarshipRow } from './scholarship-row';
import { QuickViewPanel } from './quick-view-panel';

// Main component stays clean
{scholarships.map(scholarship => (
  <ScholarshipRow 
    key={scholarship.id} 
    scholarship={scholarship}
    onToggleView={handleToggleView}
  />
))}

// Complex logic lives in focused components
export function ScholarshipRow({ scholarship, onToggleView }) {
  return (
    <div className="scholarship-row">
      {/* Simplified structure */}
      {expandedView === scholarship.id && (
        <QuickViewPanel scholarship={scholarship} />
      )}
    </div>
  );
}
```

### 2. Alternative Patterns That Work
```jsx
// ✅ Use div instead of Fragment in maps
{items.map(item => (
  <div key={item.id}>
    {/* Complex content */}
  </div>
))}

// ✅ Move conditional logic outside JSX
{items.map(item => {
  const isExpanded = expandedId === item.id;
  const expandedContent = isExpanded ? <ExpandedView item={item} /> : null;
  
  return (
    <div key={item.id}>
      <ItemRow item={item} />
      {expandedContent}
    </div>
  );
})}
```

## Prevention Checklist

### Before Writing Complex JSX:
- [ ] Are you nesting `<React.Fragment>` inside `.map()`?
- [ ] Do you have 3+ levels of conditional rendering?
- [ ] Is the component over 200 lines with complex JSX?
- [ ] Are you using fragments with multiple children in loops?

### If Any Above Are True:
- [ ] Extract complex sections into separate components
- [ ] Use `div` instead of `Fragment` in map functions
- [ ] Move conditional logic to separate variables
- [ ] Test compilation after each major JSX change

## Testing Strategy
```bash
# Test compilation frequently during development
npm run build

# Watch for specific error patterns
# "Unexpected token 'div'. Expected jsx identifier"
# "Expected jsx identifier" (general fragment issues)
```

## Component Architecture Benefits
1. **Turbopack Compatibility**: Avoids parser limitations
2. **Maintainability**: Easier to debug and modify
3. **Reusability**: Components can be used across projects
4. **Testing**: Isolated components are easier to test
5. **Performance**: Better code splitting opportunities

## Migration Strategy
When converting existing monolithic components:

1. **Identify Boundaries**: Look for logical sections (rows, panels, cards)
2. **Extract Incrementally**: Move one section at a time
3. **Preserve Props**: Maintain existing prop interfaces
4. **Test After Each**: Compile after each component extraction
5. **Document Patterns**: Note successful patterns for reuse

## Future Development Guidelines
- **Start with Components**: Begin new features as separate components
- **Avoid Deep Nesting**: Keep JSX structures flat when possible
- **Test Early**: Run builds frequently during development
- **Document Patterns**: Record successful JSX patterns for team reference

## Related Issues
- Next.js Issue #[number] (if applicable)
- Turbopack JSX Parser Limitations
- React Fragment Best Practices

---
*This playbook was developed through real-world debugging of a comprehensive dashboard implementation. The component architecture solution resolved critical parsing errors while maintaining 100% feature parity.*