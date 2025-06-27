import { IconType } from "@/enums/icon-type.enum";
import { Category } from "./category";

export interface CategoryType {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  icon?: string;
  iconType: IconType;
  iconSize: number;
  className: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}