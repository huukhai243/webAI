const vndFormatter = new Intl.NumberFormat("vi-VN");

/** 1250000 → "1.250.000đ" */
export function formatVnd(amount: number): string {
  return `${vndFormatter.format(Math.round(amount))}đ`;
}

/** 1250000 → "1,25 tr" · 2500000000 → "2,5 tỷ" */
export function formatVndShort(amount: number): string {
  const short = (value: number) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: value < 10 ? 2 : 1 }).format(value);
  if (amount >= 1_000_000_000) return `${short(amount / 1_000_000_000)} tỷ`;
  if (amount >= 1_000_000) return `${short(amount / 1_000_000)} tr`;
  if (amount >= 1_000) return `${short(amount / 1_000)}k`;
  return formatVnd(amount);
}

/** Chuỗi người dùng gõ → số nguyên (bỏ mọi ký tự không phải chữ số). */
export function parseDigits(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function formatNumber(value: number): string {
  return value ? vndFormatter.format(value) : "";
}

/** "2026-10-12" → "Thứ Hai, 12/10" */
export function formatDayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return "";
  const date = new Date(y, m - 1, d);
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${d}/${m}`;
}

/** 95 → "1 giờ 35 phút" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function googleMapsUrl(placeName: string, address: string): string {
  const query = [placeName, address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
