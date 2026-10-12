"use client";

import { useEffect, useState } from "react";
import { Check, Compass, LoaderCircle } from "lucide-react";
import { formatVndShort } from "@/lib/format";
import type { PlanProgress, TripRequest } from "@/lib/schema";

type Props = {
  trip: TripRequest;
  startedAt: number;
  progress: PlanProgress;
  demo: boolean;
  onCancel: () => void;
};

export default function PlanningProgress({ trip, startedAt, progress, demo, onCancel }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const { phase, day, place } = progress;
  const currentDay = Math.min(day, trip.days);
  const percent =
    phase === "thinking"
      ? Math.min(15, 3 + elapsed * 0.4)
      : phase === "writing"
        ? 15 + (75 * Math.max(0, currentDay - 1)) / trip.days
        : 92;

  const steps = [
    { label: "Tìm hiểu điểm đến và chọn khu vực", state: phase === "thinking" ? "active" : "done" },
    {
      label:
        phase === "writing" && currentDay > 0
          ? `Lên lịch ngày ${currentDay}/${trip.days}`
          : `Lên lịch ${trip.days} ngày`,
      state: phase === "thinking" ? "todo" : phase === "writing" ? "active" : "done",
    },
    { label: "Tính chi phí, chỗ ở và lưu ý", state: phase === "finishing" ? "active" : "todo" },
  ] as const;

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-sand-200 bg-white p-6 text-center shadow-xl shadow-stone-900/5 sm:p-10">
      <div className="relative mx-auto grid size-20 place-items-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500 [animation-duration:1.6s]" />
        <Compass className="size-9 text-brand-600" />
      </div>

      {demo && (
        <span className="mt-6 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          Chế độ demo · dữ liệu mẫu
        </span>
      )}
      <h2 className={`${demo ? "mt-3" : "mt-6"} text-2xl font-bold text-stone-900`}>
        Đang lên lịch trình {trip.destination}
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        {trip.days} ngày · {trip.travelers} người · {formatVndShort(trip.budgetVnd)}
      </p>

      <div className="mt-8 h-2 overflow-hidden rounded-full bg-sand-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-6 space-y-3 text-left">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-3">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full ${
                step.state === "done"
                  ? "bg-brand-600 text-white"
                  : step.state === "active"
                    ? "bg-brand-50 text-brand-600"
                    : "bg-sand-100 text-stone-400"
              }`}
            >
              {step.state === "done" ? (
                <Check className="size-4" />
              ) : step.state === "active" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
            <span
              className={
                step.state === "todo" ? "text-stone-400" : "font-medium text-stone-800"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-6 h-5 truncate text-sm text-stone-500">
        {place && phase !== "thinking" && (
          <span key={place} className="animate-fade-in">
            Vừa thêm: <span className="font-medium text-stone-700">{place}</span>
          </span>
        )}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-sand-100 pt-5 text-sm">
        <span className="tabular-nums text-stone-500">
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 font-medium text-stone-600 transition hover:bg-sand-100"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
