'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  X, 
  Filter, 
  RotateCcw,
  Calendar,
  DollarSign,
  Tag,
  Plus
} from 'lucide-react';

// Components
import { ScholarshipRow } from '../scholarship/scholarship-row';
import { QuickViewPanel } from '../scholarship/quick-view-panel';
import { ScholarshipCreationForm } from '../../scholarship/scholarship-creation-form';

interface ScholarshipTableProps {
  scholarshipsData: any[];
  expandedQuickView: number | null;
  onOpenModal: (scholarship: any) => void;
  onCreateScholarship: (scholarship: any) => void;
}

export function ScholarshipTable({ 
  scholarshipsData, 
  expandedQuickView, 
  onOpenModal,
  onCreateScholarship 
}: ScholarshipTableProps) {
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState({ min: '', max: '' });
  const [deadlineFilter, setDeadlineFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCreationForm, setShowCreationForm] = useState(false);

  // Advanced filtering logic
  const filteredScholarships = useMemo(() => {
    return scholarshipsData.filter(scholarship => {
      // Search filter - with null/undefined safety
      const matchesSearch = !searchQuery || 
        (scholarship.title && scholarship.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (scholarship.provider && scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (scholarship.category && scholarship.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || scholarship.status === statusFilter;
      
      // Category filter - with null/undefined safety
      const matchesCategory = categoryFilter === 'all' || (scholarship.category && scholarship.category === categoryFilter);
      
      // Amount filter
      const scholarshipAmount = parseFloat(scholarship.amount) || 0;
      const matchesAmount = (
        (amountFilter.min === '' || scholarshipAmount >= parseInt(amountFilter.min)) &&
        (amountFilter.max === '' || scholarshipAmount <= parseInt(amountFilter.max))
      );
      
      // Deadline filter
      const matchesDeadline = (() => {
        if (deadlineFilter === 'all') return true;
        if (!scholarship.deadline) return false; // Handle null/undefined deadline
        
        try {
          const deadlineDate = new Date(scholarship.deadline);
          if (isNaN(deadlineDate.getTime())) return false; // Handle invalid date
          
          const now = new Date();
          const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          
          switch (deadlineFilter) {
            case 'overdue': return daysDiff < 0;
            case 'week': return daysDiff >= 0 && daysDiff <= 7;
            case 'month': return daysDiff >= 0 && daysDiff <= 30;
            case 'future': return daysDiff > 30;
            default: return true;
          }
        } catch (error) {
          console.warn('Error parsing deadline date:', error);
          return false;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesCategory && matchesAmount && matchesDeadline;
    });
  }, [searchQuery, statusFilter, categoryFilter, amountFilter.min, amountFilter.max, deadlineFilter, scholarshipsData]);

  // Get unique categories and statuses for filter options - filter out null/undefined
  const categories = [...new Set(scholarshipsData.map(s => s.category).filter(Boolean))];
  const statuses = [...new Set(scholarshipsData.map(s => s.status).filter(Boolean))];

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setAmountFilter({ min: '', max: '' });
    setDeadlineFilter('all');
    console.log('All filters cleared');
  };

  // Count active filters
  const activeFiltersCount = [
    searchQuery !== '',
    statusFilter !== 'all',
    categoryFilter !== 'all', 
    amountFilter.min !== '' || amountFilter.max !== '',
    deadlineFilter !== 'all'
  ].filter(Boolean).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle scholarship creation
  const handleCreateScholarship = (newScholarshipData: any) => {
    console.log('Creating new scholarship:', newScholarshipData);
    onCreateScholarship(newScholarshipData);
  };

  return (
    <>
      <Card 
        className="bg-white dark:bg-gray-900 border-purple-200 dark:border-gray-700"
        style={{ backgroundColor: 'var(--card)' }}
      >
      <CardHeader className="pb-3 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base text-purple-900 dark:text-gray-100">Scholarship Applications</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search scholarships, providers, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Add New Button */}
            <Button 
              onClick={() => setShowCreationForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
            
            {/* Filter Controls */}
            <div className="flex gap-2">
              {/* Quick Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Advanced Filters Popover */}
              <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center p-0">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Advanced Filters</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-8 px-2 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    {/* Category Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Category
                      </Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Amount Range Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Amount Range
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={amountFilter.min}
                          onChange={(e) => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                          className="h-8"
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={amountFilter.max}
                          onChange={(e) => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    {/* Deadline Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Deadline
                      </Label>
                      <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="All Deadlines" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="all">All Deadlines</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="week">Due This Week</SelectItem>
                          <SelectItem value="month">Due This Month</SelectItem>
                          <SelectItem value="future">Future</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchQuery}"
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {statusFilter}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setStatusFilter('all')} />
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Category: {categoryFilter}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setCategoryFilter('all')} />
              </Badge>
            )}
            {(amountFilter.min || amountFilter.max) && (
              <Badge variant="secondary" className="text-xs">
                Amount: ${amountFilter.min || '0'} - ${amountFilter.max || '∞'}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setAmountFilter({ min: '', max: '' })} />
              </Badge>
            )}
            {deadlineFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Deadline: {deadlineFilter}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setDeadlineFilter('all')} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 px-2 text-xs text-blue-600">
              Clear all
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div 
          className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          style={{ backgroundColor: 'var(--card)' }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 p-3 font-medium text-sm bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
            <div>Scholarship</div>
            <div>Amount</div>
            <div>Deadline</div>
            <div>Progress</div>
            <div>Status</div>
            <div>View</div>
            <div>Edit</div>
          </div>

          {/* Table Content */}
          {filteredScholarships.length === 0 ? (
            <div 
              className="col-span-6 text-center py-8 text-muted-foreground bg-white dark:bg-gray-900"
              style={{ backgroundColor: 'var(--card)' }}
            >
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No scholarships found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredScholarships.map((scholarship, index) => (
                <div key={scholarship.id}>
                  <ScholarshipRow
                    scholarship={scholarship}
                    searchQuery={searchQuery}
                    onOpenModal={onOpenModal}
                    index={index}
                  />
                  {expandedQuickView === scholarship.id && (
                    <QuickViewPanel scholarship={scholarship} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="flex justify-between items-center pt-3 text-sm text-muted-foreground px-3">
          <span>
            Showing {filteredScholarships.length} of {scholarshipsData.length} scholarships
            {activeFiltersCount > 0 && (
              <span className="text-blue-600 font-medium"> (filtered)</span>
            )}
          </span>
          {filteredScholarships.length > 0 && (
            <span className="text-xs">
              Total value: {formatCurrency(filteredScholarships.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0))}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
    
    {/* Scholarship Creation Form */}
    <ScholarshipCreationForm
      isOpen={showCreationForm}
      onClose={() => setShowCreationForm(false)}
      onCreateScholarship={handleCreateScholarship}
    />
    </>
  );
}