import { createClient } from "@/lib/supabase/client"

export async function ensureProfileExists(userId: string, email: string, fullName?: string) {
  const supabase = createClient()

  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).single()

    if (!existingProfile) {
      // Create new profile
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        email,
        full_name: fullName || "",
        role: "student", // Default role
      })

      if (error) throw error
    }
  } catch (error) {
    console.error("Error ensuring profile exists:", error)
  }
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("profiles").update(updates).eq("id", userId)

    if (error) throw error
  } catch (error) {
    console.error("Error updating profile:", error)
  }
}
