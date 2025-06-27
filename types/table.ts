import { Category } from "./category";

export interface Table {
  id: number;
  name: string;
  imageUrl: string;
  capacity: number;
  tableType: Category;
  tableStatus: Category;
  tableArea: Category;
  areaId?: string;
  tableStatusId?: string;
  tableTypeId?: string;
  description?: string;
  qrCodeUrl?: string;
  // Thêm các trường khác nếu cần
} 