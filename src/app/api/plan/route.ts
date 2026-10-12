import Anthropic from "@anthropic-ai/sdk";
import { generateItinerary, PlanError } from "@/lib/planner";
import { TripRequestSchema, type PlanStreamEvent } from "@/lib/schema";

// Lập lịch trình nhiều ngày có thể mất 1–3 phút.
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = TripRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
    return Response.json({ error: message }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: PlanStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // Trình duyệt đã ngắt kết nối.
        }
      };

      try {
        const itinerary = await generateItinerary(parsed.data, send, request.signal);
        send({ type: "result", itinerary });
      } catch (err) {
        if (!request.signal.aborted) console.error("[api/plan]", err);
        send({ type: "error", message: toUserMessage(err) });
      } finally {
        try {
          controller.close();
        } catch {
          // Stream đã đóng.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function toUserMessage(err: unknown): string {
  if (err instanceof PlanError) return err.message;
  if (err instanceof Anthropic.AuthenticationError) {
    return "API key của Claude không hợp lệ. Kiểm tra ANTHROPIC_API_KEY trong file .env.local.";
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return "API key này không có quyền dùng model Claude được chọn.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Đang có quá nhiều yêu cầu. Đợi một lát rồi thử lại nhé.";
  }
  if (err instanceof Anthropic.BadRequestError) {
    return `Claude API từ chối yêu cầu: ${err.message}`;
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Không kết nối được tới Claude API. Kiểm tra kết nối mạng.";
  }
  if (err instanceof Anthropic.InternalServerError) {
    return "Claude đang quá tải hoặc gặp sự cố. Thử lại sau ít phút.";
  }
  if (err instanceof Anthropic.APIError) {
    return `Claude API báo lỗi (${err.status ?? "không rõ"}). Thử lại sau.`;
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return "Chưa cấu hình ANTHROPIC_API_KEY. Thêm key vào file .env.local rồi khởi động lại server.";
  }
  return "Có lỗi không mong muốn khi lập lịch trình. Bạn thử lại nhé.";
}
