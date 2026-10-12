# Balo AI – Lên lịch trình du lịch bằng AI

Nhập điểm đến, số ngày, số người, ngân sách và sở thích. Claude sẽ lên lịch trình từng ngày, gồm giờ giấc, quán ăn, chi phí ước tính, bản đồ lộ trình, gợi ý chỗ ở và lưu ý.

## Chạy thử

1. Cài thư viện (chỉ cần làm một lần):

   ```bash
   npm install
   ```

2. Tạo file `.env.local` từ file mẫu rồi điền API key Claude (lấy tại https://platform.claude.com/settings/keys):

   ```bash
   cp .env.example .env.local
   ```

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Chạy server phát triển rồi mở http://localhost:3000:

   ```bash
   npm run dev
   ```

Chưa có API key hoặc credit? Bấm **Xem thử lịch trình mẫu** trên trang chủ để xem toàn bộ giao diện với một lịch trình Đà Lạt viết sẵn (dữ liệu trong `src/lib/demo-plan.ts`).

## Cấu trúc

| File | Vai trò |
| --- | --- |
| `src/lib/schema.ts` | Schema Zod cho dữ liệu form và lịch trình Claude trả về |
| `src/lib/prompt.ts` | System prompt và cách ghép thông tin chuyến đi thành yêu cầu |
| `src/lib/planner.ts` | Gọi Claude (`claude-opus-5-5`) có stream và structured output, báo tiến độ |
| `src/app/api/plan/route.ts` | API `POST /api/plan`, stream tiến độ về trình duyệt dạng NDJSON |
| `src/components/TripPlanner.tsx` | Điều phối 3 màn hình: form, đang lên lịch, kết quả |
| `src/components/TripMap.tsx` | Bản đồ Leaflet + OpenStreetMap, ghim đánh số theo ngày |
| `src/lib/saved-plans.ts` | Lưu tối đa 8 lịch trình gần nhất trong localStorage |

## Lưu ý

- Mỗi lần lập lịch trình gọi Claude Opus 5.5 một lần, ước tính khoảng 0,15–0,5 USD (tùy số ngày, phần lớn là token output).
- Giá cả, giờ mở cửa và tọa độ do AI ước tính, cần kiểm tra lại trước khi đi.
- Bản đồ dùng máy chủ miễn phí của cộng đồng OpenStreetMap (tự chuyển sang tile.openstreetmap.de nếu máy chủ chính không truy cập được), chỉ phù hợp lượng truy cập nhỏ. Nếu đưa lên production với nhiều người dùng, nên đăng ký gói của một nhà cung cấp bản đồ.
