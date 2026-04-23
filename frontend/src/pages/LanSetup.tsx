import React, { useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// LAN Setup Page
//
// Shown on LAN client PCs as the first-run configuration screen.
// Lets the IT admin enter the server IP, port, and shared secret,
// test the connection, then save and connect.
//
// Config is persisted in localStorage:
//   lan_server_url  → e.g. http://192.168.1.10:3000
//   lan_secret      → shared secret token
//
// Clearing lan_server_url reverts the Electron app to Desktop mode
// on the next restart (electron-main.cjs reads config.json, client.ts
// reads localStorage).
// ─────────────────────────────────────────────────────────────────────────────

type TestState = 'idle' | 'testing' | 'success' | 'error';

interface ConnectionTestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

async function testConnection(
  serverUrl: string,
  secret: string,
): Promise<ConnectionTestResult> {
  const start = Date.now();
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (secret) headers['x-lan-secret'] = secret;

    const res = await fetch(`${serverUrl}/users/status/health`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000),
    });
    const latencyMs = Date.now() - start;

    if (res.ok) {
      return { ok: true, message: 'Connection successful! Server is reachable.', latencyMs };
    }
    if (res.status === 401) {
      return { ok: false, message: 'Server reachable but the LAN secret is incorrect. Check your secret token.', latencyMs };
    }
    return { ok: false, message: `Server responded with status ${res.status}. Check server logs.`, latencyMs };
  } catch (err: any) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      return { ok: false, message: 'Connection timed out. Verify the IP address, port, and that the server is running.' };
    }
    return { ok: false, message: `Could not reach server: ${err?.message ?? 'Network error'}` };
  }
}

// ─── Styles (inline — no CSS file dependency) ─────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2238 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', 'Inter', sans-serif",
    padding: '24px',
  } as React.CSSProperties,

  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: '40px 44px',
    maxWidth: 500,
    width: '100%',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  } as React.CSSProperties,

  logo: {
    fontSize: 48,
    textAlign: 'center' as const,
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f1f5f9',
    textAlign: 'center' as const,
    margin: '0 0 4px',
    letterSpacing: '-0.3px',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center' as const,
    margin: '0 0 32px',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 12,
  },

  row: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
  } as React.CSSProperties,

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 2,
  },

  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  } as React.CSSProperties,

  divider: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    margin: '24px 0',
  },

  btnPrimary: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    fontFamily: 'inherit',
  } as React.CSSProperties,

  btnSecondary: {
    width: '100%',
    padding: '11px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
    marginTop: 10,
  } as React.CSSProperties,

  btnTest: {
    padding: '10px 16px',
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: 10,
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit',
    transition: 'background 0.2s',
  } as React.CSSProperties,
};

// ─── Main Component ────────────────────────────────────────────────────────────
const LanSetup: React.FC = () => {
  const [ip, setIp] = useState('192.168.1.');
  const [port, setPort] = useState('3000');
  const [secret, setSecret] = useState('');
  const [testState, setTestState] = useState<TestState>('idle');
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [saving, setSaving] = useState(false);

  const serverUrl = `http://${ip}:${port}`;

  const handleTest = useCallback(async () => {
    if (!ip || !port) return;
    setTestState('testing');
    setTestResult(null);
    const result = await testConnection(serverUrl, secret);
    setTestState(result.ok ? 'success' : 'error');
    setTestResult(result);
  }, [serverUrl, secret, ip, port]);

  const handleSave = useCallback(async () => {
    if (!ip || !port) return;
    setSaving(true);

    // Verify connection one final time before saving
    const result = await testConnection(serverUrl, secret);
    if (!result.ok) {
      setTestState('error');
      setTestResult(result);
      setSaving(false);
      return;
    }

    // Persist to localStorage
    localStorage.setItem('lan_server_url', serverUrl);
    if (secret) {
      localStorage.setItem('lan_secret', secret);
    } else {
      localStorage.removeItem('lan_secret');
    }

    setSaving(false);

    // Redirect to login — client.ts will now use the LAN server URL
    window.location.hash = '#/login';
  }, [ip, port, secret, serverUrl]);

  const handleDesktopMode = useCallback(() => {
    // Clear LAN config — client.ts will fall back to localhost:3001
    localStorage.removeItem('lan_server_url');
    localStorage.removeItem('lan_secret');
    window.location.hash = '#/login';
  }, []);

  const testBtnLabel = {
    idle: '🔍 Test Connection',
    testing: '⏳ Testing…',
    success: '✅ Connected',
    error: '❌ Failed — Retry',
  }[testState];

  const isConfigured = !!localStorage.getItem('lan_server_url');

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.logo}>🏢</div>
        <h1 style={S.title}>LAN Network Setup</h1>
        <p style={S.subtitle}>Connect this PC to the pharmacy server on your local network</p>

        {/* Server Address */}
        <div style={S.sectionLabel}>Server Address</div>
        <div style={{ ...S.row, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, ...S.fieldGroup, marginBottom: 0 }}>
            <label style={S.label}>Server IP Address</label>
            <input
              id="lan-ip-input"
              style={S.input}
              value={ip}
              onChange={(e) => { setIp(e.target.value); setTestState('idle'); setTestResult(null); }}
              placeholder="192.168.1.10"
              spellCheck={false}
            />
          </div>
          <div style={{ width: 90, ...S.fieldGroup, marginBottom: 0 }}>
            <label style={S.label}>Port</label>
            <input
              id="lan-port-input"
              style={S.input}
              value={port}
              onChange={(e) => { setPort(e.target.value); setTestState('idle'); setTestResult(null); }}
              placeholder="3000"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview URL */}
        <div style={{ marginTop: 8, marginBottom: 20, fontSize: 12, color: '#475569' }}>
          Will connect to: <code style={{ color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '1px 6px', borderRadius: 4 }}>{serverUrl}</code>
        </div>

        {/* Secret Token */}
        <div style={S.fieldGroup}>
          <label style={S.label}>LAN Secret Token (optional)</label>
          <input
            id="lan-secret-input"
            style={S.input}
            type="password"
            value={secret}
            onChange={(e) => { setSecret(e.target.value); setTestState('idle'); setTestResult(null); }}
            placeholder="Enter the shared secret configured on the server"
          />
          <span style={{ fontSize: 11, color: '#475569' }}>
            Leave blank if your server does not use a LAN secret (not recommended).
          </span>
        </div>

        {/* Test + Result */}
        <div style={{ marginBottom: 20 }}>
          <button
            id="lan-test-btn"
            style={{
              ...S.btnTest,
              opacity: testState === 'testing' ? 0.6 : 1,
            }}
            onClick={handleTest}
            disabled={testState === 'testing' || !ip || !port}
          >
            {testBtnLabel}
          </button>

          {testResult && (
            <div
              style={{
                marginTop: 10,
                padding: '10px 14px',
                borderRadius: 8,
                background: testResult.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${testResult.ok ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                fontSize: 13,
                color: testResult.ok ? '#22c55e' : '#f87171',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <span>{testResult.ok ? '✅' : '⚠️'}</span>
              <span>
                {testResult.message}
                {testResult.latencyMs !== undefined && (
                  <span style={{ opacity: 0.7 }}> ({testResult.latencyMs}ms)</span>
                )}
              </span>
            </div>
          )}
        </div>

        <div style={S.divider} />

        {/* Save Button */}
        <button
          id="lan-save-btn"
          style={{ ...S.btnPrimary, opacity: saving ? 0.7 : 1 }}
          onClick={handleSave}
          disabled={saving || !ip || !port}
        >
          {saving ? '⏳ Verifying & Saving…' : '💾 Save & Connect to LAN Server'}
        </button>

        {/* Desktop Mode Fallback */}
        {isConfigured && (
          <button
            id="lan-desktop-mode-btn"
            style={S.btnSecondary}
            onClick={handleDesktopMode}
          >
            🖥️ Switch Back to Desktop Mode (Local)
          </button>
        )}

        {/* Info */}
        <div
          style={{
            marginTop: 24,
            padding: '12px 16px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10,
            fontSize: 12,
            color: '#64748b',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: '#60a5fa' }}>💡 Setup Instructions</strong><br />
          1. Ask your IT admin for the server IP, port, and secret token.<br />
          2. Enter the details above and click <strong>Test Connection</strong>.<br />
          3. Once connected, click <strong>Save & Connect</strong>.<br />
          4. Log in with your pharmacy user credentials.
        </div>
      </div>
    </div>
  );
};

export default LanSetup;
