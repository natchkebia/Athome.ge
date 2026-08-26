export type ConfiguratorCategoryKey =
  | "processor"
  | "motherboard"
  | "ram"
  | "gpu"
  | "psu"
  | "cooler"
  | "liquidCooler"
  | "case"
  | "drive"
  | "storage"
  | "storageDrive"
  | "caseFan"
  | "os"
  | "monitor"
  | "headphones"
  | "keyboard"
  | "mouse"
  | "microphone"
  | "speaker"
  | `backend:${string}`;

export type ConfiguratorCategory = {
  key: ConfiguratorCategoryKey;
  title: string;
  icon: string;
  isRecommended?: boolean;
  productCount?: number;
};

export type ConfiguratorProduct = {
  id: number;
  category: ConfiguratorCategoryKey;
  title: string;
  image: string;
  price: number;
  stock: number;
  stockStatus?: string;
  hasOwnStock?: boolean;
  brandName?: string;
  brandSlug?: string;
  compatibilityStatus?: "compatible" | "unknown" | "unchecked";
  priceDelta?: number;
  configuredPrice?: number;
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
