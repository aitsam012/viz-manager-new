import { useEffect } from 'react';

export default function GoogleOAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    const payload = error
      ? { type: 'google-oauth-callback', error }
      : { type: 'google-oauth-callback', code, state };

    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f4f0] p-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center">
          <svg className="h-7 w-7 text-emerald-700 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Finishing Google sign-in</h1>
        <p className="text-sm text-gray-500">You can close this window if it doesn't close on its own.</p>
      </div>
    </div>
  );
}
