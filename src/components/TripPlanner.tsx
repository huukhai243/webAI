"use client";

import { useRef, useState } from "react";
import { Backpack } from "lucide-react";
import { requestItinerary } from "@/lib/api-client";
import { DEMO_PLAN, playDemoProgress } from "@/lib/demo-plan";
import { newPlanId, savePlan, type SavedPlan } from "@/lib/saved-plans";
import type { PlanProgress, TripRequest } from "@/lib/schema";
import PlanForm, { DEFAULT_TRIP } from "./PlanForm";
import PlanningProgress from "./PlanningProgress";
import ItineraryView from "./ItineraryView";
import SavedPlans from "./SavedPlans";

type View =
  | { kind: "form" }
  | { kind: "loading"; trip: TripRequest; startedAt: number; progress: PlanProgress; demo: boolean }
  | { kind: "result"; plan: SavedPlan; demo: boolean };

type LoadPlan = (
  signal: AbortSignal,
  onProgress: (update: Partial<PlanProgress>) => void,
) => Promise<SavedPlan>;

export default function TripPlanner() {
  const [trip, setTrip] = useState<TripRequest>(DEFAULT_TRIP);
  const [view, setView] = useState<View>({ kind: "form" });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run(request: TripRequest, demo: boolean, load: LoadPlan) {
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setView({
      kind: "loading",
      trip: request,
      startedAt: Date.now(),
      progress: { phase: "thinking", day: 0, place: "" },
      demo,
    });
    window.scrollTo({ top: 0 });

    const onProgress = (update: Partial<PlanProgress>) =>
      setView((current) =>
        current.kind === "loading"
          ? { ...current, progress: { ...current.progress, ...update } }
          : current,
      );

    try {
      const plan = await load(controller.signal, onProgress);
      if (controller.signal.aborted) return;
      // Lịch trình mẫu không lưu vào danh sách đã lưu.
      if (!demo) savePlan(plan);
      setView({ kind: "result", plan, demo });
      window.scrollTo({ top: 0 });
    } catch (err) {
      // Người dùng đã bấm Hủy: goHome() đã đưa về form, không báo lỗi.
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Bạn thử lại nhé.");
      setView({ kind: "form" });
    }
  }

  function handleSubmit(request: TripRequest) {
    void run(request, false, async (signal, onProgress) => {
      const itinerary = await requestItinerary(request, signal, (event) => {
        if (event.type === "status") onProgress({ phase: event.phase });
        else if (event.type === "progress") onProgress({ day: event.day, place: event.place });
      });
      return { id: newPlanId(), savedAt: Date.now(), request, itinerary };
    });
  }

  function handleDemo() {
    void run(DEMO_PLAN.request, true, async (signal, onProgress) => {
      await playDemoProgress(signal, onProgress);
      return DEMO_PLAN;
    });
  }

  function goHome() {
    abortRef.current?.abort();
    setView({ kind: "form" });
  }

  function openPlan(plan: SavedPlan) {
    setTrip(plan.request);
    setView({ kind: "result", plan, demo: false });
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-sand-200/80 bg-sand-50/90 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <button type="button" onClick={goHome} className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Backpack className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-stone-900">
              Balo <span className="text-brand-600">AI</span>
            </span>
          </button>
          <span className="ml-auto hidden text-sm text-stone-500 sm:block">
            Lịch trình du lịch trong vài phút
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {view.kind === "form" && (
          <>
            <section className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
                Đi đâu cũng có <span className="text-brand-600">lịch trình</span>.
              </h1>
              <p className="mt-4 text-base text-stone-600 sm:text-lg">
                Nhập điểm đến, ngân sách và sở thích. AI sẽ lên lịch trình từng ngày, kèm bản đồ,
                quán ăn và dự toán chi phí.
              </p>
            </section>
            <PlanForm
              value={trip}
              onChange={setTrip}
              onSubmit={handleSubmit}
              onDemo={handleDemo}
              error={error}
            />
            <SavedPlans onOpen={openPlan} />
          </>
        )}

        {view.kind === "loading" && (
          <PlanningProgress
            trip={view.trip}
            startedAt={view.startedAt}
            progress={view.progress}
            demo={view.demo}
            onCancel={goHome}
          />
        )}

        {view.kind === "result" && (
          <ItineraryView plan={view.plan} demo={view.demo} onBack={goHome} />
        )}
      </main>

      <footer className="border-t border-sand-200/80 py-6 text-center text-xs text-stone-500 print:hidden">
        Lịch trình do AI (Claude) tạo, giá và giờ mở cửa chỉ là ước tính. Hãy kiểm tra lại trước khi đi.
      </footer>
    </div>
  );
}
