import type { Product } from '@/types/entities';
import type { ProductListQueryParams } from '@/types/product-filters';
import { getProductBrandName, getProductCategoryName } from '@/utils/product-labels';

export type ProductSortOption = 'featured' | 'price_asc' | 'price_desc';

export interface ProductFilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  priceRange: [number, number];
  selectedFrameStyle: string;
  selectedFrameColor: string;
  selectedShape: string;
  selectedMaterial: string;
  selectedFrameWidth: string;
}

export function buildProductListQueryParams(
  state: ProductFilterState,
  debouncedSearch: string,
  maxPriceCap: number,
): ProductListQueryParams {
  const [minPriceValue, maxPriceValue] = state.priceRange;
  return {
    search: debouncedSearch.trim() || undefined,
    category: state.selectedCategory || undefined,
    brand: state.selectedBrand || undefined,
    frameStyle: state.selectedFrameStyle || undefined,
    frameColor: state.selectedFrameColor || undefined,
    shape: state.selectedShape || undefined,
    material: state.selectedMaterial || undefined,
    frameWidth: state.selectedFrameWidth || undefined,
    minPrice: minPriceValue > 0 ? minPriceValue : undefined,
    maxPrice: maxPriceValue < maxPriceCap ? maxPriceValue : undefined,
  };
}

export function createDefaultProductFilterState(maxPriceCap: number): ProductFilterState {
  return {
    searchQuery: '',
    selectedCategory: '',
    selectedBrand: '',
    priceRange: [0, maxPriceCap],
    selectedFrameStyle: '',
    selectedFrameColor: '',
    selectedShape: '',
    selectedMaterial: '',
    selectedFrameWidth: '',
  };
}

/** Handles API JSON where `price` may be a string or number. */
export function parseProductPrice(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const parsed = parseFloat(raw.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }
  const coerced = Number(raw);
  return Number.isFinite(coerced) ? coerced : Number.NaN;
}

export function computeMaxPrice(products: Product[]): number {
  if (!products.length) return 10000;
  const prices = products
    .map((p) => parseProductPrice(p.price))
    .filter((n) => Number.isFinite(n));
  if (!prices.length) return 10000;
  const max = Math.max(...prices, 0);
  return Math.max(100, Math.ceil(max));
}

export function filterProductsByState(products: Product[], state: ProductFilterState): Product[] {
  let filtered = [...products];

  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        getProductBrandName(p.brand)?.toLowerCase().includes(query) ||
        getProductCategoryName(p.category)?.toLowerCase().includes(query) ||
        p.frameStyle?.toLowerCase().includes(query) ||
        p.frameColor?.toLowerCase().includes(query) ||
        p.shape?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.material?.toLowerCase().includes(query) ||
        (p.frameWidth && String(p.frameWidth).toLowerCase().includes(query)),
    );
  }

  if (state.selectedCategory) {
    filtered = filtered.filter(
      (p) => getProductCategoryName(p.category) === state.selectedCategory,
    );
  }

  if (state.selectedBrand) {
    filtered = filtered.filter((p) => getProductBrandName(p.brand) === state.selectedBrand);
  }

  if (state.selectedFrameStyle) {
    filtered = filtered.filter((p) => (p.frameStyle?.trim() ?? '') === state.selectedFrameStyle);
  }

  if (state.selectedFrameColor) {
    filtered = filtered.filter((p) => (p.frameColor?.trim() ?? '') === state.selectedFrameColor);
  }

  if (state.selectedShape) {
    filtered = filtered.filter((p) => (p.shape?.trim() ?? '') === state.selectedShape);
  }

  if (state.selectedMaterial) {
    filtered = filtered.filter((p) => (p.material?.trim() ?? '') === state.selectedMaterial);
  }

  if (state.selectedFrameWidth) {
    filtered = filtered.filter(
      (p) => String(p.frameWidth ?? '') === state.selectedFrameWidth,
    );
  }

  const [minP, maxP] = state.priceRange;
  filtered = filtered.filter((p) => {
    const price = parseProductPrice(p.price);
    if (!Number.isFinite(price)) {
      return true;
    }
    return price >= minP && price <= maxP;
  });

  return filtered;
}
