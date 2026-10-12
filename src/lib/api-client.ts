import type { Itinerary, PlanStreamEvent, TripRequest } from "./schema";

/**
 * Gọi /api/plan và đọc từng dòng NDJSON. Gọi `onEvent` cho mỗi sự kiện tiến độ,
 * trả về lịch trình khi xong, ném Error (thông điệp tiếng Việt) nếu thất bại.
 */
export async function requestItinerary(
  trip: TripRequest,
  signal: AbortSignal,
  onEvent: (event: PlanStreamEvent) => void,
): Promise<Itinerary> {
  const response = await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
    signal,
  });

  if (!response.ok || !response.body) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? `Máy chủ báo lỗi (${response.status}).`);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;

    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;

      const event = JSON.parse(line) as PlanStreamEvent;
      if (event.type === "result") return event.itinerary;
      if (event.type === "error") throw new Error(event.message);
      onEvent(event);
    }
  }

  throw new Error("Kết nối bị gián đoạn trước khi lịch trình hoàn tất. Bạn thử lại nhé.");
}
