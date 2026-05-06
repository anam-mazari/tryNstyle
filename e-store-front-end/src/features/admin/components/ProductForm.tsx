'use client';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Product, ProductColorVariantImage } from '@/types/entities';
import type { CreateProductDto, UpdateProductDto } from '@/types/api';
import { FRAME_WIDTH_SELECT_OPTIONS, isFrameWidthValue } from '@/types/frame-width';
import { getProductBrandName, getProductCategoryName } from '@/utils/product-labels';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function isLensCategory(category: string): boolean {
  return category.trim().toLowerCase() === 'contact lenses';
}

function resolveImageSrcForPreview(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ExtraColorFormRow {
  id: string;
  color: string;
  stockQuantity: string;
  file: File | null;
  remoteUrl: string;
  previewDataUrl: string;
}

async function uploadImageFile(file: File): Promise<string | null> {
  const data = new FormData();
  data.append('file', file);
  const res = await fetch(`${API_URL}/product/upload-image`, { method: 'POST', body: data });
  if (!res.ok) return null;
  const result = (await res.json()) as { imageUrl: string };
  return result.imageUrl;
}

async function uploadGlbFile(file: File): Promise<string | null> {
  const data = new FormData();
  data.append('file', file);
  const res = await fetch(`${API_URL}/product/upload-glb`, { method: 'POST', body: data });
  if (!res.ok) return null;
  const result = (await res.json()) as { glbUrl: string };
  return result.glbUrl;
}

async function uploadLensPng(file: File): Promise<string | null> {
  const data = new FormData();
  data.append('file', file);
  const res = await fetch(`${API_URL}/product/upload-lens-png`, { method: 'POST', body: data });
  if (!res.ok) return null;
  const result = (await res.json()) as { lensImageUrl: string };
  return result.lensImageUrl;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    price: product ? product.price.toString() : '',
    stockQuantity: product ? product.stockQuantity.toString() : '1',
    frameStyle: product?.frameStyle || '',
    frameColor: product?.frameColor || '',
    shape: product?.shape || '',
    description: product?.description || '',
    material: product?.material || '',
    frameWidth: product?.frameWidth || '',
    category: getProductCategoryName(product?.category ?? null) || '',
    brand: getProductBrandName(product?.brand ?? null) || '',
    imageUrl: product?.imageUrl || '',
    glbUrl: product?.glbUrl || '',
    lensImageUrl: product?.lensImageUrl || '',
    lensColorHex: product?.frameColor?.startsWith('#') ? product.frameColor : '',
    lensColorName: product?.frameStyle || '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.imageUrl || '');
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [lensPngFile, setLensPngFile] = useState<File | null>(null);
  const [lensPngPreview, setLensPngPreview] = useState<string>(product?.lensImageUrl || '');
  const [extraColors, setExtraColors] = useState<ExtraColorFormRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const glbInputRef = useRef<HTMLInputElement>(null);
  const lensPngInputRef = useRef<HTMLInputElement>(null);

  const isLens = isLensCategory(formData.category);

  useEffect(() => {
    if (product) {
      const cat = getProductCategoryName(product.category) || '';
      setFormData({
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        frameStyle: product.frameStyle || '',
        frameColor: product.frameColor || '',
        shape: product.shape || '',
        description: product.description || '',
        material: product.material || '',
        frameWidth: product.frameWidth || '',
        category: cat,
        brand: getProductBrandName(product.brand) || '',
        imageUrl: product.imageUrl || '',
        glbUrl: product.glbUrl || '',
        lensImageUrl: product.lensImageUrl || '',
        lensColorHex: product.frameColor?.startsWith('#') ? product.frameColor : '',
        lensColorName: product.frameStyle || '',
      });
      setImagePreview(product.imageUrl || '');
      setLensPngPreview(product.lensImageUrl || '');
      const variantExtras = Array.isArray(product.colorVariantImages) ? product.colorVariantImages : [];
      setExtraColors(
        variantExtras.map((v) => ({
          id: crypto.randomUUID(),
          color: v.color,
          stockQuantity: String(v.stockQuantity ?? 0),
          file: null,
          remoteUrl: v.imageUrl,
          previewDataUrl: '',
        })),
      );
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGlbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlbFile(file);
    setUploadError(null);
  };

  const handleLensPngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLensPngFile(file);
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setLensPngPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleExtraFileChange = (rowId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setExtraColors((rows) => rows.map((row) => row.id === rowId ? { ...row, file, previewDataUrl: dataUrl } : row));
    };
    reader.readAsDataURL(file);
    setUploadError(null);
  };

  const addExtraColorRow = (): void => {
    setExtraColors((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        color: '',
        stockQuantity: '0',
        file: null,
        remoteUrl: '',
        previewDataUrl: '',
      },
    ]);
  };

  const removeExtraColorRow = (rowId: string): void => {
    setExtraColors((rows) => rows.filter((row) => row.id !== rowId));
  };

  const updateExtraColorLabel = (rowId: string, color: string): void => {
    setExtraColors((rows) => rows.map((row) => (row.id === rowId ? { ...row, color } : row)));
  };

  const updateExtraColorStock = (rowId: string, stockQuantity: string): void => {
    setExtraColors((rows) =>
      rows.map((row) => (row.id === rowId ? { ...row, stockQuantity } : row)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate extra color rows so admins don't think they're saved when they were skipped.
    for (const row of extraColors) {
      const color = row.color.trim();
      const hasImage = Boolean(row.file) || row.remoteUrl.trim().length > 0;
      if (color.length === 0 && hasImage) {
        setUploadError('Please enter a color name for each extra color image you upload.');
        return;
      }
      if (color.length > 0 && !hasImage) {
        setUploadError('Please upload an image for each extra color you add.');
        return;
      }
    }

    let finalImageUrl = formData.imageUrl;
    if (imageFile) {
      setUploading(true); setUploadError(null);
      const uploaded = await uploadImageFile(imageFile);
      setUploading(false);
      if (!uploaded) { setUploadError('Image upload failed.'); return; }
      finalImageUrl = uploaded;
    }

    let finalGlbUrl = formData.glbUrl;
    if (glbFile) {
      setUploading(true); setUploadError(null);
      const uploaded = await uploadGlbFile(glbFile);
      setUploading(false);
      if (!uploaded) { setUploadError('GLB upload failed.'); return; }
      finalGlbUrl = uploaded;
    }

    let finalLensImageUrl = formData.lensImageUrl;
    if (lensPngFile) {
      setUploading(true); setUploadError(null);
      const uploaded = await uploadLensPng(lensPngFile);
      setUploading(false);
      if (!uploaded) { setUploadError('Lens PNG upload failed.'); return; }
      finalLensImageUrl = uploaded;
    }

    const builtVariants: ProductColorVariantImage[] = [];
    for (const row of extraColors) {
      const color = row.color.trim();
      if (!color) continue;
      let imageUrl = row.remoteUrl.trim();
      if (row.file) {
        setUploading(true); setUploadError(null);
        const uploaded = await uploadImageFile(row.file);
        setUploading(false);
        if (!uploaded) { setUploadError('Extra color image upload failed.'); return; }
        imageUrl = uploaded;
      }
      if (!imageUrl) continue;
      const stockQuantity = Math.max(0, parseInt(row.stockQuantity, 10) || 0);
      builtVariants.push({ color, imageUrl, stockQuantity });
    }

    const productData: CreateProductDto | UpdateProductDto = {
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10) || 1,
    };

    if (isLens) {
      if (formData.lensColorHex.trim()) productData.frameColor = formData.lensColorHex.trim();
      if (formData.lensColorName.trim()) productData.frameStyle = formData.lensColorName.trim();
    } else {
      if (formData.frameStyle.trim()) productData.frameStyle = formData.frameStyle.trim();
      if (formData.frameColor.trim()) productData.frameColor = formData.frameColor.trim();
      if (formData.shape.trim()) productData.shape = formData.shape.trim();
      if (formData.material.trim()) productData.material = formData.material.trim();
      if (isFrameWidthValue(formData.frameWidth)) productData.frameWidth = formData.frameWidth;
    }

    if (formData.description.trim()) productData.description = formData.description.trim();
    if (formData.category.trim()) productData.category = formData.category.trim();
    if (formData.brand.trim()) productData.brand = formData.brand.trim();
    if (finalImageUrl) productData.imageUrl = finalImageUrl;
    if (finalGlbUrl) productData.glbUrl = finalGlbUrl;
    if (finalLensImageUrl) productData.lensImageUrl = finalLensImageUrl;

    if (builtVariants.length > 0) {
      productData.colorVariantImages = builtVariants;
    } else if (product) {
      productData.colorVariantImages = [];
    }

    await onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Price" type="number" step="0.01" required value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })} id="price" name="price"
        placeholder="e.g. 129.99" />

      <Input label="Stock Quantity" type="number" min="0" required value={formData.stockQuantity}
        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} id="stockQuantity" name="stockQuantity"
        placeholder="e.g. 10" />

      <Input label="Brand" type="text" value={formData.brand}
        onChange={(e) => setFormData({ ...formData, brand: e.target.value })} id="brand" name="brand"
        placeholder="e.g. Ray-Ban, TrynStyle" />

      <div>
        <Input label='Category (type "Contact Lenses" for lens products)' type="text" value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          id="category" name="category" placeholder='e.g. Sunglasses, Eyeglasses, Contact Lenses' />
        {isLens && <p className="mt-1 text-xs text-purple-600 font-medium">👁️ Lens mode — lens-specific fields shown below</p>}
      </div>

      {/* ── LENS FIELDS ─────────────────────────────────────────────────── */}
      {isLens && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 space-y-4">
          <p className="text-sm font-semibold text-purple-800">Contact Lens Details</p>
          <Input label="Lens color display name" type="text" value={formData.lensColorName}
            onChange={(e) => setFormData({ ...formData, lensColorName: e.target.value })}
            id="lensColorName" name="lensColorName" placeholder="e.g. Ocean Blue, Hazel, Emerald Green" />

          {/* ── LENS PNG UPLOAD ──────────────────────────────────────────── */}
          <div className="space-y-2 rounded-lg border border-purple-300 bg-white p-4">
            <p className="text-sm font-semibold text-purple-800">👁️ Lens PNG Image</p>
            <p className="text-xs text-gray-500">
              Upload a PNG of the lens texture. It will be drawn over the iris on both eyes during try-on.
              Requirements: <strong>512×512px</strong>, transparent background, circular lens pattern,
              transparent center (pupil area ~15%).
            </p>

            {lensPngPreview && (
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-purple-200 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resolveImageSrcForPreview(lensPngPreview)} alt="Lens preview"
                    className="h-full w-full object-contain" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Current lens PNG</p>
                  <button type="button"
                    onClick={() => { setLensPngPreview(''); setLensPngFile(null); setFormData({ ...formData, lensImageUrl: '' }); if (lensPngInputRef.current) lensPngInputRef.current.value = ''; }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>
                </div>
              </div>
            )}

            <div onClick={() => lensPngInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-purple-300 p-4 text-center transition-colors hover:border-purple-500">
              <p className="text-sm text-purple-600">
                {lensPngFile ? lensPngFile.name : 'Click to upload lens PNG'}
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG only · Max 10MB · 512×512px recommended</p>
            </div>
            <input ref={lensPngInputRef} type="file" accept="image/png,image/webp"
              onChange={handleLensPngChange} className="hidden" />
          </div>
        </div>
      )}

      {/* ── GLASSES FIELDS ──────────────────────────────────────────────── */}
      {!isLens && (
        <>
          <Input label="Frame Style" type="text" value={formData.frameStyle}
            onChange={(e) => setFormData({ ...formData, frameStyle: e.target.value })} id="frameStyle" name="frameStyle"
            placeholder="e.g. Rectangular, Aviator, Cat-eye" />
          <Input label="Frame Color (primary)" type="text" value={formData.frameColor}
            onChange={(e) => setFormData({ ...formData, frameColor: e.target.value })} id="frameColor" name="frameColor"
            placeholder="e.g. Black, Silver, Tortoise, #1a1a1a" />
          <Input label="Shape" type="text" value={formData.shape}
            onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
            id="shape" name="shape" placeholder="e.g. Round, Square, Cat-eye" />
          <Input label="Material" type="text" value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })} id="material" name="material"
            placeholder="e.g. Acetate, Metal, Titanium" />
          <Select label="Frame width" id="frameWidth" name="frameWidth" value={formData.frameWidth}
            onChange={(e) => setFormData({ ...formData, frameWidth: e.target.value })}
            options={FRAME_WIDTH_SELECT_OPTIONS} />
        </>
      )}

      <Textarea label="Description" rows={4} value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        id="description" name="description" placeholder="Describe the product for customers" />

      {/* ── PRIMARY IMAGE ────────────────────────────────────────────────── */}
      {/* ── PRIMARY IMAGE — glasses only ───────────────────────────────── */}
      {!isLens && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Primary product image (PNG recommended for try-on)
          </label>
          {imagePreview && (
            <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImageSrcForPreview(imagePreview)} alt="Product preview" className="h-full w-full object-contain" />
              <button type="button" onClick={() => { setImagePreview(''); setImageFile(null); setFormData({ ...formData, imageUrl: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600">✕</button>
            </div>
          )}
          <div onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
            <p className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Click to upload PNG/JPG image'}</p>
            <p className="mt-1 text-xs text-gray-400">Max 5MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {/* ── 3D MODEL UPLOAD (glasses only) ──────────────────────────────── */}
      {!isLens && (
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
          <p className="text-sm font-semibold text-blue-800">3D Model (optional)</p>
          <p className="text-xs text-gray-500">
            Upload a GLB file exported from Blender. Enables the "3D Try-On" button.
          </p>
          {formData.glbUrl && (
            <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 p-2">
              <span className="text-lg">📦</span>
              <span className="text-xs text-gray-600 truncate">{formData.glbUrl}</span>
              <button type="button" onClick={() => { setFormData({ ...formData, glbUrl: '' }); setGlbFile(null); if (glbInputRef.current) glbInputRef.current.value = ''; }}
                className="ml-auto text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
          )}
          <div onClick={() => glbInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-blue-300 p-4 text-center transition-colors hover:border-blue-400">
            <p className="text-sm text-blue-600">{glbFile ? glbFile.name : 'Click to upload .glb file'}</p>
            <p className="mt-1 text-xs text-gray-400">Max 50MB · GLB format only</p>
          </div>
          <input ref={glbInputRef} type="file" accept=".glb,.gltf" onChange={handleGlbFileChange} className="hidden" />
        </div>
      )}

      {/* ── EXTRA COLORS ─────────────────────────────────────────────────── */}
      {!isLens && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-800">Additional frame colors</p>
              <p className="text-xs text-gray-500">Add one image per extra color.</p>
            </div>
            <Button type="button" variant="outline" onClick={addExtraColorRow}>Add color</Button>
          </div>
          {extraColors.length === 0 && <p className="text-sm text-gray-500">No extra colors yet.</p>}
          {extraColors.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_11rem_1fr] sm:items-end"
            >
              <div className="min-w-0">
                <Input label="Color name" type="text" value={row.color}
                  onChange={(e) => updateExtraColorLabel(row.id, e.target.value)}
                  id={`extra-color-${row.id}`} name={`extra-color-${row.id}`}
                  placeholder="e.g. Tortoise" />
              </div>
              <div className="min-w-0">
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={row.stockQuantity}
                  onChange={(e) => updateExtraColorStock(row.id, e.target.value)}
                  id={`extra-color-stock-${row.id}`}
                  name={`extra-color-stock-${row.id}`}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                {(row.previewDataUrl || row.remoteUrl) && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.previewDataUrl || resolveImageSrcForPreview(row.remoteUrl)} alt="" className="h-full w-full object-contain" />
                  </div>
                )}
                <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                  <span>{row.file ? row.file.name : row.remoteUrl ? 'Replace image' : 'Upload image'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(e) => handleExtraFileChange(row.id, e)} />
                </label>
                <Button type="button" variant="outline" onClick={() => removeExtraColorRow(row.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading || uploading}>
          {uploading ? 'Uploading...' : product ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
