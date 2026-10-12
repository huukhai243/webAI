import { Clock, ExternalLink, Lightbulb, MapPin, Wallet } from "lucide-react";
import { CATEGORY_META, dayColor } from "@/lib/categories";
import { formatDayDate, formatDuration, formatVnd, googleMapsUrl } from "@/lib/format";
import type { ItineraryDay } from "@/lib/schema";

type Props = {
  day: ItineraryDay;
  onFocusActivity: (index: number) => void;
};

export default function DayTimeline({ day, onFocusActivity }: Props) {
  const color = dayColor(day.dayNumber);
  const date = day.date ? formatDayDate(day.date) : "";

  return (
    <section className="break-inside-avoid-page">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="rounded-full px-2.5 py-0.5 text-white" style={{ background: color }}>
              Ngày {day.dayNumber}
            </span>
            {date && <span className="text-stone-500">{date}</span>}
          </div>
          <h3 className="mt-2 text-xl font-bold text-stone-900">{day.theme}</h3>
          {day.area && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-500">
              <MapPin className="size-3.5" /> {day.area}
            </p>
          )}
        </div>
        <div className="text-sm sm:text-right">
          <div className="text-stone-500">Chi phí trong ngày</div>
          <div className="font-semibold text-stone-900">{formatVnd(day.dailyCostVnd)}</div>
        </div>
      </header>

      <ol>
        {day.activities.map((activity, index) => {
          const meta = CATEGORY_META[activity.category] ?? CATEGORY_META.sightseeing;
          const Icon = meta.icon;
          const isLast = index === day.activities.length - 1;
          return (
            <li key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onFocusActivity(index)}
                  title="Xem trên bản đồ"
                  aria-label={`Xem ${activity.title} trên bản đồ`}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold text-white shadow-sm ring-4 ring-sand-50 transition hover:scale-110"
                  style={{ background: color }}
                >
                  {index + 1}
                </button>
                {!isLast && <span className="w-px flex-1 bg-sand-200" />}
              </div>

              <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-6"}`}>
                <div className="flex items-center gap-2 pt-1.5 text-xs font-semibold text-stone-500">
                  <Clock className="size-3.5" />
                  {activity.time}
                  <span className="font-normal">· {formatDuration(activity.durationMinutes)}</span>
                </div>

                <article className="mt-2 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-stone-900">{activity.title}</h4>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                      <Icon className="size-3.5" />
                      {meta.label}
                    </span>
                  </div>

                  <a
                    href={googleMapsUrl(activity.placeName, activity.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1 text-sm text-brand-700 hover:underline"
                  >
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{activity.placeName}</span>
                    <ExternalLink className="size-3 shrink-0 opacity-60 print:hidden" />
                  </a>

                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {activity.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                    <Wallet className="size-3.5 text-stone-400" />
                    {activity.estimatedCostVnd > 0 ? formatVnd(activity.estimatedCostVnd) : "Miễn phí"}
                  </div>

                  {activity.tip && (
                    <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
                      {activity.tip}
                    </p>
                  )}
                </article>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
