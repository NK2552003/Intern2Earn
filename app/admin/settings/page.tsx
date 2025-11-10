"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Sidebar from "@/components/sidebar"

interface Settings {
  applicationDeadline: boolean
  autoApproveApplications: boolean
  emailNotificationsEnabled: boolean
  maintenanceMode: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<Settings>({
    applicationDeadline: false,
    autoApproveApplications: false,
    emailNotificationsEnabled: true,
    maintenanceMode: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  useEffect(() => {
    const getData = async () => {
      // Check if user is authenticated
      if (!isLoaded) {
        return
      }

      if (!clerkUser) {
        router.push("/auth/login")
        return
      }

      const supabase = createClient()

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      // If profile doesn't exist or user is not admin, redirect accordingly
      if (profileError || !profile || !profile.role) {
        router.replace("/onboarding")
        return
      }

      if (profile.role !== "admin") {
        router.replace("/dashboard/student")
        return
      }

      setUser(clerkUser)
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  const handleToggle = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    // Simulate saving settings - in a real app, you'd save to database
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const SettingItem = ({
    title,
    description,
    enabled,
    onChange,
  }: {
    title: string
    description: string
    enabled: boolean
    onChange: () => void
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-input"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar role="admin" />
      </div>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sidebar role="admin" />
      </div>
      <main className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-2">Manage platform configuration and preferences</p>
            </div>

            {/* Platform Settings */}
            <div className="bg-card border border-border rounded-lg mb-8">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Platform Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Control how the platform operates</p>
              </div>
              <div className="p-6">
                <SettingItem
                  title="Maintenance Mode"
                  description="Enable maintenance mode to temporarily disable the platform"
                  enabled={settings.maintenanceMode}
                  onChange={() => handleToggle("maintenanceMode")}
                />
                <SettingItem
                  title="Email Notifications"
                  description="Send email notifications to users about applications and updates"
                  enabled={settings.emailNotificationsEnabled}
                  onChange={() => handleToggle("emailNotificationsEnabled")}
                />
              </div>
            </div>

            {/* Application Settings */}
            <div className="bg-card border border-border rounded-lg mb-8">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">Application Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure application processing</p>
              </div>
              <div className="p-6">
                <SettingItem
                  title="Application Deadline"
                  description="Enable application deadline enforcement"
                  enabled={settings.applicationDeadline}
                  onChange={() => handleToggle("applicationDeadline")}
                />
                <SettingItem
                  title="Auto-Approve Applications"
                  description="Automatically approve applications that meet criteria"
                  enabled={settings.autoApproveApplications}
                  onChange={() => handleToggle("autoApproveApplications")}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
              <button
                onClick={() => {
                  // Reset to defaults
                  setSettings({
                    applicationDeadline: false,
                    autoApproveApplications: false,
                    emailNotificationsEnabled: true,
                    maintenanceMode: false,
                  })
                }}
                className="px-6 py-2 bg-secondary text-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Reset to Defaults
              </button>
            </div>

            {/* Information Section */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">ℹ️ Platform Information</h3>
              <ul className="mt-3 text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>• Current API Version: v1.0</li>
                <li>• Database Status: Connected</li>
                <li>• Last Backup: Today at 12:00 AM</li>
                <li>• Active Users: {user ? "Multiple" : "None"}</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    )
  }
