# Financial Form Requirements & Conditional Logic

## Component Architecture (Modular Approach)
Replace the corrupted `enhanced-financial-form.tsx` with 4 smaller components:

1. **FormModeToggle** (50-100 lines) - Switch between manual/detailed
2. **ExpenseInputSection** (150-200 lines) - Handle expenses by category  
3. **FundingInputSection** (150-200 lines) - Handle funding sources
4. **CalculationSummary** (100-150 lines) - Display totals and gaps

## Critical Calculation Methods
```typescript
calculationMethod === 'manual-total' // User enters total directly
calculationMethod === 'detailed-breakdown' // System calculates from itemized expenses
```

## Expense Templates by Goal Type
```typescript
const expenseTemplates = {
  'education': ['tuition', 'books', 'supplies', 'housing', 'transportation'],
  'housing': ['downPayment', 'closingCosts', 'inspection', 'appraisal'],  
  'emergency': ['livingExpenses', 'medicalCosts', 'repairs'],
  'business': ['equipment', 'inventory', 'marketing', 'licenses'],
  'travel': ['flights', 'hotels', 'meals', 'activities'],
  'wedding': ['venue', 'catering', 'photography', 'flowers']
};
```

## Housing Type Conditionals
```typescript
if (housingType === 'dorm') {
  // Show: room fee, meal plan, parking permit
} else if (housingType === 'apartment') {
  // Show: rent, utilities, security deposit, renters insurance
} else if (housingType === 'home') {
  // Show: mortgage, property tax, HOA, maintenance
}
```

## Transportation Type Conditionals  
```typescript
if (transportationType === 'car') {
  // Show: car payment, insurance, gas, maintenance, registration
} else if (transportationType === 'public') {
  // Show: transit passes, uber/lyft budget
} else if (transportationType === 'bike') {
  // Show: bike purchase, maintenance, safety gear
} else if (transportationType === 'walk') {
  // Show: minimal transportation costs
}
```

## Complex Funding Source Structure
```typescript
interface FundingSources {
  personalSavings: number;
  familyContribution: number;
  federalAid: {
    pellGrant: number;
    staffordLoan: number;
    plusLoan: number;
    workStudy: number;
  };
  stateGrants: {
    [stateName: string]: {
      [grantName: string]: number;
    };
  };
  scholarships: Array<{
    name: string;
    amount: number;
    renewable: boolean;
    requirements: string[];
    deadline?: string;
  }>;
  privateLenders: Array<{
    lender: string;
    amount: number;
    interestRate: number;
    term: number;
  }>;
  employerAssistance: number;
  militaryBenefits: number;
  other: Array<{
    source: string;
    amount: number;
    description: string;
  }>;
}
```

## Anti-Patterns to Avoid (CRITICAL)
```typescript
// ❌ NEVER DO THIS - Causes infinite loops
useEffect(() => {
  onChange(calculatedValue); // Triggers parent re-render
}, [formData, onChange]); // Parent re-render creates new formData = infinite loop

// ✅ SAFE PATTERN - Use memoized calculations
const calculatedValue = useMemo(() => {
  return calculateFromInputs(formData);
}, [formData]);

const handleChange = useCallback((newData) => {
  onChange({ ...newData, calculated: calculateFromInputs(newData) });
}, [onChange]);
```

## Integration Points
- Uses existing `FinancialGoal` type from `lib/db/schema-financial-goals`
- Integrates with `GoalsContext` for state management
- Must handle both creation and editing modes
- Should validate required fields before saving

## File Size Guidelines (Prevents Corruption)
- ✅ Safe: 50-200 lines per component
- ⚠️ Risky: 200-400 lines  
- ❌ Dangerous: 400+ lines (corruption risk in this environment)