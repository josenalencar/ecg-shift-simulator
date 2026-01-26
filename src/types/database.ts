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
export type Interval = 'normal' | 'prolonged' | 'short' | 'wide' | 'na'

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
  | 'sab_2nd_type1'
  | 'sab_2nd_type2'
  | 'sab_3rd'
  | 'oca'
  | 'oca_wall_anterior'
  | 'oca_wall_inferior'
  | 'oca_wall_lateral'
  | 'oca_wall_septal'
  | 'ste'
  | 'hyperacute_t'
  | 'std_v1v4'
  | 'aslanger'
  | 'de_winter'
  | 'subtle_ste'
  | 'terminal_qrs_distortion'
  | 'sgarbossa_modified'
  | 'secondary_t_wave'
  | 'primary_t_wave'
  | 'early_repolarization'
  | 'giant_negative_t'
  | 'hyperkalemia'
  | 'hypokalemia'
  | 'digitalis'
  | 'preexcitation'
  | 'long_qt'
  | 'brugada'
  | 'spodick_sign'
  | 'pq_depression'
  | 'spiked_helmet'
  | 'dagger_q'
  | 'pathological_q'
  | 'pathological_q_anterior'
  | 'pathological_q_inferior'
  | 'pathological_q_lateral'
  | 'pathological_q_septal'
  | 'fragmented_qrs'
  | 'pacemaker_normal'
  | 'pacemaker_sense_failure'
  | 'pacemaker_pace_failure'
  | 'pacemaker_sense_failure_atrio'
  | 'pacemaker_sense_failure_ventriculo'
  | 'pacemaker_pace_failure_atrio'
  | 'pacemaker_pace_failure_ventriculo'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          bio: string | null
          role: UserRole
          is_master_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          bio?: string | null
          role?: UserRole
          is_master_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          bio?: string | null
          role?: UserRole
          is_master_admin?: boolean
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
