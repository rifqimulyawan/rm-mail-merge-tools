import { useState, useRef } from "react";
import { FileText, FilePlus, FileMinus, Play, AlertCircle, CheckCircle2, X, FileUp } from "lucide-react";
import type { ProgressInfo, CompressQuality } from "../types";
import { COMPRESS_OPTIONS } from "../types";
import { batchConvertDocxToPdf, combinePdfs, compressMultiplePdfs } from "../office-ops";
import ProgressBar from "./ProgressBar";

type Tab = "convert" | "combine" | "compress";

interface Props {
  onUseConsumed: () => void;
}

export default function BatchConvertPanel({ onUseConsumed }: Props) {
  const [tab, setTab] = useState<Tab>("convert");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [result, setResult] = useState<{ success: boolean; outputCount: number; errors: string[]; error?: string } | null>(null);
  const [compressQuality, setCompressQuality] = useState<CompressQuality>("medium");
  const [combineFileName, setCombineFileName] = useState("combined.pdf");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptType = tab === "convert" ? ".docx" : ".pdf";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setResult(null);
  };

  const handleExecute = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setResult(null);
    setProgress({ current: 0, total: files.length, message: "Starting...", fileName: "" });

    try {
      let res;
      if (tab === "convert") {
        res = await batchConvertDocxToPdf(files, (info) => setProgress(info));
      } else if (tab === "combine") {
        const combineRes = await combinePdfs(files, combineFileName || "combined.pdf", (info) => setProgress(info));
        res = {
          success: combineRes.success,
          outputCount: combineRes.success ? 1 : 0,
          errors: combineRes.error ? [combineRes.error] : [],
        };
      } else {
        res = await compressMultiplePdfs(files, compressQuality, (info) => setProgress(info));
      }

      setResult(res);
      if (res.outputCount > 0) onUseConsumed();
    } catch (err) {
      setResult({ success: false, outputCount: 0, errors: [String(err)] });
    }

    setLoading(false);
    setProgress(null);
  };

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "convert", label: "DOCX → PDF", icon: FileText },
    { key: "combine", label: "Combine PDF", icon: FilePlus },
    { key: "compress", label: "Compress PDF", icon: FileMinus },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setFiles([]); setResult(null); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition ${
                tab === t.key ? "bg-white text-rm-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-rm-400 hover:bg-rm-50 disabled:opacity-50"
        >
          <FileUp size={32} className="text-rm-500" />
          <span className="text-sm font-medium text-gray-600">
            Upload {tab === "convert" ? ".docx" : ".pdf"} files
          </span>
          <span className="text-xs text-gray-400">Klik untuk pilih file</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptType}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {tab === "combine" && (
        <div>
          <label className="mb-1 block text-xs text-gray-500">Nama File Output</label>
          <input
            type="text"
            value={combineFileName}
            onChange={(e) => setCombineFileName(e.target.value)}
            placeholder="combined.pdf"
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
            disabled={loading}
          />
        </div>
      )}

      {tab === "compress" && (
        <div>
          <label className="mb-1 block text-xs text-gray-500">Kualitas Kompresi</label>
          <select
            value={compressQuality}
            onChange={(e) => setCompressQuality(e.target.value as CompressQuality)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
            disabled={loading}
          >
            {COMPRESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label} — {opt.description}</option>
            ))}
          </select>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">{files.length} file dipilih</span>
            <button onClick={clearFiles} disabled={loading} className="text-xs text-red-500 hover:underline disabled:opacity-50">
              Clear all
            </button>
          </div>
          <div className="max-h-40 space-y-1 overflow-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5 text-xs">
                <span className="truncate text-gray-700">{file.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => removeFile(i)} disabled={loading} className="text-red-400 hover:text-red-600 disabled:opacity-50">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <button
          onClick={handleExecute}
          disabled={loading || files.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rm-600 py-2.5 text-sm font-medium text-white transition hover:bg-rm-700 disabled:opacity-50"
        >
          <Play size={16} />
          {loading ? "Processing..." : `${tab === "convert" ? "Convert" : tab === "combine" ? "Combine" : "Compress"} (${files.length} files)`}
        </button>
      )}

      {progress && <ProgressBar {...progress} />}

      {result && (
        <div className={`rounded-lg p-4 ${result.success ? "bg-green-50" : "bg-red-50"}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {result.success ? (
              <><CheckCircle2 size={16} className="text-green-600" /><span className="text-green-700">Berhasil! {result.outputCount} file dihasilkan.</span></>
            ) : (
              <><AlertCircle size={16} className="text-red-600" /><span className="text-red-700">Selesai dengan {result.errors.length} error.</span></>
            )}
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-red-600">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
              {result.errors.length > 5 && <li>...dan {result.errors.length - 5} error lainnya</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
