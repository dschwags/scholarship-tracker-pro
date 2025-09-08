#!/bin/bash

# Next.js Dashboard Starter - Project Setup Script
# This script sets up a new project with debugging tools and best practices

echo "🚀 Setting up Next.js Dashboard Starter project..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in a Next.js project
if [ ! -f "package.json" ]; then
    print_error "No package.json found. Please run this script in a Next.js project directory."
    exit 1
fi

# Check for Next.js in dependencies
if ! grep -q "next" package.json; then
    print_warning "Next.js not found in package.json. Are you sure this is a Next.js project?"
fi

print_step "Creating project directory structure..."

# Create directory structure
mkdir -p components/debug
mkdir -p components/ui
mkdir -p components/dashboard/sections
mkdir -p components/dashboard/scholarship
mkdir -p docs/playbooks
mkdir -p styles/debug
mkdir -p scripts
mkdir -p templates

print_status "Directory structure created"

print_step "Setting up debugging infrastructure..."

# Copy debug components (if they exist in templates)
if [ -d "templates/nextjs-dashboard-starter/components/debug" ]; then
    cp -r templates/nextjs-dashboard-starter/components/debug/* components/debug/
    print_status "Debug components copied"
else
    print_warning "Template debug components not found. Creating placeholders..."
    touch components/debug/ZIndexDetector.tsx
    touch components/debug/ThemeDebugger.tsx
    touch components/debug/index.ts
fi

# Copy or create debug styles
if [ -f "templates/nextjs-dashboard-starter/styles/debug-utilities.css" ]; then
    cp templates/nextjs-dashboard-starter/styles/debug-utilities.css styles/
    print_status "Debug CSS utilities copied"
else
    touch styles/debug-utilities.css
    print_warning "Debug CSS template not found. Created empty file."
fi

print_step "Setting up documentation..."

# Copy or create documentation
if [ -d "templates/nextjs-dashboard-starter/docs/playbooks" ]; then
    cp -r templates/nextjs-dashboard-starter/docs/playbooks/* docs/playbooks/
    print_status "Playbooks copied"
else
    touch docs/playbooks/turbopack-jsx-parsing-limitations.md
    touch docs/playbooks/dark-mode-css-debugging-methodology.md
    touch docs/playbooks/component-architecture-patterns.md
    print_warning "Playbook templates not found. Created placeholder files."
fi

# Create project-specific documentation
cat > docs/known-issues.md << 'EOF'
# Known Issues & Solutions

This file tracks project-specific issues and their solutions.

## Format
```markdown
### Issue: [Brief Description]
**Date:** YYYY-MM-DD
**Environment:** [Browser/Node version/etc.]
**Symptoms:** 
- Detailed description of the problem

**Root Cause:**
- What caused the issue

**Solution:**
- How it was resolved
- Code changes made

**Prevention:**
- How to avoid in the future
```

## Current Issues

<!-- Add new issues above this line -->

---
*This file is automatically created by setup-project.sh*
EOF

print_status "Project documentation created"

print_step "Updating package.json scripts..."

# Add debug scripts to package.json if they don't exist
if ! grep -q "debug:css" package.json; then
    # Create a temporary file with the updated package.json
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (!pkg.scripts) pkg.scripts = {};
        
        pkg.scripts['debug:css'] = 'echo \"Add debug-utilities.css to your global styles for CSS debugging tools\"';
        pkg.scripts['debug:info'] = 'echo \"Debug utilities available: ZIndexDetector, ThemeDebugger, debugUtils\"';
        pkg.scripts['setup:check'] = 'node scripts/check-setup.js';
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        console.log('Package.json updated with debug scripts');
    "
    print_status "Debug scripts added to package.json"
fi

print_step "Creating setup validation script..."

# Create setup check script
cat > scripts/check-setup.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking project setup...\n');

const checks = [
    {
        name: 'Debug Components',
        path: 'components/debug/index.ts',
        required: true
    },
    {
        name: 'Debug CSS Utilities', 
        path: 'styles/debug-utilities.css',
        required: true
    },
    {
        name: 'Turbopack JSX Playbook',
        path: 'docs/playbooks/turbopack-jsx-parsing-limitations.md',
        required: false
    },
    {
        name: 'Dark Mode Debug Playbook',
        path: 'docs/playbooks/dark-mode-css-debugging-methodology.md', 
        required: false
    },
    {
        name: 'Component Architecture Guide',
        path: 'docs/playbooks/component-architecture-patterns.md',
        required: false
    },
    {
        name: 'Known Issues Documentation',
        path: 'docs/known-issues.md',
        required: true
    }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
    const exists = fs.existsSync(check.path);
    const status = exists ? '✅' : (check.required ? '❌' : '⚠️ ');
    const size = exists ? `(${fs.statSync(check.path).size} bytes)` : '';
    
    console.log(`${status} ${check.name}: ${check.path} ${size}`);
    
    if (exists) passed++;
    else if (check.required) failed++;
});

console.log(`\n📊 Setup Status: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
    console.log('🎉 Setup complete! Your project is ready for development.');
    console.log('\n📝 Next steps:');
    console.log('1. Import debug utilities: import { ZIndexDetector, ThemeDebugger } from "@/components/debug"');
    console.log('2. Add debug CSS to globals.css: @import "debug-utilities.css"');
    console.log('3. Read the playbooks in docs/playbooks/ for development guidance');
} else {
    console.log('⚠️  Some required files are missing. Run setup-project.sh again or create them manually.');
}
EOF

chmod +x scripts/check-setup.js

print_status "Setup validation script created"

print_step "Creating development helpers..."

# Create development helper script
cat > scripts/debug-helpers.js << 'EOF'
/**
 * Debug Helpers for Browser Console
 * 
 * Copy these functions into browser console for quick debugging
 */

// Find elements with white backgrounds
function findWhiteElements() {
    const elements = document.querySelectorAll('*');
    const white = [];
    
    elements.forEach(el => {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg === 'rgb(255, 255, 255)' || bg === '#ffffff' || bg === '#fff') {
            white.push(el);
        }
    });
    
    console.log('Elements with white backgrounds:', white);
    return white;
}

// Test z-index layers
function testZIndexLayer(zIndex = 1000) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(255, 0, 0, 0.3);
        z-index: ${zIndex};
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;
    overlay.textContent = `Z-Index Test: ${zIndex}`;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        document.body.removeChild(overlay);
    }, 3000);
    
    console.log(`Testing z-index layer: ${zIndex}`);
}

// Get theme variables
function getThemeVars() {
    const root = getComputedStyle(document.documentElement);
    const vars = {};
    
    ['--background', '--foreground', '--card', '--primary', '--secondary'].forEach(prop => {
        vars[prop] = root.getPropertyValue(prop).trim();
    });
    
    console.table(vars);
    return vars;
}

// Toggle debug mode
function toggleDebugMode() {
    document.body.classList.toggle('debug-outlines');
    const active = document.body.classList.contains('debug-outlines');
    console.log(`Debug mode: ${active ? 'ON' : 'OFF'}`);
}

console.log('Debug helpers loaded. Available functions:');
console.log('- findWhiteElements()');
console.log('- testZIndexLayer(zIndex)');  
console.log('- getThemeVars()');
console.log('- toggleDebugMode()');
EOF

print_status "Development helpers created"

print_step "Setting up Git hooks (optional)..."

# Create pre-commit hook to remind about debug code
if [ -d ".git" ]; then
    mkdir -p .git/hooks
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Check for debug code in staged files
echo "🔍 Checking for debug code..."

# Files to check
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$')

if [ -n "$STAGED_FILES" ]; then
    # Check for debug imports
    DEBUG_IMPORTS=$(echo "$STAGED_FILES" | xargs grep -l "from.*debug" 2>/dev/null || true)
    
    # Check for console.log
    CONSOLE_LOGS=$(echo "$STAGED_FILES" | xargs grep -l "console\.log" 2>/dev/null || true)
    
    # Check for debug CSS classes
    DEBUG_CSS=$(echo "$STAGED_FILES" | xargs grep -l "debug-" 2>/dev/null || true)
    
    if [ -n "$DEBUG_IMPORTS" ] || [ -n "$CONSOLE_LOGS" ] || [ -n "$DEBUG_CSS" ]; then
        echo "⚠️  Debug code detected in staged files:"
        [ -n "$DEBUG_IMPORTS" ] && echo "Debug imports: $DEBUG_IMPORTS"
        [ -n "$CONSOLE_LOGS" ] && echo "Console logs: $CONSOLE_LOGS" 
        [ -n "$DEBUG_CSS" ] && echo "Debug CSS: $DEBUG_CSS"
        echo ""
        echo "Continue with commit? (y/n)"
        read -r response
        
        if [ "$response" != "y" ]; then
            echo "Commit aborted. Remove debug code and try again."
            exit 1
        fi
    fi
fi

echo "✅ Pre-commit check passed"
EOF

    chmod +x .git/hooks/pre-commit
    print_status "Git pre-commit hook installed"
else
    print_warning "Not a Git repository. Skipping Git hooks setup."
fi

print_step "Final setup tasks..."

# Run setup validation
node scripts/check-setup.js

print_status "Project setup complete!"

echo ""
echo "📚 Documentation:"
echo "   • Read playbooks in docs/playbooks/"
echo "   • Check docs/known-issues.md for project-specific notes"
echo ""
echo "🛠️  Debugging Tools:"
echo "   • Import components: import { ZIndexDetector, ThemeDebugger } from '@/components/debug'"
echo "   • Add CSS utilities to your global styles"
echo "   • Use debugUtils in browser console"
echo ""
echo "🧪 Quick Test:"
echo "   • Run: npm run debug:info"
echo "   • Run: npm run setup:check"
echo ""
echo "Happy debugging! 🎉"