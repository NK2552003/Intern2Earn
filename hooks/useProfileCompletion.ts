import { createClient } from "@/lib/supabase/client"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useProfileCompletion() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkProfile = async () => {
      if (!isLoaded) {
        return
      }

      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        const supabase = createClient()
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError || !profileData) {
          setError("Profile not found")
          setProfile(null)
          router.push("/onboarding")
          return
        }

        if (!profileData.role) {
          setError("Profile incomplete")
          setProfile(null)
          router.push("/onboarding")
          return
        }

        setProfile(profileData)
        setError(null)
      } catch (error) {
        console.error("Error checking profile:", error)
        setError("Failed to check profile")
        router.push("/onboarding")
      } finally {
        setIsChecking(false)
      }
    }

    checkProfile()
  }, [isLoaded, user, router])

  return { profile, isChecking, error, isAuthenticated: !!user && isLoaded }
}

export function useProtectedRoute() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!user) {
      router.push("/auth/login")
      return
    }

    const checkProfile = async () => {
      try {
        const supabase = createClient()
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (!profileData?.role) {
          router.push("/onboarding")
          return
        }

        setIsReady(true)
      } catch (error) {
        console.error("Error checking profile:", error)
        router.push("/onboarding")
      }
    }

    checkProfile()
  }, [isLoaded, user, router])

  return { isReady }
}
