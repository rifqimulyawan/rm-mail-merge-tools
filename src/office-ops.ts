import { PDFDocument, degrees } from "pdf-lib";
import type { ExportFormat, MergeConfig, DataSource, ProgressInfo, CompressQuality } from "./types";
import { EXPORT_FORMATS } from "./types";
import { sanitizeFilename, buildFilename } from "./data-loader";

export function getFormatExtension(format: ExportFormat): string {
  const found = EXPORT_FORMATS.find((f) => f.value === format);
  return found ? found.extension : ".pdf";
}

export function getFileExtension(format: ExportFormat): number {
  switch (format) {
    case "pdf": return 2; // PDF
    case "docx": return 4; // Docx
    case "xps": return 3; // XPS
    case "html": return 5; // HTML
    case "rtf": return 6; // RTF
    case "txt": return 7; // Text
    case "odt": return 8; // ODT
    default: return 2;
  }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
  const byteChars = atob(base64);
  const byteArrays: ArrayBuffer[] = [];
  const sliceSize = 512;
  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const buf = new ArrayBuffer(byteNumbers.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < byteNumbers.length; i++) {
      view[i] = byteNumbers[i];
    }
    byteArrays.push(buf);
  }
  return new Blob(byteArrays, { type: mimeType });
}

export async function downloadBlob(blob: Blob, fileName: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadBase64(base64: string, fileName: string, mimeType: string): Promise<void> {
  const blob = await base64ToBlob(base64, mimeType);
  await downloadBlob(blob, fileName);
}

export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case "pdf": return "application/pdf";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "html": return "text/html";
    case "rtf": return "application/rtf";
    case "txt": return "text/plain";
    case "odt": return "application/vnd.oasis.opendocument.text";
    case "xps": return "application/vnd.ms-xpsdocument";
    default: return "application/octet-stream";
  }
}

export async function executeMailMerge(
  dataSource: DataSource,
  config: MergeConfig,
  templateBase64: string | null,
  onProgress: (info: ProgressInfo) => void
): Promise<{ success: boolean; outputCount: number; errors: string[] }> {
  const errors: string[] = [];
  let outputCount = 0;
  const extension = getFormatExtension(config.exportFormat);
  const mimeType = getMimeType(config.exportFormat);

  for (let i = config.startRow - 1; i <= config.endRow - 1 && i < dataSource.rows.length; i++) {
    const row = dataSource.rows[i];
    const fileName = buildFilename(row, config.filenameColumns, config.filenameSeparator, getFormatExtension(config.exportFormat), config.filenamePrefix, config.filenameSuffix);

    try {
      onProgress({
        current: i - config.startRow + 2,
        total: config.endRow - config.startRow + 1,
        message: `Merging record ${i + 1}...`,
        fileName,
      });

      if (templateBase64) {
        await Word.run(async (context) => {
          const body = context.document.body;
          body.insertFileFromBase64(templateBase64, Word.InsertLocation.replace);

          const ranges = context.document.body.search("{{", { matchWildcards: false });
          context.load(ranges, "text");
          await context.sync();

          for (let r = ranges.items.length - 1; r >= 0; r--) {
            const range = ranges.items[r];
            const fieldText = range.text;
            const fieldName = fieldText.replace(/\{\{|\}\}/g, "").trim();
            if (dataSource.headers.includes(fieldName)) {
              range.insertText(row[fieldName] || "", Word.InsertLocation.replace);
            }
          }

          await context.sync();
        });
      } else {
        await Word.run(async (context) => {
          const body = context.document.body;
          for (const [key, value] of Object.entries(row)) {
            const ranges = body.search(`{{${key}}}`, { matchWildcards: false });
            context.load(ranges, "text");
            await context.sync();
            for (const range of ranges.items) {
              range.insertText(value, Word.InsertLocation.replace);
            }
          }
          await context.sync();
        });
      }

      const fileContent = await getFileContent(getFileExtension(config.exportFormat));
      if (fileContent) {
        await downloadBase64(fileContent, fileName, mimeType);
        outputCount++;
      }
    } catch (error) {
      errors.push(`Record ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { success: errors.length === 0, outputCount, errors };
}

async function getFileContent(format: number): Promise<string | null> {
  return new Promise((resolve) => {
    Office.context.document.getFileAsync(format, { sliceSize: 65536 }, (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        const file = asyncResult.value;
        const sliceCount = file.sliceCount;
        const slices: string[] = [];
        let retrieved = 0;

        const getSlice = (index: number) => {
          file.getSliceAsync(index, (sliceResult) => {
            if (sliceResult.status === Office.AsyncResultStatus.Succeeded) {
              const sliceData = sliceResult.value.data;
              let binary = "";
              const bytes = new Uint8Array(sliceData);
              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              slices[index] = btoa(binary);
            }
            retrieved++;
            if (retrieved === sliceCount) {
              file.closeAsync();
              resolve(slices.join(""));
            } else if (index + 1 < sliceCount) {
              getSlice(index + 1);
            }
          });
        };

        if (sliceCount === 0) {
          file.closeAsync();
          resolve(null);
        } else {
          getSlice(0);
        }
      } else {
        resolve(null);
      }
    });
  });
}

export async function batchConvertDocxToPdf(
  files: File[],
  onProgress: (info: ProgressInfo) => void
): Promise<{ success: boolean; outputCount: number; errors: string[] }> {
  const errors: string[] = [];
  let outputCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const outputName = file.name.replace(/\.docx$/i, ".pdf");

    try {
      onProgress({
        current: i + 1,
        total: files.length,
        message: `Converting ${file.name}...`,
        fileName: outputName,
      });

      const base64 = await fileToBase64(file);

      await Word.run(async (context) => {
        const body = context.document.body;
        body.insertFileFromBase64(base64, Word.InsertLocation.replace);
        await context.sync();
      });

      const pdfContent = await getFileContent(2);
      if (pdfContent) {
        await downloadBase64(pdfContent, outputName, "application/pdf");
        outputCount++;
      }
    } catch (error) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { success: errors.length === 0, outputCount, errors };
}

export async function combinePdfs(
  files: File[],
  outputFileName: string,
  onProgress: (info: ProgressInfo) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress({
        current: i + 1,
        total: files.length,
        message: `Merging ${file.name}...`,
        fileName: file.name,
      });

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
    await downloadBlob(blob, outputFileName);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function compressPdf(
  file: File,
  quality: CompressQuality,
  onProgress?: (info: ProgressInfo) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        message: `Compressing ${file.name}...`,
        fileName: file.name,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    const saveOptions: Parameters<typeof pdf.save>[0] = {
      useObjectStreams: true,
      addDefaultPage: false,
    };

    if (quality === "lossless") {
      saveOptions.useObjectStreams = true;
    } else {
      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setProducer("");
      pdf.setCreator("");

      const pages = pdf.getPages();

      if (quality === "extreme" || quality === "low") {
        // Remove image XObjects from page resources to drastically reduce size
        for (const page of pages) {
          try {
            const nodeAny = page.node as any;
            const resources = nodeAny.getOrCreateResources?.() ?? nodeAny.Resources?.();
            if (resources) {
              const xObject = resources.lookup?.("XObject");
              if (xObject && xObject.keys) {
                for (const key of xObject.keys()) {
                  const obj = xObject.get(key);
                  if (obj && obj.toString?.().includes("Image")) {
                    xObject.delete(key);
                  }
                }
              }
            }
          } catch {
            // skip
          }
        }
      }

      if (quality === "extreme") {
        // Also remove annotations
        for (const page of pages) {
          try {
            const nodeAny = page.node as any;
            const dict = nodeAny.dict;
            if (dict && dict.has && dict.has("Annots")) {
              dict.delete("Annots");
            }
          } catch {
            // skip
          }
        }
      }
    }

    const pdfBytes = await pdf.save(saveOptions);
    const outputName = file.name.replace(/\.pdf$/i, "_compressed.pdf");
    const blob = new Blob([pdfBytes as unknown as ArrayBuffer], { type: "application/pdf" });
    await downloadBlob(blob, outputName);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function compressMultiplePdfs(
  files: File[],
  quality: CompressQuality,
  onProgress: (info: ProgressInfo) => void
): Promise<{ success: boolean; outputCount: number; errors: string[] }> {
  const errors: string[] = [];
  let outputCount = 0;

  for (let i = 0; i < files.length; i++) {
    const result = await compressPdf(files[i], quality, onProgress);
    if (result.success) {
      outputCount++;
    } else {
      errors.push(`${files[i].name}: ${result.error}`);
    }
  }

  return { success: errors.length === 0, outputCount, errors };
}

export async function getTemplateContent(): Promise<string | null> {
  return new Promise((resolve) => {
    Office.context.document.getFileAsync(4, { sliceSize: 65536 }, (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        const file = asyncResult.value;
        const sliceCount = file.sliceCount;
        const slices: string[] = [];
        let retrieved = 0;

        const getSlice = (index: number) => {
          file.getSliceAsync(index, (sliceResult) => {
            if (sliceResult.status === Office.AsyncResultStatus.Succeeded) {
              const sliceData = sliceResult.value.data;
              let binary = "";
              const bytes = new Uint8Array(sliceData);
              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              slices[index] = btoa(binary);
            }
            retrieved++;
            if (retrieved === sliceCount) {
              file.closeAsync();
              resolve(slices.join(""));
            } else if (index + 1 < sliceCount) {
              getSlice(index + 1);
            }
          });
        };

        if (sliceCount === 0) {
          file.closeAsync();
          resolve(null);
        } else {
          getSlice(0);
        }
      } else {
        resolve(null);
      }
    });
  });
}

export async function getDocumentText(): Promise<string> {
  return Word.run(async (context) => {
    const body = context.document.body;
    context.load(body, "text");
    await context.sync();
    return body.text;
  });
}
