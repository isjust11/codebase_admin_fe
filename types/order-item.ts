import { FoodItem } from "./food-item";
import { Order } from "./order";

export interface OrderItem{
    id: number;

    order?: Order;
  
    foodItem: FoodItem;
  
    quantity: number;
  
    price: number;
  
    note?: string;
}