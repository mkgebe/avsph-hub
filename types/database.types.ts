// Generated from the Supabase schema in supabase/migrations.
// Regenerate with:
//   npx supabase gen types typescript --project-id dckqjlsbwyofyiuxwkwe
// The Row/Insert aliases at the bottom are hand-added for the data layer.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_businesses: {
        Row: {
          admin_id: string
          business_id: string
          created_at: string
        }
        Insert: {
          admin_id: string
          business_id: string
          created_at?: string
        }
        Update: {
          admin_id?: string
          business_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_businesses_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_businesses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          legacy_id: string | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          legacy_id?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          legacy_id?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          legacy_id: string | null
          logo: string | null
          name: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          logo?: string | null
          name: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          logo?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          billing_info: string | null
          business_id: string
          company_name: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          legacy_id: string | null
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["client_status"]
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          billing_info?: string | null
          business_id: string
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          billing_info?: string | null
          business_id?: string
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legacy_id?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      compensation_profiles: {
        Row: {
          business_id: string
          created_at: string
          currency: string
          effective_from: string
          effective_to: string | null
          hourly_rate: number
          id: string
          is_active: boolean
          is_pag_ibig_enabled: boolean
          is_phil_health_enabled: boolean
          is_sss_enabled: boolean
          is_transportation_allowance_enabled: boolean
          legacy_id: string | null
          name: string
          night_differential_rate_multiplier: number
          overtime_rate_multiplier: number
          pag_ibig_deduction_fixed_amount: number
          phil_health_deduction_fixed_amount: number
          sss_deduction_fixed_amount: number
          sunday_rate_multiplier: number
          transportation_allowance_monthly_amount: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          currency: string
          effective_from: string
          effective_to?: string | null
          hourly_rate: number
          id?: string
          is_active?: boolean
          is_pag_ibig_enabled?: boolean
          is_phil_health_enabled?: boolean
          is_sss_enabled?: boolean
          is_transportation_allowance_enabled?: boolean
          legacy_id?: string | null
          name: string
          night_differential_rate_multiplier?: number
          overtime_rate_multiplier?: number
          pag_ibig_deduction_fixed_amount?: number
          phil_health_deduction_fixed_amount?: number
          sss_deduction_fixed_amount?: number
          sunday_rate_multiplier?: number
          transportation_allowance_monthly_amount?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          currency?: string
          effective_from?: string
          effective_to?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean
          is_pag_ibig_enabled?: boolean
          is_phil_health_enabled?: boolean
          is_sss_enabled?: boolean
          is_transportation_allowance_enabled?: boolean
          legacy_id?: string | null
          name?: string
          night_differential_rate_multiplier?: number
          overtime_rate_multiplier?: number
          pag_ibig_deduction_fixed_amount?: number
          phil_health_deduction_fixed_amount?: number
          sss_deduction_fixed_amount?: number
          sunday_rate_multiplier?: number
          transportation_allowance_monthly_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compensation_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          bill_rate_usd: number | null
          business_id: string
          client_id: string | null
          compensation_profile_id: string | null
          created_at: string
          date_hired: string
          department: string | null
          email: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          legacy_id: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          position: string
          salary: number | null
          salary_type: Database["public"]["Enums"]["salary_type"] | null
          status: Database["public"]["Enums"]["staff_status"]
          updated_at: string
        }
        Insert: {
          bill_rate_usd?: number | null
          business_id: string
          client_id?: string | null
          compensation_profile_id?: string | null
          created_at?: string
          date_hired: string
          department?: string | null
          email: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          first_name: string
          id: string
          is_active?: boolean
          last_name: string
          legacy_id?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          position: string
          salary?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
        }
        Update: {
          bill_rate_usd?: number | null
          business_id?: string
          client_id?: string | null
          compensation_profile_id?: string | null
          created_at?: string
          date_hired?: string
          department?: string | null
          email?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          legacy_id?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string
          salary?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          status?: Database["public"]["Enums"]["staff_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_compensation_profile_id_fkey"
            columns: ["compensation_profile_id"]
            isOneToOne: false
            referencedRelation: "compensation_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          id: string
          name: string
          staff_id: string
          type: string
          uploaded_at: string
          url: string
        }
        Insert: {
          id?: string
          name: string
          staff_id: string
          type: string
          uploaded_at?: string
          url: string
        }
        Update: {
          id?: string
          name?: string
          staff_id?: string
          type?: string
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_documents_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
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
      admin_role: "super-admin" | "admin"
      client_status: "active" | "inactive"
      employment_type: "full-time" | "part-time" | "contract"
      salary_type: "hourly" | "daily" | "monthly" | "annual"
      staff_status: "active" | "on_leave" | "terminated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ── Aliases used by the data layer ────────────────────────────────────────

type PublicTables = Database["public"]["Tables"];
type PublicEnums = Database["public"]["Enums"];

export type AdminRoleEnum = PublicEnums["admin_role"];
export type ClientStatusEnum = PublicEnums["client_status"];
export type EmploymentTypeEnum = PublicEnums["employment_type"];
export type SalaryTypeEnum = PublicEnums["salary_type"];
export type StaffStatusEnum = PublicEnums["staff_status"];

export type AdminRow = PublicTables["admins"]["Row"];
export type AdminBusinessRow = PublicTables["admin_businesses"]["Row"];
export type BusinessRow = PublicTables["businesses"]["Row"];
export type ClientRow = PublicTables["clients"]["Row"];
export type CompensationProfileRow = PublicTables["compensation_profiles"]["Row"];
export type StaffRow = PublicTables["staff"]["Row"];
export type StaffDocumentRow = PublicTables["staff_documents"]["Row"];

export type StaffInsert = PublicTables["staff"]["Insert"];
export type StaffUpdate = PublicTables["staff"]["Update"];
export type AdminInsert = PublicTables["admins"]["Insert"];
