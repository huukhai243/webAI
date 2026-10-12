"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  CalendarDays,
  Eye,
  MapPin,
  Minus,
  NotebookPen,
  Plane,
  Plus,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { formatNumber, formatVndShort, parseDigits } from "@/lib/format";
import {
  INTERESTS,
  MAX_DAYS,
  MAX_TRAVELERS,
  PACES,
  TripRequestSchema,
  type TripRequest,
} from "@/lib/schema";

export const DEFAULT_TRIP: TripRequest = {
  destination: "",
  origin: "",
  days: 3,
  travelers: 2,
  budgetVnd: 10_000_000,
  startDate: "",
  interests: ["food", "culture"],
  pace: "balanced",
  notes: "",
};

const POPULAR_DESTINATIONS = [
  "Đà Lạt",
  "Hội An",
  "Phú Quốc",
  "Sa Pa",
  "Hà Giang",
  "Nha Trang",
  "Bangkok",
  "Seoul",
  "Tokyo",
];

const BUDGET_PRESETS = [3_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000];

type Props = {
  value: TripRequest;
  onChange: (trip: TripRequest) => void;
  onSubmit: (trip: TripRequest) => void;
  onDemo: () => void;
  error: string | null;
};

export default function PlanForm({ value, onChange, onSubmit, onDemo, error }: Props) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const set = <K extends keyof TripRequest>(key: K, v: TripRequest[K]) =>
    onChange({ ...value, [key]: v });

  function toggleInterest(id: TripRequest["interests"][number]) {
    set(
      "interests",
      value.interests.includes(id)
        ? value.interests.filter((i) => i !== id)
        : [...value.interests, id],
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = TripRequestSchema.safeParse(value);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? "Thông tin chưa hợp lệ");
      return;
    }
    setValidationError(null);
    onSubmit(parsed.data);
  }

  const perPersonPerDay = value.budgetVnd / Math.max(1, value.travelers * value.days);
  const shownError = validationError ?? error;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-3xl border border-sand-200 bg-white p-5 shadow-xl shadow-stone-900/5 sm:p-8"
    >
      {/* Điểm đến */}
      <Field label="Bạn muốn đi đâu?" htmlFor="destination" icon={<MapPin className="size-4" />}>
        <input
          id="destination"
          className="field text-lg"
          placeholder="Ví dụ: Đà Lạt, Hội An, Tokyo…"
          value={value.destination}
          onChange={(e) => set("destination", e.target.value)}
          maxLength={100}
          autoComplete="off"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR_DESTINATIONS.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => set("destination", place)}
              className="rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-sm text-stone-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {place}
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field
          label="Khởi hành từ"
          optional
          htmlFor="origin"
          icon={<Plane className="size-4" />}
        >
          <input
            id="origin"
            className="field"
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            value={value.origin}
            onChange={(e) => set("origin", e.target.value)}
            maxLength={100}
          />
        </Field>
        <Field
          label="Ngày khởi hành"
          optional
          htmlFor="startDate"
          icon={<CalendarDays className="size-4" />}
        >
          <input
            id="startDate"
            type="date"
            className="field"
            value={value.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Số ngày">
          <Stepper
            value={value.days}
            min={1}
            max={MAX_DAYS}
            unit="ngày"
            onChange={(v) => set("days", v)}
          />
        </Field>
        <Field label="Số người">
          <Stepper
            value={value.travelers}
            min={1}
            max={MAX_TRAVELERS}
            unit="người"
            onChange={(v) => set("travelers", v)}
          />
        </Field>
      </div>

      {/* Ngân sách */}
      <div className="mt-6">
        <Field label="Tổng ngân sách cả nhóm" htmlFor="budget">
          <div className="relative">
            <input
              id="budget"
              inputMode="numeric"
              className="field pr-12 text-lg font-semibold"
              value={formatNumber(value.budgetVnd)}
              onChange={(e) => set("budgetVnd", Math.min(parseDigits(e.target.value), 5_000_000_000))}
              placeholder="10.000.000"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-stone-400">
              đ
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {BUDGET_PRESETS.map((amount) => (
              <Chip
                key={amount}
                active={value.budgetVnd === amount}
                onClick={() => set("budgetVnd", amount)}
              >
                {formatVndShort(amount)}
              </Chip>
            ))}
            {value.budgetVnd > 0 && (
              <span className="ml-auto text-sm text-stone-500">
                ≈ {formatVndShort(perPersonPerDay)}/người/ngày
              </span>
            )}
          </div>
        </Field>
      </div>

      {/* Sở thích */}
      <div className="mt-6">
        <Field label="Sở thích">
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <Chip
                key={interest.id}
                active={value.interests.includes(interest.id)}
                onClick={() => toggleInterest(interest.id)}
              >
                {interest.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

      {/* Nhịp độ */}
      <div className="mt-6">
        <Field label="Nhịp độ">
          <div className="grid grid-cols-3 gap-2">
            {PACES.map((pace) => {
              const active = value.pace === pace.id;
              return (
                <button
                  key={pace.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set("pace", pace.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-brand-500 bg-brand-50 ring-4 ring-brand-100"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${active ? "text-brand-700" : "text-stone-800"}`}
                  >
                    {pace.label}
                  </div>
                  <div className="mt-0.5 text-xs text-stone-500">{pace.hint}</div>
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      {/* Ghi chú */}
      <div className="mt-6">
        <Field
          label="Ghi chú thêm"
          optional
          htmlFor="notes"
          icon={<NotebookPen className="size-4" />}
        >
          <textarea
            id="notes"
            rows={3}
            className="field resize-none"
            placeholder="Ví dụ: đi cùng trẻ nhỏ, ăn chay, muốn ở homestay view đồi, tránh leo núi…"
            value={value.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={500}
          />
        </Field>
      </div>

      {shownError && (
        <div
          role="alert"
          className="mt-6 flex gap-3 rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-accent-600"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{shownError}</span>
        </div>
      )}

      <button
        type="submit"
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none active:scale-[0.99]"
      >
        <Sparkles className="size-5" />
        Lên lịch trình
      </button>
      <p className="mt-3 text-center text-xs text-stone-500">
        Thường mất 1–3 phút, tùy số ngày.
      </p>

      <div className="mt-6 border-t border-sand-100 pt-6">
        <button
          type="button"
          onClick={onDemo}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sand-200 bg-sand-50 px-6 py-3 font-semibold text-stone-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
        >
          <Eye className="size-5" />
          Xem thử lịch trình mẫu
        </button>
        <p className="mt-2 text-center text-xs text-stone-500">
          Lịch trình Đà Lạt 3 ngày viết sẵn, không cần API key.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  icon,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  icon?: ReactNode;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-stone-700"
      >
        {icon && <span className="text-brand-600">{icon}</span>}
        {label}
        {optional && <span className="font-normal text-stone-400">(không bắt buộc)</span>}
      </label>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({
  value,
  min,
  max,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const button =
    "grid size-11 place-items-center rounded-lg text-stone-600 transition hover:bg-sand-100 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        className={button}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Giảm số ${unit}`}
      >
        <Minus className="size-4" />
      </button>
      <span className="text-lg font-semibold text-stone-900">
        {value} <span className="text-sm font-normal text-stone-500">{unit}</span>
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Tăng số ${unit}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
