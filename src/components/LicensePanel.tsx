import { useState } from "react";
import { KeyRound, Mail, ExternalLink, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { activateLicense, activateFreeTrial, getLicenseState } from "../license";
import { FREE_USE_LIMIT, PURCHASE_URL } from "../types";
import type { LicenseState } from "../types";

interface Props {
  onActivated: (state: LicenseState) => void;
}

export default function LicensePanel({ onActivated }: Props) {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!code.trim() || !email.trim()) {
      setMessage("Mohon masukkan kode aktivasi dan email Anda.");
      setSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await activateLicense(code.trim(), email.trim());
    setMessage(result.message);
    setSuccess(result.success);

    if (result.success) {
      const state = getLicenseState();
      setTimeout(() => onActivated(state), 1500);
    }

    setLoading(false);
  };

  const handleFreeTrial = () => {
    const state = activateFreeTrial();
    setMessage(`Trial diaktifkan! Anda memiliki ${FREE_USE_LIMIT}x penggunaan gratis.`);
    setSuccess(true);
    setTimeout(() => onActivated(state), 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rm-50 to-rm-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-rm-600 text-white shadow-lg">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">RM Mail Merge Tools</h1>
          <p className="mt-1 text-sm text-gray-500">Aktivasi Lisensi</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Kode Aktivasi</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Masukkan kode aktivasi"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-rm-500 focus:outline-none focus:ring-1 focus:ring-rm-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-rm-500 focus:outline-none focus:ring-1 focus:ring-rm-500"
                disabled={loading}
              />
            </div>
          </div>

          {message && (
            <div className={`mb-4 flex items-start gap-2 rounded-lg p-3 text-sm ${
              success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {success ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
              <span>{message}</span>
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading}
            className="w-full rounded-lg bg-rm-600 py-2.5 text-sm font-medium text-white transition hover:bg-rm-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Mengaktivasi...
              </span>
            ) : (
              "Aktivasi Lisensi"
            )}
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={handleFreeTrial}
            disabled={loading}
            className="w-full rounded-lg border border-rm-300 bg-rm-50 py-2.5 text-sm font-medium text-rm-700 transition hover:bg-rm-100 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={16} /> Coba Gratis ({FREE_USE_LIMIT}x penggunaan)
            </span>
          </button>
        </div>

        <div className="mt-4 space-y-2 text-center text-xs text-gray-500">
          <p>
            Untuk versi trial, follow dan DM via{" "}
            <a href="https://x.com" target="_blank" rel="noopener" className="text-rm-600 hover:underline">X (Twitter)</a>
            {" "}atau{" "}
            <a href="https://instagram.com" target="_blank" rel="noopener" className="text-rm-600 hover:underline">Instagram</a>
            {" "}untuk mendapatkan kode.
          </p>
          <p>
            Untuk aktivasi selamanya,{" "}
            <a href={PURCHASE_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-rm-600 hover:underline">
              beli di sini <ExternalLink size={12} />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
