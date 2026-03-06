# Intern2Earn

A full-stack internship management platform built with **Next.js**, **Clerk** (authentication), and **Supabase** (database). Students can browse and apply for internships, mentors can post and review applications, and admins can manage the entire platform.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables (.env.local)](#environment-variables-envlocal)
- [Database Setup](#database-setup)
- [Clerk Webhook Setup](#clerk-webhook-setup)
- [Running the App](#running-the-app)
- [User Roles & Routes](#user-roles--routes)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| npm | v8 or higher | `npm i` |
| Git | Latest | https://git-scm.com |

You also need free accounts on:

- **Clerk** — https://clerk.com (authentication)
- **Supabase** — https://supabase.com (database)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: pnpm

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Intern2Earn
```

### 2. Install dependencies

```bash
npm install
```

> If you run into peer dependency issues, try: `pnpm install --legacy-peer-deps`

---

## Environment Variables (.env.local)

Create a file named `.env.local` in the root of the project:

```bash
touch .env.local
```

Then paste the following template and fill in your own keys:

```env
# ─── Clerk Authentication ─────────────────────────────────────────────────────
# Get these from https://dashboard.clerk.com → Your App → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk redirect URLs (leave these as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/student
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ─── Supabase ─────────────────────────────────────────────────────────────────
# Get these from https://app.supabase.com → Your Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxx

# ─── Clerk Webhook ────────────────────────────────────────────────────────────
# Get this from https://dashboard.clerk.com → Webhooks → your endpoint → Signing Secret
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Where to find each key

#### Clerk Keys
1. Go to https://dashboard.clerk.com
2. Select your application (create one if you haven't)
3. Click **API Keys** in the left sidebar
4. Copy **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
5. Copy **Secret key** → `CLERK_SECRET_KEY`

#### Supabase Keys
1. Go to https://app.supabase.com
2. Select your project (create one if you haven't — choose a region close to you)
3. Go to **Settings** → **API**
4. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy **service_role / secret** key → `SUPABASE_SERVICE_ROLE_KEY`

> **Important:** Never commit `.env.local` to Git. It is already in `.gitignore`.

---

## Database Setup

You need to run SQL migration scripts in **Supabase SQL Editor** to create all the tables.

### Step 1 — Open the SQL Editor

1. Go to https://app.supabase.com → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2 — Run the migrations in order

Copy and paste the contents of each file below into the SQL editor and click **Run**:

| Order | File | Description |
|-------|------|-------------|
| 1 | `scripts/001_create_tables.sql` | Creates all tables (profiles, internships, applications, submissions, progress, messages, certificates) |
| 2 | `scripts/002_create_profile_trigger.sql` | Adds a trigger to auto-create a profile on user signup |
| 3 | `scripts/003_add_certificate_constraint.sql` | Adds constraints to the certificates table |

> Run them **one by one in order**. Do not skip any.

### Step 3 — Enable Row Level Security (RLS) (Recommended)

After running the migrations, go to **Authentication → Policies** in Supabase and enable RLS on all tables to restrict access appropriately.

---

## Clerk Webhook Setup

The webhook sends user data from Clerk to Supabase automatically when someone signs up.

### For Local Development

1. Install **ngrok** to expose your local server:
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```
2. Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok.io`)

### Configure the Webhook in Clerk

1. Go to https://dashboard.clerk.com → **Webhooks**
2. Click **Add Endpoint**
3. Set the URL to: `https://<your-ngrok-or-domain>/api/webhooks/clerk`
4. Under **Subscribe to events**, check: `user.created`
5. Click **Create**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

### For Production (Vercel)

Use your live domain instead of ngrok: `https://yourdomain.vercel.app/api/webhooks/clerk`

---

## Running the App

```bash
# Development mode (with hot reload)
pnpm dev
```

Open your browser at **http://localhost:3000**

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

---

## User Roles & Routes

After signing up, users complete an onboarding flow to choose their role.

### Student
| Route | Description |
|-------|-------------|
| `/dashboard/student` | Overview, stats, recent activity |
| `/internships` | Browse available internships |
| `/applications` | Track your applications |
| `/submissions` | Submit project work |
| `/progress` | Weekly progress logs |
| `/certificates` | Download earned certificates |

### Mentor
| Route | Description |
|-------|-------------|
| `/dashboard/mentor` | Overview of your internships |
| `/internships/manage` | Create and manage internships |
| `/applicants` | Review student applications |
| `/submissions/review` | Review student submissions |

### Admin
| Route | Description |
|-------|-------------|
| `/dashboard/admin` | Platform statistics |
| `/admin/users` | Manage all users |
| `/admin/internships` | Manage all internships |
| `/admin/applications` | Review all applications |
| `/admin/reports` | Generate reports |

---

## Project Structure

```
Intern2Earn/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (webhooks, certificates)
│   ├── auth/               # Login & sign-up pages
│   ├── dashboard/          # Role-specific dashboards
│   ├── admin/              # Admin pages
│   └── ...                 # Other feature pages
├── components/             # Reusable React components
│   └── ui/                 # shadcn/ui component library
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
│   ├── auth/               # Auth helpers
│   ├── clerk/              # Clerk client helpers
│   └── supabase/           # Supabase client helpers
├── scripts/                # SQL migration files
├── types/                  # TypeScript type definitions
├── middleware.ts            # Route protection middleware
└── .env.local              # Your environment variables (not committed)
```

---

## Troubleshooting

### `pnpm install` fails
Try clearing the cache and reinstalling:
```bash
pnpm store prune
pnpm install
```

### "Missing Publishable Key" error on startup
- Make sure `.env.local` exists in the project root
- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- Restart the dev server after editing `.env.local`

### Users are not being saved to Supabase after sign-up
- Verify the webhook is configured in Clerk Dashboard
- Check that `CLERK_WEBHOOK_SECRET` matches the signing secret in Clerk
- For local dev, make sure ngrok is running and the URL is up to date in Clerk

### SQL migration errors
- Run the scripts in order: `001` → `002` → `003`
- If a table already exists and causes an error, the scripts use `IF NOT EXISTS` so re-running is safe
- Check the Supabase **Logs** tab for detailed error messages

### Port 3000 already in use
```bash
# Run on a different port
pnpm dev -- -p 3001
```


<!-- 
# ─── Clerk Authentication ─────────────────────────────────────────────────────
# Get these from https://dashboard.clerk.com → Your App → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZHJpdmVuLXN0YXJsaW5nLTcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_EOsTrhPgKt3Yr6wFe52rGeMu5C0FRD0dYE2qkiH3nw
# Clerk webhook secret — generated in Clerk Dashboard → Webhooks
CLERK_WEBHOOK_SECRET=whsec_ML75+rInDFGwNKCs65xd6pN2PjI455nf

# ─── Supabase ──────────────────────────────────────────────────────────────────
# Get these from https://supabase.com/dashboard → Your Project → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://dgryvxknpntlubvdfdav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncnl2eGtucG50bHVidmRmZGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTQ0MTUsImV4cCI6MjA4ODM3MDQxNX0.PwxD2Y0hyc2t38AHUtu9Yr873sME1scqPhITdVZ4ADQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncnl2eGtucG50bHVidmRmZGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc5NDQxNSwiZXhwIjoyMDg4MzcwNDE1fQ.6rzStxeP-t80bmojBq7AMMVfjkIM67fuHyUVtXzsZ3U
 -->