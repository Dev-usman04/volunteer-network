// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { Header } from "@/components/layout/header"
// import { Footer } from "@/components/layout/footer"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { MapPin, Calendar, Users, Search, Filter, ArrowRight, Clock, Grid, List } from "lucide-react"
// import { api } from "@/lib/api"

// interface Opportunity {
//   _id: string
//   title: string
//   description: string
//   location: string
//   date: string
//   category: string
//   duration: string
//   maxVolunteers: number
//   createdBy: {
//     _id: string
//     name: string
//     location: string
//   }
//   volunteersApplied: any[]
//   isFull: boolean
// }

// interface Pagination {
//   currentPage: number
//   totalPages: number
//   totalDocs: number
//   hasNextPage: boolean
//   hasPrevPage: boolean
// }

// export default function OpportunitiesPage() {
//   const [opportunities, setOpportunities] = useState<Opportunity[]>([])
//   const [pagination, setPagination] = useState<Pagination | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

//   // Filters
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("")
//   const [selectedLocation, setSelectedLocation] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)

//   const categories = [
//     { value: "", label: "All Categories" },
//     { value: "education", label: "Education" },
//     { value: "healthcare", label: "Healthcare" },
//     { value: "environment", label: "Environment" },
//     { value: "community", label: "Community" },
//     { value: "animals", label: "Animals" },
//     { value: "other", label: "Other" },
//   ]

//   useEffect(() => {
//     fetchOpportunities()
//   }, [currentPage, selectedCategory, selectedLocation, searchQuery])

//   const fetchOpportunities = async () => {
//     setLoading(true)
//     try {
//       const params = new URLSearchParams({
//         page: currentPage.toString(),
//         limit: "12",
//       })

//       if (searchQuery) params.append("search", searchQuery)
//       if (selectedCategory) params.append("category", selectedCategory)
//       if (selectedLocation) params.append("location", selectedLocation)

//       const response = await api.get(`/opportunities?${params}`)
//       setOpportunities(response.data.opportunities)
//       setPagination(response.data.pagination)
//     } catch (error) {
//       console.error("Error fetching opportunities:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault()
//     setCurrentPage(1)
//     fetchOpportunities()
//   }

//   const getCategoryColor = (category: string) => {
//     const colors = {
//       education: "bg-blue-100 text-blue-800",
//       healthcare: "bg-red-100 text-red-800",
//       environment: "bg-green-100 text-green-800",
//       community: "bg-purple-100 text-purple-800",
//       animals: "bg-orange-100 text-orange-800",
//       other: "bg-gray-100 text-gray-800",
//     }
//     return colors[category as keyof typeof colors] || colors.other
//   }

//   const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => (
//     <Card className="card-hover h-full">
//       <CardHeader>
//         <div className="flex items-start justify-between mb-2">
//           <Badge className={getCategoryColor(opportunity.category)}>{opportunity.category}</Badge>
//           {opportunity.isFull && <Badge variant="secondary">Full</Badge>}
//         </div>
//         <CardTitle className="text-xl mb-2 line-clamp-2">{opportunity.title}</CardTitle>
//         <CardDescription className="text-gray-600 line-clamp-3">{opportunity.description}</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-2 mb-4">
//           <div className="flex items-center text-sm text-gray-500">
//             <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
//             <span className="truncate">{opportunity.location}</span>
//           </div>
//           <div className="flex items-center text-sm text-gray-500">
//             <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
//             {new Date(opportunity.date).toLocaleDateString()}
//           </div>
//           <div className="flex items-center text-sm text-gray-500">
//             <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
//             {opportunity.duration}
//           </div>
//           <div className="flex items-center text-sm text-gray-500">
//             <Users className="w-4 h-4 mr-2 flex-shrink-0" />
//             {opportunity.volunteersApplied.length}/{opportunity.maxVolunteers} volunteers
//           </div>
//         </div>
//         <div className="text-sm text-gray-600 mb-4">By {opportunity.createdBy.name}</div>
//         <Link href={`/opportunities/${opportunity._id}`}>
//           <Button className="w-full" disabled={opportunity.isFull}>
//             {opportunity.isFull ? "Opportunity Full" : "Learn More"}
//             {!opportunity.isFull && <ArrowRight className="ml-2 w-4 h-4" />}
//           </Button>
//         </Link>
//       </CardContent>
//     </Card>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Volunteer Opportunities</h1>
//           <p className="text-xl text-gray-600">Find meaningful ways to make a difference in your community</p>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
//           <form onSubmit={handleSearch} className="space-y-4">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <Input
//                     placeholder="Search opportunities..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>
//               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                 <SelectTrigger className="w-full md:w-48">
//                   <SelectValue placeholder="Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map((category) => (
//                     <SelectItem key={category.value} value={category.value}>
//                       {category.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <Input
//                 placeholder="Location"
//                 value={selectedLocation}
//                 onChange={(e) => setSelectedLocation(e.target.value)}
//                 className="w-full md:w-48"
//               />
//               <Button type="submit" className="w-full md:w-auto">
//                 <Filter className="w-4 h-4 mr-2" />
//                 Filter
//               </Button>
//             </div>
//           </form>
//         </div>

//         {/* View Toggle and Results Count */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="text-gray-600">
//             {pagination && (
//               <span>
//                 Showing {(pagination.currentPage - 1) * 12 + 1}-
//                 {Math.min(pagination.currentPage * 12, pagination.totalDocs)} of {pagination.totalDocs} opportunities
//               </span>
//             )}
//           </div>
//           <div className="flex items-center space-x-2">
//             <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
//               <Grid className="w-4 h-4" />
//             </Button>
//             <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
//               <List className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Opportunities Grid/List */}
//         {loading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[...Array(6)].map((_, i) => (
//               <Card key={i} className="animate-pulse">
//                 <CardHeader>
//                   <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
//                   <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
//                   <div className="h-4 bg-gray-200 rounded w-full"></div>
//                   <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2 mb-4">
//                     <div className="h-4 bg-gray-200 rounded w-full"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//                   </div>
//                   <div className="h-10 bg-gray-200 rounded"></div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         ) : opportunities.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Search className="w-12 h-12 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
//             <p className="text-gray-600 mb-4">
//               Try adjusting your search criteria or check back later for new opportunities.
//             </p>
//             <Button
//               onClick={() => {
//                 setSearchQuery("")
//                 setSelectedCategory("")
//                 setSelectedLocation("")
//                 setCurrentPage(1)
//               }}
//             >
//               Clear Filters
//             </Button>
//           </div>
//         ) : (
//           <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
//             {opportunities.map((opportunity) => (
//               <OpportunityCard key={opportunity._id} opportunity={opportunity} />
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {pagination && pagination.totalPages > 1 && (
//           <div className="flex items-center justify-center space-x-2 mt-8">
//             <Button
//               variant="outline"
//               onClick={() => setCurrentPage(currentPage - 1)}
//               disabled={!pagination.hasPrevPage}
//             >
//               Previous
//             </Button>

//             <div className="flex items-center space-x-1">
//               {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
//                 const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, Math.max(1, currentPage - 2))) + i

//                 return (
//                   <Button
//                     key={pageNum}
//                     variant={pageNum === currentPage ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setCurrentPage(pageNum)}
//                   >
//                     {pageNum}
//                   </Button>
//                 )
//               })}
//             </div>

//             <Button
//               variant="outline"
//               onClick={() => setCurrentPage(currentPage + 1)}
//               disabled={!pagination.hasNextPage}
//             >
//               Next
//             </Button>
//           </div>
//         )}
//       </div>

//       <Footer />
//     </div>
//   )
// }


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, Users, Search, Filter, ArrowRight, Clock, Grid, List } from "lucide-react"
import { api } from "@/lib/api"

interface Opportunity {
  _id: string
  title: string
  description: string
  location: string
  date: string
  category: string
  duration: string
  maxVolunteers: number
  createdBy: {
    _id: string
    name: string
    location: string
  }
  volunteersApplied: any[]
  isFull: boolean
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "environment", label: "Environment" },
    { value: "community", label: "Community" },
    { value: "animals", label: "Animals" },
    { value: "other", label: "Other" },
  ]

  useEffect(() => {
    fetchOpportunities()
  }, [currentPage, selectedCategory, selectedLocation, searchQuery])

  const fetchOpportunities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      })

      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedLocation) params.append("location", selectedLocation)

      const response = await api.get(`/opportunities?${params}`)
      setOpportunities(response.data.opportunities)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Error fetching opportunities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchOpportunities()
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      education: "bg-blue-100 text-blue-800",
      healthcare: "bg-red-100 text-red-800",
      environment: "bg-green-100 text-green-800",
      community: "bg-purple-100 text-purple-800",
      animals: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => (
    <Card className="card-hover h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className={getCategoryColor(opportunity.category)}>{opportunity.category}</Badge>
          {opportunity.isFull && <Badge variant="secondary">Full</Badge>}
        </div>
        <CardTitle className="text-xl mb-2 line-clamp-2">{opportunity.title}</CardTitle>
        <CardDescription className="text-gray-600 line-clamp-3">{opportunity.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{opportunity.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            {new Date(opportunity.date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            {opportunity.duration}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            {opportunity.volunteersApplied.length}/{opportunity.maxVolunteers} volunteers
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-4">By {opportunity.createdBy.name}</div>
        <Link href={`/opportunities/${opportunity._id}`}>
          <Button className="w-full" disabled={opportunity.isFull}>
            {opportunity.isFull ? "Opportunity Full" : "Learn More"}
            {!opportunity.isFull && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Volunteer Opportunities</h1>
          <p className="text-xl text-gray-600">Find meaningful ways to make a difference in your community</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full md:w-48"
              />
              <Button type="submit" className="w-full md:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {pagination && (
              <span>
                Showing {(pagination.currentPage - 1) * 12 + 1}-
                {Math.min(pagination.currentPage * 12, pagination.totalDocs)} of {pagination.totalDocs} opportunities
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedLocation("")
                setCurrentPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity._id} opportunity={opportunity} />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, Math.max(1, currentPage - 2))) + i
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
