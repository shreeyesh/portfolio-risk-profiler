import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          total_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          total_value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          total_value?: number
          created_at?: string
          updated_at?: string
        }
      }
      holdings: {
        Row: {
          id: string
          portfolio_id: string
          symbol: string
          name: string
          quantity: number
          current_price: number
          total_value: number
          sector: string
          created_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          symbol: string
          name: string
          quantity: number
          current_price: number
          total_value: number
          sector: string
          created_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          symbol?: string
          name?: string
          quantity?: number
          current_price?: number
          total_value?: number
          sector?: string
          created_at?: string
        }
      }
      risk_scores: {
        Row: {
          id: string
          portfolio_id: string
          overall_score: number
          concentration_score: number
          sector_score: number
          diversification_score: number
          risk_profile: string
          created_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          overall_score: number
          concentration_score: number
          sector_score: number
          diversification_score: number
          risk_profile: string
          created_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          overall_score?: number
          concentration_score?: number
          sector_score?: number
          diversification_score?: number
          risk_profile?: string
          created_at?: string
        }
      }
      api_connections: {
        Row: {
          id: string
          user_id: string
          platform: string
          access_token: string
          refresh_token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          access_token: string
          refresh_token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          access_token?: string
          refresh_token?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
  }
} 