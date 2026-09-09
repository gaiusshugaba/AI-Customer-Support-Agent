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
      conversation_attachments: {
        Row: {
          conversation_id: string
          created_at: string
          customer_id: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          storage_path: string
          tenant_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          customer_id: string
          file_name: string
          file_size?: number
          id?: string
          mime_type: string
          storage_path: string
          tenant_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          customer_id?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          storage_path?: string
          tenant_id?: string
        }
        Relationships: []
      }
      conversation_turns: {
        Row: {
          confidence_score: number | null
          conversation_id: string
          intent: string | null
          quality_gate_passed: boolean | null
          retrieval_score: number | null
          role: string
          tenant_id: string
          text: string | null
          timestamp: string
          turn_id: number
        }
        Insert: {
          confidence_score?: number | null
          conversation_id: string
          intent?: string | null
          quality_gate_passed?: boolean | null
          retrieval_score?: number | null
          role: string
          tenant_id: string
          text?: string | null
          timestamp?: string
          turn_id?: never
        }
        Update: {
          confidence_score?: number | null
          conversation_id?: string
          intent?: string | null
          quality_gate_passed?: boolean | null
          retrieval_score?: number | null
          role?: string
          tenant_id?: string
          text?: string | null
          timestamp?: string
          turn_id?: never
        }
        Relationships: []
      }
      customer_conversations: {
        Row: {
          conversation_id: string
          created_at: string
          customer_id: string
          last_activity: string
          tenant_id: string
          title: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          customer_id: string
          last_activity?: string
          tenant_id: string
          title?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          customer_id?: string
          last_activity?: string
          tenant_id?: string
          title?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          account_status: string | null
          custom_fields: Json | null
          customer_id: string
          email: string | null
          name: string | null
          plan_tier: string | null
          tenant_id: string
        }
        Insert: {
          account_status?: string | null
          custom_fields?: Json | null
          customer_id: string
          email?: string | null
          name?: string | null
          plan_tier?: string | null
          tenant_id: string
        }
        Update: {
          account_status?: string | null
          custom_fields?: Json | null
          customer_id?: string
          email?: string | null
          name?: string | null
          plan_tier?: string | null
          tenant_id?: string
        }
        Relationships: []
      }
      escalation_cases: {
        Row: {
          case_context: Json
          case_id: string
          conversation_id: string
          created_at: string
          customer_id: string | null
          escalation_type: string
          handoff_mode: string
          intake_attempts: number
          latest_customer_message: string | null
          missing_information: Json
          provided_information: Json
          required_information: Json
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          case_context?: Json
          case_id?: string
          conversation_id: string
          created_at?: string
          customer_id?: string | null
          escalation_type: string
          handoff_mode?: string
          intake_attempts?: number
          latest_customer_message?: string | null
          missing_information?: Json
          provided_information?: Json
          required_information?: Json
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          case_context?: Json
          case_id?: string
          conversation_id?: string
          created_at?: string
          customer_id?: string | null
          escalation_type?: string
          handoff_mode?: string
          intake_attempts?: number
          latest_customer_message?: string | null
          missing_information?: Json
          provided_information?: Json
          required_information?: Json
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ingestion_log: {
        Row: {
          chunk_count: number | null
          doc_id: string | null
          embedding_model: string | null
          error_message: string | null
          failed_node: string | null
          id: number
          ingested_at: string
          status: string
          tenant_id: string | null
          title: string | null
        }
        Insert: {
          chunk_count?: number | null
          doc_id?: string | null
          embedding_model?: string | null
          error_message?: string | null
          failed_node?: string | null
          id?: never
          ingested_at: string
          status: string
          tenant_id?: string | null
          title?: string | null
        }
        Update: {
          chunk_count?: number | null
          doc_id?: string | null
          embedding_model?: string | null
          error_message?: string | null
          failed_node?: string | null
          id?: never
          ingested_at?: string
          status?: string
          tenant_id?: string | null
          title?: string | null
        }
        Relationships: []
      }
      request_errors: {
        Row: {
          error_message: string | null
          failed_node: string | null
          id: string
          occurred_at: string | null
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          error_message?: string | null
          failed_node?: string | null
          id?: string
          occurred_at?: string | null
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          error_message?: string | null
          failed_node?: string | null
          id?: string
          occurred_at?: string | null
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      tenant_config: {
        Row: {
          active_channels: string[] | null
          classification_prompt_id: string | null
          confidence_threshold: number | null
          industry_pack: string | null
          similarity_threshold: number | null
          system_prompt_id: string | null
          tenant_id: string
          tenant_name: string | null
        }
        Insert: {
          active_channels?: string[] | null
          classification_prompt_id?: string | null
          confidence_threshold?: number | null
          industry_pack?: string | null
          similarity_threshold?: number | null
          system_prompt_id?: string | null
          tenant_id: string
          tenant_name?: string | null
        }
        Update: {
          active_channels?: string[] | null
          classification_prompt_id?: string | null
          confidence_threshold?: number | null
          industry_pack?: string | null
          similarity_threshold?: number | null
          system_prompt_id?: string | null
          tenant_id?: string
          tenant_name?: string | null
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
