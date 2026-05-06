'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useGetProductsQuery, useGetProductFiltersQuery } from '@/store/api/productsApi';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { FilterIcon, ArrowLeftIcon } from '@/components/icons/CommerceIcons';
import { useIsLargeScreen } from '@/hooks/use-is-large-screen';
import {
  createDefaultProductFilterState,
  buildProductListQueryParams,
  parseProductPrice,
  type ProductFilterState,
  type ProductSortOption,
} from '@/features/products/utils/product-filter-logic';
import type { Product } from '@/types/entities';
import { getProductCategoryName } from '@/utils/product-labels';

function sortProducts(products: Product[], sort: ProductSortOption): Product[] {
  const copy = [...products];
  if (sort === 'price_asc') {
    copy.sort((a, b) => parseProductPrice(a.price) - parseProductPrice(b.price));
  } else if (sort === 'price_desc') {
    copy.sort((a, b) => parseProductPrice(b.price) - parseProductPrice(a.price));
  }
  return copy;
}

export default function ProductsPage() {
  const isLargeScreen = useIsLargeScreen();
  const { data: filterMeta, isLoading: filterMetaLoading } = useGetProductFiltersQuery();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [sortOption, setSortOption] = useState<ProductSortOption>('featured');

  const maxPriceCap = useMemo(() => {
    if (!filterMeta) {
      return 10000;
    }
    return Math.max(100, Math.ceil(filterMeta.priceRange.max));
  }, [filterMeta]);

  const [filters, setFilters] = useState<ProductFilterState>(() =>
    createDefaultProductFilterState(10000),
  );

  const didInitFiltersFromMetaRef = useRef(false);

  useEffect(() => {
    if (!filterMeta || didInitFiltersFromMetaRef.current) {
      return;
    }
    didInitFiltersFromMetaRef.current = true;
    const cap = Math.max(100, Math.ceil(filterMeta.priceRange.max));
    const urlSearch =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('search') ?? ''
        : '';
    setFilters({
      ...createDefaultProductFilterState(cap),
      ...(urlSearch ? { searchQuery: urlSearch } : {}),
    });
  }, [filterMeta]);

  useEffect(() => {
    setFilters((previous) => {
      const high = Math.min(previous.priceRange[1], maxPriceCap);
      const low = Math.min(previous.priceRange[0], high);
      if (low === previous.priceRange[0] && high === previous.priceRange[1]) {
        return previous;
      }
      return { ...previous, priceRange: [low, high] };
    });
  }, [maxPriceCap]);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(filters.searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [filters.searchQuery]);

  const listQuery = useMemo(
    () => buildProductListQueryParams(filters, debouncedSearch, maxPriceCap),
    [filters, debouncedSearch, maxPriceCap],
  );

  const {
    currentData: productsForCurrentFilters,
    isFetching: productsFetching,
    isUninitialized: productsQueryUninitialized,
    isError: productsQueryError,
    error: productsError,
  } = useGetProductsQuery(listQuery, { refetchOnMountOrArgChange: true });

  const products = useMemo(
    () => productsForCurrentFilters ?? [],
    [productsForCurrentFilters],
  );
  const productsExcludingLenses = useMemo(() => {
    return products.filter((product) => {
      const categoryName = getProductCategoryName(product.category) ?? '';
      return categoryName.toLowerCase() !== 'contact lenses';
    });
  }, [products]);
  const productsListPending =
    !productsQueryError &&
    productsForCurrentFilters === undefined &&
    (productsFetching || productsQueryUninitialized);

  const isLoading = filterMetaLoading || productsListPending;

  const sortedProducts = useMemo(
    () => sortProducts(productsExcludingLenses, sortOption),
    [productsExcludingLenses, sortOption],
  );

  const hasProducts = productsExcludingLenses.length > 0;
  const filterReturnedEmpty =
    !isLoading && !hasProducts && filterMeta !== undefined && !productsQueryError;

  useEffect(() => {
    if (isLargeScreen) {
      setMobileFiltersOpen(false);
    }
  }, [isLargeScreen]);

  const showDesktopSidebar = isLargeScreen && filterMeta && !desktopSidebarCollapsed;
  const filtersSidebarProps =
    filterMeta !== undefined
      ? {
          products,
          filterMetadata: filterMeta,
          value: filters,
          onChange: setFilters,
          maxPrice: maxPriceCap,
        }
      : null;

  const handleToggleSidebarVisibility = (): void => {
    if (isLargeScreen) {
      setDesktopSidebarCollapsed((previous) => !previous);
    } else {
      setMobileFiltersOpen((previous) => !previous);
    }
  };

  const sidebarVisible = showDesktopSidebar || mobileFiltersOpen;
  const hideFiltersLabel = sidebarVisible ? 'Hide filters' : 'Show filters';

  return (
    <div className="min-h-screen bg-neutral-50">
      {mobileFiltersOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
          aria-label="Close filters overlay"
        />
      ) : null}

      <div className="mx-auto flex max-w-[1600px]">
        {showDesktopSidebar && filtersSidebarProps ? (
          <aside className="sticky top-0 hidden h-[calc(100vh-0px)] w-[280px] shrink-0 overflow-y-auto border-r border-neutral-200 bg-white px-5 py-8 lg:block">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Filters
            </h2>
            <ProductFilters {...filtersSidebarProps} />
          </aside>
        ) : null}

        {mobileFiltersOpen && filtersSidebarProps ? (
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw,20rem)] flex-col border-r border-neutral-200 bg-white shadow-2xl lg:hidden">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-neutral-900"
              >
                <ArrowLeftIcon className="h-5 w-5" aria-hidden />
                Hide filters
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <ProductFilters {...filtersSidebarProps} />
            </div>
          </aside>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {filterMeta ? (
                <button
                  type="button"
                  onClick={handleToggleSidebarVisibility}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 transition hover:text-neutral-600"
                >
                  <FilterIcon className="h-5 w-5 shrink-0" aria-hidden />
                  {hideFiltersLabel}
                </button>
              ) : null}
              <span className="text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900">{sortedProducts.length}</span>{' '}
                frames
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <label className="sr-only" htmlFor="product-search">
                Search frames
              </label>
              <input
                id="product-search"
                type="search"
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters((previous) => ({ ...previous, searchQuery: e.target.value }))
                }
                placeholder="Search frames…"
                className="w-full min-w-[12rem] rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 sm:w-56"
              />

              <label className="sr-only" htmlFor="product-sort">
                Sort frames
              </label>
              <select
                id="product-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as ProductSortOption)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
              </select>
            </div>
          </div>

          <ProductGrid
            products={sortedProducts}
            isLoading={isLoading}
            error={productsQueryError ? productsError : undefined}
            emptyTitle={filterReturnedEmpty ? 'No products match your filters' : undefined}
            emptyDescription={
              filterReturnedEmpty ? 'Try adjusting or clearing filters.' : undefined
            }
          />
        </main>
      </div>

    </div>
  );
}
