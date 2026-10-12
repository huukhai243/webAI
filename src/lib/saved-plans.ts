"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { ItinerarySchema, TripRequestSchema } from "./schema";

// Lịch trình chỉ lưu trong localStorage của trình duyệt này.
const STORAGE_KEY = "balo-ai:plans:v1";
const MAX_PLANS = 8;

const SavedPlanSchema = z.object({
  id: z.string(),
  savedAt: z.number(),
  request: TripRequestSchema,
  itinerary: ItinerarySchema,
});

export type SavedPlan = z.infer<typeof SavedPlanSchema>;

const EMPTY: SavedPlan[] = [];
let cache: SavedPlan[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): SavedPlan[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return EMPTY;
    // Bỏ qua bản lưu cũ không còn khớp schema hiện tại.
    return list.flatMap((item) => {
      const parsed = SavedPlanSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): SavedPlan[] {
  cache ??= readStorage();
  return cache;
}

function write(plans: SavedPlan[]) {
  cache = plans;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // Chế độ ẩn danh hoặc bộ nhớ đầy: vẫn giữ trong phiên hiện tại.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedPlans(): SavedPlan[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function savePlan(plan: SavedPlan) {
  write([plan, ...getSnapshot().filter((p) => p.id !== plan.id)].slice(0, MAX_PLANS));
}

export function deletePlan(id: string) {
  write(getSnapshot().filter((p) => p.id !== id));
}

export function newPlanId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
