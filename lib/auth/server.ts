import { redirect } from "next/navigation"
import { createServerClient_ } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function checkProfileCompletion() {
  try {
    const { userId } = await auth()

    if (!userId) {
      redirect("/auth/login")
    }

    const supabase = await createServerClient_()

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (error || !profile) {
      // Profile doesn't exist, redirect to onboarding
      redirect("/onboarding")
    }

    if (!profile.role) {
      // Profile exists but role is not set, redirect to onboarding
      redirect("/onboarding")
    }

    return { userId, profile }
  } catch (error) {
    console.error("Error checking profile completion:", error)
    redirect("/auth/login")
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createServerClient_()

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return profile
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}
