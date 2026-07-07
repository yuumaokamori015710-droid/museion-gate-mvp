import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  hint,
  optional = false,
  required = false
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      <span className="flex items-center gap-2">
        {label}
        {required ? <span className="rounded-full bg-navy px-2 py-0.5 text-[11px] font-bold text-white">必須</span> : null}
        {optional ? <span className="rounded-full border border-line bg-[#fffaf2] px-2 py-0.5 text-[11px] font-bold text-ink/55">任意</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs font-normal text-ink/55">{hint}</span> : null}
    </label>
  );
}

export const inputClass = cn("w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus-ring");
