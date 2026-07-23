import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { DataSource } from "./types";

export async function parseExcelFile(file: File): Promise<DataSource> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  if (jsonData.length === 0) {
    return {
      type: "excel",
      fileName: file.name,
      headers: [],
      rows: [],
      totalRows: 0,
    };
  }

  const headers = Object.keys(jsonData[0]);
  const rows = jsonData.map((row) => {
    const stringRow: Record<string, string> = {};
    for (const key of headers) {
      stringRow[key] = String(row[key] ?? "");
    }
    return stringRow;
  });

  return {
    type: "excel",
    fileName: file.name,
    headers,
    rows,
    totalRows: rows.length,
  };
}

export async function parseCsvFile(file: File): Promise<DataSource> {
  const text = await file.text();
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const headers = result.meta.fields || [];
  const rows = (result.data || []).map((row) => {
    const stringRow: Record<string, string> = {};
    for (const key of headers) {
      stringRow[key] = String(row[key] ?? "");
    }
    return stringRow;
  });

  return {
    type: "csv",
    fileName: file.name,
    headers,
    rows,
    totalRows: rows.length,
  };
}

export async function parseGoogleSheets(url: string): Promise<DataSource> {
  let csvUrl = url.trim();

  if (csvUrl.includes("docs.google.com/spreadsheets/d/")) {
    const match = csvUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const sheetId = match[1];
      csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    }
  } else if (csvUrl.includes("edit#gid=")) {
    const gidMatch = csvUrl.match(/gid=(\d+)/);
    if (gidMatch) {
      csvUrl = csvUrl.replace(/edit#gid=\d+/, `export?format=csv&gid=${gidMatch[1]}`);
    }
  }

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error("Gagal mengakses Google Sheets. Pastikan spreadsheet bersifat public.");
  }
  const text = await response.text();
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const headers = result.meta.fields || [];
  const rows = (result.data || []).map((row) => {
    const stringRow: Record<string, string> = {};
    for (const key of headers) {
      stringRow[key] = String(row[key] ?? "");
    }
    return stringRow;
  });

  return {
    type: "google-sheets",
    fileName: "Google Sheets",
    headers,
    rows,
    totalRows: rows.length,
  };
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export function buildFilename(
  row: Record<string, string>,
  columns: string[],
  separator: string,
  extension: string,
  prefix: string = "",
  suffix: string = ""
): string {
  const parts = columns.map((col) => sanitizeFilename(row[col] || ""));
  const baseName = parts.join(separator);
  return `${prefix}${baseName}${suffix}${extension}`;
}

export function detectMergeFields(templateText: string): string[] {
  const patterns = [
    /\{\{([^}]+)\}\}/g,
    /<<([^>]+)>>/g,
    /\{([^}]+)\}/g,
  ];

  const fields = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(templateText)) !== null) {
      fields.add(match[1].trim());
    }
  }

  return Array.from(fields);
}
