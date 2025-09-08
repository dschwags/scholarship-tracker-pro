# Component Architecture Patterns for Scalable React Applications

## Overview
This guide documents proven component architecture patterns that improve maintainability, resolve compiler limitations, and create reusable, testable code structures.

## Core Principles

### 1. Single Responsibility Components
Each component should have one clear purpose and responsibility.

```jsx
// ❌ Monolithic component doing everything
function Dashboard() {
  return (
    <div>
      {/* 500+ lines of JSX mixing stats, tables, modals, filters */}
    </div>
  );
}

// ✅ Focused, single-responsibility components
function Dashboard() {
  return (
    <div>
      <DashboardStats />
      <FinancialProgress />
      <ScholarshipTable />
    </div>
  );
}
```

### 2. Container vs Presentation Pattern
Separate data/state management from UI rendering.

```jsx
// ✅ Container Component (manages state and data)
function ScholarshipTableContainer() {
  const [scholarships, setScholarships] = useState([]);
  const [filters, setFilters] = useState({});
  const [expandedView, setExpandedView] = useState(null);
  
  return (
    <ScholarshipTable 
      scholarships={scholarships}
      filters={filters}
      expandedView={expandedView}
      onFilterChange={setFilters}
      onToggleView={setExpandedView}
    />
  );
}

// ✅ Presentation Component (pure UI)
function ScholarshipTable({ scholarships, filters, onFilterChange }) {
  return (
    <div>
      {/* Pure UI rendering */}
    </div>
  );
}
```

### 3. Composition Over Inheritance
Build complex UIs by composing simple components.

```jsx
// ✅ Composable components
function ScholarshipCard({ scholarship, children }) {
  return (
    <Card>
      <ScholarshipHeader scholarship={scholarship} />
      <ScholarshipContent scholarship={scholarship} />
      {children}
    </Card>
  );
}

// Usage allows flexible composition
<ScholarshipCard scholarship={data}>
  <QuickActions />
  <ProgressIndicator />
</ScholarshipCard>
```

## Proven Architecture Patterns

### 1. Feature-Based Organization
```
components/
  dashboard/                    # Feature boundary
    main-dashboard.tsx         # Container component
    sections/                  # Section components
      dashboard-stats.tsx
      financial-progress.tsx
      gap-analysis.tsx
      scholarship-table.tsx
    scholarship/               # Related sub-feature
      scholarship-row.tsx
      quick-view-panel.tsx
    types.ts                   # Feature-specific types
    hooks/                     # Feature-specific hooks
      useScholarshipFilters.ts
```

### 2. Layered Component Structure

#### Layer 1: Layout Components
```jsx
// High-level layout and structure
function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

#### Layer 2: Section Components  
```jsx
// Major sections with their own state
function FinancialProgress({ userData }) {
  const [goals, setGoals] = useState(userData.goals);
  
  return (
    <section>
      <ProgressSummary goals={goals} />
      <GapAnalysis goals={goals} />
      <GoalActions onEditGoals={handleEditGoals} />
    </section>
  );
}
```

#### Layer 3: UI Components
```jsx
// Reusable, stateless UI components
function ProgressBar({ value, max, label }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="progress-container">
      <label>{label}</label>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### 3. Props Interface Design

#### Clear, Typed Interfaces
```typescript
interface ScholarshipRowProps {
  scholarship: Scholarship;
  isExpanded: boolean;
  searchQuery?: string;
  onToggleExpanded: (id: number) => void;
  onEdit: (scholarship: Scholarship) => void;
  onQuickView: (id: number) => void;
}

// Use discriminated unions for complex states
interface FilterState {
  type: 'idle' | 'filtering' | 'error';
  query: string;
  results?: Scholarship[];
  error?: string;
}
```

#### Prop Drilling Solutions
```jsx
// ✅ Context for deeply nested data
const ScholarshipContext = createContext();

function ScholarshipProvider({ children }) {
  const [scholarships, setScholarships] = useState([]);
  const [filters, setFilters] = useState({});
  
  return (
    <ScholarshipContext.Provider value={{ scholarships, filters, setFilters }}>
      {children}
    </ScholarshipContext.Provider>
  );
}

// ✅ Custom hooks for context access
function useScholarships() {
  const context = useContext(ScholarshipContext);
  if (!context) {
    throw new Error('useScholarships must be used within ScholarshipProvider');
  }
  return context;
}
```

## State Management Patterns

### 1. Colocation Principle
Keep state as close to where it's used as possible.

```jsx
// ✅ Local state for UI interactions
function QuickViewPanel({ scholarship }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('info');
  
  return (
    <div>
      {/* Component manages its own UI state */}
    </div>
  );
}

// ✅ Lift state only when needed by multiple components
function ScholarshipTableContainer() {
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  return (
    <div>
      <ScholarshipTable expandedRows={expandedRows} />
      <QuickViewSidebar expandedRows={expandedRows} />
    </div>
  );
}
```

### 2. Reducer Pattern for Complex State
```jsx
function scholarshipReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'TOGGLE_EXPANSION':
      const newExpanded = new Set(state.expandedRows);
      if (newExpanded.has(action.id)) {
        newExpanded.delete(action.id);
      } else {
        newExpanded.add(action.id);
      }
      return { ...state, expandedRows: newExpanded };
    default:
      return state;
  }
}

function useScholarshipTable() {
  const [state, dispatch] = useReducer(scholarshipReducer, initialState);
  
  return {
    ...state,
    setFilter: (filter) => dispatch({ type: 'SET_FILTER', payload: filter }),
    toggleExpansion: (id) => dispatch({ type: 'TOGGLE_EXPANSION', id }),
  };
}
```

## Performance Optimization Patterns

### 1. Memoization Strategies
```jsx
// ✅ Memoize expensive calculations
const filteredScholarships = useMemo(() => {
  return scholarships.filter(scholarship => {
    // Complex filtering logic
  });
}, [scholarships, searchQuery, statusFilter, categoryFilter]);

// ✅ Memoize callback functions
const handleToggleExpansion = useCallback((id) => {
  setExpandedRows(prev => 
    prev.has(id) 
      ? new Set([...prev].filter(x => x !== id))
      : new Set([...prev, id])
  );
}, []);

// ✅ Memoize components that render lists
const ScholarshipRow = memo(function ScholarshipRow({ 
  scholarship, 
  isExpanded, 
  onToggle 
}) {
  return (
    <div>
      {/* Row content */}
    </div>
  );
});
```

### 2. Code Splitting & Lazy Loading
```jsx
// ✅ Lazy load heavy components
const ScholarshipDetailModal = lazy(() => 
  import('./scholarship-detail-modal')
);

const QuickViewPanel = lazy(() => 
  import('./quick-view-panel')
);

// ✅ Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  {showModal && <ScholarshipDetailModal />}
</Suspense>
```

## Testing Patterns

### 1. Component Testing Structure
```jsx
// ✅ Test component behavior, not implementation
describe('ScholarshipTable', () => {
  it('filters scholarships based on search query', () => {
    render(<ScholarshipTable scholarships={mockData} />);
    
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'Merit' }
    });
    
    expect(screen.getByText('Merit Excellence Scholarship')).toBeInTheDocument();
    expect(screen.queryByText('STEM Innovation Grant')).not.toBeInTheDocument();
  });
  
  it('toggles quick view panel when eye icon is clicked', () => {
    render(<ScholarshipTable scholarships={mockData} />);
    
    fireEvent.click(screen.getAllByTitle('Quick View')[0]);
    
    expect(screen.getByText('Quick Info')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```jsx
// ✅ Test component integration
describe('Dashboard Integration', () => {
  it('updates statistics when scholarship status changes', () => {
    render(<Dashboard />);
    
    // Initial state
    expect(screen.getByText('Applications: 8')).toBeInTheDocument();
    expect(screen.getByText('Submitted: 1')).toBeInTheDocument();
    
    // Change status
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'submitted' }
    });
    fireEvent.click(screen.getByText('Save'));
    
    // Verify statistics updated
    expect(screen.getByText('Submitted: 2')).toBeInTheDocument();
  });
});
```

## Migration Strategies

### 1. Incremental Refactoring
```jsx
// Step 1: Extract obvious sections
function Dashboard() {
  return (
    <div>
      <DashboardStats {...statsProps} />
      {/* Rest of monolithic component */}
    </div>
  );
}

// Step 2: Extract data logic
function Dashboard() {
  const { stats, scholarships, filters } = useDashboardData();
  
  return (
    <div>
      <DashboardStats stats={stats} />
      <ScholarshipSection scholarships={scholarships} filters={filters} />
    </div>
  );
}

// Step 3: Extract remaining sections
function Dashboard() {
  return (
    <div>
      <DashboardStats />
      <FinancialProgress />
      <ScholarshipTable />
    </div>
  );
}
```

### 2. Gradual Type Addition
```typescript
// Start with basic types
interface Scholarship {
  id: number;
  title: string;
  status: string;
}

// Evolve to more specific types
interface Scholarship {
  id: number;
  title: string;
  status: 'not started' | 'in progress' | 'submitted' | 'awarded' | 'rejected';
  provider: string;
  amount: number;
  deadline: string;
  category: ScholarshipCategory;
}

type ScholarshipCategory = 'Merit' | 'Need-Based' | 'STEM' | 'Athletics' | 'Service' | 'Research' | 'Diversity';
```

## Common Anti-Patterns to Avoid

### 1. Prop Drilling
```jsx
// ❌ Props passed through multiple levels
<Dashboard>
  <Section onEdit={onEdit} onDelete={onDelete} onView={onView}>
    <Table onEdit={onEdit} onDelete={onDelete} onView={onView}>
      <Row onEdit={onEdit} onDelete={onDelete} onView={onView} />
    </Table>
  </Section>
</Dashboard>
```

### 2. God Components
```jsx
// ❌ One component doing everything
function Dashboard() {
  // 50+ state variables
  // 100+ functions
  // 500+ lines of JSX
  return <div>{/* Everything */}</div>;
}
```

### 3. Tight Coupling
```jsx
// ❌ Components knowing too much about each other
function ScholarshipRow({ scholarship, dashboardState, setDashboardState }) {
  // Component manipulates parent state directly
  setDashboardState(prev => ({
    ...prev,
    selectedScholarship: scholarship,
    modalOpen: true,
    lastAction: 'edit'
  }));
}
```

## Best Practices Checklist

### Component Design
- [ ] Single responsibility principle followed
- [ ] Props interface is clear and typed
- [ ] Component is pure/predictable when possible
- [ ] Minimal external dependencies
- [ ] Easy to test in isolation

### State Management
- [ ] State is colocated near usage
- [ ] Complex state uses reducer pattern
- [ ] Derived state is memoized
- [ ] State updates are immutable

### Performance
- [ ] Expensive calculations are memoized
- [ ] Callback functions are stable
- [ ] Heavy components are lazy-loaded
- [ ] List rendering is optimized

### Testing
- [ ] Components have unit tests
- [ ] Integration tests cover workflows
- [ ] Accessibility is tested
- [ ] Error boundaries are in place

---
*These patterns were developed through refactoring a complex dashboard application to resolve compiler limitations while improving maintainability and performance. The component architecture successfully eliminated JSX parsing errors and created a scalable foundation for future development.*