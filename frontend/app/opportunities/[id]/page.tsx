"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Calendar, Users, Clock, ArrowLeft, Send, Share2, Building, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

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
    bio?: string
  }
  volunteersApplied: any[]
  isFull: boolean
  isActive: boolean
}

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchOpportunity()
    }
  }, [params.id])

  const fetchOpportunity = async () => {
    try {
      const response = await api.get(`/opportunities/${params.id}`)
      setOpportunity(response.data.opportunity)

      // Check if user has already applied
      if (user && response.data.opportunity.volunteersApplied) {
        const hasUserApplied = response.data.opportunity.volunteersApplied.some(
          (volunteer: any) => volunteer._id === user._id,
        )
        setHasApplied(hasUserApplied)
      }
    } catch (error) {
      console.error("Error fetching opportunity:", error)
      toast({
        title: "Error",
        description: "Failed to load opportunity details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "volunteer") {
      toast({
        title: "Access Denied",
        description: "Only volunteers can apply to opportunities.",
        variant: "destructive",
      })
      return
    }

    setApplying(true)
    try {
      await api.post(`/opportunities/${params.id}/apply`, {
        message: applicationMessage,
      })

      setHasApplied(true)
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the organization.",
      })

      // Refresh opportunity data
      fetchOpportunity()
    } catch (error: any) {
      toast({
        title: "Application Failed",
        description: error.response?.data?.message || "Failed to submit application.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: opportunity?.title,
          text: opportunity?.description,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Opportunity link copied to clipboard.",
      })
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Opportunity Not Found</h1>
            <p className="text-gray-600 mb-6">The opportunity you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/opportunities")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Opportunities
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(opportunity.category)}>{opportunity.category}</Badge>
                    {opportunity.isFull && <Badge variant="secondary">Full</Badge>}
                    {!opportunity.isActive && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <CardTitle className="text-2xl md:text-3xl mb-4">{opportunity.title}</CardTitle>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(opportunity.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {opportunity.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {opportunity.volunteersApplied.length}/{opportunity.maxVolunteers} volunteers
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-3">About This Opportunity</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{opportunity.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  About the Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{opportunity.createdBy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{opportunity.createdBy.name}</h4>
                    <p className="text-gray-600 flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {opportunity.createdBy.location}
                    </p>
                    {opportunity.createdBy.bio && <p className="text-gray-700">{opportunity.createdBy.bio}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Apply for This Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">You need to be logged in to apply for opportunities.</p>
                    <Button onClick={() => router.push("/login")} className="w-full">
                      Sign In to Apply
                    </Button>
                  </div>
                ) : user.role !== "volunteer" ? (
                  <Alert>
                    <AlertDescription>
                      Only volunteers can apply to opportunities. Organizations can create their own opportunities.
                    </AlertDescription>
                  </Alert>
                ) : hasApplied ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-800 mb-2">Application Submitted!</h3>
                    <p className="text-sm text-gray-600">
                      Your application has been sent to the organization. They will review it and get back to you soon.
                    </p>
                  </div>
                ) : opportunity.isFull ? (
                  <Alert>
                    <AlertDescription>
                      This opportunity is currently full. Check back later or browse other opportunities.
                    </AlertDescription>
                  </Alert>
                ) : !opportunity.isActive ? (
                  <Alert>
                    <AlertDescription>
                      This opportunity is no longer active and not accepting applications.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="message">Why do you want to volunteer? (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell the organization why you're interested in this opportunity..."
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <Button onClick={handleApply} disabled={applying} className="w-full">
                      {applying ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Apply Now
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By applying, you agree to be contacted by the organization about this opportunity.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-semibold">{opportunity.volunteersApplied.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spots Available</span>
                    <span className="font-semibold">
                      {opportunity.maxVolunteers - opportunity.volunteersApplied.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{opportunity.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
