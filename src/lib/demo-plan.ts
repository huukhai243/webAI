import type { SavedPlan } from "./saved-plans";
import type { Activity, PlanProgress } from "./schema";

// Lịch trình mẫu viết sẵn để xem thử giao diện khi chưa có credit Claude API.
// Không phải do AI tạo; giá và tọa độ chỉ mang tính minh họa.

const activity = (fields: Omit<Activity, "durationMinutes" | "tip"> & Partial<Activity>): Activity => ({
  durationMinutes: 90,
  tip: "",
  ...fields,
});

export const DEMO_PLAN: SavedPlan = {
  id: "demo",
  savedAt: 0,
  request: {
    destination: "Đà Lạt",
    origin: "TP. Hồ Chí Minh",
    days: 3,
    travelers: 2,
    budgetVnd: 8_000_000,
    startDate: "",
    interests: ["food", "nature", "cafe"],
    pace: "balanced",
    notes: "",
  },
  itinerary: {
    destination: "Đà Lạt, Lâm Đồng",
    country: "Việt Nam",
    summary:
      "Ba ngày khám phá Đà Lạt cho 2 người: dạo trung tâm và chợ đêm, đi cáp treo lên Thiền viện Trúc Lâm, trượt máng ở thác Datanla và săn mây ở đồi chè Cầu Đất. Lịch trình dành nhiều thời gian cho ẩm thực địa phương.",
    center: { lat: 11.9404, lng: 108.4583 },
    days: [
      {
        dayNumber: 1,
        date: "",
        theme: "Làm quen trung tâm & chợ đêm",
        area: "Hồ Xuân Hương – Chợ Đà Lạt",
        dailyCostVnd: 770_000,
        activities: [
          activity({
            time: "08:00",
            title: "Ăn sáng bánh mì xíu mại",
            category: "food",
            placeName: "Bánh mì xíu mại Hoàng Diệu",
            address: "Hoàng Diệu, Phường 5",
            lat: 11.9468,
            lng: 108.4318,
            durationMinutes: 45,
            description: "Bánh mì giòn chấm chén xíu mại nóng hổi, món sáng quen thuộc của người Đà Lạt.",
            estimatedCostVnd: 80_000,
            tip: "Quán đông từ 7h, đến sớm để có chỗ ngồi.",
          }),
          activity({
            time: "09:30",
            title: "Dạo hồ Xuân Hương & Quảng trường Lâm Viên",
            category: "nature",
            placeName: "Quảng trường Lâm Viên",
            address: "Trần Quốc Toản, Phường 1",
            lat: 11.9398,
            lng: 108.4448,
            durationMinutes: 120,
            description: "Đi bộ quanh hồ trong không khí se lạnh, chụp ảnh với nụ hoa dã quỳ và bông atiso khổng lồ ở quảng trường.",
            estimatedCostVnd: 0,
          }),
          activity({
            time: "12:00",
            title: "Ăn trưa bánh căn",
            category: "food",
            placeName: "Bánh căn Nhà Chung",
            address: "1 Nhà Chung, Phường 3",
            lat: 11.9372,
            lng: 108.4362,
            durationMinutes: 60,
            description: "Bánh căn đổ khuôn đất, ăn kèm xíu mại, trứng và nước chấm đặc trưng.",
            estimatedCostVnd: 120_000,
          }),
          activity({
            time: "14:30",
            title: "Tham quan Ga Đà Lạt",
            category: "culture",
            placeName: "Ga Đà Lạt",
            address: "1 Quang Trung, Phường 10",
            lat: 11.9419,
            lng: 108.4551,
            description: "Nhà ga kiến trúc Pháp xây từ thập niên 1930, có toa tàu cổ để chụp ảnh.",
            estimatedCostVnd: 20_000,
          }),
          activity({
            time: "18:30",
            title: "Ăn tối lẩu gà lá é",
            category: "food",
            placeName: "Lẩu gà lá é Tao Ngộ",
            address: "5 Đường 3 Tháng 4, Phường 3",
            lat: 11.933,
            lng: 108.4447,
            durationMinutes: 75,
            description: "Lẩu gà ta nấu lá é thơm cay, rất hợp với tiết trời lạnh buổi tối.",
            estimatedCostVnd: 400_000,
          }),
          activity({
            time: "20:00",
            title: "Dạo chợ đêm, ăn bánh tráng nướng",
            category: "nightlife",
            placeName: "Chợ đêm Đà Lạt",
            address: "Nguyễn Thị Minh Khai, Phường 1",
            lat: 11.9426,
            lng: 108.4378,
            description: "Thưởng thức sữa đậu nành nóng, bánh tráng nướng và mua áo len giá tốt.",
            estimatedCostVnd: 150_000,
            tip: "Hỏi giá trước khi mua hoặc ăn để tránh bị nói thách.",
          }),
        ],
      },
      {
        dayNumber: 2,
        date: "",
        theme: "Thiền viện, hồ Tuyền Lâm & thác Datanla",
        area: "Phía nam thành phố",
        dailyCostVnd: 1_520_000,
        activities: [
          activity({
            time: "07:30",
            title: "Ăn sáng bánh ướt lòng gà",
            category: "food",
            placeName: "Bánh ướt lòng gà Trang",
            address: "Tăng Bạt Hổ, Phường 1",
            lat: 11.9475,
            lng: 108.441,
            durationMinutes: 45,
            description: "Bánh ướt mỏng ăn kèm gà xé, lòng gà và nước mắm chua ngọt.",
            estimatedCostVnd: 120_000,
          }),
          activity({
            time: "08:30",
            title: "Đi cáp treo lên Thiền viện Trúc Lâm",
            category: "culture",
            placeName: "Thiền viện Trúc Lâm",
            address: "Đèo Prenn, Phường 3",
            lat: 11.902,
            lng: 108.4352,
            durationMinutes: 120,
            description: "Ngắm rừng thông từ cáp treo đồi Robin, rồi thăm thiền viện yên tĩnh nhìn xuống hồ Tuyền Lâm.",
            estimatedCostVnd: 300_000,
            tip: "Mặc trang phục kín đáo khi vào khu chánh điện.",
          }),
          activity({
            time: "10:45",
            title: "Chèo kayak hồ Tuyền Lâm",
            category: "adventure",
            placeName: "Hồ Tuyền Lâm",
            address: "Phường 3 và 4",
            lat: 11.8975,
            lng: 108.433,
            description: "Mặt hồ phẳng lặng giữa đồi thông, thích hợp chèo thuyền nhẹ nhàng trước giờ trưa.",
            estimatedCostVnd: 200_000,
          }),
          activity({
            time: "12:30",
            title: "Ăn trưa gà nướng cơm lam",
            category: "food",
            placeName: "Khu ăn uống ven hồ Tuyền Lâm",
            address: "Hồ Tuyền Lâm, Phường 4",
            lat: 11.8935,
            lng: 108.4385,
            durationMinutes: 60,
            description: "Gà nướng mật ong và cơm lam ống tre, đặc sản dễ tìm quanh hồ.",
            estimatedCostVnd: 200_000,
          }),
          activity({
            time: "14:00",
            title: "Trượt máng thác Datanla",
            category: "adventure",
            placeName: "Khu du lịch thác Datanla",
            address: "Quốc lộ 20, đèo Prenn",
            lat: 11.9015,
            lng: 108.4495,
            durationMinutes: 150,
            description: "Đi máng trượt xuyên rừng xuống chân thác, trải nghiệm vui nhất của Đà Lạt.",
            estimatedCostVnd: 500_000,
            tip: "Mang giày đế bám, đường xuống thác khá trơn.",
          }),
          activity({
            time: "18:30",
            title: "Ăn tối nem nướng",
            category: "food",
            placeName: "Nem nướng Bà Hùng",
            address: "328 Phan Đình Phùng, Phường 2",
            lat: 11.952,
            lng: 108.432,
            durationMinutes: 60,
            description: "Nem nướng cuốn bánh tráng, rau rừng và chén nước sốt sệt đặc trưng.",
            estimatedCostVnd: 200_000,
          }),
        ],
      },
      {
        dayNumber: 3,
        date: "",
        theme: "Săn mây Cầu Đất & mua đặc sản",
        area: "Cầu Đất – trung tâm",
        dailyCostVnd: 780_000,
        activities: [
          activity({
            time: "05:00",
            title: "Săn mây và uống trà ở đồi chè Cầu Đất",
            category: "nature",
            placeName: "Cầu Đất Farm",
            address: "Xuân Trường, cách trung tâm khoảng 25 km",
            lat: 11.8665,
            lng: 108.5605,
            durationMinutes: 180,
            description: "Ngắm biển mây và bình minh trên đồi chè xanh mướt, rồi uống trà nóng ngay tại nông trại.",
            estimatedCostVnd: 200_000,
            tip: "Xuất phát trước 5h, mặc áo thật ấm và chạy chậm vì đường đèo nhiều sương.",
          }),
          activity({
            time: "10:30",
            title: "Mua đặc sản ở chợ Đà Lạt",
            category: "shopping",
            placeName: "Chợ Đà Lạt",
            address: "Nguyễn Thị Minh Khai, Phường 1",
            lat: 11.9429,
            lng: 108.4374,
            description: "Mua mứt dâu, trà atiso, hồng treo gió về làm quà.",
            estimatedCostVnd: 500_000,
          }),
          activity({
            time: "12:00",
            title: "Ăn trưa bánh tráng nướng",
            category: "food",
            placeName: "Bánh tráng nướng Dì Đinh",
            address: "26 Hoàng Diệu, Phường 5",
            lat: 11.9462,
            lng: 108.4326,
            durationMinutes: 45,
            description: "Bánh tráng nướng giòn rụm với trứng, hành, khô bò, quán lâu năm của Đà Lạt.",
            estimatedCostVnd: 80_000,
          }),
          activity({
            time: "13:30",
            title: "Trả phòng, ra bến xe về TP. Hồ Chí Minh",
            category: "transport",
            placeName: "Bến xe Liên tỉnh Đà Lạt",
            address: "1 Tô Hiến Thành, Phường 3",
            lat: 11.9293,
            lng: 108.4467,
            durationMinutes: 30,
            description: "Xe giường nằm khởi hành buổi chiều, về đến nơi khoảng 22h.",
            estimatedCostVnd: 0,
            tip: "Vé xe đã tính trong chi phí di chuyển, nên đặt trước 2–3 ngày.",
          }),
        ],
      },
    ],
    budget: {
      accommodationVnd: 1_200_000,
      foodVnd: 1_500_000,
      transportVnd: 1_700_000,
      activitiesVnd: 1_200_000,
      otherVnd: 800_000,
      totalVnd: 6_400_000,
      verdict: "comfortable",
      note: "Ngân sách 8 triệu đủ dư khoảng 1,6 triệu. Có thể nâng cấp lên khách sạn view hồ hoặc giữ lại làm dự phòng.",
    },
    stays: [
      {
        name: "Homestay gần chợ Đà Lạt",
        area: "Phường 1 – Phường 2",
        pricePerNightVnd: 600_000,
        reason: "Đi bộ ra chợ đêm và hồ Xuân Hương, giá hợp với ngân sách.",
      },
      {
        name: "Khách sạn 3 sao quanh hồ Xuân Hương",
        area: "Phường 1",
        pricePerNightVnd: 900_000,
        reason: "Phòng tiện nghi hơn, có bữa sáng, thuận tiện đi lại.",
      },
    ],
    gettingAround:
      "Từ TP. Hồ Chí Minh đi xe giường nằm khoảng 7–8 tiếng, hoặc bay đến sân bay Liên Khương rồi đi xe buýt khoảng 40 phút vào trung tâm. Ở Đà Lạt nên thuê xe máy khoảng 120.000–150.000đ/ngày.",
    tips: [
      "Sáng sớm và buổi tối khá lạnh (12–18°C), luôn mang áo khoác.",
      "Cuối tuần và dịp lễ rất đông, nên đặt phòng và vé xe trước.",
      "Mùa mưa (tháng 5–10) thường mưa chiều, xếp điểm ngoài trời vào buổi sáng.",
      "Đường đèo đi Cầu Đất có sương mù, bật đèn và chạy chậm.",
    ],
    packing: [
      "Áo khoác ấm",
      "Áo mưa",
      "Giày đi bộ đế bám",
      "Kem chống nắng",
      "Sạc dự phòng",
      "Khăn quàng, mũ len",
    ],
  },
};

/** Phát lại tiến độ giả lập để xem thử màn hình chờ (khoảng 5 giây). */
export async function playDemoProgress(
  signal: AbortSignal,
  onProgress: (update: Partial<PlanProgress>) => void,
): Promise<void> {
  onProgress({ phase: "thinking", day: 0, place: "" });
  await sleep(1500, signal);
  onProgress({ phase: "writing" });
  for (const day of DEMO_PLAN.itinerary.days) {
    for (const item of day.activities) {
      onProgress({ day: day.dayNumber, place: item.title });
      await sleep(220, signal);
    }
  }
  onProgress({ phase: "finishing" });
  await sleep(900, signal);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
