import { supabase } from '../lib/supabase';

export interface GoogleConnection {
  id: string;
  project_id: string;
  connected_by: string | null;
  gsc_site_url: string | null;
  ga4_property_id: string | null;
  status: 'connected' | 'error' | 'disconnected';
  last_error: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectStatRow {
  id: string;
  project_id: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  total_users: number;
  organic_users: number;
}

export interface ProjectStatsAggregate {
  project_id: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  total_users: number;
  organic_users: number;
  days_with_data: number;
}

export interface GscSite {
  siteUrl: string;
  permissionLevel: string;
}

export interface Ga4Property {
  propertyId: string;
  displayName: string;
  account: string;
}

async function callEdge<T>(fn: string, body: unknown): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload?.error) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }
  return payload as T;
}

export const StatsService = {
  async getConnection(projectId: string): Promise<GoogleConnection | null> {
    const { data, error } = await supabase
      .from('google_connections')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();
    if (error) throw error;
    return (data as GoogleConnection) ?? null;
  },

  async listConnections(): Promise<GoogleConnection[]> {
    const { data, error } = await supabase.from('google_connections').select('*');
    if (error) throw error;
    return (data as GoogleConnection[]) ?? [];
  },

  async exchangeCode(projectId: string, code: string, redirectUri: string) {
    return callEdge<{ ok: true }>('google-oauth', {
      action: 'exchange_code',
      project_id: projectId,
      code,
      redirect_uri: redirectUri,
    });
  },

  async listProperties(projectId: string) {
    return callEdge<{ gsc_sites: GscSite[]; ga4_properties: Ga4Property[] }>('google-oauth', {
      action: 'list_properties',
      project_id: projectId,
    });
  },

  async saveProperties(projectId: string, gscSiteUrl: string | null, ga4PropertyId: string | null) {
    return callEdge<{ ok: true }>('google-oauth', {
      action: 'save_properties',
      project_id: projectId,
      gsc_site_url: gscSiteUrl,
      ga4_property_id: ga4PropertyId,
    });
  },

  async disconnect(projectId: string) {
    return callEdge<{ ok: true }>('google-oauth', {
      action: 'disconnect',
      project_id: projectId,
    });
  },

  async syncNow(projectId?: string, days: number = 28) {
    return callEdge<{ ok: true; synced: Array<{ project_id: string; rows?: number; error?: string }> }>(
      'sync-project-stats',
      projectId ? { project_id: projectId, days } : { days },
    );
  },

  async getStatsInRange(startDate: string, endDate: string, projectIds?: string[]): Promise<ProjectStatRow[]> {
    let query = supabase
      .from('project_stats')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (projectIds && projectIds.length > 0) {
      query = query.in('project_id', projectIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data as ProjectStatRow[]) ?? [];
  },

  aggregateByProject(rows: ProjectStatRow[]): Map<string, ProjectStatsAggregate> {
    const map = new Map<string, ProjectStatsAggregate>();
    for (const r of rows) {
      const existing = map.get(r.project_id) ?? {
        project_id: r.project_id,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        total_users: 0,
        organic_users: 0,
        days_with_data: 0,
      };
      existing.clicks += r.clicks;
      existing.impressions += r.impressions;
      existing.total_users += r.total_users;
      existing.organic_users += r.organic_users;
      existing.position += r.position;
      existing.days_with_data += 1;
      map.set(r.project_id, existing);
    }
    for (const agg of map.values()) {
      agg.ctr = agg.impressions > 0 ? agg.clicks / agg.impressions : 0;
      agg.position = agg.days_with_data > 0 ? agg.position / agg.days_with_data : 0;
    }
    return map;
  },
};

export function buildGoogleAuthUrl(clientId: string, redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
    scope: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ].join(' '),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
