import { Category } from "./category";
import { Guest } from "./guest";
import { OrderItem } from "./order-item";
import { Table } from "./table";
import { User } from "./user";

export interface Order {
    id: number;
    tableId: any;
    table: Table;
    orderStatus: Category;
    totalAmount: number;
    note?: string;
    userId?: number;
    guestId?: number;
    user?: User;
    guest?: Guest;
    orderItems: OrderItem[];
    createdAt: string;
    updatedAt: string;
}
