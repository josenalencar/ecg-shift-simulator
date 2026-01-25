export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Category = 'arrhythmia' | 'ischemia' | 'conduction' | 'normal' | 'other'
export type Axis = 'normal' | 'left' | 'right' | 'extreme'
export type Interval = 'normal' | 'prolonged' | 'short' | 'wide'

export type Rhythm =
  | 'sinus'
  | 'afib'
  | 'aflutter'
  | 'svt'
  | 'vtach'
  | 'vfib'
  | 'junctional'
  | 'paced'
  | 'asystole'
  | 'other'

export type Regularity = 'regular' | 'irregular'

export type Finding =
  | 'normal'
  | 'lvh'
  | 'rvh'
  | 'lae'
  | 'rae'
  | 'rbbb'
  | 'lbbb'
  | 'lafb'
  | 'lpfb'
  | 'interatrial_block'
  | 'avb_1st'
  | 'avb_2nd_type1'
  | 'avb_2nd_type2'
  | 'avb_3rd'
  | 'stemi_anterior'
  | 'stemi_inferior'
  | 'stemi_lateral'
  | 'stemi_posterior'
  | 'stemi_septal'
  | 'oca_anterior'
  | 'oca_inferior'
  | 'oca_septal'
  | 'oca_lateral'
  | 'nstemi'
  | 'old_mi'
  | 'secondary_t_wave'
  | 'primary_t_wave'
  | 'pericarditis'
  | 'early_repolarization'
  | 'hyperkalemia'
  | 'hypokalemia'
  | 'digitalis'
  | 'pe_pattern'
  | 'preexcitation'
  | 'long_qt'
  | 'brugada'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      ecgs: {
        Row: {
          id: string
          title: string
          image_url: string
          difficulty: Difficulty
          category: Category
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          difficulty?: Difficulty
          category?: Category
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          difficulty?: Difficulty
          category?: Category
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      official_reports: {
        Row: {
          id: string
          ecg_id: string
          rhythm: Rhythm[]
          regularity: Regularity
          heart_rate: number
          axis: Axis
          pr_interval: Interval
          qrs_duration: Interval
          qt_interval: Interval
          findings: Finding[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ecg_id: string
          rhythm: Rhythm[]
          regularity: Regularity
          heart_rate: number
          axis?: Axis
          pr_interval?: Interval
          qrs_duration?: Interval
          qt_interval?: Interval
          findings?: Finding[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ecg_id?: string
          rhythm?: Rhythm[]
          regularity?: Regularity
          heart_rate?: number
          axis?: Axis
          pr_interval?: Interval
          qrs_duration?: Interval
          qt_interval?: Interval
          findings?: Finding[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attempts: {
        Row: {
          id: string
          user_id: string
          ecg_id: string
          rhythm: Rhythm[]
          regularity: Regularity
          heart_rate: number
          axis: Axis
          pr_interval: Interval
          qrs_duration: Interval
          qt_interval: Interval
          findings: Finding[]
          score: number
          feedback: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ecg_id: string
          rhythm: Rhythm[]
          regularity: Regularity
          heart_rate: number
          axis?: Axis
          pr_interval?: Interval
          qrs_duration?: Interval
          qt_interval?: Interval
          findings?: Finding[]
          score?: number
          feedback?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ecg_id?: string
          rhythm?: Rhythm[]
          regularity?: Regularity
          heart_rate?: number
          axis?: Axis
          pr_interval?: Interval
          qrs_duration?: Interval
          qt_interval?: Interval
          findings?: Finding[]
          score?: number
          feedback?: Json
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

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ECG = Database['public']['Tables']['ecgs']['Row']
export type OfficialReport = Database['public']['Tables']['official_reports']['Row']
export type Attempt = Database['public']['Tables']['attempts']['Row']

export type ECGWithReport = ECG & {
  official_reports: OfficialReport | null
}

export type AttemptWithECG = Attempt & {
  ecgs: ECG
}
