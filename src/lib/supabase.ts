import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'manager' | 'viewer';
          is_active: boolean;
          avatar: string | null;
          has_all_projects: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'admin' | 'manager' | 'viewer';
          is_active?: boolean;
          avatar?: string;
          has_all_projects?: boolean;
          last_login?: string;
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'admin' | 'manager' | 'viewer';
          is_active?: boolean;
          avatar?: string;
          has_all_projects?: boolean;
          last_login?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          client_name: string;
          status: 'Active' | 'On Pause' | 'Ended';
          start_date: string;
          duration: string;
          project_type: 'milestone' | 'timer' | 'fixed' | 'direct-client';
          deadline: string | null;
          weekly_hours: number | null;
          equivalent_hours: number | null;
          upwork_profile: string;
          business_developer: string;
          team_members: string[];
          primary_goals: string[];
          focus_keywords: string[];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          client_name: string;
          status?: 'Active' | 'On Pause' | 'Ended';
          start_date: string;
          duration?: string;
          project_type?: 'milestone' | 'timer' | 'fixed' | 'direct-client';
          deadline?: string;
          weekly_hours?: number;
          equivalent_hours?: number;
          upwork_profile?: string;
          business_developer?: string;
          team_members?: string[];
          primary_goals?: string[];
          focus_keywords?: string[];
          created_by?: string;
        };
        Update: {
          name?: string;
          client_name?: string;
          status?: 'Active' | 'On Pause' | 'Ended';
          start_date?: string;
          duration?: string;
          project_type?: 'milestone' | 'timer' | 'fixed' | 'direct-client';
          deadline?: string;
          weekly_hours?: number;
          equivalent_hours?: number;
          upwork_profile?: string;
          business_developer?: string;
          team_members?: string[];
          primary_goals?: string[];
          focus_keywords?: string[];
          updated_at?: string;
        };
      };
      project_assignments: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          can_view: boolean;
          can_edit: boolean;
          editable_sections: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          project_id: string;
          can_view?: boolean;
          can_edit?: boolean;
          editable_sections?: string[];
        };
        Update: {
          can_view?: boolean;
          can_edit?: boolean;
          editable_sections?: string[];
          updated_at?: string;
        };
      };
      access_items: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          date_granted: string;
          status: 'Active' | 'Pending' | 'Revoked';
          email: string;
          website_credentials: any;
          client_email: any;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          type: string;
          date_granted: string;
          status?: 'Active' | 'Pending' | 'Revoked';
          email?: string;
          website_credentials?: any;
          client_email?: any;
          notes?: string;
        };
        Update: {
          type?: string;
          date_granted?: string;
          status?: 'Active' | 'Pending' | 'Revoked';
          email?: string;
          website_credentials?: any;
          client_email?: any;
          notes?: string;
          updated_at?: string;
        };
      };
      queries: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          qa_items: any;
          linked_sheet: string;
          assigned_to: string;
          status: 'Open' | 'In Progress' | 'Resolved';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          title: string;
          qa_items?: any;
          linked_sheet?: string;
          assigned_to?: string;
          status?: 'Open' | 'In Progress' | 'Resolved';
        };
        Update: {
          title?: string;
          qa_items?: any;
          linked_sheet?: string;
          assigned_to?: string;
          status?: 'Open' | 'In Progress' | 'Resolved';
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          type: 'progress-report' | 'google-sheet' | 'looker-studio' | 'internal-doc';
          url: string;
          category: string;
          description: string;
          upload_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          name: string;
          type?: 'progress-report' | 'google-sheet' | 'looker-studio' | 'internal-doc';
          url: string;
          category?: string;
          description?: string;
          upload_date?: string;
        };
        Update: {
          name?: string;
          type?: 'progress-report' | 'google-sheet' | 'looker-studio' | 'internal-doc';
          url?: string;
          category?: string;
          description?: string;
          upload_date?: string;
          updated_at?: string;
        };
      };
      audits: {
        Row: {
          id: string;
          client_website: string;
          project_name: string;
          business_developer: string;
          auditor: string;
          audit_date: string;
          month: string;
          audit_sheet_links: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_website: string;
          project_name: string;
          business_developer: string;
          auditor: string;
          audit_date: string;
          month: string;
          audit_sheet_links?: any;
        };
        Update: {
          client_website?: string;
          project_name?: string;
          business_developer?: string;
          auditor?: string;
          audit_date?: string;
          month?: string;
          audit_sheet_links?: any;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          project_name: string;
          client_name: string;
          upwork_profile: string;
          business_developer: string;
          reporting_person: string;
          report_day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
          department_name: string;
          is_active: boolean;
          completion_history: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_name: string;
          client_name: string;
          upwork_profile: string;
          business_developer: string;
          reporting_person: string;
          report_day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
          department_name: string;
          is_active?: boolean;
          completion_history?: any;
        };
        Update: {
          project_name?: string;
          client_name?: string;
          upwork_profile?: string;
          business_developer?: string;
          reporting_person?: string;
          report_day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
          department_name?: string;
          is_active?: boolean;
          completion_history?: any;
          updated_at?: string;
        };
      };
    };
  };
}