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
      analysis_config: {
        Row: {
          columns: string[]
          created_at: string
          id: string
        }
        Insert: {
          columns: string[]
          created_at?: string
          id: string
        }
        Update: {
          columns?: string[]
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      call_log_embeddings: {
        Row: {
          call_log_id: number | null
          created_at: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          call_log_id?: number | null
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          call_log_id?: number | null
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "call_log_embeddings_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          call_time_phone: number | null
          call_time_video: number | null
          category: string | null
          closed: string | null
          created: string | null
          created_at: string | null
          created_by: string | null
          created_on: string | null
          customer_number: string | null
          e_identification: boolean | null
          first_contact: string | null
          first_offered_time: string | null
          first_user_id: string | null
          form_closing: string | null
          id: number
          last_user_id: string | null
          number_pres: string | null
          phone_no: string | null
          post_tag_code: string | null
          recordings: number | null
          scheduled_time: string | null
          sms_received: number | null
          sms_sent: number | null
          teleq_id: number | null
          type_of_task_closed: string | null
          type_of_task_created: string | null
          unique_task_id: string | null
          user_time: string | null
        }
        Insert: {
          call_time_phone?: number | null
          call_time_video?: number | null
          category?: string | null
          closed?: string | null
          created?: string | null
          created_at?: string | null
          created_by?: string | null
          created_on?: string | null
          customer_number?: string | null
          e_identification?: boolean | null
          first_contact?: string | null
          first_offered_time?: string | null
          first_user_id?: string | null
          form_closing?: string | null
          id?: number
          last_user_id?: string | null
          number_pres?: string | null
          phone_no?: string | null
          post_tag_code?: string | null
          recordings?: number | null
          scheduled_time?: string | null
          sms_received?: number | null
          sms_sent?: number | null
          teleq_id?: number | null
          type_of_task_closed?: string | null
          type_of_task_created?: string | null
          unique_task_id?: string | null
          user_time?: string | null
        }
        Update: {
          call_time_phone?: number | null
          call_time_video?: number | null
          category?: string | null
          closed?: string | null
          created?: string | null
          created_at?: string | null
          created_by?: string | null
          created_on?: string | null
          customer_number?: string | null
          e_identification?: boolean | null
          first_contact?: string | null
          first_offered_time?: string | null
          first_user_id?: string | null
          form_closing?: string | null
          id?: number
          last_user_id?: string | null
          number_pres?: string | null
          phone_no?: string | null
          post_tag_code?: string | null
          recordings?: number | null
          scheduled_time?: string | null
          sms_received?: number | null
          sms_sent?: number | null
          teleq_id?: number | null
          type_of_task_closed?: string | null
          type_of_task_created?: string | null
          unique_task_id?: string | null
          user_time?: string | null
        }
        Relationships: []
      }
      memory: {
        Row: {
          created_at: string
          id: number
          image_url: string
          theme: string
        }
        Insert: {
          created_at?: string
          id?: never
          image_url: string
          theme: string
        }
        Update: {
          created_at?: string
          id?: never
          image_url?: string
          theme?: string
        }
        Relationships: []
      }
      pipeline_assignments: {
        Row: {
          client_id: string | null
          consultant_id: string | null
          created_at: string
          end_date: string | null
          id: string
          role: string | null
          start_date: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          consultant_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          role?: string | null
          start_date: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          consultant_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          role?: string | null
          start_date?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "pipeline_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "pipeline_consultants"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_clients: {
        Row: {
          company_name: string
          contact_email: string | null
          contact_person: string | null
          created_at: string
          id: string
          industry: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pipeline_consultants: {
        Row: {
          auth_id: string | null
          broker_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          role: string | null
          skills: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          auth_id?: string | null
          broker_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string | null
          skills?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          auth_id?: string | null
          broker_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          skills?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pipeline_customers: {
        Row: {
          Assistant: string | null
          base: string | null
          created_at: string
          id: number
          key: string | null
          name: string | null
          user_id: string | null
          vector_store: string | null
        }
        Insert: {
          Assistant?: string | null
          base?: string | null
          created_at?: string
          id?: number
          key?: string | null
          name?: string | null
          user_id?: string | null
          vector_store?: string | null
        }
        Update: {
          Assistant?: string | null
          base?: string | null
          created_at?: string
          id?: number
          key?: string | null
          name?: string | null
          user_id?: string | null
          vector_store?: string | null
        }
        Relationships: []
      }
      pipeline_items: {
        Row: {
          client_id: string
          consultant_id: string | null
          created_at: string
          id: string
          sign_date: string | null
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          consultant_id?: string | null
          created_at?: string
          id?: string
          sign_date?: string | null
          stage: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          consultant_id?: string | null
          created_at?: string
          id?: string
          sign_date?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "pipeline_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_items_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "pipeline_consultants"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_sign_in_at: string | null
          role: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          last_sign_in_at?: string | null
          role?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_sign_in_at?: string | null
          role?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      pipeline_resumes: {
        Row: {
          consultant_id: string | null
          created_at: string
          file_id: string
          filename: string
          id: string
          user_id: string | null
          vector_store_id: string | null
        }
        Insert: {
          consultant_id?: string | null
          created_at?: string
          file_id: string
          filename: string
          id?: string
          user_id?: string | null
          vector_store_id?: string | null
        }
        Update: {
          consultant_id?: string | null
          created_at?: string
          file_id?: string
          filename?: string
          id?: string
          user_id?: string | null
          vector_store_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_call_logs: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          similarity: number
          metadata: Json
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      upvote_rag_solution: {
        Args: {
          solution_id: number
        }
        Returns: undefined
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
