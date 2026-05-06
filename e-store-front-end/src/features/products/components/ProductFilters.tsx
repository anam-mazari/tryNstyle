'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@/types/entities';
import type { ProductFiltersMetadata } from '@/types/product-filters';
import { getProductBrandName, getProductCategoryName } from '@/utils/product-labels';
import { getFrameColorCss } from '@/utils/frame-color-display';
import { getFrameWidthLabel, isFrameWidthValue } from '@/types/frame-width';
import type { ProductFilterState } from '@/features/products/utils/product-filter-logic';
import { createDefaultProductFilterState } from '@/features/products/utils/product-filter-logic';
import { ChevronDownIcon } from '@/components/icons/CommerceIcons';

interface ProductFiltersProps {
  products: Product[];
  filterMetadata?: ProductFiltersMetadata;
  value: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  maxPrice: number;
}

function uniqueDetailValues(
  products: Product[],
  pick: (p: Product) => string | null,
): string[] {
  const set = new Set<string>();
  for (const p of products) {
    const v = pick(p);
    if (v && v.trim()) {
      set.add(v.trim());
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

interface FilterAccordionSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  openId: string | null;
  onToggle: (id: string) => void;
}

function FilterAccordionSection({
  id,
  title,
  children,
  openId,
  onToggle,
}: FilterAccordionSectionProps) {
  const open = openId === id;

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-neutral-900 transition hover:text-neutral-600"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? <div className="pb-4 pt-0">{children}</div> : null}
    </div>
  );
}

export function ProductFilters({
  products,
  filterMetadata,
  value,
  onChange,
  maxPrice,
}: ProductFiltersProps) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const toggleSection = (id: string): void => {
    setOpenSectionId((previous) => (previous === id ? null : id));
  };

  const categories = useMemo(() => {
    if (filterMetadata) {
      return filterMetadata.categories.map((c) => c.name).sort((a, b) => a.localeCompare(b));
    }
    return Array.from(
      new Set(
        products
          .map((p) => getProductCategoryName(p.category))
          .filter((cat): cat is string => Boolean(cat)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [filterMetadata, products]);

  const brands = useMemo(() => {
    if (filterMetadata) {
      return filterMetadata.brands.map((b) => b.name).sort((a, b) => a.localeCompare(b));
    }
    return Array.from(
      new Set(
        products
          .map((p) => getProductBrandName(p.brand))
          .filter((brand): brand is string => Boolean(brand)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [filterMetadata, products]);

  const frameStyles = useMemo(() => {
    if (filterMetadata) {
      return [...filterMetadata.frameStyles].sort((a, b) => a.localeCompare(b));
    }
    return uniqueDetailValues(products, (p) => p.frameStyle);
  }, [filterMetadata, products]);

  const frameColors = useMemo(() => {
    if (filterMetadata) {
      return [...filterMetadata.frameColors].sort((a, b) => a.localeCompare(b));
    }
    return uniqueDetailValues(products, (p) => p.frameColor);
  }, [filterMetadata, products]);

  const shapes = useMemo(() => {
    if (filterMetadata) {
      return [...filterMetadata.shapes].sort((a, b) => a.localeCompare(b));
    }
    return uniqueDetailValues(products, (p) => p.shape);
  }, [filterMetadata, products]);

  const materials = useMemo(() => {
    if (filterMetadata) {
      return [...filterMetadata.materials].sort((a, b) => a.localeCompare(b));
    }
    return uniqueDetailValues(products, (p) => p.material);
  }, [filterMetadata, products]);

  const frameWidths = useMemo(() => {
    if (filterMetadata) {
      return [...filterMetadata.frameWidths].sort((a, b) => a.localeCompare(b));
    }
    return uniqueDetailValues(products, (p) => p.frameWidth);
  }, [filterMetadata, products]);

  const patch = (partial: Partial<ProductFilterState>): void => {
    onChange({ ...value, ...partial });
  };

  const clearFilters = (): void => {
    onChange(createDefaultProductFilterState(maxPrice));
  };

  const selectClass =
    'block w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900';

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-0 overflow-y-auto pr-1">
        {shapes.length > 0 && (
          <FilterAccordionSection
            id="shape"
            title="Shape"
            openId={openSectionId}
            onToggle={toggleSection}
          >
            <select
              value={value.selectedShape}
              onChange={(e) => patch({ selectedShape: e.target.value })}
              className={selectClass}
              aria-label="Filter by shape"
            >
              <option value="">All shapes</option>
              {shapes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </FilterAccordionSection>
        )}

        {frameColors.length > 0 && (
          <FilterAccordionSection
            id="color"
            title="Color"
            openId={openSectionId}
            onToggle={toggleSection}
          >
            <div className="flex flex-wrap gap-2">
              {frameColors.map((colorName) => {
                const selected = value.selectedFrameColor === colorName;
                return (
                  <button
                    key={colorName}
                    type="button"
                    title={colorName}
                    onClick={() =>
                      patch({
                        selectedFrameColor: selected ? '' : colorName,
                      })
                    }
                    className={`h-9 w-9 rounded-full border-2 shadow-inner transition focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 ${
                      selected ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2' : 'border-neutral-200'
                    }`}
                    style={{ backgroundColor: getFrameColorCss(colorName) }}
                    aria-pressed={selected}
                  />
                );
              })}
            </div>
            {value.selectedFrameColor ? (
              <p className="mt-2 text-xs text-neutral-500">{value.selectedFrameColor}</p>
            ) : null}
          </FilterAccordionSection>
        )}

        {categories.length > 0 && (
          <FilterAccordionSection
            id="category"
            title="Category"
            openId={openSectionId}
            onToggle={toggleSection}
          >
            <select
              value={value.selectedCategory}
              onChange={(e) => patch({ selectedCategory: e.target.value })}
              className={selectClass}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </FilterAccordionSection>
        )}

        {brands.length > 0 && (
          <FilterAccordionSection
            id="brand"
            title="Brand"
            openId={openSectionId}
            onToggle={toggleSection}
          >
            <select
              value={value.selectedBrand}
              onChange={(e) => patch({ selectedBrand: e.target.value })}
              className={selectClass}
              aria-label="Filter by brand"
            >
              <option value="">All brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </FilterAccordionSection>
        )}

        {frameWidths.length > 0 && (
          <FilterAccordionSection
            id="frame-width"
            title="Frame width"
            openId={openSectionId}
            onToggle={toggleSection}
          >
            <select
              value={value.selectedFrameWidth}
              onChange={(e) => patch({ selectedFrameWidth: e.target.value })}
              className={selectClass}
              aria-label="Filter by frame width"
            >
              <option value="">Any width</option>
              {frameWidths.map((v) => (
                <option key={v} value={v}>
                  {isFrameWidthValue(v) ? getFrameWidthLabel(v) : v}
                </option>
              ))}
            </select>
          </FilterAccordionSection>
        )}

        <FilterAccordionSection
          id="price"
          title="Frame price"
          openId={openSectionId}
          onToggle={toggleSection}
        >
          <label className="mb-2 block text-xs font-medium text-neutral-600">
            Up to ${Math.min(value.priceRange[1], maxPrice)}
          </label>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step={maxPrice > 500 ? 25 : 10}
            value={Math.min(value.priceRange[1], maxPrice)}
            onChange={(e) => {
              const nextMax = Number(e.target.value);
              patch({ priceRange: [value.priceRange[0], nextMax] });
            }}
            className="w-full accent-neutral-900"
            aria-label="Maximum price"
          />
          <p className="mt-1 text-xs text-neutral-500">
            ${value.priceRange[0]} – ${Math.min(value.priceRange[1], maxPrice)}
          </p>
        </FilterAccordionSection>

        {materials.length > 0 && (
          <FilterAccordionSection
            id="material"
            title="Material"
            openId={openSectionId}
            onToggle={toggleSection}
          >
            <select
              value={value.selectedMaterial}
              onChange={(e) => patch({ selectedMaterial: e.target.value })}
              className={selectClass}
              aria-label="Filter by material"
            >
              <option value="">Any material</option>
              {materials.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </FilterAccordionSection>
        )}

        {frameStyles.length > 0 && (
          <FilterAccordionSection
            id="frame-style"
            title="Frame style"
            openId={openSectionId}
            onToggle={toggleSection}
          >
            <select
              value={value.selectedFrameStyle}
              onChange={(e) => patch({ selectedFrameStyle: e.target.value })}
              className={selectClass}
              aria-label="Filter by frame style"
            >
              <option value="">Any style</option>
              {frameStyles.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </FilterAccordionSection>
        )}
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="mt-4 w-full rounded-md border border-neutral-300 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
      >
        Clear all filters
      </button>
    </div>
  );
}
