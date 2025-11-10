# Troubleshooting Guide

## Common Issues and Solutions

---

## 🔴 Issue: Still Getting Redirect Loop to /onboarding

### Symptoms
- Keep getting redirected to `/onboarding` page
- Can't stay on dashboard
- Loop happens immediately after completing onboarding

### Root Causes & Solutions

**Solution 1: Clear Browser Cache**
```
Chrome:
1. Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Select "All time"
3. Check "Cookies and other site data"
4. Click "Clear data"
5. Refresh app
```

**Solution 2: Check Supabase Profile**
```
1. Open Supabase dashboard
2. Go to "profiles" table
3. Look for a row with your user ID
4. Check that "role" column is filled (not null)
   - Should be "student", "mentor", or "admin"
5. If role is null, that's the problem!
   - Edit the row and set role manually
```

**Solution 3: Check Clerk User ID**
```
Browser Console:
1. Press F12 to open dev tools
2. Go to "Console" tab
3. Type: JSON.stringify(document.cookie)
4. Look for "__clerk_db_jwt" token
5. Decode it on jwt.io
6. Check "sub" field - this is your Clerk user ID
7. Verify this ID matches your Supabase profile "id" column
```

**Solution 4: Use Incognito Window**
```
1. Open incognito/private window
2. Try signing up again
3. Complete onboarding
4. This tests fresh session without old cookies
```

---

## 🔴 Issue: Profile Page Shows "Page Not Found" (404)

### Symptoms
- Clicking "Profile" link gives 404 error
- Or profile page won't load

### Root Causes & Solutions

**Solution 1: Complete Onboarding First**
```
1. Make sure you've completed onboarding
2. Profile only exists AFTER onboarding is done
3. Go to /onboarding if you skipped it
4. Fill out and submit the form
5. Then try accessing /profile
```

**Solution 2: Check Supabase Profile Exists**
```
Supabase Dashboard:
1. Open your Supabase project
2. Go to "profiles" table
3. Look for a row with your user ID
4. If NOT found:
   a. Go back and complete onboarding
   b. Or manually create profile row:
      - id: your-clerk-user-id
      - email: your-email
      - role: student (or mentor/admin)
      - full_name: your-name
5. Try accessing /profile again
```

**Solution 3: Check Middleware Allows /profile**
```
File: /middleware.ts

Should include:
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/internships(.*)",
  "/applications(.*)",
  "/submissions(.*)",
  "/progress(.*)",
  "/certificates(.*)",
  "/profile",  ← Check this exists
  "/admin(.*)",
  "/applicants(.*)",
  "/onboarding(.*)",
])
```

**Solution 4: Check Sidebar Has Profile Link**
```
File: /components/sidebar.tsx

For student role should have:
{ href: "/profile", label: "Profile" }

If missing, the link won't appear in sidebar.
Profile page exists, but you can't access it!
```

---

## 🔴 Issue: Can't Log In / No User Found

### Symptoms
- Clerk login form appears but login doesn't work
- "User not found" error
- Stuck on login page

### Root Causes & Solutions

**Solution 1: Check Clerk Configuration**
```
File: /.env.local

Should contain:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

If missing:
1. Get keys from Clerk dashboard (https://dashboard.clerk.com)
2. Add to .env.local
3. Restart dev server
```

**Solution 2: Check Network Tab**
```
Browser Dev Tools:
1. F12 → Network tab
2. Try logging in
3. Look for failed requests to clerk.com
4. Common issues:
   - CORS errors → Check Clerk domain settings
   - 401 → Check API keys are correct
   - Timeout → Check internet connection
```

**Solution 3: Clear Clerk Cache**
```
1. Delete all cookies for your domain
2. Clear localStorage:
   - F12 → Application → Local Storage → Clear All
3. Close and reopen browser
4. Try logging in again
```

---

## 🔴 Issue: Profile Won't Save / Changes Not Persisting

### Symptoms
- Edit profile and click "Save Changes"
- See success message
- But changes aren't saved after refresh

### Root Causes & Solutions

**Solution 1: Check Supabase Connection**
```
Browser Console:
1. F12 → Console tab
2. Look for errors like:
   - "Supabase connection failed"
   - "Permission denied"
   - Network errors
3. Fix connection issues before saving
```

**Solution 2: Check Supabase Row Level Security (RLS)**
```
Supabase Dashboard:
1. Go to "profiles" table
2. Click "Policies" tab
3. Should have policy like:
   ```sql
   CREATE POLICY "Users can update own profile"
   ON profiles
   FOR UPDATE
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id)
   ```
4. If missing, add it
5. Make sure Clerk user ID matches RLS check
```

**Solution 3: Check Network Requests**
```
Browser Dev Tools:
1. F12 → Network tab
2. Edit profile and click Save
3. Look for request to Supabase API
4. Check if:
   - Request succeeded (200 status)
   - Response contains updated data
   - No error messages in response
```

**Solution 4: Manually Update Supabase**
```
As a test:
1. Open Supabase dashboard
2. Go to "profiles" table
3. Edit a row directly
4. Refresh app - should see changes
5. If this works, the page/form is the problem
6. If this doesn't work, Supabase is the problem
```

---

## 🔴 Issue: Sidebar Links Don't Work

### Symptoms
- Clicking sidebar links does nothing
- Page doesn't change
- Links look like they're not responsive

### Root Causes & Solutions

**Solution 1: Check You're Logged In**
```
1. Make sure Clerk session exists
2. F12 → Application → Cookies
3. Look for "__clerk_db_jwt" or similar
4. If missing:
   a. You're not logged in
   b. Go to /auth/sign-up
   c. Complete login
5. Then try sidebar links
```

**Solution 2: Check Profile Has Role**
```
Supabase:
1. Open "profiles" table
2. Find your user ID row
3. Check "role" column has value
   - Should be "student", "mentor", or "admin"
4. If null:
   a. Edit row and set role
   b. Try sidebar links again
```

**Solution 3: Check Sidebar Has Links**
```
File: /components/sidebar.tsx

If role is "student", should have:
- Dashboard
- Browse Internships
- My Applications
- My Submissions
- Progress
- Certificates
- Profile

If any are missing, they won't appear.
```

**Solution 4: Check Browser Console for Errors**
```
1. F12 → Console tab
2. Look for red error messages
3. Try clicking sidebar link again
4. Check if new errors appear
5. Fix errors as needed
```

---

## 🔴 Issue: Role-Based Pages Inaccessible

### Symptoms
- Try to access /dashboard/admin but get redirected
- Can't access mentor-only pages
- "Insufficient permissions" type errors

### Root Causes & Solutions

**Solution 1: Check Your Profile Role**
```
Supabase:
1. Open "profiles" table
2. Find your user row
3. Check "role" column
4. If role is "student" but you're trying to access /dashboard/admin:
   a. You don't have admin permissions
   b. Create new admin user or change role in Supabase
   c. Log out and log back in
```

**Solution 2: Check Role Validation Logic**
```
File: /app/dashboard/admin/page.tsx

Should have check like:
if (profile.role !== "admin") {
  router.push("/dashboard/student")
  return
}

If this check is missing, anyone can access it!
```

**Solution 3: Verify Onboarding Set Correct Role**
```
When completing onboarding:
1. Make sure you select the role you want
2. Check the radio button for "Admin" if needed
3. Submit onboarding
4. After onboarding, check Supabase:
   - Profile row should have correct role
   - If wrong, edit in Supabase
   - Log out and log back in
```

---

## 🟡 Issue: Slow Page Loading

### Symptoms
- Pages take a long time to load
- Lots of "Loading..." messages
- Laggy navigation

### Root Causes & Solutions

**Solution 1: Check Supabase Connection**
```
Network Tab:
1. F12 → Network tab
2. Filter for "supabase"
3. Check if requests are slow
4. Usual times:
   - < 200ms = Good
   - 200-500ms = OK
   - > 1000ms = Slow
5. If slow, check Supabase status: status.supabase.com
```

**Solution 2: Check for Multiple Queries**
```
Browser Console:
1. F12 → Console tab
2. Look for multiple similar requests
3. If same query runs multiple times:
   a. Check useEffect dependencies
   b. Make sure [router, isLoaded, clerkUser] are listed
   c. Avoid infinite queries
```

**Solution 3: Optimize Queries**
```
Reduce data fetched:
- Only select needed columns: .select("id, role")
- Instead of: .select("*")
- Add filters early: .eq("status", "active")
- Instead of fetching all and filtering locally
```

---

## 🟡 Issue: TypeScript/Lint Errors in Console

### Symptoms
- Red squiggly lines in code editor
- Build warnings/errors
- "Type 'X' is not assignable to type 'Y'"

### Root Causes & Solutions

**These Are Usually Safe:**
```
Most TypeScript errors in this codebase are about:
- Interface types not matching Supabase query results
- Gradient class names (bg-gradient-to-br vs bg-linear-to-br)

These don't prevent the app from running!
```

**If You Want to Fix Them:**
```
1. Update interface definitions to match Supabase response
2. Or cast responses: setData(response as MyType)
3. Or use `// @ts-ignore` (not recommended but works)
```

---

## ✅ Verification Steps (Everything Working)

Run through these to confirm everything is fixed:

```
✓ Sign up creates account in Clerk
✓ Onboarding page appears after signup
✓ Completing onboarding creates profile in Supabase
✓ Redirected to /dashboard/{role} after onboarding
✓ Visiting /onboarding when already onboarded redirects to dashboard
✓ Profile page loads with user data
✓ Can edit profile fields
✓ Profile changes save to Supabase
✓ All sidebar links work and load pages
✓ Logout clears Clerk session
✓ Login again goes to dashboard, not onboarding
✓ Admin pages only accessible to admin users
✓ Mentor pages only accessible to mentor users
✓ No console errors in developer tools
✓ No infinite redirect loops
```

If all above check out → Everything is working! ✨

---

## Getting Help

If none of these solutions work:

1. **Check the logs**:
   - Browser console (F12)
   - Supabase logs (dashboard)
   - Clerk logs (dashboard)

2. **Verify configuration**:
   - `.env.local` has all required keys
   - Clerk domain is configured
   - Supabase project is active

3. **Try fresh setup**:
   - Clear all cookies
   - Use incognito window
   - Create new test account

4. **Check documentation**:
   - Clerk docs: https://clerk.com/docs
   - Supabase docs: https://supabase.com/docs
   - Next.js docs: https://nextjs.org/docs

---

**Last Updated**: Today
**All fixes documented and tested**
