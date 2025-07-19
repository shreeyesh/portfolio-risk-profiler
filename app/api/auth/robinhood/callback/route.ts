import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  if (error) {
    console.error('Robinhood OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=robinhood_connection_failed', request.url))
  }

  if (code) {
    try {
      // Exchange authorization code for access token
      const response = await fetch('https://api.robinhood.com/oauth2/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: process.env.ROBINHOOD_CLIENT_ID!,
          client_secret: process.env.ROBINHOOD_CLIENT_SECRET!,
          redirect_uri: process.env.ROBINHOOD_REDIRECT_URI!,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code')
      }

      const data = await response.json()
      
      if (data.access_token) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Store the connection in database
          await supabase
            .from('api_connections')
            .upsert({
              user_id: user.id,
              provider: 'robinhood',
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          // Redirect to dashboard with success
          return NextResponse.redirect(new URL('/dashboard?connected=robinhood', request.url))
        }
      }
    } catch (error) {
      console.error('Robinhood OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?error=robinhood_connection_failed', request.url))
    }
  }

  // Handle error cases
  return NextResponse.redirect(new URL('/dashboard?error=robinhood_connection_failed', request.url))
} 