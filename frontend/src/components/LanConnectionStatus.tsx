import React, { useState, useEffect, useCallback } from 'react';

// ─── Utility: read LAN config from localStorage ──────────────────────────────
export function getLanServerUrl(): string {
  return localStorage.getItem('lan_server_url') || '';
}

export function getLanSecret(): string {
  return localStorage.getItem('lan_secret') || '';
}

export function isLanClientMode(): boolean {
  const url = getLanServerUrl();
  return !!(url && url.startsWith('http'));
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ConnectionState = 'connected' | 'disconnected' | 'checking';

interface PingResult {
  ok: boolean;
  latencyMs?: number;
}

// ─── Ping helper (no axios dep — plain fetch) ─────────────────────────────────
async function pingServer(serverUrl: string, secret: string): Promise<PingResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${serverUrl}/users/status/health`, {
      method: 'GET',
      headers: secret ? { 'x-lan-secret': secret } : {},
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - start;
    return { ok: res.ok || res.status === 401, latencyMs }; // 401 means reachable but token wrong
  } catch {
    return { ok: false };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 15_000; // 15 seconds

export const LanConnectionStatus: React.FC = () => {
  const [state, setState] = useState<ConnectionState>('checking');
  const [latency, setLatency] = useState<number | undefined>();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const serverUrl = getLanServerUrl();
  const secret = getLanSecret();

  const doCheck = useCallback(async () => {
    setState('checking');
    const result = await pingServer(serverUrl, secret);
    setState(result.ok ? 'connected' : 'disconnected');
    setLatency(result.latencyMs);
    setLastChecked(new Date());
  }, [serverUrl, secret]);

  useEffect(() => {
    doCheck();
    const interval = setInterval(doCheck, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [doCheck]);

  // Don't render unless in LAN client mode
  if (!isLanClientMode()) return null;

  const colors = {
    connected: { dot: '#22c55e', text: '#16a34a', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' },
    disconnected: { dot: '#ef4444', text: '#dc2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
    checking: { dot: '#f59e0b', text: '#d97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  }[state];

  const labels = {
    connected: 'LAN Connected',
    disconnected: 'LAN Disconnected',
    checking: 'Checking…',
  }[state];

  // Extract host for compact display
  const displayHost = (() => {
    try { return new URL(serverUrl).host; } catch { return serverUrl; }
  })();

  return (
    <div
      title={`Server: ${serverUrl}\nLast check: ${lastChecked?.toLocaleTimeString() ?? '—'}`}
      onClick={doCheck}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        color: colors.text,
        userSelect: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
      }}
    >
      {/* Pulsing dot */}
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors.dot,
            display: 'block',
            animation: state === 'connected' ? 'lan-pulse 2s ease-in-out infinite' : 'none',
          }}
        />
        {state === 'connected' && (
          <span
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: colors.dot,
              opacity: 0,
              animation: 'lan-ping 2s ease-in-out infinite',
            }}
          />
        )}
      </span>

      <span>{labels}</span>
      <span style={{ opacity: 0.7, fontWeight: 400 }}>| {displayHost}</span>
      {latency !== undefined && state === 'connected' && (
        <span style={{ opacity: 0.6, fontWeight: 400 }}>{latency}ms</span>
      )}

      <style>{`
        @keyframes lan-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes lan-ping {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LanConnectionStatus;
