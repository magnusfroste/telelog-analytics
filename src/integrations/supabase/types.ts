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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      upvote_rag_solution: {
        Args: {
          solution_id: number
        }
        Returns: undefined
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
