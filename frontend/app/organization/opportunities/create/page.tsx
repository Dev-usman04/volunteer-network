"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, MapPin, Users, Clock, Save } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

interface OpportunityForm {
  title: string
  description: string
  location: string
  date: string
  category: string
  duration: string
  maxVolunteers: number
}

export default function CreateOpportunityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState<OpportunityForm>({
    title: "",
    description: "",
    location: "",
    date: "",
    category: "",
    duration: "",
    maxVolunteers: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const categories = [
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "environment", label: "Environment" },
    { value: "community", label: "Community" },
    { value: "animals", label: "Animals" },
    { value: "other", label: "Other" },
  ]

  const durations = [
    { value: "1-2 hours", label: "1-2 hours" },
    { value: "3-5 hours", label: "3-5 hours" },
    { value: "6-8 hours", label: "6-8 hours" },
    { value: "Full day", label: "Full day" },
    { value: "Multiple days", label: "Multiple days" },
  ]

  const handleInputChange = (field: keyof OpportunityForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!formData.title.trim() || formData.title.length < 5) {
      setError("Title must be at least 5 characters long")
      setLoading(false)
      return
    }

    if (!formData.description.trim() || formData.description.length < 10) {
      setError("Description must be at least 10 characters long")
      setLoading(false)
      return
    }

    if (!formData.location.trim()) {
      setError("Location is required")
      setLoading(false)
      return
    }

    if (!formData.date) {
      setError("Date is required")
      setLoading(false)
      return
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date)
    const now = new Date()
    if (selectedDate <= now) {
      setError("Date must be in the future")
      setLoading(false)
      return
    }

    if (!formData.category) {
      setError("Category is required")
      setLoading(false)
      return
    }

    if (!formData.duration) {
      setError("Duration is required")
      setLoading(false)
      return
    }

    if (formData.maxVolunteers < 1) {
      setError("Maximum volunteers must be at least 1")
      setLoading(false)
      return
    }

    try {
      const response = await api.post("/opportunities", {
        ...formData,
        date: new Date(formData.date).toISOString(),
      })

      toast({
        title: "Opportunity Created!",
        description: "Your volunteer opportunity has been published successfully.",
      })

      router.push(`/opportunities/${response.data.opportunity._id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create opportunity")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "organization") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only accessible to organizations.</p>
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
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Volunteer Opportunity</h1>
          <p className="text-gray-600">Share a meaningful opportunity with passionate volunteers</p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>Provide clear and detailed information to attract the right volunteers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Opportunity Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Help at Local Food Bank"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">{formData.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what volunteers will be doing, what skills are needed, and what impact they'll make..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">{formData.description.length}/1000 characters</p>
              </div>

              {/* Location and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Max Volunteers */}
              <div className="space-y-2">
                <Label htmlFor="maxVolunteers">Maximum Number of Volunteers *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="maxVolunteers"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxVolunteers}
                    onChange={(e) => handleInputChange("maxVolunteers", Number.parseInt(e.target.value) || 1)}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500">How many volunteers do you need for this opportunity?</p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Opportunity
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
