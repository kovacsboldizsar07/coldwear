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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          email: string | null
          id: string
          recovered: boolean | null
          total_price: number | null
          updated_at: string | null
          utm_source: string | null
        }
        Insert: {
          email?: string | null
          id: string
          recovered?: boolean | null
          total_price?: number | null
          updated_at?: string | null
          utm_source?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          recovered?: boolean | null
          total_price?: number | null
          updated_at?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      ad_spend: {
        Row: {
          campaign_name: string
          clicks: number | null
          conversions: number | null
          date: string
          id: number
          impressions: number | null
          platform: string
          spend: number
        }
        Insert: {
          campaign_name?: string
          clicks?: number | null
          conversions?: number | null
          date: string
          id?: number
          impressions?: number | null
          platform: string
          spend?: number
        }
        Update: {
          campaign_name?: string
          clicks?: number | null
          conversions?: number | null
          date?: string
          id?: number
          impressions?: number | null
          platform?: string
          spend?: number
        }
        Relationships: []
      }
      block_views: {
        Row: {
          block_id: string | null
          created_at: string | null
          id: number
          max_scroll_pct: number | null
          session_id: string | null
          time_spent_sec: number | null
        }
        Insert: {
          block_id?: string | null
          created_at?: string | null
          id?: number
          max_scroll_pct?: number | null
          session_id?: string | null
          time_spent_sec?: number | null
        }
        Update: {
          block_id?: string | null
          created_at?: string | null
          id?: number
          max_scroll_pct?: number | null
          session_id?: string | null
          time_spent_sec?: number | null
        }
        Relationships: []
      }
      capi_deliveries: {
        Row: {
          attempts: number
          consent_id: string
          created_at: string
          event_id: string
          event_name: string
          event_payload: Json
          event_time: number
          last_error: string | null
          lease_token: string | null
          lease_until: string | null
          next_attempt_at: string
          order_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          consent_id: string
          created_at?: string
          event_id: string
          event_name: string
          event_payload: Json
          event_time: number
          last_error?: string | null
          lease_token?: string | null
          lease_until?: string | null
          next_attempt_at?: string
          order_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          consent_id?: string
          created_at?: string
          event_id?: string
          event_name?: string
          event_payload?: Json
          event_time?: number
          last_error?: string | null
          lease_token?: string | null
          lease_until?: string | null
          next_attempt_at?: string
          order_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "capi_deliveries_consent_id_fkey"
            columns: ["consent_id"]
            isOneToOne: false
            referencedRelation: "marketing_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      capi_log: {
        Row: {
          created_at: string | null
          event_id: string | null
          event_name: string | null
          id: number
          response: Json | null
          status_code: number | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          event_name?: string | null
          id?: number
          response?: Json | null
          status_code?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          event_name?: string | null
          id?: number
          response?: Json | null
          status_code?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_id: string | null
          event_name: string | null
          id: number
          page_path: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_id?: string | null
          event_name?: string | null
          id?: number
          page_path?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_id?: string | null
          event_name?: string | null
          id?: number
          page_path?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json | null
          key: string
          last_event_at: string | null
          message: string | null
          status: string | null
        }
        Insert: {
          config?: Json | null
          key: string
          last_event_at?: string | null
          message?: string | null
          status?: string | null
        }
        Update: {
          config?: Json | null
          key?: string
          last_event_at?: string | null
          message?: string | null
          status?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          client_ip: string | null
          consent_text: string
          consent_version: string
          created_at: string
          email: string
          id: string
          page_path: string | null
          source: string
          unsubscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          client_ip?: string | null
          consent_text: string
          consent_version: string
          created_at?: string
          email: string
          id?: string
          page_path?: string | null
          source?: string
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          client_ip?: string | null
          consent_text?: string
          consent_version?: string
          created_at?: string
          email?: string
          id?: string
          page_path?: string | null
          source?: string
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      marketing_permissions: {
        Row: {
          accepted_at: string
          client_ip: string | null
          expires_at: string
          id: string
          notice_version: string
          revoked_at: string | null
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          accepted_at?: string
          client_ip?: string | null
          expires_at: string
          id: string
          notice_version?: string
          revoked_at?: string | null
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          accepted_at?: string
          client_ip?: string | null
          expires_at?: string
          id?: string
          notice_version?: string
          revoked_at?: string | null
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          discount: number | null
          id: number
          order_id: string | null
          price: number | null
          product_title: string | null
          quantity: number | null
          sku: string | null
          variant_title: string | null
        }
        Insert: {
          discount?: number | null
          id?: number
          order_id?: string | null
          price?: number | null
          product_title?: string | null
          quantity?: number | null
          sku?: string | null
          variant_title?: string | null
        }
        Update: {
          discount?: number | null
          id?: number
          order_id?: string | null
          price?: number | null
          product_title?: string | null
          quantity?: number | null
          sku?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          angle: string | null
          cancelled_at: string | null
          capi_sent_at: string | null
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_phone: string | null
          fbc: string | null
          fbclid: string | null
          fbp: string | null
          financial_status: string | null
          fulfillment_status: string | null
          gclid: string | null
          id: string
          marketing_consent: boolean | null
          order_number: string | null
          payment_gateway: string | null
          shipping_price: number | null
          subtotal_price: number | null
          total_discounts: number | null
          total_price: number | null
          total_tax: number | null
          ttclid: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          angle?: string | null
          cancelled_at?: string | null
          capi_sent_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          fbc?: string | null
          fbclid?: string | null
          fbp?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          gclid?: string | null
          id: string
          marketing_consent?: boolean | null
          order_number?: string | null
          payment_gateway?: string | null
          shipping_price?: number | null
          subtotal_price?: number | null
          total_discounts?: number | null
          total_price?: number | null
          total_tax?: number | null
          ttclid?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          angle?: string | null
          cancelled_at?: string | null
          capi_sent_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          fbc?: string | null
          fbclid?: string | null
          fbp?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          gclid?: string | null
          id?: string
          marketing_consent?: boolean | null
          order_number?: string | null
          payment_gateway?: string | null
          shipping_price?: number | null
          subtotal_price?: number | null
          total_discounts?: number | null
          total_price?: number | null
          total_tax?: number | null
          ttclid?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      product_costs: {
        Row: {
          cod_fee: number | null
          cogs: number | null
          id: number
          packaging_cost: number | null
          payment_fee_pct: number | null
          product_key: string
          return_rate_pct: number | null
          shipping_cost: number | null
          title: string
          vat_pct: number | null
          waste_cost: number | null
        }
        Insert: {
          cod_fee?: number | null
          cogs?: number | null
          id?: number
          packaging_cost?: number | null
          payment_fee_pct?: number | null
          product_key: string
          return_rate_pct?: number | null
          shipping_cost?: number | null
          title: string
          vat_pct?: number | null
          waste_cost?: number | null
        }
        Update: {
          cod_fee?: number | null
          cogs?: number | null
          id?: number
          packaging_cost?: number | null
          payment_fee_pct?: number | null
          product_key?: string
          return_rate_pct?: number | null
          shipping_cost?: number | null
          title?: string
          vat_pct?: number | null
          waste_cost?: number | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          order_id: string | null
          reason: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id: string
          order_id?: string | null
          reason?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          angle: string | null
          consent_level: string | null
          created_at: string | null
          device: string | null
          fbclid: string | null
          gclid: string | null
          id: string
          landing_path: string | null
          ttclid: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
        }
        Insert: {
          angle?: string | null
          consent_level?: string | null
          created_at?: string | null
          device?: string | null
          fbclid?: string | null
          gclid?: string | null
          id: string
          landing_path?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Update: {
          angle?: string | null
          consent_level?: string | null
          created_at?: string | null
          device?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          landing_path?: string | null
          ttclid?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          error: string | null
          lease_token: string | null
          lease_until: string | null
          received_at: string | null
          status: string | null
          topic: string | null
          webhook_id: string
        }
        Insert: {
          error?: string | null
          lease_token?: string | null
          lease_until?: string | null
          received_at?: string | null
          status?: string | null
          topic?: string | null
          webhook_id: string
        }
        Update: {
          error?: string | null
          lease_token?: string | null
          lease_until?: string | null
          received_at?: string | null
          status?: string | null
          topic?: string | null
          webhook_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_capi_delivery: {
        Args: { p_event_id?: string }
        Returns: {
          attempts: number
          consent_id: string
          created_at: string
          event_id: string
          event_name: string
          event_payload: Json
          event_time: number
          last_error: string | null
          lease_token: string | null
          lease_until: string | null
          next_attempt_at: string
          order_id: string | null
          sent_at: string | null
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "capi_deliveries"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_shopify_webhook: {
        Args: { p_id: string; p_topic: string }
        Returns: string
      }
      grant_marketing_permission: {
        Args: {
          p_agent: string
          p_expires: string
          p_id: string
          p_ip: string
          p_notice: string
          p_visitor: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      replace_mirrored_order_items: {
        Args: { p_items: Json; p_order: string }
        Returns: undefined
      }
      revoke_marketing_permission: {
        Args: { p_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
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
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
