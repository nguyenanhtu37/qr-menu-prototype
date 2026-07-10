export type MenuCategory = "FOOD" | "SIDE" | "DRINK";

export type TableDTO = {
  id: number;
  name: string;
};

export type MenuItemDTO = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  category: MenuCategory;
};

export const categoryLabels: Record<MenuCategory, string> = {
  FOOD: "Món ăn",
  SIDE: "Món ăn kèm",
  DRINK: "Đồ uống",
};

export const categoryOrder: MenuCategory[] = ["FOOD", "SIDE", "DRINK"];
