import { IconType } from "@/enums/icon-type.enum";
import { CategoryType } from "./category-type";

export interface Category {
  id: string;
  name: string;
  description: string;
  nameEN?: string;
  descriptionEN?: string;
  isActive: boolean;
  icon: string;
  createBy: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
  iconType: IconType;
  iconSize: number;
  className: string;
  sortOrder: number;
  code: string;
  isDefault: boolean;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  // URL ảnh đại diện. Server lưu relative path, client tự ghép base url.
  image?: string | null;
  // Mã màu HEX (#RRGGBB hoặc #RRGGBBAA) dùng làm tone chính của card.
  color?: string | null;
}
