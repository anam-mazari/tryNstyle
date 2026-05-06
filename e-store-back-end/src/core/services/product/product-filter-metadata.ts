export interface ProductFilterOptionItem {
  id: string;
  name: string;
}

export interface ProductPriceRange {
  min: number;
  max: number;
}

export interface ProductFilterMetadata {
  categories: ProductFilterOptionItem[];
  brands: ProductFilterOptionItem[];
  frameStyles: string[];
  frameColors: string[];
  shapes: string[];
  materials: string[];
  frameWidths: string[];
  priceRange: ProductPriceRange;
}
