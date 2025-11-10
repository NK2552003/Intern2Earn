import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/internships(.*)",
  "/applications(.*)",
  "/submissions(.*)",
  "/progress(.*)",
  "/certificates(.*)",
  "/admin(.*)",
  "/applicants(.*)",
  "/onboarding(.*)",
])

const isAuthRoute = createRouteMatcher([
  "/auth/login(.*)",
  "/auth/sign-up(.*)",
])

const isOnboarding = createRouteMatcher(["/onboarding"])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Don't protect auth routes
  if (isAuthRoute(request)) {
    return NextResponse.next()
  }

  if (isProtectedRoute(request)) {
    await auth.protect()
    // Profile completion check is done client-side in pages
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

