import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import {
  ItinerarySchema,
  type Itinerary,
  type PlanStreamEvent,
  type TripRequest,
} from "./schema";

const MODEL = "claude-opus-5-5";

/** Lỗi có thông điệp an toàn để hiển thị thẳng cho người dùng. */
export class PlanError extends Error {}

// Chỉ lấy JSON schema, không lấy hàm `parse` của SDK: khi bật `fallbacks`, nếu model
// đầu tiên từ chối giữa chừng thì message có thêm một khối text dang dở trước khối
// `fallback`, và SDK sẽ ném lỗi khi parse khối đó. Ta tự parse khối text cuối cùng.
const zodFormat = betaZodOutputFormat(ItinerarySchema);
const ITINERARY_FORMAT = { type: zodFormat.type, schema: zodFormat.schema };

let client: Anthropic | undefined;

export async function generateItinerary(
  trip: TripRequest,
  emit: (event: PlanStreamEvent) => void,
  signal: AbortSignal,
): Promise<Itinerary> {
  client ??= new Anthropic();

  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: ITINERARY_FORMAT },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(trip) }],
    },
    { signal },
  );

  const progress = createProgressTracker(emit);
  for await (const event of stream) {
    if (event.type === "content_block_start") {
      if (event.content_block.type === "thinking") {
        emit({ type: "status", phase: "thinking" });
      } else if (event.content_block.type === "text") {
        progress.reset();
        emit({ type: "status", phase: "writing" });
      }
    } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      progress.push(event.delta.text);
    }
  }

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new PlanError("Claude từ chối yêu cầu này. Hãy thử điểm đến hoặc ghi chú khác.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new PlanError("Lịch trình quá dài nên bị cắt giữa chừng. Hãy giảm số ngày rồi thử lại.");
  }

  const lastText = message.content.findLast(
    (block): block is Anthropic.Beta.BetaTextBlock => block.type === "text",
  );
  const result = ItinerarySchema.safeParse(safeJsonParse(lastText?.text));
  if (!result.success) {
    console.error("[planner] Kết quả không khớp schema:", result.error);
    throw new PlanError("Claude trả về lịch trình không hợp lệ. Bạn thử lại nhé.");
  }
  return result.data;
}

function safeJsonParse(text: string | undefined): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Đọc JSON đang stream để báo tiến độ: đếm số ngày đã bắt đầu (khóa "dayNumber"),
 * lấy tên hoạt động vừa viết xong (khóa "title") và nhận biết lúc chuyển sang phần
 * ngân sách (khóa "budget" nằm ngay sau mảng days trong schema).
 */
function createProgressTracker(emit: (event: PlanStreamEvent) => void) {
  const dayKey = /"dayNumber"\s*:/g;
  const titleKey = /"title"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let text = "";
  let day = 0;
  let place = "";
  let finishing = false;

  return {
    reset() {
      text = "";
      day = 0;
      place = "";
      finishing = false;
      dayKey.lastIndex = 0;
      titleKey.lastIndex = 0;
    },
    push(chunk: string) {
      // Chỉ cần tìm "budget" ở phần đuôi mới nhận để không quét lại cả chuỗi.
      const tail = text.slice(-16) + chunk;
      text += chunk;
      if (!finishing && tail.includes('"budget"')) {
        finishing = true;
        emit({ type: "status", phase: "finishing" });
      }
      let changed = false;

      // Khi exec() không còn khớp, lastIndex tự về 0, nên lưu lại vị trí đã quét.
      let dayCursor = dayKey.lastIndex;
      while (dayKey.exec(text)) {
        day++;
        dayCursor = dayKey.lastIndex;
        changed = true;
      }
      dayKey.lastIndex = dayCursor;

      let titleCursor = titleKey.lastIndex;
      let match: RegExpExecArray | null;
      while ((match = titleKey.exec(text))) {
        place = decodeJsonString(match[1]);
        titleCursor = titleKey.lastIndex;
        changed = true;
      }
      titleKey.lastIndex = titleCursor;

      if (changed && day > 0) emit({ type: "progress", day, place });
    },
  };
}

function decodeJsonString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`);
  } catch {
    return raw;
  }
}
