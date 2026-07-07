import { createClient } from "npm:@supabase/supabase-js@2.39.7";

// TODO (manual): Schedule this function via Supabase Dashboard -> Database -> Cron Jobs (pg_cron).
// Suggested schedule: daily at 03:00 UTC.
// The cron job should POST to this function with an empty JSON body {} or {"days": 7}
// so it iterates all connected projects. To trigger a single project, POST { "project_id": "<uuid>" }.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing");
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(`refresh_token failed: ${payload.error_description || payload.error}`);
  return payload.access_token as string;
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function fetchGscDaily(accessToken: string, siteUrl: string, startDate: string, endDate: string) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 1000,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GSC search analytics failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const map = new Map<string, { clicks: number; impressions: number; ctr: number; position: number }>();
  for (const row of data.rows || []) {
    const date = row.keys?.[0];
    if (!date) continue;
    map.set(date, {
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    });
  }
  return map;
}

async function fetchGa4Daily(accessToken: string, propertyId: string, startDate: string, endDate: string) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 totalUsers failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const total = new Map<string, number>();
  for (const row of data.rows || []) {
    const d = row.dimensionValues?.[0]?.value;
    if (!d) continue;
    const iso = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    total.set(iso, Number(row.metricValues?.[0]?.value || 0));
  }

  const resOrganic = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "sessionDefaultChannelGroup",
          stringFilter: { matchType: "EXACT", value: "Organic Search" },
        },
      },
    }),
  });
  if (!resOrganic.ok) {
    const text = await resOrganic.text();
    throw new Error(`GA4 organic users failed (${resOrganic.status}): ${text}`);
  }
  const organicData = await resOrganic.json();
  const organic = new Map<string, number>();
  for (const row of organicData.rows || []) {
    const d = row.dimensionValues?.[0]?.value;
    if (!d) continue;
    const iso = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    organic.set(iso, Number(row.metricValues?.[0]?.value || 0));
  }
  return { total, organic };
}

async function syncProject(admin: ReturnType<typeof getAdminClient>, projectId: string, days: number) {
  const { data: conn, error: connErr } = await admin
    .from("google_connections")
    .select("refresh_token, gsc_site_url, ga4_property_id")
    .eq("project_id", projectId)
    .maybeSingle();
  if (connErr) throw connErr;
  if (!conn?.refresh_token) throw new Error("No Google connection");

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const startDate = formatDate(start);
  const endDate = formatDate(end);

  const accessToken = await refreshAccessToken(conn.refresh_token);

  const gsc = conn.gsc_site_url
    ? await fetchGscDaily(accessToken, conn.gsc_site_url, startDate, endDate)
    : new Map();
  const ga4 = conn.ga4_property_id
    ? await fetchGa4Daily(accessToken, conn.ga4_property_id, startDate, endDate)
    : { total: new Map(), organic: new Map() };

  const dates = new Set<string>([...gsc.keys(), ...ga4.total.keys(), ...ga4.organic.keys()]);
  const rows = Array.from(dates).map((date) => {
    const g = gsc.get(date);
    return {
      project_id: projectId,
      date,
      clicks: g?.clicks ?? 0,
      impressions: g?.impressions ?? 0,
      ctr: g?.ctr ?? 0,
      position: g?.position ?? 0,
      total_users: ga4.total.get(date) ?? 0,
      organic_users: ga4.organic.get(date) ?? 0,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length > 0) {
    const { error: upErr } = await admin
      .from("project_stats")
      .upsert(rows, { onConflict: "project_id,date" });
    if (upErr) throw upErr;
  }

  await admin
    .from("google_connections")
    .update({
      status: "connected",
      last_error: null,
      last_synced_at: new Date().toISOString(),
    })
    .eq("project_id", projectId);

  return rows.length;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const admin = getAdminClient();
    let body: { project_id?: string; days?: number } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const days = Math.max(1, Math.min(90, Number(body.days) || 28));

    const targets: string[] = [];
    if (body.project_id) {
      targets.push(body.project_id);
    } else {
      const { data } = await admin
        .from("google_connections")
        .select("project_id")
        .eq("status", "connected");
      for (const row of data || []) targets.push(row.project_id);
    }

    const results: Array<{ project_id: string; rows?: number; error?: string }> = [];
    for (const projectId of targets) {
      try {
        const rows = await syncProject(admin, projectId, days);
        results.push({ project_id: projectId, rows });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await admin
          .from("google_connections")
          .update({ status: "error", last_error: message })
          .eq("project_id", projectId);
        results.push({ project_id: projectId, error: message });
      }
    }

    return json({ ok: true, synced: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: message }, 500);
  }
});
