import { IconType } from "@/enums/icon-type.enum";
import { CategoryType } from "./category-type";

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  icon: string;
  createBy: string;
  categoryType: CategoryType;
  createdAt: string;
  updatedAt: string;
  iconType: IconType;
  iconSize: number;
  className: string;
  sortOrder: number;
  code: string;
  isDefault: boolean;
} 