import { z } from "zod";

// ---------- Dữ liệu người dùng gửi lên ----------

export const INTERESTS = [
  { id: "food", label: "Ẩm thực" },
  { id: "culture", label: "Văn hóa – lịch sử" },
  { id: "nature", label: "Thiên nhiên" },
  { id: "beach", label: "Biển" },
  { id: "cafe", label: "Cà phê" },
  { id: "shopping", label: "Mua sắm" },
  { id: "photo", label: "Chụp ảnh" },
  { id: "nightlife", label: "Về đêm" },
  { id: "adventure", label: "Phiêu lưu" },
  { id: "relax", label: "Nghỉ dưỡng" },
] as const;

export const PACES = [
  { id: "relaxed", label: "Thong thả", hint: "3–4 hoạt động/ngày" },
  { id: "balanced", label: "Vừa phải", hint: "4–6 hoạt động/ngày" },
  { id: "packed", label: "Dày đặc", hint: "6–8 hoạt động/ngày" },
] as const;

export const MAX_DAYS = 10;
export const MAX_TRAVELERS = 20;

type InterestId = (typeof INTERESTS)[number]["id"];
type PaceId = (typeof PACES)[number]["id"];

const interestIds = INTERESTS.map((i) => i.id) as [InterestId, ...InterestId[]];
const paceIds = PACES.map((p) => p.id) as [PaceId, ...PaceId[]];

export const TripRequestSchema = z.object({
  destination: z.string().trim().min(2, "Hãy nhập điểm đến").max(100),
  origin: z.string().trim().max(100),
  days: z.int().min(1).max(MAX_DAYS),
  travelers: z.int().min(1).max(MAX_TRAVELERS),
  budgetVnd: z.int().min(500_000, "Ngân sách tối thiểu 500.000đ").max(5_000_000_000),
  startDate: z.union([z.iso.date(), z.literal("")]),
  interests: z.array(z.enum(interestIds)).max(INTERESTS.length),
  pace: z.enum(paceIds),
  notes: z.string().trim().max(500),
});

export type TripRequest = z.infer<typeof TripRequestSchema>;

// ---------- Lịch trình Claude trả về (structured output) ----------

export const ACTIVITY_CATEGORIES = [
  "food",
  "cafe",
  "sightseeing",
  "culture",
  "nature",
  "beach",
  "shopping",
  "nightlife",
  "adventure",
  "relax",
  "transport",
  "checkin",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

const vnd = (what: string) => z.int().describe(`${what}, đơn vị VND, cho cả nhóm`);

export const ActivitySchema = z.object({
  time: z.string().describe("Giờ bắt đầu, định dạng HH:MM (24h)"),
  title: z.string().describe("Tên hoạt động ngắn gọn, vd: 'Ăn sáng bánh mì Phượng'"),
  category: z.enum(ACTIVITY_CATEGORIES),
  placeName: z.string().describe("Tên địa điểm có thật, đúng như trên Google Maps"),
  address: z.string().describe("Địa chỉ hoặc khu vực của địa điểm"),
  lat: z.number().describe("Vĩ độ của địa điểm"),
  lng: z.number().describe("Kinh độ của địa điểm"),
  durationMinutes: z.int().describe("Thời lượng dự kiến (phút)"),
  description: z.string().describe("1–2 câu: làm gì ở đây và vì sao đáng đi"),
  estimatedCostVnd: vnd("Chi phí ước tính của hoạt động (0 nếu miễn phí)"),
  tip: z.string().describe("Mẹo ngắn cho hoạt động này; chuỗi rỗng nếu không có"),
});

export const DaySchema = z.object({
  dayNumber: z.int().describe("Số thứ tự ngày, bắt đầu từ 1"),
  date: z.string().describe("YYYY-MM-DD nếu biết ngày khởi hành, ngược lại là chuỗi rỗng"),
  theme: z.string().describe("Chủ đề của ngày, vd: 'Phố cổ & ẩm thực đường phố'"),
  area: z.string().describe("Khu vực chính của ngày"),
  activities: z.array(ActivitySchema),
  dailyCostVnd: vnd("Tổng chi phí các hoạt động trong ngày (không gồm lưu trú)"),
});

export const ItinerarySchema = z.object({
  destination: z.string().describe("Tên điểm đến chuẩn hóa, vd: 'Đà Lạt, Lâm Đồng'"),
  country: z.string(),
  summary: z.string().describe("Tóm tắt chuyến đi trong 2–3 câu"),
  center: z
    .object({ lat: z.number(), lng: z.number() })
    .describe("Tọa độ trung tâm điểm đến"),
  days: z.array(DaySchema),
  budget: z.object({
    accommodationVnd: vnd("Tổng tiền lưu trú cả chuyến"),
    foodVnd: vnd("Tổng tiền ăn uống"),
    transportVnd: vnd("Tổng tiền di chuyển (gồm vé đến nơi nếu biết điểm khởi hành)"),
    activitiesVnd: vnd("Tổng tiền vé tham quan, trải nghiệm"),
    otherVnd: vnd("Chi phí khác, dự phòng"),
    totalVnd: vnd("Tổng chi phí ước tính"),
    verdict: z
      .enum(["comfortable", "fits", "tight", "over"])
      .describe("So với ngân sách người dùng: dư dả / vừa đủ / hơi eo hẹp / vượt ngân sách"),
    note: z.string().describe("Nhận xét ngắn về ngân sách và cách tiết kiệm hoặc nâng cấp"),
  }),
  stays: z
    .array(
      z.object({
        name: z.string(),
        area: z.string(),
        pricePerNightVnd: z.int().describe("Giá mỗi đêm cho cả nhóm, VND"),
        reason: z.string().describe("Vì sao phù hợp, 1 câu"),
      }),
    )
    .describe("2–3 gợi ý chỗ ở phù hợp ngân sách"),
  gettingAround: z.string().describe("Cách đến nơi và đi lại tại chỗ, 2–3 câu"),
  tips: z.array(z.string()).describe("4–6 lưu ý quan trọng: thời tiết, phong tục, lừa đảo, đặt trước…"),
  packing: z.array(z.string()).describe("5–8 món nên mang theo"),
});

export type Itinerary = z.infer<typeof ItinerarySchema>;
export type ItineraryDay = z.infer<typeof DaySchema>;
export type Activity = z.infer<typeof ActivitySchema>;

// ---------- Sự kiện stream từ /api/plan về trình duyệt (NDJSON) ----------

/** thinking: Claude đang suy nghĩ · writing: đang viết các ngày · finishing: đang viết chi phí, mẹo */
export type PlanPhase = "thinking" | "writing" | "finishing";

export type PlanProgress = { phase: PlanPhase; day: number; place: string };

export type PlanStreamEvent =
  | { type: "status"; phase: PlanPhase }
  | { type: "progress"; day: number; place: string }
  | { type: "result"; itinerary: Itinerary }
  | { type: "error"; message: string };
