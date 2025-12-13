export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          category_id: string | null
          category_name: string | null
          created_at: string
          description: string | null
          id: number
          is_available: boolean
          is_deleted: boolean
          last_seen_at: string | null
          merchant_id: number
          name: string
          provider: string
          provider_item_id: string
          provider_updated_at: string | null
          provider_version: number | null
          raw: Json | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_available?: boolean
          is_deleted?: boolean
          last_seen_at?: string | null
          merchant_id: number
          name: string
          provider?: string
          provider_item_id: string
          provider_updated_at?: string | null
          provider_version?: number | null
          raw?: Json | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: number
          is_available?: boolean
          is_deleted?: boolean
          last_seen_at?: string | null
          merchant_id?: number
          name?: string
          provider?: string
          provider_item_id?: string
          provider_updated_at?: string | null
          provider_version?: number | null
          raw?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          access_token: string
          connected_at: string
          created_at: string
          id: number
          last_refreshed_at: string | null
          locations: Json
          name: string
          onboarding_completed: boolean
          provider: string
          provider_merchant_id: string
          refresh_failure_count: number
          refresh_token: string
          revoked: boolean
          scopes_mismatch: boolean
          token_expires_at: string
          token_scopes: string[]
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          created_at?: string
          id?: number
          last_refreshed_at?: string | null
          locations?: Json
          name: string
          onboarding_completed?: boolean
          provider: string
          provider_merchant_id: string
          refresh_failure_count?: number
          refresh_token: string
          revoked?: boolean
          scopes_mismatch?: boolean
          token_expires_at: string
          token_scopes?: string[]
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          created_at?: string
          id?: number
          last_refreshed_at?: string | null
          locations?: Json
          name?: string
          onboarding_completed?: boolean
          provider?: string
          provider_merchant_id?: string
          refresh_failure_count?: number
          refresh_token?: string
          revoked?: boolean
          scopes_mismatch?: boolean
          token_expires_at?: string
          token_scopes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      pgmigrations: {
        Row: {
          id: number
          name: string
          run_on: string
        }
        Insert: {
          id?: number
          name: string
          run_on: string
        }
        Update: {
          id?: number
          name?: string
          run_on?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          account_setup_complete: boolean
          created_at: string
          email_verification_sent_at: string | null
          email_verified_at: string | null
          id: string
          merchant_id: number
          password_set_at: string | null
          provider_user_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          account_setup_complete?: boolean
          created_at?: string
          email_verification_sent_at?: string | null
          email_verified_at?: string | null
          id: string
          merchant_id: number
          password_set_at?: string | null
          provider_user_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          account_setup_complete?: boolean
          created_at?: string
          email_verification_sent_at?: string | null
          email_verified_at?: string | null
          id?: string
          merchant_id?: number
          password_set_at?: string | null
          provider_user_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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

