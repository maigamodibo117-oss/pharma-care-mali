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
      fiches_medicaments: {
        Row: {
          classe_therapeutique: string | null
          conservation: string | null
          contre_indications: string | null
          created_at: string
          date_maj: string
          dci: string
          dosage: string | null
          effets_indesirables: string | null
          forme: string | null
          id: string
          image_source: string | null
          image_url: string | null
          indications: string | null
          interactions: string | null
          laboratoire: string | null
          nom_commercial: string
          posologie: string | null
          precautions: string | null
          sources: string
          updated_at: string
        }
        Insert: {
          classe_therapeutique?: string | null
          conservation?: string | null
          contre_indications?: string | null
          created_at?: string
          date_maj?: string
          dci: string
          dosage?: string | null
          effets_indesirables?: string | null
          forme?: string | null
          id?: string
          image_source?: string | null
          image_url?: string | null
          indications?: string | null
          interactions?: string | null
          laboratoire?: string | null
          nom_commercial: string
          posologie?: string | null
          precautions?: string | null
          sources?: string
          updated_at?: string
        }
        Update: {
          classe_therapeutique?: string | null
          conservation?: string | null
          contre_indications?: string | null
          created_at?: string
          date_maj?: string
          dci?: string
          dosage?: string | null
          effets_indesirables?: string | null
          forme?: string | null
          id?: string
          image_source?: string | null
          image_url?: string | null
          indications?: string | null
          interactions?: string | null
          laboratoire?: string | null
          nom_commercial?: string
          posologie?: string | null
          precautions?: string | null
          sources?: string
          updated_at?: string
        }
        Relationships: []
      }
      medicaments: {
        Row: {
          categorie: string
          created_at: string
          date_peremption: string | null
          description: string | null
          id: string
          nom: string
          prix_fcfa: number
          seuil_alerte: number
          stock: number
          updated_at: string
          user_id: string
        }
        Insert: {
          categorie?: string
          created_at?: string
          date_peremption?: string | null
          description?: string | null
          id?: string
          nom: string
          prix_fcfa?: number
          seuil_alerte?: number
          stock?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          categorie?: string
          created_at?: string
          date_peremption?: string | null
          description?: string | null
          id?: string
          nom?: string
          prix_fcfa?: number
          seuil_alerte?: number
          stock?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ordonnances: {
        Row: {
          created_at: string
          date_ordonnance: string
          id: string
          medecin: string | null
          medicaments_prescrits: string
          notes: string | null
          patient_id: string | null
          patient_nom: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_ordonnance?: string
          id?: string
          medecin?: string | null
          medicaments_prescrits: string
          notes?: string | null
          patient_id?: string | null
          patient_nom: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_ordonnance?: string
          id?: string
          medecin?: string | null
          medicaments_prescrits?: string
          notes?: string | null
          patient_id?: string | null
          patient_nom?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordonnances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          created_at: string
          id: string
          nom: string
          notes: string | null
          prenom: string
          sexe: string | null
          telephone: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          id?: string
          nom: string
          notes?: string | null
          prenom: string
          sexe?: string | null
          telephone?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          id?: string
          nom?: string
          notes?: string | null
          prenom?: string
          sexe?: string | null
          telephone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nom: string
          prenom: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nom?: string
          prenom?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
        }
        Relationships: []
      }
      ventes: {
        Row: {
          created_at: string
          id: string
          medicament_id: string | null
          medicament_nom: string
          patient_id: string | null
          patient_nom: string | null
          prix_unitaire: number
          quantite: number
          total_fcfa: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicament_id?: string | null
          medicament_nom: string
          patient_id?: string | null
          patient_nom?: string | null
          prix_unitaire?: number
          quantite?: number
          total_fcfa?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medicament_id?: string | null
          medicament_nom?: string
          patient_id?: string | null
          patient_nom?: string | null
          prix_unitaire?: number
          quantite?: number
          total_fcfa?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventes_medicament_id_fkey"
            columns: ["medicament_id"]
            isOneToOne: false
            referencedRelation: "medicaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
