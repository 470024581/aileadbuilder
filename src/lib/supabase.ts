import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          name: string
          role: string
          company: string
          linkedin_url: string | null
          status: 'draft' | 'approved' | 'sent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          company: string
          linkedin_url?: string | null
          status?: 'draft' | 'approved' | 'sent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          company?: string
          linkedin_url?: string | null
          status?: 'draft' | 'approved' | 'sent'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          lead_id: string
          content: string
          generated_at: string
          edited: boolean
        }
        Insert: {
          id?: string
          lead_id: string
          content: string
          generated_at?: string
          edited?: boolean
        }
        Update: {
          id?: string
          lead_id?: string
          content?: string
          generated_at?: string
          edited?: boolean
        }
      }
    }
  }
} 