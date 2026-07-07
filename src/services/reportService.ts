import { supabase } from '../lib/supabase';
import { Report } from '../types/reports';

export class ReportService {
  static async getAllReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.mapReportFromDB);
  }

  static async createReport(reportData: Omit<Report, 'id' | 'createdAt'>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        project_name: reportData.projectName,
        client_name: reportData.clientName,
        upwork_profile: reportData.upworkProfile,
        business_developer: reportData.businessDeveloper,
        reporting_person: reportData.reportingPerson,
        report_day: reportData.reportDay,
        department_name: reportData.departmentName,
        is_active: reportData.isActive,
        completion_history: reportData.completionHistory
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapReportFromDB(data);
  }

  static async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .update({
        project_name: updates.projectName,
        client_name: updates.clientName,
        upwork_profile: updates.upworkProfile,
        business_developer: updates.businessDeveloper,
        reporting_person: updates.reportingPerson,
        report_day: updates.reportDay,
        department_name: updates.departmentName,
        is_active: updates.isActive,
        completion_history: updates.completionHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.mapReportFromDB(data);
  }

  static async deleteReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async updateReportCompletion(id: string, completionHistory: any[]): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({
        completion_history: completionHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  private static mapReportFromDB(data: any): Report {
    return {
      id: data.id,
      projectName: data.project_name,
      clientName: data.client_name,
      upworkProfile: data.upwork_profile,
      businessDeveloper: data.business_developer,
      reportingPerson: data.reporting_person,
      reportDay: data.report_day,
      departmentName: data.department_name,
      isActive: data.is_active,
      completionHistory: data.completion_history || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}