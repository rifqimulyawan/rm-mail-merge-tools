import { useState } from "react";
import { X, BookOpen, FileSpreadsheet, FileText, Download, ArrowRight, Lightbulb, CheckCircle2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

const STEPS = [
  {
    icon: FileText,
    title: "1. Siapkan Template Dokumen",
    content: "Buat dokumen Word (.docx) sebagai template. Gunakan placeholder dengan format {{nama_kolom}} di mana data akan diganti.",
    example: "Contoh: Kepada Yth. {{nama}}\nAlamat: {{alamat}}\nKota: {{kota}}",
  },
  {
    icon: FileSpreadsheet,
    title: "2. Siapkan Data Source",
    content: "Buat file Excel (.xlsx) atau CSV dengan header kolom yang sesuai dengan placeholder di template. Pastikan nama header sama persis.",
    example: "Contoh Excel:\n| nama    | alamat        | kota     |\n| Budi    | Jl. Merdeka 1 | Jakarta  |\n| Siti    | Jl. Sudirman 2 | Bandung |",
  },
  {
    icon: ArrowRight,
    title: "3. Upload Data Source",
    content: "Klik tombol upload di bagian Data Source, pilih file Excel/CSV Anda, atau masukkan URL Google Sheets (pastikan sharing public).",
    example: "",
  },
  {
    icon: Download,
    title: "4. Konfigurasi Merge",
    content: "Pilih baris awal dan akhir, pilih kolom untuk nama file output, atur separator, dan pilih format export (PDF, DOCX, dll).",
    example: "Contoh: Kolom 'nama' + separator '_' → nama_file = Budi.pdf",
  },
  {
    icon: FileText,
    title: "5. Load Template",
    content: "Buka template dokumen di Word, lalu klik 'Load Template dari Dokumen Aktif'. Template akan digunakan untuk setiap record.",
    example: "",
  },
  {
    icon: CheckCircle2,
    title: "6. Execute Merge",
    content: "Klik 'Execute Merge'. Setiap record akan diproses: template diisi dengan data, lalu di-export sesuai format yang dipilih.",
    example: "Hasil: Setiap file akan otomatis ter-download dengan nama sesuai kolom yang dipilih.",
  },
];

export default function GuidePopup({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-rm-600 px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            <BookOpen size={20} />
            <span className="text-sm font-semibold">Panduan Mail Merge</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rm-100">
              <Icon size={20} className="text-rm-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{step.title}</h3>
              <p className="text-xs text-gray-500">Langkah {currentStep + 1} dari {STEPS.length}</p>
            </div>
          </div>

          <p className="mb-3 text-sm leading-relaxed text-gray-600">{step.content}</p>

          {step.example && (
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <pre className="whitespace-pre-wrap text-xs text-gray-600 font-mono">{step.example}</pre>
            </div>
          )}

          {currentStep === 0 && (
            <div className="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3">
              <Lightbulb size={16} className="shrink-0 text-amber-500 mt-0.5" />
              <p className="text-xs text-amber-700">
                Tip: Gunakan kurung kurawal ganda <code className="font-mono font-bold">{"{{nama_kolom}}"}</code> sebagai placeholder. Nama kolom harus sama dengan header di Excel/CSV.
              </p>
            </div>
          )}

          <div className="mb-4 flex gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i === currentStep ? "bg-rm-600" : i < currentStep ? "bg-rm-300" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="flex-1 rounded-lg bg-rm-600 py-2 text-sm font-medium text-white transition hover:bg-rm-700"
              >
                Selanjutnya
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Mulai Merge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
