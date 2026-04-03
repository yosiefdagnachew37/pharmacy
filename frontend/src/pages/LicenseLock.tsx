import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LockClosedIcon, FingerPrintIcon, KeyIcon } from '@heroicons/react/24/outline';
import client from '../api/client';

export default function LicenseLock() {
  const [hwid, setHwid] = useState<string>('Detecting Hardware ID...');
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the current HWID and License Status
    const fetchStatus = async () => {
      try {
        const response = await client.get('/license/status');
        setHwid(response.data.hwid);
        if (response.data.isValid) {
          // If valid, redirect to login or dashboard
          const isElectron =
            (typeof window !== 'undefined' && window.location.protocol === 'file:') ||
            (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron'));
          if (isElectron) {
            window.location.hash = '#/';
          } else {
            window.location.href = '/';
          }
        } else {
           setError('License is invalid or missing.');
        }
      } catch (err: any) {
        // If we get a 402, the middleware intercepts it before reaching the endpoint, 
        // OR the endpoint itself throws 402. Let's extract the HWID from the error response.
        if (err.response?.data?.hwid) {
            setHwid(err.response.data.hwid);
            setError(err.response.data.message || 'License Error');
        } else {
            setError('Failed to fetch hardware binding info.');
        }
      }
    };
    fetchStatus();
  }, []);

  const handleApplyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError('Please enter a valid license key.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await client.post('/license/apply', { licenseKey: licenseKey.trim() });
      if (response.data.success) {
        alert('License validated and activated successfully! The application will now reload.');
        window.location.reload();
      } else {
        setError(response.data.message || 'Failed to apply license.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error communicating with validation server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Application Locked</h1>
          <p className="text-sm text-gray-500 text-center">
            This node requires a valid Offline License Key bound to your hardware. 
            Unauthorized copying is prohibited.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <FingerPrintIcon className="w-4 h-4 mr-1" />
            Your Machine ID
          </label>
          <div className="flex gap-2">
            <code className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs font-mono text-gray-800 break-all select-all">
              {hwid}
            </code>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Provide this Hardware ID to your Super Admin to generate a license key specifically for this machine.
          </p>
        </div>

        <form onSubmit={handleApplyLicense} className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1">
              <KeyIcon className="w-4 h-4 mr-1 text-gray-400" />
              Enter License Key Data
            </label>
            <textarea
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder='Paste the entire {"hwid": "...", "signature": "..."} key here...'
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Unlock Application'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
