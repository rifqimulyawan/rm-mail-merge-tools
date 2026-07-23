import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Globe, Table, CheckCircle2, AlertCircle } from "lucide-react";
import { parseExcelFile, parseCsvFile, parseGoogleSheets } from "../data-loader";
import type { DataSource } from "../types";

interface Props {
  dataSource: DataSource | null;
  onLoad: (ds: DataSource) => void;
}

export default function DataSourcePanel({ dataSource, onLoad }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [showGoogleInput, setShowGoogleInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const ext = file.name.toLowerCase().split(".").pop();
      let ds: DataSource;
      if (ext === "xlsx" || ext === "xls") {
        ds = await parseExcelFile(file);
      } else if (ext === "csv") {
        ds = await parseCsvFile(file);
      } else {
        throw new Error("Format file tidak didukung. Gunakan .xlsx atau .csv");
      }

      if (ds.totalRows === 0) {
        throw new Error("File kosong atau tidak memiliki data.");
      }

      onLoad(ds);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGoogleSheets = async () => {
    if (!googleUrl.trim()) return;

    setLoading(true);
    setError("");

    try {
      const ds = await parseGoogleSheets(googleUrl.trim());
      if (ds.totalRows === 0) {
        throw new Error("Google Sheets kosong atau tidak dapat diakses.");
      }
      onLoad(ds);
      setShowGoogleInput(false);
      setGoogleUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Data Source</h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-rm-400 hover:bg-rm-50 disabled:opacity-50"
          >
            <FileSpreadsheet size={28} className="text-rm-500" />
            <span className="text-xs font-medium text-gray-600">Upload Excel/CSV</span>
          </button>

          <button
            onClick={() => setShowGoogleInput(!showGoogleInput)}
            disabled={loading}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-rm-400 hover:bg-rm-50 disabled:opacity-50"
          >
            <Globe size={28} className="text-rm-500" />
            <span className="text-xs font-medium text-gray-600">Google Sheets</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {showGoogleInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
              placeholder="Paste Google Sheets URL..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rm-500 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={handleGoogleSheets}
              disabled={loading || !googleUrl.trim()}
              className="rounded-lg bg-rm-600 px-4 py-2 text-sm font-medium text-white hover:bg-rm-700 disabled:opacity-50"
            >
              Load
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {dataSource && (
          <div className="mt-3 rounded-lg bg-green-50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 size={16} />
              {dataSource.fileName}
            </div>
            <p className="mt-1 text-xs text-green-600">
              {dataSource.totalRows} baris, {dataSource.headers.length} kolom
            </p>
          </div>
        )}
      </div>

      {dataSource && dataSource.headers.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Table size={16} /> Preview Data
          </div>
          <div className="overflow-auto rounded-lg border border-gray-200" style={{ maxHeight: "200px" }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-500">#</th>
                  {dataSource.headers.slice(0, 6).map((h) => (
                    <th key={h} className="px-2 py-1.5 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataSource.rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                    {dataSource.headers.slice(0, 6).map((h) => (
                      <td key={h} className="px-2 py-1.5 text-gray-700 truncate max-w-[120px]">{row[h] || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataSource.totalRows > 10 && (
            <p className="mt-1 text-xs text-gray-400">Menampilkan 10 dari {dataSource.totalRows} baris...</p>
          )}
        </div>
      )}
    </div>
  );
}
