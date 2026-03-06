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
        return "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30"
      case "mentor":
        return "bg-violet-500/15 text-violet-300 border-violet-500/30"
      case "student":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      default:
        return "bg-white/8 text-white/60 border-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#05040f]">
        <Sidebar role={userRole} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
            <p className="text-white/60">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-screen bg-[#05040f]">
        <Sidebar role={userRole} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-white/60">Redirecting to onboarding...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const profileCompletion = getProfileCompletion()

  return (
    <div className="flex h-screen bg-[#05040f]">
      <Sidebar role={userRole} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
              <X className="h-5 w-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Profile updated successfully!
            </div>
          )}

          {/* Header Section */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Avatar Section */}
                <Avatar className="h-24 w-24 border-4 border-violet-500/10">
                  <AvatarImage src={profile.profile_image_url || clerkUser?.imageUrl} />
                  <AvatarFallback className="text-2xl font-bold bg-violet-500 text-white">
                    {getInitials(profile.full_name || "User")}
                  </AvatarFallback>
                </Avatar>

                {/* Profile Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h1 className="text-3xl font-bold text-white">
                      {profile.full_name || "User"}
                    </h1>
                    <Badge className={`${getRoleBadgeColor(profile.role)} w-fit`}>
                      {profile.role}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
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
                    <p className="text-white/60 mt-2">{profile.bio}</p>
                  )}

                  {/* Profile Completion */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Profile Completion</span>
                      <span className="text-sm font-semibold text-violet-400">{profileCompletion}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
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
                    <p className="text-sm font-medium text-white/60">
                      {userRole === "student" ? "Applications" : "Total Internships"}
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.applications}</p>
                  </div>
                  <div className="h-12 w-12 bg-violet-500/15 rounded-full flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/60">Active</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.activeInternships}</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-500/15 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/60">Completed</p>
                    <p className="text-3xl font-bold text-white mt-2">{stats.completedInternships}</p>
                  </div>
                  <div className="h-12 w-12 bg-fuchsia-500/15 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-fuchsia-400 " />
                  </div>
                </div>
              </CardContent>
            </Card>

            {userRole === "student" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/60">Certificates</p>
                      <p className="text-3xl font-bold text-white mt-2">{stats.certificates}</p>
                    </div>
                    <div className="h-12 w-12 bg-amber-500/15 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-600" />
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
                      <p className="text-sm font-medium text-white/60 mb-1">Full Name</p>
                      <p className="text-white">{profile.full_name || "Not provided"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1">Bio</p>
                      <p className="text-white">{profile.bio || "No bio added yet"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1">Member Since</p>
                      <div className="flex items-center gap-2 text-white">
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
                        <div className="h-2 w-2 bg-violet-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-white">Profile Updated</p>
                          <p className="text-xs text-white/60">
                            {new Date(profile.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 bg-muted rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-white">Account Created</p>
                          <p className="text-xs text-white/60">
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
                    <p className="text-white/60 text-center py-8">
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
                        <label htmlFor="full_name" className="block text-sm font-medium text-white">
                          Full Name
                        </label>
                        <input
                          id="full_name"
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-white/8 rounded-lg bg-[#05040f] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-white">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2 border border-white/8 rounded-lg bg-[#05040f] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60 resize-none"
                          placeholder="Tell us about yourself..."
                        />
                        <p className="text-xs text-white/60">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <label htmlFor="location" className="block text-sm font-medium text-white">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-white/8 rounded-lg bg-[#05040f] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                          placeholder="City, Country"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-white">
                          Phone Number
                        </label>
                        <input
                          id="phone_number"
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-white/8 rounded-lg bg-[#05040f] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <label htmlFor="skills" className="block text-sm font-medium text-white">
                          Skills (comma-separated)
                        </label>
                        <input
                          id="skills"
                          type="text"
                          value={formData.skills.join(", ")}
                          onChange={handleSkillsChange}
                          placeholder="e.g., JavaScript, React, Node.js, Python"
                          className="w-full px-4 py-2 border border-white/8 rounded-lg bg-[#05040f] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                        />
                        <p className="text-xs text-white/60">
                          Separate each skill with a comma
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-2 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="px-6 py-2 border border-white/8 rounded-lg hover:bg-white/5 transition-colors"
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
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 mb-4">
                        <Edit2 className="h-8 w-8 text-violet-400" />
                      </div>
                      <p className="text-white/60 mb-4">Click "Edit Profile" to update your information</p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-all"
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
