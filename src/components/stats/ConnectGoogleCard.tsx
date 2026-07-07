import { useEffect, useState } from 'react';
import { Link2, RefreshCw, XCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  StatsService,
  GoogleConnection,
  GscSite,
  Ga4Property,
  buildGoogleAuthUrl,
} from '../../services/statsService';

interface ConnectGoogleCardProps {
  projectId: string;
}

const OAUTH_REDIRECT_PATH = '/oauth/google/callback';

function openOAuthPopup(url: string): Promise<{ code: string; state: string } | { error: string }> {
  return new Promise((resolve) => {
    const width = 520;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0`,
    );
    if (!popup) {
      resolve({ error: 'Popup blocked. Please allow popups and try again.' });
      return;
    }
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', handler);
        resolve({ error: 'Authorization window closed.' });
      }
    }, 500);
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== 'google-oauth-callback') return;
      clearInterval(timer);
      window.removeEventListener('message', handler);
      try {
        popup.close();
      } catch {
        // ignore
      }
      if (data.error) resolve({ error: data.error });
      else resolve({ code: data.code, state: data.state });
    };
    window.addEventListener('message', handler);
  });
}

export default function ConnectGoogleCard({ projectId }: ConnectGoogleCardProps) {
  const { isDarkMode } = useTheme();
  const [connection, setConnection] = useState<GoogleConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [gscSites, setGscSites] = useState<GscSite[]>([]);
  const [ga4Properties, setGa4Properties] = useState<Ga4Property[]>([]);
  const [pickerGsc, setPickerGsc] = useState<string>('');
  const [pickerGa4, setPickerGa4] = useState<string>('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  // TODO (manual): Set VITE_GOOGLE_CLIENT_ID in your .env to the OAuth client ID
  // from the Google Cloud Console (Web application). Redirect URI must include
  // http://<host>/oauth/google/callback for every environment you deploy to.

  const refresh = async () => {
    setLoading(true);
    try {
      const conn = await StatsService.getConnection(projectId);
      setConnection(conn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [projectId]);

  const openPicker = async () => {
    setPickerLoading(true);
    setShowPicker(true);
    setError(null);
    try {
      const { gsc_sites, ga4_properties } = await StatsService.listProperties(projectId);
      setGscSites(gsc_sites);
      setGa4Properties(ga4_properties);
      setPickerGsc(connection?.gsc_site_url || '');
      setPickerGa4(connection?.ga4_property_id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list Google properties');
      setShowPicker(false);
    } finally {
      setPickerLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!clientId) {
      setError('VITE_GOOGLE_CLIENT_ID is not configured. Add it to your .env file.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const state = crypto.randomUUID();
      sessionStorage.setItem('google_oauth_state', state);
      const redirectUri = `${window.location.origin}${OAUTH_REDIRECT_PATH}`;
      const authUrl = buildGoogleAuthUrl(clientId, redirectUri, state);
      const result = await openOAuthPopup(authUrl);
      if ('error' in result) throw new Error(result.error);
      const expectedState = sessionStorage.getItem('google_oauth_state');
      sessionStorage.removeItem('google_oauth_state');
      if (result.state !== expectedState) throw new Error('OAuth state mismatch — please retry.');
      await StatsService.exchangeCode(projectId, result.code, redirectUri);
      await refresh();
      await openPicker();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authorization failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProperties = async () => {
    setBusy(true);
    setError(null);
    try {
      await StatsService.saveProperties(projectId, pickerGsc || null, pickerGa4 || null);
      setShowPicker(false);
      await StatsService.syncNow(projectId, 28).catch(() => {});
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save properties');
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google from this project? The refresh token will be revoked from our records.')) return;
    setBusy(true);
    setError(null);
    try {
      await StatsService.disconnect(projectId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSyncNow = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await StatsService.syncNow(projectId, 28);
      const first = res.synced?.[0];
      if (first?.error) throw new Error(first.error);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  const connected = connection?.status === 'connected';
  const hasError = connection?.status === 'error';

  return (
    <div className={`rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center ${
              connected
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : hasError
                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Google Search Console + GA4
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Connect this project to pull clicks, impressions, and user metrics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </span>
          )}
          {hasError && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
              <AlertTriangle className="h-3.5 w-3.5" /> Error
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading…</div>
      ) : (
        <>
          {connection && (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 rounded-2xl ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
              <div>
                <div className={`text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  GSC site
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {connection.gsc_site_url || 'Not selected'}
                </div>
              </div>
              <div>
                <div className={`text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  GA4 property
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {connection.ga4_property_id || 'Not selected'}
                </div>
              </div>
              {connection.last_synced_at && (
                <div className="md:col-span-2">
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last synced: {new Date(connection.last_synced_at).toLocaleString()}
                  </div>
                </div>
              )}
              {connection.last_error && (
                <div className="md:col-span-2 text-xs text-red-600 dark:text-red-300">
                  {connection.last_error}
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              className={`mb-4 p-3 rounded-2xl text-sm ${
                isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-700'
              }`}
            >
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!connection ? (
              <button
                onClick={handleConnect}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <Link2 className="h-4 w-4" />
                Connect Google
              </button>
            ) : (
              <>
                <button
                  onClick={openPicker}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  Change properties
                </button>
                <button
                  onClick={handleSyncNow}
                  disabled={busy}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
                  Sync now
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={busy}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isDarkMode
                      ? 'text-red-300 hover:bg-red-900/30'
                      : 'text-red-600 hover:bg-red-50'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <XCircle className="h-4 w-4" />
                  Disconnect
                </button>
              </>
            )}
          </div>
        </>
      )}

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
              }`}
            >
              <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Choose Google properties
              </h2>
              <button
                onClick={() => setShowPicker(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {pickerLoading ? (
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Fetching your Google properties…
                </div>
              ) : (
                <>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Search Console site
                    </label>
                    <select
                      value={pickerGsc}
                      onChange={(e) => setPickerGsc(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 text-white border border-gray-600 focus:border-emerald-500'
                          : 'bg-white text-gray-900 border border-gray-200 focus:border-emerald-500'
                      }`}
                    >
                      <option value="">— None —</option>
                      {gscSites.map((s) => (
                        <option key={s.siteUrl} value={s.siteUrl}>
                          {s.siteUrl} ({s.permissionLevel})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      GA4 property
                    </label>
                    <select
                      value={pickerGa4}
                      onChange={(e) => setPickerGa4(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 text-white border border-gray-600 focus:border-emerald-500'
                          : 'bg-white text-gray-900 border border-gray-200 focus:border-emerald-500'
                      }`}
                    >
                      <option value="">— None —</option>
                      {ga4Properties.map((p) => (
                        <option key={p.propertyId} value={p.propertyId}>
                          {p.displayName} — {p.account} ({p.propertyId})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div
              className={`flex justify-end gap-3 px-6 py-4 border-t shrink-0 ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
              }`}
            >
              <button
                onClick={() => setShowPicker(false)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProperties}
                disabled={busy || pickerLoading}
                className="px-5 py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? 'Saving…' : 'Save & Sync'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
