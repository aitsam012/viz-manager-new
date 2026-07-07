import { createClient } from "npm:@supabase/supabase-js@2.39.7";

// TODO (manual): In Google Cloud Console, create an OAuth 2.0 Client (Web Application).
// Add these Authorized redirect URIs (match what the frontend uses):
//   http://localhost:5173/oauth/google/callback
//   https://<your-production-domain>/oauth/google/callback
// Enable the following APIs for that project:
//   - Google Search Console API
//   - Google Analytics Data API (GA4)
// Then set these as edge function secrets:
//   GOOGLE_CLIENT_ID     (your OAuth client id)
//   GOOGLE_CLIENT_SECRET (your OAuth client secret)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GSC_SITES_URL = "https://searchconsole.googleapis.com/webmasters/v3/sites";
const GA_ADMIN_ACCOUNTS_URL = "https://analyticsadmin.googleapis.com/v1beta/accountSummaries";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

function getAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceKey);
}

async function assertProjectAccess(userId: string, projectId: string) {
  const admin = getAdminClient();
  const { data: userRow } = await admin
    .from("users")
    .select("role, has_all_projects")
    .eq("id", userId)
    .maybeSingle();
  if (userRow?.role === "admin" || userRow?.has_all_projects) return true;

  const { data: proj } = await admin
    .from("projects")
    .select("created_by")
    .eq("id", projectId)
    .maybeSingle();
  if (proj?.created_by === userId) return true;

  const { data: assign } = await admin
    .from("project_assignments")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  return !!assign;
}

async function exchangeCode(code: string, redirectUri: string) {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured");
  }
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${payload.error_description || payload.error || res.status}`);
  }
  if (!payload.refresh_token) {
    throw new Error(
      "Google did not return a refresh_token. Ensure access_type=offline and prompt=consent, and revoke prior access before re-consenting.",
    );
  }
  return payload as { refresh_token: string; access_token: string; expires_in: number };
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured");
  }
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

async function listGscSites(accessToken: string) {
  const res = await fetch(GSC_SITES_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`GSC sites list failed (${res.status})`);
  const data = await res.json();
  return (data.siteEntry || []).map((s: { siteUrl: string; permissionLevel: string }) => ({
    siteUrl: s.siteUrl,
    permissionLevel: s.permissionLevel,
  }));
}

async function listGa4Properties(accessToken: string) {
  const res = await fetch(GA_ADMIN_ACCOUNTS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`GA4 accounts list failed (${res.status})`);
  const data = await res.json();
  const props: Array<{ propertyId: string; displayName: string; account: string }> = [];
  for (const acc of data.accountSummaries || []) {
    for (const p of acc.propertySummaries || []) {
      const propertyId = (p.property || "").split("/").pop();
      if (propertyId) {
        props.push({ propertyId, displayName: p.displayName, account: acc.displayName });
      }
    }
  }
  return props;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const payload = await req.json();
    const action = payload?.action as string;
    const projectId = payload?.project_id as string;

    if (!action || !projectId) return json({ error: "action and project_id required" }, 400);

    const canAccess = await assertProjectAccess(user.id, projectId);
    if (!canAccess) return json({ error: "Forbidden" }, 403);

    const admin = getAdminClient();

    if (action === "exchange_code") {
      const { code, redirect_uri } = payload;
      if (!code || !redirect_uri) return json({ error: "code and redirect_uri required" }, 400);
      const tokens = await exchangeCode(code, redirect_uri);
      const { error: upsertErr } = await admin
        .from("google_connections")
        .upsert(
          {
            project_id: projectId,
            connected_by: user.id,
            refresh_token: tokens.refresh_token,
            status: "connected",
            last_error: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "project_id" },
        );
      if (upsertErr) throw upsertErr;
      return json({ ok: true });
    }

    if (action === "list_properties") {
      const { data: conn } = await admin
        .from("google_connections")
        .select("refresh_token")
        .eq("project_id", projectId)
        .maybeSingle();
      if (!conn?.refresh_token) return json({ error: "No Google connection for this project" }, 400);
      const accessToken = await refreshAccessToken(conn.refresh_token);
      const [gsc, ga4] = await Promise.all([listGscSites(accessToken), listGa4Properties(accessToken)]);
      return json({ gsc_sites: gsc, ga4_properties: ga4 });
    }

    if (action === "save_properties") {
      const { gsc_site_url, ga4_property_id } = payload;
      const { error } = await admin
        .from("google_connections")
        .update({
          gsc_site_url: gsc_site_url || null,
          ga4_property_id: ga4_property_id || null,
          status: "connected",
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("project_id", projectId);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "disconnect") {
      const { error } = await admin.from("google_connections").delete().eq("project_id", projectId);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: message }, 500);
  }
});
