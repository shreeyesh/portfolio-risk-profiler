import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')
  const status = searchParams.get('status')
  const requestToken = searchParams.get('request_token')
  
  if (action === 'login' && status === 'success' && requestToken) {
    try {
      // Exchange request token for access token
      const response = await fetch('https://api.kite.trade/session/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: process.env.ZERODHA_API_KEY!,
          request_token: requestToken,
          checksum: process.env.ZERODHA_API_SECRET!, // In production, generate proper checksum
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange token')
      }

      const data = await response.json()
      
      if (data.status === 'success') {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Store the connection in database
          await supabase
            .from('api_connections')
            .upsert({
              user_id: user.id,
              provider: 'zerodha',
              access_token: data.data.access_token,
              refresh_token: data.data.refresh_token,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          // Redirect to dashboard with success
          return NextResponse.redirect(new URL('/dashboard?connected=zerodha', request.url))
        }
      }
    } catch (error) {
      console.error('Zerodha OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?error=zerodha_connection_failed', request.url))
    }
  }

  // Handle error cases
  return NextResponse.redirect(new URL('/dashboard?error=zerodha_connection_failed', request.url))
} 