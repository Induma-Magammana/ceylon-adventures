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
      activities: {
        Row: {
          cancellation_policy: string | null
          category_id: string | null
          city: string | null
          cover_image: string | null
          created_at: string
          description: string
          duration_hours: number
          excluded: string[] | null
          family_friendly: boolean
          free_cancellation: boolean
          id: string
          included: string[] | null
          instant_confirmation: boolean
          latitude: number | null
          location: string
          longitude: number | null
          max_participants: number
          price_lkr: number
          provider_id: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["approval_status"]
          title: string
          updated_at: string
        }
        Insert: {
          cancellation_policy?: string | null
          category_id?: string | null
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description: string
          duration_hours?: number
          excluded?: string[] | null
          family_friendly?: boolean
          free_cancellation?: boolean
          id?: string
          included?: string[] | null
          instant_confirmation?: boolean
          latitude?: number | null
          location: string
          longitude?: number | null
          max_participants?: number
          price_lkr: number
          provider_id?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["approval_status"]
          title: string
          updated_at?: string
        }
        Update: {
          cancellation_policy?: string | null
          category_id?: string | null
          city?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          duration_hours?: number
          excluded?: string[] | null
          family_friendly?: boolean
          free_cancellation?: boolean
          id?: string
          included?: string[] | null
          instant_confirmation?: boolean
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_participants?: number
          price_lkr?: number
          provider_id?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["approval_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_images: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_images_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          activity_id: string
          available_date: string
          available_slots: number
          created_at: string
          id: string
        }
        Insert: {
          activity_id: string
          available_date: string
          available_slots: number
          created_at?: string
          id?: string
        }
        Update: {
          activity_id?: string
          available_date?: string
          available_slots?: number
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          activity_id: string
          booking_date: string
          booking_reference: string
          booking_status: Database["public"]["Enums"]["booking_status"]
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          participants: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          booking_date: string
          booking_reference?: string
          booking_status?: Database["public"]["Enums"]["booking_status"]
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          participants?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          booking_date?: string
          booking_reference?: string
          booking_status?: Database["public"]["Enums"]["booking_status"]
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          participants?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          category_name: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          slug: string
        }
        Insert: {
          category_name: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          slug: string
        }
        Update: {
          category_name?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          slug?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          payment_method: string
          payment_reference: string
          payment_status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          payment_method?: string
          payment_reference?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          payment_method?: string
          payment_reference?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          profile_image: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          profile_image?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_image?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          business_address: string | null
          company_name: string
          contact_number: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          business_address?: string | null
          company_name: string
          contact_number?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          business_address?: string | null
          company_name?: string
          contact_number?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
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
      wishlist: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "provider" | "admin"
      approval_status: "pending" | "approved" | "rejected"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      payment_status: "pending" | "paid" | "refunded" | "failed"
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
      app_role: ["customer", "provider", "admin"],
      approval_status: ["pending", "approved", "rejected"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      payment_status: ["pending", "paid", "refunded", "failed"],
    },
  },
} as const
