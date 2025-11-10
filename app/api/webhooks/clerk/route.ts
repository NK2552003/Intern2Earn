import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createServerClient_ } from '@/lib/supabase/server'

export async function POST(req: Request) {
  // Get the webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const body = await req.text()

  // Create a new Webhook instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verify payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Unauthorized', {
      status: 401,
    })
  }

  // Handle the webhook
  const eventType = evt.type
  console.log(`Webhook received: ${eventType}`)

  if (eventType === 'user.created') {
    try {
      const { id, email_addresses, first_name, last_name } = evt.data

      const supabase = await createServerClient_()

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id)
        .single()

      if (!existingProfile) {
        // Create new profile with default role
        const { error } = await supabase.from('profiles').insert({
          id,
          email: email_addresses[0]?.email_address || '',
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || '',
          role: 'student', // Default role
        })

        if (error) {
          console.error('Error creating profile:', error)
          return new Response('Error creating profile', { status: 500 })
        }

        console.log(`Profile created for user ${id}`)
      }
    } catch (error) {
      console.error('Webhook error:', error)
      return new Response('Error processing webhook', { status: 500 })
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
