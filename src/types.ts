export type LicenseType = "none" | "free" | "lifetime";

export interface LicenseState {
  type: LicenseType;
  freeUseCount: number;
  activatedEmail: string;
  activationCode: string;
  activatedAt: string;
}

export type CompressQuality = "extreme" | "low" | "medium" | "high" | "lossless";

export interface Settings {
  defaultExportFormat: ExportFormat;
  defaultSeparator: string;
  includeSubfolders: boolean;
  overwriteExisting: boolean;
  compressPdfQuality: CompressQuality;
  filenamePrefix: string;
  filenameSuffix: string;
  autoOpenFolder: boolean;
  showGuideOnStart: boolean;
  defaultMergeTemplate: string;
  removeBlankFields: boolean;
  zipOutput: boolean;
}

export type ExportFormat = "pdf" | "docx" | "xps" | "html" | "rtf" | "txt" | "odt";

export interface DataSource {
  type: "excel" | "csv" | "google-sheets";
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface MergeField {
  name: string;
  mappedColumn: string | null;
}

export interface MergeConfig {
  startRow: number;
  endRow: number;
  filenameColumns: string[];
  filenameSeparator: string;
  exportFormat: ExportFormat;
  outputFolder: string;
  filenamePrefix: string;
  filenameSuffix: string;
  removeBlankFields: boolean;
}

export interface ConvertConfig {
  inputFolder: string;
  outputFolder: string;
  includeSubfolders: boolean;
  overwriteExisting: boolean;
}

export interface CombinePdfConfig {
  inputFiles: string[];
  outputPath: string;
  fileName: string;
}

export interface CompressPdfConfig {
  inputFiles: string[];
  outputFolder: string;
  quality: CompressQuality;
}

export interface SavedTemplate {
  id: string;
  name: string;
  base64: string;
  createdAt: string;
}

export interface ProgressInfo {
  current: number;
  total: number;
  message: string;
  fileName: string;
}

export const EXPORT_FORMATS: { value: ExportFormat; label: string; extension: string }[] = [
  { value: "pdf", label: "PDF (.pdf)", extension: ".pdf" },
  { value: "docx", label: "Word (.docx)", extension: ".docx" },
  { value: "xps", label: "XPS (.xps)", extension: ".xps" },
  { value: "html", label: "HTML (.html)", extension: ".html" },
  { value: "rtf", label: "RTF (.rtf)", extension: ".rtf" },
  { value: "txt", label: "Plain Text (.txt)", extension: ".txt" },
  { value: "odt", label: "OpenDocument (.odt)", extension: ".odt" },
];

export const COMPRESS_OPTIONS: { value: CompressQuality; label: string; description: string }[] = [
  { value: "extreme", label: "Extreme", description: "Ukuran terkecil, kualitas gambar sangat rendah" },
  { value: "low", label: "Low", description: "Ukuran kecil, kualitas gambar rendah" },
  { value: "medium", label: "Medium", description: "Seimbang antara ukuran dan kualitas" },
  { value: "high", label: "High", description: "Kualitas baik, ukuran lebih besar" },
  { value: "lossless", label: "Lossless", description: "Hanya optimasi struktur, tanpa kompresi gambar" },
];

export const DEFAULT_SETTINGS: Settings = {
  defaultExportFormat: "pdf",
  defaultSeparator: "_",
  includeSubfolders: false,
  overwriteExisting: false,
  compressPdfQuality: "medium",
  filenamePrefix: "",
  filenameSuffix: "",
  autoOpenFolder: false,
  showGuideOnStart: true,
  defaultMergeTemplate: "",
  removeBlankFields: false,
  zipOutput: false,
};

export const FREE_USE_LIMIT = 3;

export const LICENSE_ENDPOINT = "https://rifqimulyawan.com/aktivasi-add-in-rmmt/";
export const PURCHASE_URL = "https://rmdigital.co.id/produk/";
