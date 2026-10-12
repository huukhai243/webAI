"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Backpack,
  BedDouble,
  CalendarDays,
  Check,
  Info,
  Lightbulb,
  Printer,
  Route,
  Users,
} from "lucide-react";
import { dayColor } from "@/lib/categories";
import { formatDayDate, formatVnd, formatVndShort } from "@/lib/format";
import type { SavedPlan } from "@/lib/saved-plans";
import BudgetCard, { VERDICT_META } from "./BudgetCard";
import DayTimeline from "./DayTimeline";
import type { MapFocus } from "./TripMap";

// Leaflet cần `window`, nên chỉ tải bản đồ trên trình duyệt.
const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-sand-100" />,
});

type Props = { plan: SavedPlan; demo: boolean; onBack: () => void };

export default function ItineraryView({ plan, demo, onBack }: Props) {
  const { itinerary, request } = plan;
  const [selectedDay, setSelectedDay] = useState<number | "all">(1);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const visibleDays = useMemo(
    () =>
      selectedDay === "all"
        ? itinerary.days
        : itinerary.days.filter((d) => d.dayNumber === selectedDay),
    [itinerary.days, selectedDay],
  );

  const firstDate = itinerary.days[0]?.date;
  const lastDate = itinerary.days.at(-1)?.date;
  const verdict = VERDICT_META[itinerary.budget.verdict];

  function focusActivity(day: number, index: number) {
    if (selectedDay !== "all" && selectedDay !== day) setSelectedDay(day);
    setFocus((prev) => ({ day, index, seq: (prev?.seq ?? 0) + 1 }));
    // Trên điện thoại bản đồ nằm phía trên, cuộn lên để thấy ghim.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const tabClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-stone-900 text-white" : "bg-white text-stone-600 hover:bg-sand-100"
    }`;

  return (
    <div>
      {/* Thanh công cụ */}
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-sand-100"
        >
          <ArrowLeft className="size-4" /> Lên kế hoạch mới
        </button>
        <div className="flex items-center gap-2">
          {!demo && (
            <span className="hidden items-center gap-1 text-sm text-stone-500 sm:flex">
              <Check className="size-4 text-brand-600" /> Đã lưu trên trình duyệt
            </span>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-sand-100"
          >
            <Printer className="size-4" /> In / Lưu PDF
          </button>
        </div>
      </div>

      {demo && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <p>
            <strong>Đây là lịch trình mẫu</strong> viết sẵn để xem thử giao diện, không phải do AI
            tạo theo yêu cầu của bạn. Khi tài khoản Claude API có credit, bấm{" "}
            <strong>Lên lịch trình</strong> để AI lập lịch trình thật.
          </p>
        </div>
      )}

      {/* Tổng quan chuyến đi */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-xl shadow-brand-900/20 sm:p-8 print:bg-none print:p-0 print:text-stone-900 print:shadow-none">
        <p className="text-sm font-medium text-brand-100 print:text-stone-500">{itinerary.country}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {itinerary.destination}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Badge>
            <CalendarDays className="size-4" /> {itinerary.days.length} ngày
            {firstDate && lastDate && ` · ${formatDayDate(firstDate)} – ${formatDayDate(lastDate)}`}
          </Badge>
          <Badge>
            <Users className="size-4" /> {request.travelers} người
          </Badge>
          <Badge>
            Ước tính {formatVndShort(itinerary.budget.totalVnd)} / {formatVndShort(request.budgetVnd)}
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${verdict.className}`}>
              {verdict.label}
            </span>
          </Badge>
        </div>
        <p className="mt-5 max-w-3xl leading-relaxed text-brand-50 print:text-stone-700">
          {itinerary.summary}
        </p>
      </section>

      {/* Lịch trình + bản đồ */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <aside className="lg:order-last print:hidden">
          <div className="lg:sticky lg:top-6">
            <div
              ref={mapRef}
              className="h-72 scroll-mt-4 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm sm:h-96 lg:h-[calc(100vh-7rem)] lg:max-h-[640px]"
            >
              <TripMap days={visibleDays} center={itinerary.center} focus={focus} />
            </div>
            <p className="mt-2 px-1 text-xs text-stone-500">
              Vị trí trên bản đồ do AI ước lượng. Bấm vào số thứ tự để xem trên bản đồ, bấm tên địa
              điểm để mở Google Maps.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 print:hidden">
            <button
              type="button"
              className={tabClass(selectedDay === "all")}
              onClick={() => setSelectedDay("all")}
            >
              Tất cả
            </button>
            {itinerary.days.map((day) => (
              <button
                key={day.dayNumber}
                type="button"
                className={`${tabClass(selectedDay === day.dayNumber)} flex items-center gap-2`}
                onClick={() => setSelectedDay(day.dayNumber)}
              >
                <span className="size-2 rounded-full" style={{ background: dayColor(day.dayNumber) }} />
                Ngày {day.dayNumber}
              </button>
            ))}
          </div>

          <div className="space-y-12">
            {itinerary.days.map((day) => (
              <div
                key={day.dayNumber}
                className={
                  selectedDay === "all" || selectedDay === day.dayNumber ? "" : "hidden print:block"
                }
              >
                <DayTimeline
                  day={day}
                  onFocusActivity={(index) => focusActivity(day.dayNumber, index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chi phí, chỗ ở, lưu ý */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <BudgetCard budget={itinerary.budget} userBudget={request.budgetVnd} />

        <InfoCard icon={<BedDouble className="size-5" />} title="Gợi ý chỗ ở">
          <ul className="space-y-4">
            {itinerary.stays.map((stay) => (
              <li key={stay.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-stone-900">{stay.name}</span>
                  <span className="shrink-0 text-sm font-medium text-brand-700">
                    {formatVnd(stay.pricePerNightVnd)}/đêm
                  </span>
                </div>
                <div className="text-sm text-stone-500">{stay.area}</div>
                <p className="mt-1 text-sm text-stone-600">{stay.reason}</p>
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard icon={<Lightbulb className="size-5" />} title="Lưu ý quan trọng">
          <ul className="space-y-2.5 text-sm leading-relaxed text-stone-600">
            {itinerary.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                {tip}
              </li>
            ))}
          </ul>
        </InfoCard>

        <div className="space-y-6">
          <InfoCard icon={<Route className="size-5" />} title="Đi lại">
            <p className="text-sm leading-relaxed text-stone-600">{itinerary.gettingAround}</p>
          </InfoCard>
          <InfoCard icon={<Backpack className="size-5" />} title="Nên mang theo">
            <ul className="flex flex-wrap gap-2">
              {itinerary.packing.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-sand-100 px-3 py-1 text-sm text-stone-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-medium backdrop-blur print:bg-sand-100">
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="break-inside-avoid rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900">
        <span className="text-brand-600">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
