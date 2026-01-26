export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Category = 'arrhythmia' | 'ischemia' | 'structural' | 'normal' | 'emergency' | 'routine' | 'advanced' | 'rare' | 'other'

export type ElectrodeSwap =
  | 'swap_la_ra'        // BE-BD (Left Arm - Right Arm)
  | 'swap_la_ll'        // BE-PE (Left Arm - Left Leg)
  | 'swap_la_rl'        // BE-PD (Left Arm - Right Leg)
  | 'swap_rl_involved'  // Troca envolvendo perna direita
  | 'swap_precordial'   // Troca de eletrodos precordiais
export type Axis = 'normal' | 'left' | 'right' | 'extreme'
export type Interval = 'normal' | 'prolonged' | 'short' | 'wide' | 'na'

export type Rhythm =
  | 'sinus'
  | 'sinus_arrhythmia'
  | 'sinus_bradycardia'
  | 'afib'
  | 'aflutter'
  | 'svt'
  | 'mat'
  | 'vtach'
  | 'vfib'
  | 'polymorphic_vtach'
  | 'torsades'
  | 'junctional'
  | 'ventricular_escape'
  | 'riva'
  | 'paced'
  | 'asystole'
  | 'isorhythmic_dissociation'
  | 'other'

export type Regularity = 'regular' | 'irregular'

export type Finding =
  | 'normal'
  // Chambers - renamed from SVE/SVD/SAE/SAD
  | 'lvh' // kept for backward compatibility
  | 'rvh' // kept for backward compatibility
  | 'lae' // kept for backward compatibility
  | 'rae' // kept for backward compatibility
  | 'amplitude_criteria' // new: replaces SVE display
  | 'tall_r_right_precordial' // new: replaces SVD display
  | 'left_atrial_enlargement' // new: replaces SAE display
  | 'right_atrial_enlargement' // new: replaces SAD display
  | 'low_voltage' // new
  // Conduction
  | 'rbbb'
  | 'lbbb'
  | 'lafb'
  | 'lpfb'
  | 'interatrial_block'
  // AV Blocks
  | 'avb_1st'
  | 'avb_2nd_type1'
  | 'avb_2nd_type2'
  | 'avb_3rd'
  // SA Blocks
  | 'sab_2nd_type1'
  | 'sab_2nd_type2'
  | 'sab_3rd'
  // Occlusive infarction
  | 'oca'
  | 'oca_wall_anterior'
  | 'oca_wall_inferior'
  | 'oca_wall_lateral'
  | 'oca_wall_septal'
  | 'oca_wall_anteroapical'
  | 'oca_wall_anteromedial'
  | 'oca_wall_inferolateral'
  | 'oca_wall_extensive_anterior'
  // Ischemic signs
  | 'ste'
  | 'hyperacute_t'
  | 'std_v1v4'
  | 'aslanger'
  | 'de_winter'
  | 'subtle_ste'
  | 'terminal_qrs_distortion'
  | 'sgarbossa_modified'
  // Repolarization
  | 'secondary_t_wave'
  | 'primary_t_wave'
  | 'early_repolarization'
  | 'giant_negative_t'
  // Electrolytes/Medications
  | 'hyperkalemia'
  | 'hypokalemia'
  | 'digitalis'
  // Other
  | 'preexcitation'
  | 'long_qt' // kept for backward compatibility
  | 'brugada'
  | 'spodick_sign'
  | 'pq_depression'
  | 'spiked_helmet'
  | 'dagger_q'
  // Fibrosis signs
  | 'pathological_q'
  | 'pathological_q_anterior'
  | 'pathological_q_inferior'
  | 'pathological_q_lateral'
  | 'pathological_q_septal'
  | 'pathological_q_anteroapical'
  | 'pathological_q_anteromedial'
  | 'pathological_q_inferolateral'
  | 'pathological_q_extensive_anterior'
  | 'fragmented_qrs'
  // Pacemaker
  | 'pacemaker_normal'
  | 'pacemaker_sense_failure'
  | 'pacemaker_pace_failure'
  | 'pacemaker_sense_failure_atrio'
  | 'pacemaker_sense_failure_ventriculo'
  | 'pacemaker_pace_failure_atrio'
  | 'pacemaker_pace_failure_ventriculo'
  // Extrasystoles
  | 'ventricular_extrasystole'
  | 'supraventricular_extrasystole'

export type MedicalHistory =
  | 'diabetes'
  | 'hypertension'
  | 'cad'
  | 'smoking'
  | 'dyslipidemia'

export type FamilyHistory =
  | 'sudden_death'
  | 'cardiomyopathy'

export type Medication =
  | 'betablocker'
  | 'asa'
  | 'antiarrhythmic'
  | 'digitalis'
  | 'ace_inhibitor'
  | 'calcium_blocker'
  | 'diuretic'
  | 'anticoagulant'
  | 'statin'
  | 'antidepressant'

export type HospitalType =
  | 'pronto_socorro'
  | 'hospital_geral'
  | 'hospital_cardiologico'

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
          hospital_type: HospitalType | null
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
          hospital_type?: HospitalType | null
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
          hospital_type?: HospitalType | null
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
          category: Category // kept for backward compatibility
          categories: Category[] | null // new: multiple categories
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
          patient_age: number | null
          patient_sex: string | null
          clinical_presentation: string[] | null
          medical_history: MedicalHistory[] | null
          family_history: FamilyHistory[] | null
          medications: Medication[] | null
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          difficulty?: Difficulty
          category?: Category
          categories?: Category[] | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          patient_age?: number | null
          patient_sex?: string | null
          clinical_presentation?: string[] | null
          medical_history?: MedicalHistory[] | null
          family_history?: FamilyHistory[] | null
          medications?: Medication[] | null
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          difficulty?: Difficulty
          category?: Category
          categories?: Category[] | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
          patient_age?: number | null
          patient_sex?: string | null
          clinical_presentation?: string[] | null
          medical_history?: MedicalHistory[] | null
          family_history?: FamilyHistory[] | null
          medications?: Medication[] | null
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
          electrode_swap: ElectrodeSwap[] | null
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
          electrode_swap?: ElectrodeSwap[] | null
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
          electrode_swap?: ElectrodeSwap[] | null
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
          electrode_swap: ElectrodeSwap[] | null
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
          electrode_swap?: ElectrodeSwap[] | null
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
          electrode_swap?: ElectrodeSwap[] | null
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
