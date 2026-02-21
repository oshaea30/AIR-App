export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      opportunities: {
        Row: {
          id: string;
          title: string;
          org: string;
          type: "Job" | "Grant" | "Pitch Call" | "Fellowship";
          location: string;
          compensation: string;
          deadline: string;
          tags: string[];
          match_reason: string;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          org: string;
          type: "Job" | "Grant" | "Pitch Call" | "Fellowship";
          location: string;
          compensation: string;
          deadline: string;
          tags?: string[];
          match_reason: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Insert"]>;
        Relationships: [];
      };
      pipeline_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          client: string;
          due_date: string;
          value: number;
          stage: "To Pitch" | "Applied" | "Interview" | "Booked" | "Invoiced" | "Paid";
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          client: string;
          due_date: string;
          value: number;
          stage: "To Pitch" | "Applied" | "Interview" | "Booked" | "Invoiced" | "Paid";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pipeline_items"]["Insert"]>;
        Relationships: [];
      };
      member_profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          location: string | null;
          skills: string[];
          beats: string[];
          pay_floor: number | null;
          notify_daily: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          location?: string | null;
          skills?: string[];
          beats?: string[];
          pay_floor?: number | null;
          notify_daily?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["member_profiles"]["Insert"]>;
        Relationships: [];
      };
      saved_opportunities: {
        Row: {
          user_id: string;
          opportunity_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          opportunity_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_opportunities"]["Insert"]>;
        Relationships: [];
      };
      mentor_checkins: {
        Row: {
          id: string;
          user_id: string;
          mentor_name: string;
          topic: string;
          next_check_in: string;
          notes: string | null;
          status: "Scheduled" | "Completed";
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          mentor_name: string;
          topic: string;
          next_check_in: string;
          notes?: string | null;
          status?: "Scheduled" | "Completed";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mentor_checkins"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
