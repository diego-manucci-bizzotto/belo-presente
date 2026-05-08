import { ProductPurchaseType } from "@/services/products/create-product";

export type GetSharedProductsRequest = {
  shareId: string;
  guestPhone?: string;
};

export type SharedProductResponse = {
  id: string;
  list_id: string;
  name: string;
  description: string | null;
  url: string | null;
  affiliate_url: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
  quantity: number;
  purchase_type: ProductPurchaseType;
  created_at: string;
  is_active: boolean;
  gifted_count: number;
  remaining_quantity: number;
  selected_by_me: boolean;
  my_gift_intent_id: string | null;
}[];

export const getSharedProducts = async ({
  shareId,
  guestPhone,
}: GetSharedProductsRequest): Promise<SharedProductResponse> => {
  const searchParams = new URLSearchParams();
  if (guestPhone) {
    searchParams.set("guest_phone", guestPhone);
  }
  const query = searchParams.toString();
  const response = await fetch(`/api/share/${shareId}/products${query ? `?${query}` : ""}`, {
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
