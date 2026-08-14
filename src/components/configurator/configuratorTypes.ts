export type ConfiguratorCategoryKey =
  | "processor"
  | "motherboard"
  | "ram"
  | "gpu"
  | "psu"
  | "cooler"
  | "case"
  | "drive"
  | "storage"
  | "caseFan"
  | "os"
  | "monitor"
  | "headphones"
  | "keyboard"
  | "mouse"
  | "microphone"
  | "speaker";

export type ConfiguratorCategory = {
  key: ConfiguratorCategoryKey;
  title: string;
  icon: string;
};

export type ConfiguratorProduct = {
  id: number;
  category: ConfiguratorCategoryKey;
  title: string;
  image: string;
  price: number;
  stock: number;
  brandName?: string;
  brandSlug?: string;
  compatibilityStatus?: "compatible" | "unknown" | "unchecked";
  specs: {
    label: string;
    value: string;
  }[];
};

export type SelectedConfiguratorProduct = ConfiguratorProduct & {
  quantity: number;
};

export type SavedConfiguration = {
  id: number;
  createdAt: string;
  products: SelectedConfiguratorProduct[];
  totalPrice: number;
  totalQuantity: number;
};
