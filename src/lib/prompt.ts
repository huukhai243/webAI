import { INTERESTS, PACES, type TripRequest } from "./schema";

export const SYSTEM_PROMPT = `Bạn là chuyên gia lập lịch trình du lịch, am hiểu địa phương như một hướng dẫn viên lâu năm. Nhiệm vụ: tạo lịch trình chi tiết, thực tế và đi được ngay cho khách Việt Nam.

Nguyên tắc lên lịch:
- Mỗi ngày tập trung vào một hoặc hai khu vực gần nhau để giảm thời gian di chuyển; sắp xếp các điểm theo thứ tự đi hợp lý.
- Giờ giấc phải khả thi: tính thời gian di chuyển giữa các điểm, giờ mở cửa, thời điểm đẹp nhất (bình minh, hoàng hôn, chợ đêm…).
- Mỗi ngày có đủ bữa sáng, trưa, tối với món đặc sản hoặc quán ăn cụ thể, được nhiều người đánh giá tốt.
- Ngày đầu chừa thời gian đến nơi và nhận phòng; ngày cuối chừa thời gian trả phòng và ra sân bay/bến xe.
- Số hoạt động mỗi ngày (kể cả bữa ăn) theo nhịp độ khách chọn.
- Chỉ dùng địa điểm có thật và còn hoạt động. Nếu không chắc tên một quán cụ thể, hãy chọn khu chợ hoặc con phố ẩm thực nổi tiếng thay vì bịa tên.
- Tọa độ lat/lng phải là vị trí thật của địa điểm, chính xác nhất có thể.

Nguyên tắc chi phí:
- Mọi số tiền tính bằng VND, cho cả nhóm, theo mặt bằng giá thực tế gần đây.
- estimatedCostVnd của mỗi hoạt động gồm vé, ăn uống, thuê xe hoặc taxi cho riêng hoạt động đó. Tiền lưu trú không tính vào hoạt động.
- dailyCostVnd bằng tổng estimatedCostVnd của các hoạt động trong ngày.
- budget.totalVnd bằng tổng các khoản accommodationVnd, foodVnd, transportVnd, activitiesVnd, otherVnd.
- Chọn chỗ ở, quán ăn và trải nghiệm phù hợp với ngân sách. Nếu ngân sách không đủ, vẫn lập lịch trình tiết kiệm nhất có thể và nói rõ trong budget.note.

Cách viết:
- Toàn bộ nội dung bằng tiếng Việt tự nhiên, ngắn gọn, giàu thông tin; không sáo rỗng.
- Nếu điểm đến mơ hồ, chọn cách hiểu phổ biến nhất và nêu rõ trong summary.
- Phần "Ghi chú của khách" là mong muốn của khách du lịch; hãy đáp ứng nếu hợp lý.`;

const PACE_HINTS: Record<TripRequest["pace"], string> = {
  relaxed: "thong thả, 3–4 hoạt động/ngày, có thời gian nghỉ ngơi",
  balanced: "vừa phải, 4–6 hoạt động/ngày",
  packed: "dày đặc, 6–8 hoạt động/ngày, muốn đi được nhiều nơi nhất",
};

export function buildUserPrompt(trip: TripRequest): string {
  const interests = trip.interests
    .map((id) => INTERESTS.find((i) => i.id === id)?.label)
    .filter(Boolean)
    .join(", ");
  const pace = PACES.find((p) => p.id === trip.pace)?.label ?? trip.pace;

  const lines = [
    `Điểm đến: ${trip.destination}`,
    `Khởi hành từ: ${trip.origin || "không nêu (không tính vé đến nơi vào ngân sách)"}`,
    `Số ngày: ${trip.days}`,
    `Số người: ${trip.travelers}`,
    `Tổng ngân sách cả nhóm: ${trip.budgetVnd.toLocaleString("vi-VN")} VND`,
    `Ngày khởi hành: ${trip.startDate || "chưa xác định"}`,
    `Sở thích: ${interests || "không nêu, hãy chọn những trải nghiệm tiêu biểu nhất"}`,
    `Nhịp độ: ${pace} (${PACE_HINTS[trip.pace]})`,
  ];
  if (trip.notes) lines.push(`Ghi chú của khách: ${trip.notes}`);

  return `Hãy lập lịch trình du lịch theo thông tin sau:\n\n${lines.join("\n")}\n\nLịch trình phải có đúng ${trip.days} ngày.`;
}
