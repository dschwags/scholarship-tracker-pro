"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, DollarSign, FileText, Users, Search, Filter, X, Plus } from "lucide-react"

// Mock data interface
interface Scholarship {
  id: string
  title: string
  provider: string
  amount: number
  deadline: string
  status: string
  category: string
  description?: string
}

// Mock scholarship data - CORRECTED VERSION with consistent dates and statuses
const mockScholarships: Scholarship[] = [
  { id: "1", title: "Merit Excellence Award", provider: "Academic Foundation", amount: 5000, deadline: "2025-03-15", status: "Applied", category: "Merit" },
  { id: "2", title: "STEM Innovation Grant", provider: "Tech Institute", amount: 7500, deadline: "2025-04-20", status: "Pending", category: "STEM" },
  { id: "3", title: "Community Service Scholarship", provider: "Civic Organization", amount: 3000, deadline: "2024-12-15", status: "Awarded", category: "Service" },
  { id: "4", title: "Athletic Achievement Award", provider: "Sports Foundation", amount: 4000, deadline: "2024-11-10", status: "Rejected", category: "Athletics" },
  { id: "5", title: "Arts & Culture Grant", provider: "Arts Council", amount: 2500, deadline: "2025-06-15", status: "Draft", category: "Arts" }
]

export default function ComprehensiveDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Calculate statistics - UNLOCKED and fixed for infinite loops
  const stats = useMemo(() => {
    const total = mockScholarships.length
    const applied = mockScholarships.filter(s => s.status === 'Applied' || s.status === 'Pending').length
    const awarded = mockScholarships.filter(s => s.status === 'Awarded').length
    const totalAwarded = mockScholarships
      .filter(s => s.status === 'Awarded')
      .reduce((sum, s) => sum + s.amount, 0)
    
    return { total, applied, awarded, totalAwarded }
  }, [])

  // Filter scholarships based on search and status
  const filteredScholarships = useMemo(() => {
    return mockScholarships.filter(scholarship => {
      const matchesSearch = !searchQuery || 
        scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarship.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || scholarship.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'awarded': return 'bg-green-100 text-green-800'
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Statistics Row - UNLOCKED */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scholarships</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Available opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applied}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awards Won</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.awarded}</div>
            <p className="text-xs text-muted-foreground">Successful applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Awarded</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAwarded)}</div>
            <p className="text-xs text-muted-foreground">Scholarship funds received</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card with Scholarship Management - UNLOCKED */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Scholarship Management</CardTitle>
              <CardDescription>Track and manage your scholarship applications</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Scholarship
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Awarded">Awarded</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Scholarships Table - UNLOCKED */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scholarship</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScholarships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No scholarships found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScholarships.map((scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell className="font-medium">
                        {scholarship.title}
                      </TableCell>
                      <TableCell>{scholarship.provider}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(scholarship.amount)}
                      </TableCell>
                      <TableCell>{formatDate(scholarship.deadline)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(scholarship.status)}>
                          {scholarship.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{scholarship.category}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          {filteredScholarships.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredScholarships.length} of {mockScholarships.length} scholarships
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}