export type CurrentOrderItemDTO = {
  menuItemId: number;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CurrentOrderDTO = {
  id: number;
  tableId: number;
  createdAt: string;
  items: CurrentOrderItemDTO[];
  totalQuantity: number;
  subtotal: number;
};
