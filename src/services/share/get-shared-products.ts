import { ProductPurchaseType } from "@/services/products/create-product";

export type GetSharedProductsRequest = {
  shareId: string;
};

export type SharedProductResponse = {
  id: string;
  list_id: string;
  name: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
  quantity: number;
  purchase_type: ProductPurchaseType;
  created_at: string;
  is_active: boolean;
  gifted_count: number;
  remaining_quantity: number;
}[];

export const getSharedProducts = async ({
  shareId,
}: GetSharedProductsRequest): Promise<SharedProductResponse> => {
  const response = await fetch(`/api/share/${shareId}/products`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
