"use client";

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { addToCart } from "@/store/slices/cartSlice";
import LensTryOn from "@/components/LensTryOn";
import type { Product } from "@/types/entities";
import toast from "react-hot-toast";

const DEMO_SWATCHES = [
  { hex: "#5DADE2", name: "Ocean Blue" },
  { hex: "#27AE60", name: "Emerald Green" },
  { hex: "#8E44AD", name: "Violet" },
  { hex: "#C0392B", name: "Ruby Red" },
  { hex: "#D4AC0D", name: "Honey" },
  { hex: "#1ABC9C", name: "Aqua" },
  { hex: "#7F8C8D", name: "Storm Grey" },
  { hex: "#2C3E50", name: "Midnight" },
  { hex: "#E67E22", name: "Amber" },
  { hex: "#EC407A", name: "Rose" },
  { hex: "#00BCD4", name: "Ice Blue" },
  { hex: "#795548", name: "Hazel Brown" },
];

interface ActiveLens {
  hex:          string;
  name:         string;
  lensImageUrl: string | null;
  product:      Product | null;
}

export default function LensesPage() {
  const dispatch = useDispatch();

  const { data: lensProducts = [], isLoading } = useGetProductsQuery({
    category: "Contact Lenses",
  });

  const [activeLens, setActiveLens] = useState<ActiveLens | null>(null);

  const hasRealProducts = lensProducts.length > 0;

  const handleColorClick = useCallback(
    (hex: string, name: string, lensImageUrl: string | null, product: Product | null) => {
      setActiveLens({ hex, name, lensImageUrl, product });
    },
    []
  );

  const handleClose = useCallback(() => { setActiveLens(null); }, []);

  const handleColorChange = useCallback(
    (hex: string, name: string) => {
      const matched = lensProducts.find((p) => p.frameColor === hex) ?? null;
      setActiveLens({
        hex,
        name,
        lensImageUrl: matched?.lensImageUrl ?? null,
        product: matched,
      });
    },
    [lensProducts]
  );

  const handleAddToCart = useCallback(
    (product: Product, e: React.MouseEvent) => {
      e.stopPropagation();
      if (product.stockQuantity === 0) { toast.error("Out of stock."); return; }
      dispatch(addToCart({ product, quantity: 1 }));
      toast.success("Added to cart!");
    },
    [dispatch]
  );

  // Build swatches including PNG URL for the color switcher inside the modal
  const allSwatches = hasRealProducts
    ? lensProducts
        .filter((p) => p.frameColor?.startsWith("#"))
        .map((p) => ({
          hex:      p.frameColor!,
          name:     p.frameStyle || p.frameColor!,
          imageUrl: p.lensImageUrl ?? null,
        }))
    : DEMO_SWATCHES.map((s) => ({ ...s, imageUrl: null }));

  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-neutral-950 text-white py-16 px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
          Virtual Try-On
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
          Contact Lenses
        </h1>
        <p className="text-neutral-400 text-base max-w-md mx-auto leading-relaxed">
          Pick a lens below, try it on live with your camera, and add it to your cart.
        </p>
      </div>

      {/* Product grid */}
      <div className="max-w-5xl mx-auto px-6 py-14">
        <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-10 text-center">
          {hasRealProducts ? "Choose a lens to try on" : "Demo colors — add real products from the admin dashboard"}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-neutral-100">
                <div className="w-20 h-20 rounded-full bg-neutral-100 animate-pulse" />
                <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse" />
                <div className="h-3 w-12 bg-neutral-100 rounded animate-pulse" />
                <div className="h-8 w-full bg-neutral-100 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>

        ) : hasRealProducts ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {lensProducts.map((product) => {
              const hex          = product.frameColor || "#888888";
              const name         = product.frameStyle || product.frameColor || "Lens";
              const price        = Number(product.price);
              const outOfStock   = product.stockQuantity === 0;
              const lensImageUrl = product.lensImageUrl ?? null;

              return (
                <div key={product.id}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all">

                  {/* Lens thumbnail — PNG if available, solid color otherwise */}
                  <button type="button"
                    onClick={() => handleColorClick(hex, name, lensImageUrl, product)}
                    className="group focus:outline-none"
                    aria-label={`Try on ${name} lenses`}>
                    <div className="w-20 h-20 rounded-full shadow-md ring-2 ring-transparent group-hover:ring-neutral-900 group-focus:ring-neutral-900 group-hover:scale-110 transition-all duration-200 overflow-hidden">
                      {lensImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={lensImageUrl} alt={name}
                          className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: hex }} />
                      )}
                    </div>
                  </button>

                  <p className="text-sm font-semibold text-neutral-800 text-center">{name}</p>
                  <p className="text-sm text-neutral-500 font-medium">
                    ${Number.isFinite(price) ? price.toFixed(2) : "—"}
                  </p>

                  <button type="button"
                    onClick={() => handleColorClick(hex, name, lensImageUrl, product)}
                    className="w-full py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition">
                    👁️ Try On
                  </button>

                  <button type="button"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={outOfStock}
                    className="w-full py-2 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    {outOfStock ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              );
            })}
          </div>

        ) : (
          // Demo colors
          <div className="grid grid-cols-3 gap-10 sm:grid-cols-4 md:grid-cols-6">
            {DEMO_SWATCHES.map((color) => (
              <button key={color.hex} type="button"
                onClick={() => handleColorClick(color.hex, color.name, null, null)}
                className="flex flex-col items-center gap-3 group focus:outline-none"
                aria-label={`Try on ${color.name} lenses`}>
                <div className="w-16 h-16 rounded-full shadow-md ring-2 ring-transparent group-hover:ring-neutral-900 group-focus:ring-neutral-900 group-hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: color.hex }} />
                <span className="text-xs font-medium text-neutral-600 text-center leading-tight group-hover:text-neutral-900 transition-colors">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl bg-neutral-50 border border-neutral-200 p-6 text-center">
          <p className="text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto">
            👁️ Click any lens to try it on live with your camera — no download needed.
            {hasRealProducts && " Add your favourite to the cart directly from this page."}
          </p>
        </div>
      </div>

      {/* LensTryOn modal */}
      {activeLens && (
        <div>
          <LensTryOn
            key={activeLens.hex}
            lensColor={activeLens.hex}
            lensColorName={activeLens.name}
            lensImageUrl={activeLens.lensImageUrl}
            productName="TryNStyle Lenses"
            autoOpen={true}
            onClose={handleClose}
            colorSwatches={allSwatches}
            onColorChange={handleColorChange}
          />

          {activeLens.product && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-neutral-200 px-5 py-3">
              {/* PNG or color dot */}
              {activeLens.lensImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeLens.lensImageUrl} alt={activeLens.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-neutral-200" />
              ) : (
                <div className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: activeLens.hex }} />
              )}
              <span className="text-sm font-semibold text-neutral-800">
                {activeLens.name} — ${Number(activeLens.product.price).toFixed(2)}
              </span>
              <button type="button"
                onClick={(e) => handleAddToCart(activeLens.product!, e)}
                disabled={activeLens.product.stockQuantity === 0}
                className="ml-2 px-4 py-1.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 disabled:opacity-50 transition">
                {activeLens.product.stockQuantity === 0 ? "Out of stock" : "Add to cart"}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
