import { baseApi } from './baseApi';
import type { Product } from '@/types/entities';
import type { CreateProductDto, UpdateProductDto } from '@/types/api';
import type { ProductListQueryParams, ProductFiltersMetadata } from '@/types/product-filters';

function buildProductQueryString(params: ProductListQueryParams | undefined): string {
  if (!params) {
    return '';
  }
  const searchParams = new URLSearchParams();
  const entries: [keyof ProductListQueryParams, string | number | undefined][] = [
    ['search', params.search],
    ['category', params.category],
    ['brand', params.brand],
    ['frameStyle', params.frameStyle],
    ['frameColor', params.frameColor],
    ['shape', params.shape],
    ['material', params.material],
    ['frameWidth', params.frameWidth],
    ['minPrice', params.minPrice],
    ['maxPrice', params.maxPrice],
  ];
  for (const [key, value] of entries) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const queryString = searchParams.toString();
  return queryString === '' ? '' : `?${queryString}`;
}

function normalizeProductListParams(
  params: ProductListQueryParams | void,
): ProductListQueryParams | undefined {
  if (params === undefined || params === null) {
    return undefined;
  }
  const cleaned: ProductListQueryParams = {};
  const assign = <K extends keyof ProductListQueryParams>(key: K, value: ProductListQueryParams[K]) => {
    if (value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  };
  assign('search', params.search);
  assign('category', params.category);
  assign('brand', params.brand);
  assign('frameStyle', params.frameStyle);
  assign('frameColor', params.frameColor);
  assign('shape', params.shape);
  assign('material', params.material);
  assign('frameWidth', params.frameWidth);
  if (params.minPrice !== undefined && params.minPrice > 0) {
    cleaned.minPrice = params.minPrice;
  }
  if (params.maxPrice !== undefined && params.maxPrice > 0) {
    cleaned.maxPrice = params.maxPrice;
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], ProductListQueryParams | void>({
      query: (params) =>
        `/product${buildProductQueryString(normalizeProductListParams(params))}`,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const normalized = normalizeProductListParams(queryArgs);
        if (!normalized) {
          return endpointName;
        }
        return `${endpointName}(${JSON.stringify(normalized)})`;
      },
      providesTags: ['Product'],
    }),
    getProductFilters: builder.query<ProductFiltersMetadata, void>({
      query: () => '/product/filters',
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/product/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, CreateProductDto>({
      query: (body) => ({
        url: '/product',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: UpdateProductDto }>({
      query: ({ id, data }) => ({
        url: `/product/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/product/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Product', id }, 'Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductFiltersQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

