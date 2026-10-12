"use client";

import { CalendarDays, MapPin, Trash, Users } from "lucide-react";
import { formatVndShort } from "@/lib/format";
import { deletePlan, useSavedPlans, type SavedPlan } from "@/lib/saved-plans";

export default function SavedPlans({ onOpen }: { onOpen: (plan: SavedPlan) => void }) {
  const plans = useSavedPlans();
  if (plans.length === 0) return null;

  return (
    <section className="mx-auto mt-12 max-w-3xl">
      <h2 className="mb-4 text-lg font-bold text-stone-900">Lịch trình đã lưu</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {plans.map((plan) => (
          <li key={plan.id} className="group relative">
            <button
              type="button"
              onClick={() => onOpen(plan)}
              className="w-full rounded-2xl border border-sand-200 bg-white p-4 pr-12 text-left shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex items-center gap-2 font-semibold text-stone-900">
                <MapPin className="size-4 shrink-0 text-brand-600" />
                <span className="truncate">{plan.itinerary.destination}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {plan.itinerary.days.length} ngày
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {plan.request.travelers} người
                </span>
                <span>≈ {formatVndShort(plan.itinerary.budget.totalVnd)}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => deletePlan(plan.id)}
              aria-label={`Xóa lịch trình ${plan.itinerary.destination}`}
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-lg text-stone-400 transition hover:bg-accent-50 hover:text-accent-600"
            >
              <Trash className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
