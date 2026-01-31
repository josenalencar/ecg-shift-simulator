export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin'
export type GrantedPlan = 'premium' | 'ai' | 'aluno_ecg'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Category = 'arrhythmia' | 'ischemia' | 'structural' | 'normal' | 'emergency' | 'routine' | 'advanced' | 'rare' | 'other'

export type ElectrodeSwap =
  | 'swap_la_ra'        // BE-BD (Left Arm - Right Arm)
  | 'swap_la_ll'        // BE-PE (Left Arm - Left Leg)
  | 'swap_ra_ll'        // BD-PE (Right Arm - Left Leg)
  | 'swap_rl_involved'  // Troca envolvendo perna direita
  | 'swap_precordial'   // Troca de eletrodos precordiais
export type Axis = 'normal' | 'left' | 'right' | 'extreme'
export type Interval = 'normal' | 'prolonged' | 'short' | 'wide' | 'na'

export type Rhythm =
  | 'sinus'
  | 'sinus_arrhythmia'
  | 'sinus_bradycardia'
  | 'sinus_tachycardia'
  | 'sinus_pause'
  | 'ectopic_atrial'
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
  | 'qt_short'
  | 'qt_long'
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
  // Additional AV blocks
  | 'avb_2_1'
  | 'avb_advanced'
  // Conduction
  | 'ivcd'
  // Ischemic signs
  | 'wellens'
  | 'avr_elevation_diffuse_std'
  // Additional conduction
  | 'incomplete_rbbb'
  | 'ashman_phenomenon'
  // Pediatric chamber findings
  | 'ped_left_atrial_disease'
  | 'ped_left_ventricular_disease'
  | 'ped_right_atrial_disease'
  | 'ped_right_ventricular_disease'

export type AgePattern = 'expected_for_age' | 'outside_age_pattern'

export type MedicalHistory =
  | 'diabetes'
  | 'hypertension'
  | 'cad'
  | 'smoking'
  | 'dyslipidemia'
  | 'prior_mi'
  | 'obesity'
  | 'heart_failure'

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
  | 'pediatria_geral'
  | 'pediatria_cardiologica'

// Gamification Types
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type AchievementCategory = 'ecg_count' | 'diagnosis' | 'streak' | 'perfect' | 'level' | 'special' | 'hospital' | 'pediatric'
export type AchievementUnlockType = 'counter' | 'streak' | 'category' | 'special'
export type XPEventType = '2x' | '3x'
export type XPEventTargetType = 'all' | 'inactive_7d' | 'inactive_30d' | 'inactive_60d' | 'user_specific'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          bio: string | null
          avatar: string
          role: UserRole
          is_master_admin: boolean
          hospital_type: HospitalType | null
          granted_plan: GrantedPlan | null
          email_notifications_enabled: boolean
          unsubscribe_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          bio?: string | null
          avatar?: string
          role?: UserRole
          is_master_admin?: boolean
          hospital_type?: HospitalType | null
          granted_plan?: GrantedPlan | null
          email_notifications_enabled?: boolean
          unsubscribe_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          bio?: string | null
          avatar?: string
          role?: UserRole
          is_master_admin?: boolean
          hospital_type?: HospitalType | null
          granted_plan?: GrantedPlan | null
          email_notifications_enabled?: boolean
          unsubscribe_token?: string
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
          regularity: Regularity // kept for backward compatibility
          heart_rate: number
          axis: Axis
          pr_interval: Interval
          qrs_duration: Interval
          qt_interval: Interval
          findings: Finding[]
          electrode_swap: ElectrodeSwap[] | null
          age_pattern: AgePattern | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ecg_id: string
          rhythm: Rhythm[]
          regularity?: Regularity // optional - not used in scoring
          heart_rate: number
          axis?: Axis
          pr_interval?: Interval
          qrs_duration?: Interval
          qt_interval?: Interval
          findings?: Finding[]
          electrode_swap?: ElectrodeSwap[] | null
          age_pattern?: AgePattern | null
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
          age_pattern?: AgePattern | null
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
          regularity: Regularity // kept for backward compatibility
          heart_rate: number
          axis: Axis
          pr_interval: Interval
          qrs_duration: Interval
          qt_interval: Interval
          findings: Finding[]
          electrode_swap: ElectrodeSwap[] | null
          age_pattern: AgePattern | null
          score: number
          feedback: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ecg_id: string
          rhythm: Rhythm[]
          regularity?: Regularity // optional - not used in scoring
          heart_rate: number
          axis?: Axis
          pr_interval?: Interval
          qrs_duration?: Interval
          qt_interval?: Interval
          findings?: Finding[]
          electrode_swap?: ElectrodeSwap[] | null
          age_pattern?: AgePattern | null
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
          age_pattern?: AgePattern | null
          score?: number
          feedback?: Json
          created_at?: string
        }
      }
      // Gamification Tables
      gamification_config: {
        Row: {
          id: string
          xp_per_ecg_base: number
          xp_per_score_point: number
          xp_difficulty_multipliers: { easy: number; medium: number; hard: number }
          xp_streak_bonus_per_day: number
          xp_streak_bonus_max: number
          xp_perfect_bonus: number
          level_multiplier_per_level: number
          max_level: number
          xp_per_level_base: number
          xp_per_level_growth: number
          event_2x_bonus: number
          event_3x_bonus: number
          streak_grace_period_hours: number
          inactivity_email_days: number[]
          inactivity_event_duration_hours: number
          ranking_top_n_visible: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          xp_per_ecg_base?: number
          xp_per_score_point?: number
          xp_difficulty_multipliers?: { easy: number; medium: number; hard: number }
          xp_streak_bonus_per_day?: number
          xp_streak_bonus_max?: number
          xp_perfect_bonus?: number
          level_multiplier_per_level?: number
          max_level?: number
          xp_per_level_base?: number
          xp_per_level_growth?: number
          event_2x_bonus?: number
          event_3x_bonus?: number
          streak_grace_period_hours?: number
          inactivity_email_days?: number[]
          inactivity_event_duration_hours?: number
          ranking_top_n_visible?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          xp_per_ecg_base?: number
          xp_per_score_point?: number
          xp_difficulty_multipliers?: { easy: number; medium: number; hard: number }
          xp_streak_bonus_per_day?: number
          xp_streak_bonus_max?: number
          xp_perfect_bonus?: number
          level_multiplier_per_level?: number
          max_level?: number
          xp_per_level_base?: number
          xp_per_level_growth?: number
          event_2x_bonus?: number
          event_3x_bonus?: number
          streak_grace_period_hours?: number
          inactivity_email_days?: number[]
          inactivity_event_duration_hours?: number
          ranking_top_n_visible?: number
          updated_at?: string
          updated_by?: string | null
        }
      }
      user_gamification_stats: {
        Row: {
          user_id: string
          total_xp: number
          current_level: number
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          total_ecgs_completed: number
          total_perfect_scores: number
          ecgs_by_difficulty: { easy: number; medium: number; hard: number }
          correct_by_category: Record<string, number>
          correct_by_finding: Record<string, number>
          perfect_streak: number
          events_participated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_xp?: number
          current_level?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_ecgs_completed?: number
          total_perfect_scores?: number
          ecgs_by_difficulty?: { easy: number; medium: number; hard: number }
          correct_by_category?: Record<string, number>
          correct_by_finding?: Record<string, number>
          perfect_streak?: number
          events_participated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_xp?: number
          current_level?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          total_ecgs_completed?: number
          total_perfect_scores?: number
          ecgs_by_difficulty?: { easy: number; medium: number; hard: number }
          correct_by_category?: Record<string, number>
          correct_by_finding?: Record<string, number>
          perfect_streak?: number
          events_participated?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          slug: string
          name_pt: string
          description_pt: string
          icon: string
          rarity: AchievementRarity
          category: AchievementCategory
          unlock_type: AchievementUnlockType
          unlock_conditions: Json
          xp_reward: number
          display_order: number
          is_active: boolean
          is_hidden: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_pt: string
          description_pt: string
          icon: string
          rarity: AchievementRarity
          category: AchievementCategory
          unlock_type: AchievementUnlockType
          unlock_conditions: Json
          xp_reward?: number
          display_order?: number
          is_active?: boolean
          is_hidden?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name_pt?: string
          description_pt?: string
          icon?: string
          rarity?: AchievementRarity
          category?: AchievementCategory
          unlock_type?: AchievementUnlockType
          unlock_conditions?: Json
          xp_reward?: number
          display_order?: number
          is_active?: boolean
          is_hidden?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          notified: boolean
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          notified?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
          notified?: boolean
        }
      }
      xp_events: {
        Row: {
          id: string
          name: string
          description: string | null
          multiplier_type: XPEventType
          start_at: string
          end_at: string
          target_type: XPEventTargetType
          target_user_id: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          multiplier_type: XPEventType
          start_at: string
          end_at: string
          target_type?: XPEventTargetType
          target_user_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          multiplier_type?: XPEventType
          start_at?: string
          end_at?: string
          target_type?: XPEventTargetType
          target_user_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      user_xp_events: {
        Row: {
          id: string
          user_id: string
          event_id: string
          email_sent_at: string | null
          participated: boolean
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          email_sent_at?: string | null
          participated?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          email_sent_at?: string | null
          participated?: boolean
        }
      }
      inactivity_emails: {
        Row: {
          id: string
          user_id: string
          days_inactive: number
          event_id: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          days_inactive: number
          event_id?: string | null
          sent_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          days_inactive?: number
          event_id?: string | null
          sent_at?: string
        }
      }
      ecg_dislikes: {
        Row: {
          id: string
          ecg_id: string
          user_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ecg_id: string
          user_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ecg_id?: string
          user_id?: string
          reason?: string | null
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

// Gamification helper types
export type GamificationConfig = Database['public']['Tables']['gamification_config']['Row']
export type UserGamificationStats = Database['public']['Tables']['user_gamification_stats']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type XPEvent = Database['public']['Tables']['xp_events']['Row']
export type UserXPEvent = Database['public']['Tables']['user_xp_events']['Row']
export type InactivityEmail = Database['public']['Tables']['inactivity_emails']['Row']
export type ECGDislike = Database['public']['Tables']['ecg_dislikes']['Row']

export type AchievementWithProgress = Achievement & {
  earned: boolean
  earned_at: string | null
}

export type UserStatsWithRanking = UserGamificationStats & {
  rank: number | null
  percentile: number
  profiles: {
    full_name: string | null
    email: string
  }
}

// ============================================
// Email Stats Types
// ============================================

export interface WeeklyStats {
  ecgsCompleted: number
  perfectScores: number
  totalXpEarned: number
  activeDays: number
  streakAtEnd: number
  levelAtEnd: number
  totalXpAtEnd: number
  bestScore: number
  worstScore: number
  averageScore: number
  categoriesPracticed: Record<string, number>
  difficultiesPracticed: Record<string, number>
  achievementsEarned: string[]
  ecgsDelta: number
  xpDelta: number
  averageScoreDelta: number
}

export interface MonthlyStats extends WeeklyStats {
  levelStart: number
  levelEnd: number
  levelsGained: number
  xpStart: number
  xpEnd: number
  streakBest: number
  rankAtEnd: number | null
  rankPercentile: number | null
  totalAchievementsAtEnd: number
  perfectDelta: number
  activeDaysDelta: number
  rankDelta: number
}

export interface MonthlyComparison {
  ecgsDelta: number
  perfectScoresDelta: number
  xpDelta: number
  levelDelta: number
  averageScoreDelta: number
  activeDaysDelta: number
}

export type EmailType =
  | 'first_case'
  | 'day2'
  | 'day3'
  | 'day5'
  | 'day7'
  | 'streak_starter'
  | 'streak_at_risk'
  | 'streak_milestone'
  | 'level_up'
  | 'achievement'
  | 'weekly_digest'
  | 'monthly_report'

export interface EmailTracking {
  id: string
  user_id: string
  email_type: EmailType
  sent_at: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface UserEmailPreferences {
  user_id: string
  onboarding_emails: boolean
  streak_emails: boolean
  achievement_emails: boolean
  level_up_emails: boolean
  weekly_digest: boolean
  monthly_report: boolean
  marketing_emails: boolean
  preferred_hour: number
  timezone: string
  created_at: string
  updated_at: string
}
