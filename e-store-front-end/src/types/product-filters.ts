export interface ProductListQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  frameStyle?: string;
  frameColor?: string;
  shape?: string;
  material?: string;
  frameWidth?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductFilterOptionItem {
  id: string;
  name: string;
}

export interface ProductFiltersMetadata {
  categories: ProductFilterOptionItem[];
  brands: ProductFilterOptionItem[];
  frameStyles: string[];
  frameColors: string[];
  shapes: string[];
  materials: string[];
  frameWidths: string[];
  priceRange: { min: number; max: number };
}
