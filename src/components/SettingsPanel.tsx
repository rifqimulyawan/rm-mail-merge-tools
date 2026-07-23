import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, RotateCcw, FileText, FolderOpen, Zap, FileEdit, Package } from "lucide-react";
import type { Settings, ExportFormat, CompressQuality } from "../types";
import { DEFAULT_SETTINGS, EXPORT_FORMATS, COMPRESS_OPTIONS } from "../types";

const SETTINGS_KEY = "rmmmt_settings";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

interface Props {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export default function SettingsPanel({ settings, onSave }: Props) {
  const [local, setLocal] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(local);
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocal(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    onSave(DEFAULT_SETTINGS);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <SettingsIcon size={18} className="text-rm-600" />
          Pengaturan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition ${
              saved ? "bg-green-600" : "bg-rm-600 hover:bg-rm-700"
            }`}
          >
            <Save size={14} />
            {saved ? "Tersimpan!" : "Simpan"}
          </button>
        </div>
      </div>

      {/* Export Settings */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          <FileText size={14} className="text-rm-500" />
          Export & Merge
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Format Export Default</label>
            <select
              value={local.defaultExportFormat}
              onChange={(e) => update("defaultExportFormat", e.target.value as ExportFormat)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Separator Default untuk Nama File</label>
            <input
              type="text"
              value={local.defaultSeparator}
              onChange={(e) => update("defaultSeparator", e.target.value)}
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Prefix Nama File</label>
            <input
              type="text"
              value={local.filenamePrefix}
              onChange={(e) => update("filenamePrefix", e.target.value)}
              placeholder="contoh: SURAT_"
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Suffix Nama File</label>
            <input
              type="text"
              value={local.filenameSuffix}
              onChange={(e) => update("filenameSuffix", e.target.value)}
              placeholder="contoh: _final"
              className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={local.removeBlankFields}
              onChange={(e) => update("removeBlankFields", e.target.checked)}
              className="rounded border-gray-300"
            />
            Hapus placeholder kosong (jika data kosong, hapus teks {`{{}}`} )
          </label>
        </div>
      </div>

      {/* PDF Compression Settings */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          <Zap size={14} className="text-rm-500" />
          Kompresi PDF
        </h3>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Kualitas Kompresi Default</label>
          <select
            value={local.compressPdfQuality}
            onChange={(e) => update("compressPdfQuality", e.target.value as CompressQuality)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
          >
            {COMPRESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label} — {opt.description}</option>
            ))}
          </select>
        </div>
      </div>

      {/* File Management Settings */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          <FolderOpen size={14} className="text-rm-500" />
          Manajemen File
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={local.overwriteExisting}
              onChange={(e) => update("overwriteExisting", e.target.checked)}
              className="rounded border-gray-300"
            />
            Overwrite file yang sudah ada
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={local.includeSubfolders}
              onChange={(e) => update("includeSubfolders", e.target.checked)}
              className="rounded border-gray-300"
            />
            Include subfolder saat batch convert
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={local.zipOutput}
              onChange={(e) => update("zipOutput", e.target.checked)}
              className="rounded border-gray-300"
            />
            Bundle output sebagai ZIP (jika lebih dari 1 file)
          </label>
        </div>
      </div>

      {/* UI Settings */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          <Package size={14} className="text-rm-500" />
          Tampilan & UX
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={local.showGuideOnStart}
              onChange={(e) => update("showGuideOnStart", e.target.checked)}
              className="rounded border-gray-300"
            />
            Tampilkan panduan saat membuka tab Mail Merge
          </label>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-center">
        <p className="text-xs text-gray-400">RM Mail Merge Tools v1.0.0</p>
        <p className="text-xs text-gray-400">© RM Digital</p>
      </div>
    </div>
  );
}
