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
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      anbieter: {
        Row: {
          adresse: string | null
          created_at: string
          id: string
          kanton: string | null
          kontakt_email: string | null
          kontakt_telefon: string | null
          kurstyp: Database["public"]["Enums"]["kurstyp"]
          lat: number | null
          lng: number | null
          name: string
          ort: string | null
          plz: string | null
          preis_chf: number | null
          slug: string
          sprache: string[]
          status: Database["public"]["Enums"]["anbieter_status"]
          termine_url: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          id?: string
          kanton?: string | null
          kontakt_email?: string | null
          kontakt_telefon?: string | null
          kurstyp?: Database["public"]["Enums"]["kurstyp"]
          lat?: number | null
          lng?: number | null
          name: string
          ort?: string | null
          plz?: string | null
          preis_chf?: number | null
          slug: string
          sprache?: string[]
          status?: Database["public"]["Enums"]["anbieter_status"]
          termine_url?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string
          id?: string
          kanton?: string | null
          kontakt_email?: string | null
          kontakt_telefon?: string | null
          kurstyp?: Database["public"]["Enums"]["kurstyp"]
          lat?: number | null
          lng?: number | null
          name?: string
          ort?: string | null
          plz?: string | null
          preis_chf?: number | null
          slug?: string
          sprache?: string[]
          status?: Database["public"]["Enums"]["anbieter_status"]
          termine_url?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anbieter_kanton_fkey"
            columns: ["kanton"]
            isOneToOne: false
            referencedRelation: "kantone"
            referencedColumns: ["kuerzel"]
          },
        ]
      }
      gutschein_klicks: {
        Row: {
          anbieter_id: string
          email: string | null
          id: string
          zeitpunkt: string
        }
        Insert: {
          anbieter_id: string
          email?: string | null
          id?: string
          zeitpunkt?: string
        }
        Update: {
          anbieter_id?: string
          email?: string | null
          id?: string
          zeitpunkt?: string
        }
        Relationships: [
          {
            foreignKeyName: "gutschein_klicks_anbieter_id_fkey"
            columns: ["anbieter_id"]
            isOneToOne: false
            referencedRelation: "anbieter"
            referencedColumns: ["id"]
          },
        ]
      }
      kantone: {
        Row: {
          kuerzel: string
          name: string
        }
        Insert: {
          kuerzel: string
          name: string
        }
        Update: {
          kuerzel?: string
          name?: string
        }
        Relationships: []
      }
      kurstermine: {
        Row: {
          anbieter_id: string
          created_at: string
          id: string
          kursbeginn: string
          plaetze_frei: number | null
          quelle_zuletzt_geprueft: string | null
        }
        Insert: {
          anbieter_id: string
          created_at?: string
          id?: string
          kursbeginn: string
          plaetze_frei?: number | null
          quelle_zuletzt_geprueft?: string | null
        }
        Update: {
          anbieter_id?: string
          created_at?: string
          id?: string
          kursbeginn?: string
          plaetze_frei?: number | null
          quelle_zuletzt_geprueft?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kurstermine_anbieter_id_fkey"
            columns: ["anbieter_id"]
            isOneToOne: false
            referencedRelation: "anbieter"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin_role: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      anbieter_status: "aktiv" | "inaktiv"
      app_role: "admin" | "user"
      kurstyp: "vku" | "nothelferkurs" | "beide"
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
    Enums: {
      anbieter_status: ["aktiv", "inaktiv"],
      app_role: ["admin", "user"],
      kurstyp: ["vku", "nothelferkurs", "beide"],
    },
  },
} as const
