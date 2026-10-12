import {
  BedDouble,
  Bus,
  Coffee,
  Landmark,
  Moon,
  Mountain,
  Camera,
  ShoppingBag,
  Sofa,
  Trees,
  TreePalm,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { ActivityCategory } from "./schema";

export const CATEGORY_META: Record<ActivityCategory, { label: string; icon: LucideIcon }> = {
  food: { label: "Ăn uống", icon: Utensils },
  cafe: { label: "Cà phê", icon: Coffee },
  sightseeing: { label: "Tham quan", icon: Camera },
  culture: { label: "Văn hóa", icon: Landmark },
  nature: { label: "Thiên nhiên", icon: Trees },
  beach: { label: "Biển", icon: TreePalm },
  shopping: { label: "Mua sắm", icon: ShoppingBag },
  nightlife: { label: "Về đêm", icon: Moon },
  adventure: { label: "Phiêu lưu", icon: Mountain },
  relax: { label: "Thư giãn", icon: Sofa },
  transport: { label: "Di chuyển", icon: Bus },
  checkin: { label: "Lưu trú", icon: BedDouble },
};

/** Mỗi ngày một màu, dùng chung cho dòng thời gian và bản đồ. */
const DAY_COLORS = [
  "#0e8a76",
  "#e8622c",
  "#6d5bd0",
  "#d23f78",
  "#2f7fd8",
  "#b98200",
  "#3c9a3f",
  "#a8512b",
  "#127c9b",
  "#8a5a9e",
];

export function dayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1 + DAY_COLORS.length) % DAY_COLORS.length];
}
