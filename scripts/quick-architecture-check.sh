#!/bin/bash

# Quick Architecture Validation
# Purpose: Fast check of critical architecture components

echo "🔍 QUICK ARCHITECTURE VALIDATION"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ERRORS=0
SUCCESS=0

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" 
    ((SUCCESS++))
}

log_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Check EnhancedLogin is used correctly
echo "1. Authentication Components:"
ENHANCED_LOGIN_FILES=$(grep -r -l "import.*EnhancedLogin" app/ --include="page.tsx" 2>/dev/null | wc -l)
if [ "$ENHANCED_LOGIN_FILES" -eq 2 ]; then
    log_success "EnhancedLogin used in correct routes"
else
    log_error "EnhancedLogin usage issue (found: $ENHANCED_LOGIN_FILES routes)"
fi

# 2. Check for orphaned Login component
echo "2. Orphaned Components:"
ORPHANED_LOGIN=$(find . -name "login.tsx" -path "./app/*" 2>/dev/null | wc -l)
if [ "$ORPHANED_LOGIN" -gt 0 ]; then
    log_info "Found orphaned login.tsx file (documented as unused)"
else
    log_success "No orphaned login components found"
fi

# 3. Check password toggle exists in correct component
echo "3. Password Toggle Feature:"
if grep -q "showPassword.*useState" components/auth/enhanced-login.tsx 2>/dev/null; then
    log_success "Password toggle implemented in EnhancedLogin"
else
    log_error "Password toggle not found in EnhancedLogin component"
fi

# 4. Check architecture docs exist
echo "4. Documentation:"
if [ -f "docs/CORRECTED-SITE-ARCHITECTURE-MAPPING.md" ]; then
    log_success "Architecture mapping documentation exists"
else
    log_error "Missing architecture mapping documentation"
fi

if [ -f "docs/SITE-WIDE-LOGIC-MAINTENANCE-PROTOCOL.md" ]; then
    log_success "Maintenance protocol documentation exists" 
else
    log_error "Missing maintenance protocol documentation"
fi

echo ""
echo "📊 SUMMARY:"
echo -e "✅ Successes: ${GREEN}$SUCCESS${NC}"
echo -e "❌ Errors: ${RED}$ERRORS${NC}"

if [ "$ERRORS" -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ARCHITECTURE VALIDATION PASSED${NC}"
    exit 0
else
    echo -e "\n🚨 ${RED}ARCHITECTURE VALIDATION FAILED${NC}"
    echo "Fix the errors above and re-run validation."
    exit 1
fi