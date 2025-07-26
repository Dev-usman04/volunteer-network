"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Mail, Calendar, Save, Edit, Building } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

interface ProfileForm {
  name: string
  location: string
  bio: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState<ProfileForm>({
    name: "",
    location: "",
    bio: "",
  })
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        location: user.location || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (!formData.name.trim() || formData.name.length < 2) {
      setError("Name must be at least 2 characters long")
      setLoading(false)
      return
    }

    if (!formData.location.trim()) {
      setError("Location is required")
      setLoading(false)
      return
    }

    try {
      await api.put("/auth/profile", formData)

      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
      })

      setEditing(false)
      // Note: In a real app, you'd want to update the user context here
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        location: user.location || "",
        bio: user.bio || "",
      })
    }
    setEditing(false)
    setError("")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to view your profile.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <Card className="animate-fade-in">
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h2>

              <Badge
                className={user.role === "volunteer" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}
              >
                <div className="flex items-center space-x-1">
                  {user.role === "volunteer" ? <User className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                  <span className="capitalize">{user.role}</span>
                </div>
              </Badge>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {user.location}
                </div>
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              {user.bio && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{user.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <Card className="animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </div>
                  {!editing && (
                    <Button onClick={() => setEditing(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{user.role === "volunteer" ? "Full Name" : "Organization Name"}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!editing}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user.email} disabled className="bg-gray-50" />
                    <p className="text-sm text-gray-500">
                      Email cannot be changed. Contact support if you need to update your email.
                    </p>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={!editing}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">{user.role === "volunteer" ? "About You" : "About Your Organization"}</Label>
                    <Textarea
                      id="bio"
                      placeholder={
                        user.role === "volunteer"
                          ? "Tell others about yourself, your interests, and what motivates you to volunteer..."
                          : "Describe your organization, mission, and the impact you're making..."
                      }
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      disabled={!editing}
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500">{formData.bio.length}/500 characters</p>
                  </div>

                  {/* Role (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Input
                      id="role"
                      value={user.role === "volunteer" ? "Volunteer" : "Organization"}
                      disabled
                      className="bg-gray-50 capitalize"
                    />
                    <p className="text-sm text-gray-500">Account type cannot be changed after registration.</p>
                  </div>

                  {/* Action Buttons */}
                  {editing && (
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="mt-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your activity summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{user.role === "volunteer" ? "12" : "8"}</div>
                    <div className="text-sm text-gray-600">
                      {user.role === "volunteer" ? "Applications" : "Opportunities"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{user.role === "volunteer" ? "5" : "45"}</div>
                    <div className="text-sm text-gray-600">
                      {user.role === "volunteer" ? "Accepted" : "Volunteers Helped"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{user.role === "volunteer" ? "50" : "200"}</div>
                    <div className="text-sm text-gray-600">Impact Score</div>
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
