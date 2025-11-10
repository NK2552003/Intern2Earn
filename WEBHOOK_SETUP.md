# Setting Up Clerk Webhooks for Profile Creation

When users sign up with Clerk, their profile is automatically created in Supabase through a webhook. This ensures profile data exists immediately after signup.

## Setup Instructions

### Step 1: Get Your Webhook Secret

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** (usually under **Instances & Organizations** or **Integrations**)
3. Click **Create Endpoint**
4. Enter the endpoint URL: `https://yourdomain.com/api/webhooks/clerk`
   - For local development: `http://localhost:3000/api/webhooks/clerk`
5. Select events: Check **user.created**
6. Create the endpoint
7. Copy the **Signing Secret** (starts with `whsec_`)

### Step 2: Add Environment Variable

Add the webhook secret to your `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

### Step 3: Deploy Webhook (if needed)

If deploying to Vercel:

1. Go to your Vercel project settings
2. Add `CLERK_WEBHOOK_SECRET` to **Environment Variables**
3. Redeploy or push changes to trigger a rebuild

## How It Works

When a user signs up:

1. Clerk emits a `user.created` webhook event
2. Our API route (`/api/webhooks/clerk`) receives and verifies the event
3. A basic profile is created in Supabase with:
   - User ID from Clerk
   - Email address
   - Full name (if provided)
   - Default role: `student`
4. User is redirected to `/onboarding` to complete their profile

## What Happens on Onboarding

The onboarding page allows users to:
- Select their role (student, mentor, admin)
- Add full name, bio, location, skills, phone number
- Complete their profile in Supabase using the `upsert` operation

## Troubleshooting

### "Webhook secret not configured" error
- Make sure `CLERK_WEBHOOK_SECRET` is in your `.env.local`
- Restart your dev server after adding the environment variable

### Webhook not triggering
- Verify the webhook endpoint URL is correct in Clerk Dashboard
- For local development, use ngrok or similar tunnel to expose your localhost
- Check Clerk webhook logs for any errors

### Profile not being created
- Check browser console for any client-side errors
- Check server logs (`npm run dev` output) for webhook errors
- Verify Supabase connection is working

## Example Webhook Payload

The webhook sends a payload like:

```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123def456...",
    "email_addresses": [
      {
        "email_address": "user@example.com"
      }
    ],
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## API Endpoint Details

- **Route**: `/api/webhooks/clerk`
- **Method**: POST
- **Expects**: Svix-signed webhook payload
- **Creates**: Initial profile in Supabase if not exists
- **Returns**: 200 OK if successful
