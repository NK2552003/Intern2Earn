import { auth } from "@clerk/nextjs/server"
import { createServerClient_ } from "@/lib/supabase/server"

export async function getServerUser() {
  const { userId } = await auth()
  return userId
}

export async function getCurrentUserProfile() {
  const userId = await getServerUser()
  if (!userId) return null

  const supabase = await createServerClient_()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return profile
}

export async function isUserMentor() {
  const profile = await getCurrentUserProfile()
  return profile?.role === "mentor"
}

export async function isUserAdmin() {
  const profile = await getCurrentUserProfile()
  return profile?.role === "admin"
}

export async function isUserStudent() {
  const profile = await getCurrentUserProfile()
  return profile?.role === "student"
}
