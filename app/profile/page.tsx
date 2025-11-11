"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award, 
  Calendar,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  X
} from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<"student" | "mentor" | "admin">("student")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState({
    applications: 0,
    completedInternships: 0,
    certificates: 0,
    activeInternships: 0
  })
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    skills: [] as string[],
    phone_number: "",
  })
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return

      if (!clerkUser) {
        router.push("/auth/login")
        return
      }

      const supabase = createClient()

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clerkUser.id)
        .single()

      if (profileError) {
        if (profileError.code === "PGRST116") {
          // Profile doesn't exist
          setError("Profile not found. Please complete onboarding first.")
          setTimeout(() => router.push("/onboarding"), 2000)
        } else {
          setError(profileError.message)
        }
        return
      }

      setProfile(profileData)
      setUserRole(profileData.role || "student")
      setFormData({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        skills: profileData.skills || [],
        phone_number: profileData.phone_number || "",
      })

      // Load stats based on role
      await loadStats(profileData.role, clerkUser.id, supabase)
      
      setIsLoading(false)
    }

    loadProfile()
  }, [clerkUser, isLoaded, router])

  const loadStats = async (role: string, userId: string, supabase: any) => {
    try {
      if (role === "student") {
        const [applicationsRes, certificatesRes] = await Promise.all([
          supabase.from("applications").select("status").eq("student_id", userId),
          supabase.from("certificates").select("id").eq("student_id", userId)
        ])

        const applications = applicationsRes.data || []
        const activeApps = applications.filter((app: any) => app.status === "accepted").length

        setStats({
          applications: applications.length,
          completedInternships: applications.filter((app: any) => app.status === "accepted").length,
          certificates: certificatesRes.data?.length || 0,
          activeInternships: activeApps
        })
      } else if (role === "mentor") {
        const [internshipsRes, applicationsRes] = await Promise.all([
          supabase.from("internships").select("id, status").eq("mentor_id", userId),
          supabase.from("applications").select("status").in("status", ["accepted", "pending"])
        ])

        const internships = internshipsRes.data || []
        
        setStats({
          applications: applicationsRes.data?.length || 0,
          completedInternships: internships.filter((i: any) => i.status === "filled").length,
          certificates: 0,
          activeInternships: internships.filter((i: any) => i.status === "open").length
        })
      }
    } catch (err) {
      console.error("Error loading stats:", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const skillsArray = value.split(",").map((s) => s.trim()).filter((s) => s)
    setFormData((prev) => ({
      ...prev,
      skills: skillsArray,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          skills: formData.skills,
          phone_number: formData.phone_number,
        })
        .eq("id", clerkUser!.id)

      if (updateError) throw updateError

      // Update local profile state
      setProfile((prev: any) => ({ ...prev, ...formData }))
      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getProfileCompletion = () => {
    const fields = [
      profile?.full_name,
      profile?.bio,
      profile?.location,
      profile?.phone_number,
      profile?.skills?.length > 0
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "mentor":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "student":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar role={userRole} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-screen">
        <Sidebar role={userRole} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-muted-foreground">Redirecting to onboarding...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const profileCompletion = getProfileCompletion()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={userRole} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-2">
              <X className="h-5 w-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Profile updated successfully!
            </div>
          )}

          {/* Header Section */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Avatar Section */}
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  <AvatarImage src={profile.profile_image_url || clerkUser?.imageUrl} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                    {getInitials(profile.full_name || "User")}
                  </AvatarFallback>
                </Avatar>

                {/* Profile Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h1 className="text-3xl font-bold text-foreground">
                      {profile.full_name || "User"}
                    </h1>
                    <Badge className={`${getRoleBadgeColor(profile.role)} w-fit`}>
                      {profile.role}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {profile.phone_number}
                      </div>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-muted-foreground mt-2">{profile.bio}</p>
                  )}

                  {/* Profile Completion */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Profile Completion</span>
                      <span className="text-sm font-semibold text-primary">{profileCompletion}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className={`grid gap-4 ${userRole === "student" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {userRole === "student" ? "Applications" : "Total Internships"}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.applications}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.activeInternships}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stats.completedInternships}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {userRole === "student" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Certificates</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stats.certificates}</p>
                    </div>
                    <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills & Expertise</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      About
                    </CardTitle>
                    <CardDescription>Your professional information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                      <p className="text-foreground">{profile.full_name || "Not provided"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                      <p className="text-foreground">{profile.bio || "No bio added yet"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                      <div className="flex items-center gap-2 text-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(profile.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Profile Updated</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(profile.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 bg-muted rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Account Created</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                  <CardDescription>Your technical and professional skills</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No skills added yet. Add your skills to showcase your expertise!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit2 className="h-5 w-5" />
                        Edit Profile Information
                      </CardTitle>
                      <CardDescription>Update your personal and professional details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label htmlFor="full_name" className="block text-sm font-medium text-foreground">
                          Full Name
                        </label>
                        <input
                          id="full_name"
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Tell us about yourself..."
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <label htmlFor="location" className="block text-sm font-medium text-foreground">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="City, Country"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-foreground">
                          Phone Number
                        </label>
                        <input
                          id="phone_number"
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <label htmlFor="skills" className="block text-sm font-medium text-foreground">
                          Skills (comma-separated)
                        </label>
                        <input
                          id="skills"
                          type="text"
                          value={formData.skills.join(", ")}
                          onChange={handleSkillsChange}
                          placeholder="e.g., JavaScript, React, Node.js, Python"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Separate each skill with a comma
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              full_name: profile.full_name || "",
                              bio: profile.bio || "",
                              location: profile.location || "",
                              skills: profile.skills || [],
                              phone_number: profile.phone_number || "",
                            })
                          }}
                          className="px-6 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Edit2 className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground mb-4">Click "Edit Profile" to update your information</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
