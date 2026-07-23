import { Loader2 } from "lucide-react";

interface Props {
  current: number;
  total: number;
  message?: string;
  fileName?: string;
}

export default function ProgressBar({ current, total, message, fileName }: Props) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-gray-600">
          <Loader2 size={14} className="animate-spin text-rm-600" />
          {message || `Processing ${current}/${total}...`}
        </span>
        <span className="font-medium text-rm-600">{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-rm-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {fileName && (
        <p className="mt-2 truncate text-xs text-gray-400">{fileName}</p>
      )}
    </div>
  );
}
