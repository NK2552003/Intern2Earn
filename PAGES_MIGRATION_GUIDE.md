# Complete Pages Migration Guide - Supabase Auth → Clerk Auth

## Overview
All protected pages in the app need to be updated to use Clerk authentication instead of Supabase Auth.

## Pages That Need Fixing

### Priority 1 - Already Fixed ✅
- `/app/dashboard/student/page.tsx` ✅
- `/app/dashboard/mentor/page.tsx` ✅
- `/app/dashboard/admin/page.tsx` ✅
- `/components/navbar.tsx` ✅
- `/app/applications/page.tsx` ✅
- `/app/internships/page.tsx` ✅

### Priority 2 - Need Fixing
- [ ] `/app/internships/[id]/page.tsx` - View single internship
- [ ] `/app/internships/manage/page.tsx` - Mentor manage internships
- [ ] `/app/submissions/page.tsx` - Student submissions
- [ ] `/app/certificates/page.tsx` - Student certificates
- [ ] `/app/progress/page.tsx` - Student progress
- [ ] `/app/applicants/page.tsx` - Mentor applicants
- [ ] `/app/admin/users/page.tsx` - Admin users list
- [ ] `/app/admin/internships/page.tsx` - Admin internships list

### Priority 3 - Don't Break Existing Code
- `/app/page.tsx` - Home page (already handles null user fine)
- `/app/auth/**` - Auth pages (don't modify)
- `/app/dashboard/` - All dashboard pages (already fixed)

---

## Pattern to Apply

Every protected page should follow this pattern:

### Step 1: Add Imports
```typescript
import { useUser } from "@clerk/nextjs"
```

### Step 2: Add Hook
```typescript
const { user: clerkUser, isLoaded } = useUser()
```

### Step 3: Check Authentication
```typescript
useEffect(() => {
  const getData = async () => {
    if (!isLoaded) return
    if (!clerkUser) {
      router.push("/auth/login")
      return
    }
    
    // Profile validation
    const supabase = createClient()
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", clerkUser.id)
      .single()

    if (profileError || !profile?.role) {
      router.push("/onboarding")
      return
    }

    setUser(clerkUser)
    // ... rest of data fetching using clerkUser.id instead of user.id
  }
  
  getData()
}, [router, isLoaded, clerkUser])
```

### Step 4: Replace user.id with clerkUser.id
All database queries should use `clerkUser.id` instead of `user.id`

---

## Detailed Fix for Each Remaining Page

### 1. `/app/internships/[id]/page.tsx`
```typescript
// Add
import { useUser } from "@clerk/nextjs"
const { user: clerkUser, isLoaded } = useUser()

// Replace
const { data: { user } } = await supabase.auth.getUser()
if (!user) router.push("/auth/login")

// With
if (!isLoaded) return
if (!clerkUser) router.push("/auth/login")

// Add profile validation before using clerkUser.id
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", clerkUser.id)
  .single()

if (profileError || !profile?.role) {
  router.push("/onboarding")
  return
}

// Update dependency array
}, [router, isLoaded, clerkUser])
```

### 2. `/app/internships/manage/page.tsx`
Same pattern as above (used by mentors)

### 3. `/app/submissions/page.tsx`
Same pattern as above (used by students)

### 4. `/app/certificates/page.tsx`
Same pattern as above (used by students)

### 5. `/app/progress/page.tsx`
Same pattern as above (used by students)

### 6. `/app/applicants/page.tsx`
Same pattern as above (used by mentors)

### 7. `/app/admin/users/page.tsx`
```typescript
// Same pattern + add admin check
if (profile.role !== "admin") {
  router.push("/dashboard/student")
  return
}
```

### 8. `/app/admin/internships/page.tsx`
```typescript
// Same pattern + add admin check
if (profile.role !== "admin") {
  router.push("/dashboard/student")
  return
}
```

---

## Quick Checklist for Each Page

When fixing a page:
- [ ] Import `useUser` from `@clerk/nextjs`
- [ ] Add `const { user: clerkUser, isLoaded } = useUser()`
- [ ] Check `if (!isLoaded) return`
- [ ] Check `if (!clerkUser) router.push("/auth/login")`
- [ ] Add profile validation with error check
- [ ] Redirect to onboarding if profile incomplete
- [ ] Replace all `user.id` with `clerkUser.id`
- [ ] Replace all `user.email` with `clerkUser.emailAddresses[0]?.emailAddress`
- [ ] Update dependency array to include `isLoaded, clerkUser`
- [ ] Remove any `setUser(user)` and replace with `setUser(clerkUser)`

---

## Search & Replace Commands

### Find: `supabase.auth.getUser()`
All occurrences should be replaced per the pattern above.

### Find: `user.id`
In database queries, replace with `clerkUser.id`

### Find: `user.email`
If used, replace with `clerkUser.emailAddresses[0]?.emailAddress`

---

## Testing After Fixing Each Page

For each page you fix:
1. Sign in with Clerk
2. Navigate to that page
3. Verify data loads correctly
4. Verify no redirect to onboarding
5. Verify no errors in console

---

## Files Already Fixed (Don't Touch)

These files are already correctly updated:
- ✅ `/components/navbar.tsx`
- ✅ `/app/dashboard/student/page.tsx`
- ✅ `/app/dashboard/mentor/page.tsx`
- ✅ `/app/dashboard/admin/page.tsx`
- ✅ `/app/applications/page.tsx`
- ✅ `/app/internships/page.tsx`
- ✅ `/app/onboarding/page.tsx`
- ✅ `/middleware.ts`

---

## Performance Note

All profile checks are done client-side because:
- ✅ Faster than server-side middleware checks
- ✅ User state already available in React
- ✅ Less network overhead
- ✅ Proper error handling at page level

---

## After All Pages Are Fixed

Run these tests:
1. Sign up as new user → Complete onboarding → Access all pages
2. Sign in as existing user → All pages should work
3. Try to access admin pages as non-admin → Should redirect
4. Logout and login → Should work correctly
5. Click navbar links → Should navigate without redirects

---

## Summary

**Pattern**: `useUser()` + profile validation + `clerkUser.id`

**Result**: All pages properly authenticated with Clerk ✅

**Status**: 6/14 core pages fixed, ready to continue with remaining 8 pages
