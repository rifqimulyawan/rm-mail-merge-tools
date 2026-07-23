import { useState } from "react";
import { Mail, Play, AlertCircle, CheckCircle2, FileText, HelpCircle } from "lucide-react";
import type { DataSource, MergeConfig, ExportFormat, ProgressInfo, Settings } from "../types";
import { EXPORT_FORMATS } from "../types";
import { executeMailMerge, getFormatExtension, getTemplateContent } from "../office-ops";
import { buildFilename, sanitizeFilename } from "../data-loader";
import DataSourcePanel from "./DataSourcePanel";
import ProgressBar from "./ProgressBar";
import GuidePopup from "./GuidePopup";

interface Props {
  onUseConsumed: () => void;
  settings: Settings;
}

export default function MailMergePanel({ onUseConsumed, settings }: Props) {
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [startRow, setStartRow] = useState(1);
  const [endRow, setEndRow] = useState(1);
  const [filenameColumns, setFilenameColumns] = useState<string[]>([]);
  const [separator, setSeparator] = useState(settings.defaultSeparator);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(settings.defaultExportFormat);
  const [templateBase64, setTemplateBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [result, setResult] = useState<{ success: boolean; outputCount: number; errors: string[] } | null>(null);
  const [previewFilenames, setPreviewFilenames] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [filenamePrefix, setFilenamePrefix] = useState(settings.filenamePrefix);
  const [filenameSuffix, setFilenameSuffix] = useState(settings.filenameSuffix);

  const handleDataSourceLoad = (ds: DataSource) => {
    setDataSource(ds);
    setStartRow(1);
    setEndRow(Math.min(ds.totalRows, 10));
    setFilenameColumns(ds.headers.length > 0 ? [ds.headers[0]] : []);
    setResult(null);
    updatePreviewFilenames(ds, 1, Math.min(ds.totalRows, 10), ds.headers.length > 0 ? [ds.headers[0]] : [], "_", exportFormat);
  };

  const updatePreviewFilenames = (
    ds: DataSource,
    start: number,
    end: number,
    cols: string[],
    sep: string,
    fmt: ExportFormat
  ) => {
    const ext = getFormatExtension(fmt);
    const previews: string[] = [];
    for (let i = start - 1; i < end && i < ds.rows.length && previews.length < 5; i++) {
      previews.push(buildFilename(ds.rows[i], cols, sep, ext));
    }
    setPreviewFilenames(previews);
  };

  const handleColumnToggle = (col: string) => {
    setFilenameColumns((prev) => {
      const next = prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col];
      if (dataSource) {
        updatePreviewFilenames(dataSource, startRow, endRow, next, separator, exportFormat);
      }
      return next;
    });
  };

  const handleLoadTemplate = async () => {
    setLoading(true);
    try {
      const base64 = await getTemplateContent();
      if (base64) {
        setTemplateBase64(base64);
      }
    } catch (err) {
      setResult({ success: false, outputCount: 0, errors: [String(err)] });
    }
    setLoading(false);
  };

  const handleExecute = async () => {
    if (!dataSource) return;
    if (filenameColumns.length === 0) {
      setResult({ success: false, outputCount: 0, errors: ["Pilih minimal satu kolom untuk nama file."] });
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress({ current: 0, total: endRow - startRow + 1, message: "Starting...", fileName: "" });

    const config: MergeConfig = {
      startRow,
      endRow,
      filenameColumns,
      filenameSeparator: separator,
      exportFormat,
      outputFolder: "",
      filenamePrefix,
      filenameSuffix,
      removeBlankFields: settings.removeBlankFields,
    };

    try {
      const res = await executeMailMerge(dataSource, config, templateBase64, (info) => {
        setProgress(info);
      });
      setResult(res);
      if (res.outputCount > 0) onUseConsumed();
    } catch (err) {
      setResult({ success: false, outputCount: 0, errors: [String(err)] });
    }

    setLoading(false);
    setProgress(null);
  };

  const handleRangeChange = (start: number, end: number) => {
    setStartRow(start);
    setEndRow(end);
    if (dataSource) {
      updatePreviewFilenames(dataSource, start, end, filenameColumns, separator, exportFormat);
    }
  };

  return (
    <div className="space-y-4">
      {showGuide && <GuidePopup onClose={() => setShowGuide(false)} />}

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Mail size={18} className="text-rm-600" />
          Mail Merge
        </h2>
        <button
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1 rounded-lg border border-rm-200 px-2.5 py-1 text-xs font-medium text-rm-600 transition hover:bg-rm-50"
        >
          <HelpCircle size={14} />
          Panduan
        </button>
      </div>

      <DataSourcePanel dataSource={dataSource} onLoad={handleDataSourceLoad} />

      {dataSource && (
        <>
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Konfigurasi Merge</h3>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Dari Baris</label>
                <input
                  type="number"
                  min={1}
                  max={dataSource.totalRows}
                  value={startRow}
                  onChange={(e) => handleRangeChange(parseInt(e.target.value) || 1, endRow)}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Sampai Baris</label>
                <input
                  type="number"
                  min={1}
                  max={dataSource.totalRows}
                  value={endRow}
                  onChange={(e) => handleRangeChange(startRow, parseInt(e.target.value) || 1)}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="mb-1.5 block text-xs text-gray-500">Kolom untuk Nama File</label>
              <div className="flex flex-wrap gap-1.5">
                {dataSource.headers.map((h) => (
                  <button
                    key={h}
                    onClick={() => handleColumnToggle(h)}
                    disabled={loading}
                    className={`rounded px-2 py-1 text-xs font-medium transition ${
                      filenameColumns.includes(h)
                        ? "bg-rm-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Separator</label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => {
                    const sep = e.target.value;
                    setSeparator(sep);
                    if (dataSource) updatePreviewFilenames(dataSource, startRow, endRow, filenameColumns, sep, exportFormat);
                  }}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Format Export</label>
                <select
                  value={exportFormat}
                  onChange={(e) => {
                    const fmt = e.target.value as ExportFormat;
                    setExportFormat(fmt);
                    if (dataSource) updatePreviewFilenames(dataSource, startRow, endRow, filenameColumns, separator, fmt);
                  }}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
                  disabled={loading}
                >
                  {EXPORT_FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Prefix Nama File</label>
                <input
                  type="text"
                  value={filenamePrefix}
                  onChange={(e) => setFilenamePrefix(e.target.value)}
                  placeholder="(opsional)"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Suffix Nama File</label>
                <input
                  type="text"
                  value={filenameSuffix}
                  onChange={(e) => setFilenameSuffix(e.target.value)}
                  placeholder="(opsional)"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-rm-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={handleLoadTemplate}
              disabled={loading}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <FileText size={16} />
              {templateBase64 ? "Template Loaded (klik untuk reload)" : "Load Template dari Dokumen Aktif"}
            </button>

            {previewFilenames.length > 0 && (
              <div className="mb-3 rounded-lg bg-gray-50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-500">Preview Nama File:</p>
                {previewFilenames.map((fn, i) => (
                  <p key={i} className="text-xs text-gray-600 truncate">{fn}</p>
                ))}
                {endRow - startRow + 1 > 5 && (
                  <p className="mt-1 text-xs text-gray-400">...dan {endRow - startRow + 1 - 5} file lainnya</p>
                )}
              </div>
            )}

            <button
              onClick={handleExecute}
              disabled={loading || !dataSource}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-rm-600 py-2.5 text-sm font-medium text-white transition hover:bg-rm-700 disabled:opacity-50"
            >
              <Play size={16} />
              {loading ? "Processing..." : `Execute Merge (${endRow - startRow + 1} records)`}
            </button>
          </div>

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
              {result.outputCount > 0 && (
                <p className="mt-1 text-xs text-gray-600">{result.outputCount} file berhasil di-download.</p>
              )}
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
        </>
      )}
    </div>
  );
}
