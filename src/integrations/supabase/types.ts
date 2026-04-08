export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_reviews: {
        Row: {
          child_id: string
          created_at: string
          data_range: string | null
          id: string
          model_used: string | null
          review_text: string
        }
        Insert: {
          child_id: string
          created_at?: string
          data_range?: string | null
          id?: string
          model_used?: string | null
          review_text: string
        }
        Update: {
          child_id?: string
          created_at?: string
          data_range?: string | null
          id?: string
          model_used?: string | null
          review_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_reviews_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      bedtime_chapters: {
        Row: {
          chapter_number: number
          child_id: string
          created_at: string
          id: string
          illustration_url: string | null
          materia_color: string | null
          materia_name: string | null
          story_text: string
          title: string
        }
        Insert: {
          chapter_number: number
          child_id: string
          created_at?: string
          id?: string
          illustration_url?: string | null
          materia_color?: string | null
          materia_name?: string | null
          story_text: string
          title: string
        }
        Update: {
          chapter_number?: number
          child_id?: string
          created_at?: string
          id?: string
          illustration_url?: string | null
          materia_color?: string | null
          materia_name?: string | null
          story_text?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bedtime_chapters_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          created_at: string
          created_by: string | null
          date_of_birth: string
          handover_mode: boolean | null
          id: string
          name: string
          night_start_hour: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_of_birth: string
          handover_mode?: boolean | null
          id?: string
          name: string
          night_start_hour?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_of_birth?: string
          handover_mode?: boolean | null
          id?: string
          name?: string
          night_start_hour?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          child_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          child_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          child_id: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          status?: string
          token: string
        }
        Update: {
          child_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_at: string
          child_id: string
          created_at: string
          id: string
          milestone_key: string
        }
        Insert: {
          achieved_at?: string
          child_id: string
          created_at?: string
          id?: string
          milestone_key: string
        }
        Update: {
          achieved_at?: string
          child_id?: string
          created_at?: string
          id?: string
          milestone_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      night_wakings: {
        Row: {
          back_to_sleep_time: string | null
          created_at: string
          id: string
          sleep_entry_id: string
          wake_time: string
        }
        Insert: {
          back_to_sleep_time?: string | null
          created_at?: string
          id?: string
          sleep_entry_id: string
          wake_time: string
        }
        Update: {
          back_to_sleep_time?: string | null
          created_at?: string
          id?: string
          sleep_entry_id?: string
          wake_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "night_wakings_sleep_entry_id_fkey"
            columns: ["sleep_entry_id"]
            isOneToOne: false
            referencedRelation: "sleep_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          onboarding_complete: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          onboarding_complete?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_complete?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      sleep_entries: {
        Row: {
          child_id: string
          created_at: string
          id: string
          is_deleted: boolean
          sleep_end: string | null
          sleep_start: string
          sleep_type: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          sleep_end?: string | null
          sleep_start: string
          sleep_type?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          sleep_end?: string | null
          sleep_start?: string
          sleep_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      wake_window_config: {
        Row: {
          id: string
          max_age_weeks: number
          max_wake_minutes: number
          min_age_weeks: number
          min_wake_minutes: number
        }
        Insert: {
          id?: string
          max_age_weeks: number
          max_wake_minutes: number
          min_age_weeks: number
          min_wake_minutes: number
        }
        Update: {
          id?: string
          max_age_weeks?: number
          max_wake_minutes?: number
          min_age_weeks?: number
          min_wake_minutes?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_family_member: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
