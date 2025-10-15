/**
 * Supabase Database Types
 * 
 * TODO: Generate these types automatically using:
 * npx supabase gen types typescript --project-id your-project-ref > src/lib/supabase/types.ts
 * 
 * For now, we define the core types manually based on our schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'moderator' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'moderator' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'moderator' | 'admin'
          created_at?: string
        }
      }
      car_brands: {
        Row: {
          id: number
          name: string
          country: string | null
        }
        Insert: {
          id?: number
          name: string
          country?: string | null
        }
        Update: {
          id?: number
          name?: string
          country?: string | null
        }
      }
      car_models: {
        Row: {
          id: number
          brand_id: number
          name: string
          start_year: number | null
          end_year: number | null
        }
        Insert: {
          id?: number
          brand_id: number
          name: string
          start_year?: number | null
          end_year?: number | null
        }
        Update: {
          id?: number
          brand_id?: number
          name?: string
          start_year?: number | null
          end_year?: number | null
        }
      }
      car_trims: {
        Row: {
          id: number
          model_id: number
          year: number
          trim_name: string | null
          engine: string | null
          transmission: string | null
          drivetrain: string | null
        }
        Insert: {
          id?: number
          model_id: number
          year: number
          trim_name?: string | null
          engine?: string | null
          transmission?: string | null
          drivetrain?: string | null
        }
        Update: {
          id?: number
          model_id?: number
          year?: number
          trim_name?: string | null
          engine?: string | null
          transmission?: string | null
          drivetrain?: string | null
        }
      }
      review_categories: {
        Row: {
          id: number
          key: string
          label: string
          weight: number
        }
        Insert: {
          id?: number
          key: string
          label: string
          weight?: number
        }
        Update: {
          id?: number
          key?: string
          label?: string
          weight?: number
        }
      }
      reviews: {
        Row: {
          id: number
          author_id: string
          trim_id: number
          title: string | null
          body: string | null
          ratings: Json
          avg_score: number | null
          pros: string[]
          cons: string[]
          status: 'published' | 'pending' | 'rejected' | 'removed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          author_id: string
          trim_id: number
          title?: string | null
          body?: string | null
          ratings: Json
          pros?: string[]
          cons?: string[]
          status?: 'published' | 'pending' | 'rejected' | 'removed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          author_id?: string
          trim_id?: number
          title?: string | null
          body?: string | null
          ratings?: Json
          pros?: string[]
          cons?: string[]
          status?: 'published' | 'pending' | 'rejected' | 'removed'
          created_at?: string
          updated_at?: string
        }
      }
      review_votes: {
        Row: {
          review_id: number
          user_id: string
          is_helpful: boolean
          created_at: string
        }
        Insert: {
          review_id: number
          user_id: string
          is_helpful: boolean
          created_at?: string
        }
        Update: {
          review_id?: number
          user_id?: string
          is_helpful?: boolean
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          review_id: number
          author_id: string
          body: string
          status: 'published' | 'pending' | 'rejected' | 'removed'
          created_at: string
        }
        Insert: {
          id?: number
          review_id: number
          author_id: string
          body: string
          status?: 'published' | 'pending' | 'rejected' | 'removed'
          created_at?: string
        }
        Update: {
          id?: number
          review_id?: number
          author_id?: string
          body?: string
          status?: 'published' | 'pending' | 'rejected' | 'removed'
          created_at?: string
        }
      }
      favorites: {
        Row: {
          user_id: string
          review_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          review_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          review_id?: number
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: number
          reported_type: 'review' | 'comment'
          reported_id: number
          reporter_id: string | null
          reason: string
          status: 'open' | 'closed' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: number
          reported_type: 'review' | 'comment'
          reported_id: number
          reporter_id?: string | null
          reason: string
          status?: 'open' | 'closed' | 'dismissed'
          created_at?: string
        }
        Update: {
          id?: number
          reported_type?: 'review' | 'comment'
          reported_id?: number
          reporter_id?: string | null
          reason?: string
          status?: 'open' | 'closed' | 'dismissed'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

