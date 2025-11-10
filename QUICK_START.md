# Inter2Earn - Quick Start Guide

## Setup (5 minutes)

### 1. Environment Setup
\`\`\`bash
# Clone the repository
git clone <repo-url>
cd inter2earn

# Install dependencies
npm install

# Create .env.local with your keys
cp .env.example .env.local
\`\`\`

### 2. Get Your API Keys

**Clerk Keys** (https://dashboard.clerk.com/api-keys):
\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
\`\`\`

**Supabase Keys** (https://app.supabase.com/project/xxx/settings/api):
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
\`\`\`

### 3. Database Setup
\`\`\`bash
# Run the SQL migration to create tables
# Go to Supabase SQL editor and run scripts/001_create_tables.sql
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
# Open http://localhost:3000
\`\`\`

## Testing the Flow

1. **Sign Up**: Go to `/auth/sign-up`
2. **Create Account**: Enter email and password
3. **Choose Role**: Select Student, Mentor, or Admin
4. **Complete Profile**: Add name, bio, skills
5. **Access Dashboard**: View role-specific dashboard

## User Roles

### Student
- Browse internships
- Submit applications
- Track progress
- View certificates
- Log weekly updates

### Mentor
- Create internships
- Review applications
- Provide feedback
- Approve submissions

### Admin
- Manage users
- Monitor internships
- Review applications
- Platform statistics

## Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/auth/sign-up` | Registration |
| `/auth/login` | Login |
| `/onboarding` | Role selection |
| `/dashboard/student` | Student dashboard |
| `/dashboard/mentor` | Mentor dashboard |
| `/dashboard/admin` | Admin dashboard |

## Common Tasks

### Get Current User in Server Component
\`\`\`typescript
import { auth } from "@clerk/nextjs/server"
import { getCurrentUserProfile } from "@/lib/clerk/auth"

export default async function Page() {
  const { userId } = await auth()
  const profile = await getCurrentUserProfile()
  
  return <div>{profile?.full_name}</div>
}
\`\`\`

### Get Current User in Client Component
\`\`\`typescript
import { useUser } from "@clerk/nextjs"

export default function Component() {
  const { user } = useUser()
  
  return <div>{user?.fullName}</div>
}
\`\`\`

### Query Supabase Data
\`\`\`typescript
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
const { data } = await supabase
  .from('internships')
  .select('*')
  .eq('status', 'open')
\`\`\`

### Insert Profile Data
\`\`\`typescript
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@clerk/nextjs"

const { user } = useUser()
const supabase = createClient()

await supabase.from('profiles').upsert({
  id: user.id,
  email: user.emailAddresses[0]?.emailAddress,
  full_name: user.fullName,
  role: 'student'
})
\`\`\`

## Deployment

### Deploy to Vercel
\`\`\`bash
# Push to GitHub
git push origin main

# Vercel auto-deploys or:
vercel deploy
\`\`\`

### Add Production Secrets
In Vercel project settings → Environment Variables:
\`\`\`
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
\`\`\`

## Troubleshooting

**"Clerk is not initialized"**
- Ensure `ClerkProvider` is in `app/layout.tsx`
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set

**"Database connection failed"**
- Verify Supabase URL and anon key
- Check RLS policies allow operations

**"Can't create profile"**
- Ensure onboarding page submits role
- Check Supabase connection works

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

Need help? Check CLERK_SETUP.md for detailed setup or AUTHENTICATION_CHANGES.md for technical details.
