import { useState, useEffect } from "react";
import { Mail, FileText, KeyRound, Settings as SettingsIcon, Sparkles, ShieldCheck, RotateCcw } from "lucide-react";
import { getLicenseState, isAccessGranted, getRemainingFreeUses, incrementFreeUse, resetLicense, autoActivateDevMode } from "./license";
import { FREE_USE_LIMIT, PURCHASE_URL, DEFAULT_SETTINGS } from "./types";
import type { LicenseState, Settings } from "./types";
import LicensePanel from "./components/LicensePanel";
import MailMergePanel from "./components/MailMergePanel";
import BatchConvertPanel from "./components/BatchConvertPanel";
import SettingsPanel, { loadSettings } from "./components/SettingsPanel";

type Tab = "merge" | "convert" | "license" | "settings";

export default function App() {
  const [license, setLicense] = useState<LicenseState | null>(null);
  const [tab, setTab] = useState<Tab>("merge");
  const [showLicense, setShowLicense] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    autoActivateDevMode();
    const state = getLicenseState();
    setLicense(state);
    setSettings(loadSettings());
    if (!isAccessGranted(state)) {
      setShowLicense(true);
    }
  }, []);

  const handleActivated = (state: LicenseState) => {
    setLicense(state);
    setShowLicense(false);
  };

  const handleUseConsumed = () => {
    const newState = incrementFreeUse();
    setLicense(newState);
    if (!isAccessGranted(newState)) {
      setShowLicense(true);
    }
  };

  const handleReset = () => {
    if (confirm("Reset lisensi? Semua data lisensi akan dihapus.")) {
      resetLicense();
      const state = getLicenseState();
      setLicense(state);
      setShowLicense(true);
    }
  };

  if (showLicense || !license || !isAccessGranted(license)) {
    return <LicensePanel onActivated={handleActivated} />;
  }

  const remaining = getRemainingFreeUses(license);
  const isFree = license.type === "free";

  const tabs: { key: Tab; label: string; icon: typeof Mail }[] = [
    { key: "merge", label: "Merge", icon: Mail },
    { key: "convert", label: "Convert", icon: FileText },
    { key: "license", label: "License", icon: KeyRound },
    { key: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-rm-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={20} />
            <span className="text-sm font-semibold">RM Mail Merge Tools</span>
          </div>
          {isFree && (
            <span className="rounded-full bg-rm-500 px-2 py-0.5 text-xs font-medium">
              Trial: {remaining}/{FREE_USE_LIMIT} tersisa
            </span>
          )}
          {license.type === "lifetime" && (
            <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium">
              <ShieldCheck size={12} /> Lifetime
            </span>
          )}
        </div>
      </header>

      <nav className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                tab === t.key ? "border-b-2 border-rm-600 text-rm-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={18} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-auto p-4">
        {tab === "merge" && <MailMergePanel onUseConsumed={handleUseConsumed} settings={settings} />}
        {tab === "convert" && <BatchConvertPanel onUseConsumed={handleUseConsumed} />}
        {tab === "license" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Status Lisensi</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipe:</span>
                  <span className="font-medium">{license.type === "lifetime" ? "Lifetime" : "Free Trial"}</span>
                </div>
                {isFree && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Penggunaan tersisa:</span>
                    <span className="font-medium">{remaining}/{FREE_USE_LIMIT}</span>
                  </div>
                )}
                {license.type === "lifetime" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{license.activatedEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Aktivasi:</span>
                      <span className="font-medium">{new Date(license.activatedAt).toLocaleDateString("id-ID")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {isFree && (
              <div className="rounded-lg bg-rm-50 p-4 text-center">
                <Sparkles size={24} className="mx-auto mb-2 text-rm-500" />
                <p className="mb-2 text-sm text-gray-600">Upgrade ke Lifetime untuk akses tanpa batas</p>
                <a
                  href={PURCHASE_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-block rounded-lg bg-rm-600 px-4 py-2 text-sm font-medium text-white hover:bg-rm-700"
                >
                  Beli Lisensi Lifetime
                </a>
              </div>
            )}

            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <RotateCcw size={16} />
              Reset Lisensi
            </button>
          </div>
        )}
        {tab === "settings" && (
          <SettingsPanel settings={settings} onSave={setSettings} />
        )}
      </main>
    </div>
  );
}
