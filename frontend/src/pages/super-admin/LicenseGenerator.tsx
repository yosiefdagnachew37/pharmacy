import React, { useState } from 'react';
import { KeyIcon, ClipboardDocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import client from '../../api/client';

export default function LicenseGenerator() {
  const [hwid, setHwid] = useState('');
  const [expiry, setExpiry] = useState('');
  const [plan, setPlan] = useState('');
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedLicense(null);
    setCopied(false);

    try {
      const response = await client.post('/system/generate-license', {
        hwid: hwid.trim(),
        expiry: expiry ? expiry : undefined,
        plan: plan ? plan : undefined
      });
      
      setGeneratedLicense(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      if (err.response?.status === 402) {
         setError('Failed to generate. Ensure you are connected to the Cloud Super Admin.');
      } else {
         setError(err.response?.data?.message || 'Server error while generating license. Ensure LICENSE_PRIVATE_KEY is set via environment variables.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLicense) {
      navigator.clipboard.writeText(generatedLicense);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">License Generator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate an offline cryptographic license specifically bound to a customer's Desktop node hardware.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center">
            <KeyIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Generate New Client License
          </h3>
        </div>
        
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hardware Node ID (HWID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={hwid}
                onChange={(e) => setHwid(e.target.value)}
                placeholder="e.g. 5e18a8f1b6... (provided by the customer's lock screen)"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank for a permanent lifetime license.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription Tier Override (Optional)
              </label>
              <input
                type="text"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="e.g. GOLD, BASIC"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate License Block'}
            </button>
          </div>
        </form>
      </div>

      {generatedLicense && (
        <div className="bg-gray-900 rounded-xl shadow overflow-hidden">
          <div className="flex justify-between items-center border-b border-gray-700 px-6 py-3">
             <h3 className="text-sm font-mono text-emerald-400">✅ License Signed Successfully</h3>
             <button
               onClick={handleCopy}
               className="flex items-center text-xs font-semibold text-gray-300 hover:text-white transition-colors bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-600"
             >
               {copied ? (
                 <><CheckCircleIcon className="w-4 h-4 mr-1 text-emerald-400"/> Copied</>
               ) : (
                 <><ClipboardDocumentIcon className="w-4 h-4 mr-1"/> Copy to Clipboard</>
               )}
             </button>
          </div>
          <div className="p-6">
             <textarea 
               readOnly
               className="w-full h-48 bg-black text-gray-300 font-mono text-sm border border-gray-800 rounded-lg p-4 focus:outline-none resize-none"
               value={generatedLicense}
             />
             <p className="text-xs text-gray-400 mt-4">
               Copy this entire JSON block perfectly and send it to your customer. They will paste it into their locked desktop app.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
