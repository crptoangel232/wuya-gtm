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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      action_plan_items: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          opportunity_id: string
          sort_order: number
          task_text: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          opportunity_id: string
          sort_order?: number
          task_text: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          opportunity_id?: string
          sort_order?: number
          task_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_items_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          enrichment_json: Json | null
          export_error: string | null
          export_status: string | null
          exported_at: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string
          opportunity_id: string
          phone: string | null
          role: string | null
          source: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          enrichment_json?: Json | null
          export_error?: string | null
          export_status?: string | null
          exported_at?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          opportunity_id: string
          phone?: string | null
          role?: string | null
          source?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          enrichment_json?: Json | null
          export_error?: string | null
          export_status?: string | null
          exported_at?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          opportunity_id?: string
          phone?: string | null
          role?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_leads_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_exports: {
        Row: {
          created_at: string
          crm_type: string
          error_message: string | null
          id: string
          leads_count: number
          opportunity_id: string
          status: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          crm_type: string
          error_message?: string | null
          id?: string
          leads_count?: number
          opportunity_id: string
          status?: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          crm_type?: string
          error_message?: string | null
          id?: string
          leads_count?: number
          opportunity_id?: string
          status?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_exports_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          buyer_keywords: string | null
          buyer_type: string | null
          created_at: string
          id: string
          recommended_action: string | null
          score: number
          signal_id: string
          status: string
          target_city: string | null
          urgency_label: string
        }
        Insert: {
          buyer_keywords?: string | null
          buyer_type?: string | null
          created_at?: string
          id?: string
          recommended_action?: string | null
          score?: number
          signal_id: string
          status?: string
          target_city?: string | null
          urgency_label?: string
        }
        Update: {
          buyer_keywords?: string | null
          buyer_type?: string | null
          created_at?: string
          id?: string
          recommended_action?: string | null
          score?: number
          signal_id?: string
          status?: string
          target_city?: string | null
          urgency_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_images: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          id: string
          signal_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          id?: string
          signal_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          id?: string
          signal_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_images_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          created_at: string
          district: string
          harvest_deadline_days: number
          id: string
          notes: string | null
          price_drop_severity: string
          produce_type: string
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string
          district: string
          harvest_deadline_days: number
          id?: string
          notes?: string | null
          price_drop_severity: string
          produce_type: string
          quantity: number
          unit?: string
        }
        Update: {
          created_at?: string
          district?: string
          harvest_deadline_days?: number
          id?: string
          notes?: string | null
          price_drop_severity?: string
          produce_type?: string
          quantity?: number
          unit?: string
        }
        Relationships: []
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
