import { supabase } from '../lib/supabase';
import { Project, AccessItem, Query, ProjectDocument } from '../types';

export class ProjectService {
  static async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          access_items (*),
          queries (*),
          documents (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          throw new Error('Could not find the table \'public.projects\' in the schema cache. Please run database migrations in your Supabase project.');
        }
        throw error;
      }

      return data ? data.map(this.mapProjectFromDB) : [];
    } catch (error) {
      console.error('ProjectService.getAllProjects error:', error);
      throw error;
    }
  }

  static async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        access_items (*),
        queries (*),
        documents (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapProjectFromDB(data);
  }

  static async createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        client_name: projectData.clientName,
        status: projectData.status,
        start_date: projectData.startDate,
        duration: projectData.duration,
        project_type: projectData.projectType,
        deadline: projectData.deadline,
        weekly_hours: projectData.weeklyHours,
        equivalent_hours: projectData.equivalentHours,
        upwork_profile: projectData.upworkProfile,
        business_developer: projectData.businessDeveloper,
        team_members: projectData.teamMembers,
        primary_goals: projectData.primaryGoals,
        focus_keywords: projectData.focusKeywords,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapProjectFromDB({
      ...data,
      access_items: [],
      queries: [],
      documents: []
    });
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        client_name: updates.clientName,
        status: updates.status,
        start_date: updates.startDate,
        duration: updates.duration,
        project_type: updates.projectType,
        deadline: updates.deadline,
        weekly_hours: updates.weeklyHours,
        equivalent_hours: updates.equivalentHours,
        upwork_profile: updates.upworkProfile,
        business_developer: updates.businessDeveloper,
        team_members: updates.teamMembers,
        primary_goals: updates.primaryGoals,
        focus_keywords: updates.focusKeywords,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        access_items (*),
        queries (*),
        documents (*)
      `)
      .single();

    if (error) throw error;

    return this.mapProjectFromDB(data);
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Access Items
  static async addAccessItem(projectId: string, accessItem: Omit<AccessItem, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('access_items')
      .insert({
        project_id: projectId,
        type: accessItem.type,
        date_granted: accessItem.dateGranted,
        status: accessItem.status,
        email: accessItem.email,
        website_credentials: accessItem.websiteCredentials,
        client_email: accessItem.clientEmail,
        notes: accessItem.notes
      });

    if (error) throw error;
  }

  static async updateAccessItem(id: string, updates: Partial<AccessItem>): Promise<void> {
    const { error } = await supabase
      .from('access_items')
      .update({
        type: updates.type,
        date_granted: updates.dateGranted,
        status: updates.status,
        email: updates.email,
        website_credentials: updates.websiteCredentials,
        client_email: updates.clientEmail,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteAccessItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('access_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Queries
  static async addQuery(projectId: string, query: Omit<Query, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('queries')
      .insert({
        project_id: projectId,
        title: query.title,
        qa_items: query.qaItems,
        linked_sheet: query.linkedSheet,
        assigned_to: query.assignedTo,
        status: query.status
      });

    if (error) throw error;
  }

  static async updateQuery(id: string, updates: Partial<Query>): Promise<void> {
    const { error } = await supabase
      .from('queries')
      .update({
        title: updates.title,
        qa_items: updates.qaItems,
        linked_sheet: updates.linkedSheet,
        assigned_to: updates.assignedTo,
        status: updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteQuery(id: string): Promise<void> {
    const { error } = await supabase
      .from('queries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Documents
  static async addDocument(projectId: string, document: Omit<ProjectDocument, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        name: document.name,
        type: document.type,
        url: document.url,
        category: document.category,
        description: document.description,
        upload_date: document.uploadDate
      });

    if (error) throw error;
  }

  static async updateDocument(id: string, updates: Partial<ProjectDocument>): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({
        name: updates.name,
        type: updates.type,
        url: updates.url,
        category: updates.category,
        description: updates.description,
        upload_date: updates.uploadDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Helper method to map database row to Project type
  private static mapProjectFromDB(data: any): Project {
    return {
      id: data.id,
      name: data.name,
      clientName: data.client_name,
      status: data.status,
      startDate: data.start_date,
      duration: data.duration,
      projectType: data.project_type,
      deadline: data.deadline,
      weeklyHours: data.weekly_hours,
      equivalentHours: data.equivalent_hours,
      upworkProfile: data.upwork_profile,
      businessDeveloper: data.business_developer,
      teamMembers: data.team_members || [],
      primaryGoals: data.primary_goals || [],
      focusKeywords: data.focus_keywords || [],
      accessGranted: (data.access_items || []).map((item: any) => ({
        type: item.type,
        dateGranted: item.date_granted,
        status: item.status,
        email: item.email,
        websiteCredentials: item.website_credentials,
        clientEmail: item.client_email,
        notes: item.notes
      })),
      queries: (data.queries || []).map((query: any) => ({
        id: query.id,
        title: query.title,
        qaItems: query.qa_items || [],
        linkedSheet: query.linked_sheet,
        assignedTo: query.assigned_to,
        status: query.status,
        createdAt: query.created_at,
        updatedAt: query.updated_at
      })),
      documents: (data.documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        category: doc.category,
        description: doc.description,
        uploadDate: doc.upload_date
      })),
      progressReports: [] // This would be derived from documents with type 'progress-report'
    };
  }
}