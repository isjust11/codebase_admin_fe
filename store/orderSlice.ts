import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderItem } from '@/types/order-item';
import { Table } from '@/types/table';

interface OrderState {
  orderItems: OrderItem[];
  tableDetail: Table | null;
  orderNote: string;
}

const initialState: OrderState = {
  orderItems: [],
  tableDetail: null,
  orderNote: '',
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderItems: (state, action: PayloadAction<OrderItem[]>) => {
      state.orderItems = action.payload;
    },
    addOrderItem: (state, action: PayloadAction<OrderItem>) => {
      const existingItem = state.orderItems.find(
        (item) => item.foodItem.id === action.payload.foodItem.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.orderItems.push(action.payload);
      }
    },
    removeOrderItem: (state, action: PayloadAction<number>) => {
      state.orderItems = state.orderItems.filter(
        (item) => item.foodItem.id !== action.payload
      );
    },
    updateOrderItemQuantity: (
      state,
      action: PayloadAction<{ foodItemId: number; quantity: number }>
    ) => {
      const item = state.orderItems.find(
        (item) => item.foodItem.id === action.payload.foodItemId
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    setTableDetail: (state, action: PayloadAction<Table>) => {
      state.tableDetail = action.payload;
    },
    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },
    clearOrder: (state) => {
      state.orderItems = [];
      state.tableDetail = null;
      state.orderNote = '';
    },
  },
});

export const {
  setOrderItems,
  addOrderItem,
  removeOrderItem,
  updateOrderItemQuantity,
  setTableDetail,
  setOrderNote,
  clearOrder,
} = orderSlice.actions;

export default orderSlice.reducer; 