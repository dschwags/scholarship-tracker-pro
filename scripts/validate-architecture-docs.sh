#!/bin/bash

# Site-Wide Logic Documentation Validator
# Purpose: Ensure architecture documentation matches actual codebase
# Usage: npm run validate-architecture

set -e

echo "🔍 SITE-WIDE ARCHITECTURE VALIDATION"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Validation counters
ERRORS=0
WARNINGS=0
SUCCESS=0

# Function to log results
log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

log_success() {
    echo -e "${GREEN}✅ SUCCESS: $1${NC}"
    ((SUCCESS++))
}

echo "🔍 1. COMPONENT USAGE VALIDATION"
echo "--------------------------------"

# Check EnhancedLogin imports (should be 2 files importing it)
ENHANCED_LOGIN_IMPORTS=$(grep -r "import.*EnhancedLogin" app/ --include="*.tsx" --include="*.ts" | wc -l)
if [ "$ENHANCED_LOGIN_IMPORTS" -eq 2 ]; then
    log_success "EnhancedLogin correctly imported in 2 routes (/sign-in, /sign-up)"
else
    log_error "EnhancedLogin import count mismatch. Expected: 2, Found: $ENHANCED_LOGIN_IMPORTS"
fi

# Check for orphaned Login component usage
LOGIN_IMPORTS=$(grep -r "import.*Login" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "EnhancedLogin" | wc -l)
if [ "$LOGIN_IMPORTS" -eq 0 ]; then
    log_success "No orphaned Login component imports found"
else
    log_warning "Found $LOGIN_IMPORTS potential orphaned Login imports"
    grep -r "import.*Login" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "EnhancedLogin" | sed 's/^/  /'
fi

echo ""
echo "🔍 2. ROUTE-TO-COMPONENT MAPPING VALIDATION"
echo "-------------------------------------------"

# Verify /sign-in route
SIGNIN_COMPONENT=$(grep -r "EnhancedLogin.*signin" app/\(login\)/sign-in/ 2>/dev/null || echo "")
if [ ! -z "$SIGNIN_COMPONENT" ]; then
    log_success "/sign-in correctly maps to EnhancedLogin"
else
    log_error "/sign-in route mapping verification failed"
fi

# Verify /sign-up route  
SIGNUP_COMPONENT=$(grep -r "EnhancedLogin.*signup" app/\(login\)/sign-up/ 2>/dev/null || echo "")
if [ ! -z "$SIGNUP_COMPONENT" ]; then
    log_success "/sign-up correctly maps to EnhancedLogin"
else
    log_error "/sign-up route mapping verification failed"
fi

echo ""
echo "🔍 3. ORPHANED COMPONENT DETECTION"
echo "---------------------------------"

# Find potential orphaned components in auth directory
echo "Checking components/auth/ directory..."
for component_file in components/auth/*.tsx; do
    if [ -f "$component_file" ]; then
        component_name=$(basename "$component_file" .tsx)
        # Convert to PascalCase for search
        pascal_name=$(echo "$component_name" | sed 's/^./\U&/' | sed 's/-\(.\)/\U\1/g')
        
        # Search for imports of this component
        import_count=$(grep -r "import.*$pascal_name\|from.*$component_name" app/ components/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "$component_file" | wc -l)
        
        if [ "$import_count" -eq 0 ]; then
            log_warning "Potentially orphaned component: $component_file"
        else
            log_success "Component $pascal_name is actively used ($import_count references)"
        fi
    fi
done

echo ""
echo "🔍 4. DOCUMENTATION FRESHNESS CHECK"
echo "----------------------------------"

# Check if architecture docs are newer than component changes
LATEST_COMPONENT=$(find components/ app/ -name "*.tsx" -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- || echo "unknown")
LATEST_DOCS=$(find docs/ -name "*ARCHITECTURE*.md" -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- || echo "unknown")

if [ "$LATEST_COMPONENT" != "unknown" ] && [ "$LATEST_DOCS" != "unknown" ]; then
    COMPONENT_TIME=$(stat -c %Y "$LATEST_COMPONENT" 2>/dev/null || echo "0")
    DOCS_TIME=$(stat -c %Y "$LATEST_DOCS" 2>/dev/null || echo "0")
    
    if [ "$DOCS_TIME" -gt "$COMPONENT_TIME" ]; then
        log_success "Architecture documentation is up-to-date"
    else
        log_warning "Architecture documentation may be outdated"
        echo "  Latest component change: $LATEST_COMPONENT"
        echo "  Latest docs update: $LATEST_DOCS"
    fi
else
    log_warning "Could not determine documentation freshness"
fi

echo ""
echo "🔍 5. SITE-WIDE LOGIC GUIDE ACCURACY"
echo "------------------------------------"

# Check if site-wide logic guide mentions correct components
if grep -q "EnhancedLogin" docs/SITE-WIDE-CONDITIONAL-LOGIC-DIAGRAM.md; then
    log_success "Site-wide logic guide references correct component (EnhancedLogin)"
else
    log_error "Site-wide logic guide does not reference EnhancedLogin component"
fi

# Check if orphaned components are documented
if grep -q "ORPHANED.*login\.tsx" docs/SITE-WIDE-CONDITIONAL-LOGIC-DIAGRAM.md; then
    log_success "Site-wide logic guide documents orphaned Login component"
else
    log_warning "Site-wide logic guide should document orphaned Login component"
fi

echo ""
echo "📊 VALIDATION SUMMARY"
echo "===================="
echo -e "✅ Successes: ${GREEN}$SUCCESS${NC}"
echo -e "⚠️  Warnings:  ${YELLOW}$WARNINGS${NC}"
echo -e "❌ Errors:    ${RED}$ERRORS${NC}"

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}PERFECT ARCHITECTURE ALIGNMENT!${NC}"
    echo "Site-wide logic documentation is accurate and up-to-date."
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "\n✅ ${GREEN}ARCHITECTURE MOSTLY ALIGNED${NC}"
    echo "No critical errors, but some warnings to review."
    exit 0
else
    echo -e "\n🚨 ${RED}ARCHITECTURE DOCUMENTATION DRIFT DETECTED${NC}"
    echo "Critical errors found. Update documentation before proceeding."
    echo ""
    echo "📋 Next Steps:"
    echo "1. Review and fix the errors listed above"
    echo "2. Update docs/SITE-WIDE-CONDITIONAL-LOGIC-DIAGRAM.md"
    echo "3. Run this validator again to confirm fixes"
    echo "4. Follow docs/SITE-WIDE-LOGIC-MAINTENANCE-PROTOCOL.md"
    exit 1
fi