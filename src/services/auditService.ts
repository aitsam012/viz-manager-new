import { supabase } from '../lib/supabase';
import { Audit } from '../types/audit';

export class AuditService {
  static async getAllAudits(): Promise<Audit[]> {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .order('audit_date', { ascending: false });

    if (error) throw error;

    return data.map(this.mapAuditFromDB);
  }

  static async createAudit(auditData: Omit<Audit, 'id' | 'createdAt'>): Promise<Audit> {
    const { data, error } = await supabase
      .from('audits')
      .insert({
        client_website: auditData.clientWebsite,
        project_name: auditData.projectName,
        business_developer: auditData.businessDeveloper,
        auditor: auditData.auditor,
        audit_date: auditData.date,
        month: auditData.month,
        audit_sheet_links: auditData.auditSheetLinks
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapAuditFromDB(data);
  }

  static async updateAudit(id: string, updates: Partial<Audit>): Promise<Audit> {
    const { data, error } = await supabase
      .from('audits')
      .update({
        client_website: updates.clientWebsite,
        project_name: updates.projectName,
        business_developer: updates.businessDeveloper,
        auditor: updates.auditor,
        audit_date: updates.date,
        month: updates.month,
        audit_sheet_links: updates.auditSheetLinks,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.mapAuditFromDB(data);
  }

  static async deleteAudit(id: string): Promise<void> {
    const { error } = await supabase
      .from('audits')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private static mapAuditFromDB(data: any): Audit {
    return {
      id: data.id,
      clientWebsite: data.client_website,
      projectName: data.project_name,
      businessDeveloper: data.business_developer,
      auditor: data.auditor,
      date: data.audit_date,
      month: data.month,
      auditSheetLinks: data.audit_sheet_links || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}