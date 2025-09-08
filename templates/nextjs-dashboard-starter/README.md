# Next.js Dashboard Starter Template

## Overview
This template provides a pre-configured Next.js dashboard structure with built-in debugging tools, component architecture patterns, and solutions for common development issues.

## What's Included

### 🛠️ Debugging Infrastructure
- **Z-Index Detective Component**: Systematic layer debugging for CSS issues
- **Theme Debugger**: Real-time theme variable inspection
- **CSS Debug Utilities**: Outline, background, and z-index visualization tools
- **Component Diagnostics**: Built-in tools for React component debugging

### 🏗️ Component Architecture
- **Feature-based Organization**: Logical component grouping
- **Container/Presentation Pattern**: Clean separation of concerns
- **Proven Component Patterns**: Battle-tested structures for scalability

### 📚 Knowledge Base
- **Turbopack JSX Limitations**: Documented workarounds and solutions
- **Dark Mode CSS Debugging**: Systematic methodology for theme issues
- **Component Architecture Guide**: Best practices and patterns
- **Common Issues Playbook**: Solutions for frequent development problems

### 🎨 Theme System
- **Dark/Light Mode**: Fully implemented theme switching
- **CSS Custom Properties**: Systematic color variable organization
- **Theme-Aware Components**: All components support both modes

## Quick Start

### 1. Copy Template Structure
```bash
cp -r templates/nextjs-dashboard-starter/* your-new-project/
cd your-new-project
npm install
```

### 2. Initialize Development Environment
```bash
# Run the setup script
./scripts/setup-project.sh

# Start development server
npm run dev
```

### 3. Access Debugging Tools
- Add `<ZIndexDetector />` to any page for CSS layer debugging
- Use `<ThemeDebugger />` for theme variable inspection
- Apply `debug-outlines` class to visualize element structure

## Template Structure

```
your-new-project/
├── components/
│   ├── debug/                    # Debugging utilities
│   │   ├── ZIndexDetector.tsx
│   │   ├── ThemeDebugger.tsx
│   │   └── index.ts
│   ├── ui/                       # Base UI components
│   └── dashboard/                # Feature components
│       ├── sections/
│       └── types.ts
├── docs/
│   ├── playbooks/               # Development playbooks
│   │   ├── turbopack-jsx-parsing-limitations.md
│   │   ├── dark-mode-css-debugging-methodology.md
│   │   └── component-architecture-patterns.md
│   └── known-issues.md          # Project-specific issues
├── styles/
│   ├── globals.css              # Global styles with dark mode fixes
│   ├── debug-utilities.css      # CSS debugging helpers
│   └── theme-variables.css      # Organized theme variables
├── scripts/
│   ├── setup-project.sh         # Project initialization
│   └── debug-helpers.js         # JavaScript debugging tools
└── templates/                   # Additional templates for features
```

## Using the Debugging Tools

### Z-Index Detective
```jsx
import { ZIndexDetector } from '@/components/debug';

// Add to any component experiencing layering issues
function MyComponent() {
  return (
    <div>
      {/* Your component content */}
      <ZIndexDetector testLayer={1000} />
    </div>
  );
}
```

### Theme Debugger
```jsx
import { ThemeDebugger } from '@/components/debug';

// Add anywhere to inspect theme variables
function App() {
  return (
    <div>
      {/* Your app */}
      <ThemeDebugger />
    </div>
  );
}
```

### CSS Debug Utilities
```jsx
// Apply debug classes to visualize layouts
<div className="debug-outlines">
  {/* All child elements will have visible outlines */}
</div>

<div className="debug-backgrounds">
  {/* All child elements will have colored backgrounds */}
</div>
```

## Development Workflow

### 1. Starting New Features
- Check `docs/playbooks/` for relevant patterns
- Use component architecture from `component-architecture-patterns.md`
- Follow Turbopack JSX guidelines to avoid parsing errors

### 2. Debugging CSS Issues
- Start with browser DevTools
- If issue persists, use Z-Index Detective methodology
- Document solutions in `docs/known-issues.md`

### 3. Component Development
- Follow single responsibility principle
- Use container/presentation pattern
- Test compilation frequently with complex JSX

### 4. Theme Implementation
- Use CSS custom properties consistently
- Test both light and dark modes
- Use Theme Debugger for variable verification

## Common Solutions Pre-Implemented

### Dark Mode Global Fixes
```css
/* Already included in globals.css */
html, body, #__next {
  background-color: hsl(240 10% 3.9%) !important;
}
```

### Turbopack JSX Safe Patterns
```jsx
// Template components follow safe patterns
{items.map(item => (
  <ItemComponent key={item.id} item={item} /> // ✅ Safe
))}

// Avoid this pattern:
{items.map(item => (
  <React.Fragment key={item.id}>     // ❌ Can cause parsing errors
    <ComplexJSX />
  </React.Fragment>
))}
```

### Component Architecture
- Feature-based organization implemented
- Container/presentation separation
- Proper prop interfaces with TypeScript

## Customization

### Adding New Debugging Tools
1. Create component in `components/debug/`
2. Export from `components/debug/index.ts`
3. Document usage in `docs/debugging-guide.md`

### Extending Theme System
1. Add variables to `styles/theme-variables.css`
2. Update Theme Debugger to show new variables
3. Test with existing components

### Adding New Playbooks
1. Create markdown file in `docs/playbooks/`
2. Follow existing playbook structure
3. Link from main documentation

## Integration with Existing Projects

### Minimal Integration
Copy only the debugging tools:
```bash
cp -r templates/nextjs-dashboard-starter/components/debug/ existing-project/components/
cp templates/nextjs-dashboard-starter/styles/debug-utilities.css existing-project/styles/
```

### Full Integration
1. Review existing architecture
2. Gradually adopt component patterns
3. Implement debugging infrastructure
4. Document project-specific issues

## Contributing Back

### Found New Issues?
1. Document the problem in `docs/known-issues.md`
2. Develop solution following playbook format
3. Create new playbook if pattern is reusable
4. Test solution thoroughly

### Improved Patterns?
1. Update relevant playbook
2. Update template structure if needed
3. Test with multiple scenarios
4. Document breaking changes

---
*This template was created from real-world dashboard development experience, incorporating solutions for Turbopack limitations, dark mode CSS issues, and component architecture challenges. All patterns have been battle-tested in production applications.*