import { Category } from "./category";

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime?: number;
  foodCategory?: Category;
  statusCategory?: Category;
  unitCategory?: Category;
  unitCategoryId?: string;
  foodCategoryId?: string;
  statusCategoryId?: string;
  discountPercent?: number;
  discountStartTime?: Date;
  discountEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFoodItemDto {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime?: number;
  unitCategoryId?: string;
  foodCategoryId?: string;
  statusCategoryId?: string;
  discountPercent?: number;
  discountStartTime?: Date;
  discountEndTime?: Date;
}

export interface UpdateFoodItemDto extends Partial<CreateFoodItemDto> {} 