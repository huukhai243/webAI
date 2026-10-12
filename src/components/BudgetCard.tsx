import { Wallet } from "lucide-react";
import { formatVnd } from "@/lib/format";
import type { Itinerary } from "@/lib/schema";

export const VERDICT_META: Record<Itinerary["budget"]["verdict"], { label: string; className: string }> = {
  comfortable: { label: "Dư dả", className: "bg-emerald-50 text-emerald-700" },
  fits: { label: "Vừa đủ", className: "bg-brand-50 text-brand-700" },
  tight: { label: "Hơi eo hẹp", className: "bg-amber-50 text-amber-700" },
  over: { label: "Vượt ngân sách", className: "bg-accent-50 text-accent-600" },
};

type Props = { budget: Itinerary["budget"]; userBudget: number };

export default function BudgetCard({ budget, userBudget }: Props) {
  const rows = [
    { label: "Lưu trú", value: budget.accommodationVnd, color: "#0e8a76" },
    { label: "Ăn uống", value: budget.foodVnd, color: "#f26b3a" },
    { label: "Di chuyển", value: budget.transportVnd, color: "#2f7fd8" },
    { label: "Vé & trải nghiệm", value: budget.activitiesVnd, color: "#6d5bd0" },
    { label: "Khác, dự phòng", value: budget.otherVnd, color: "#a8a29e" },
  ];
  const sum = rows.reduce((total, row) => total + row.value, 0) || 1;
  const verdict = VERDICT_META[budget.verdict];
  const remaining = userBudget - budget.totalVnd;

  return (
    <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-stone-900">
          <Wallet className="size-5 text-brand-600" /> Dự toán chi phí
        </h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${verdict.className}`}>
          {verdict.label}
        </span>
      </div>

      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-sand-100">
        {rows.map((row) => (
          <div
            key={row.label}
            style={{ width: `${(row.value / sum) * 100}%`, background: row.color }}
            title={row.label}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: row.color }} />
            <span className="text-stone-600">{row.label}</span>
            <span className="ml-auto font-medium text-stone-900 tabular-nums">
              {formatVnd(row.value)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1 border-t border-sand-100 pt-4 text-sm">
        <div className="flex justify-between font-bold text-stone-900">
          <span>Tổng ước tính</span>
          <span className="tabular-nums">{formatVnd(budget.totalVnd)}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>Ngân sách của bạn</span>
          <span className="tabular-nums">{formatVnd(userBudget)}</span>
        </div>
        <div
          className={`flex justify-between font-medium ${remaining >= 0 ? "text-emerald-700" : "text-accent-600"}`}
        >
          <span>{remaining >= 0 ? "Còn dư" : "Thiếu"}</span>
          <span className="tabular-nums">{formatVnd(Math.abs(remaining))}</span>
        </div>
      </div>

      {budget.note && <p className="mt-4 text-sm leading-relaxed text-stone-600">{budget.note}</p>}
    </div>
  );
}
