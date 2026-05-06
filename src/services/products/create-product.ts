export type ProductPurchaseType = "qrcode" | "redirect";

export type CreateProductRequest = {
  list_id: string;
  product: {
    name: string;
    description?: string;
    url?: string;
    image_url?: string;
    price?: number;
    currency: string;
    quantity: number;
    purchase_type: ProductPurchaseType;
  };
};

export type CreateProductResponse = {
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
};

export const createProduct = async ({ list_id, product }: CreateProductRequest): Promise<CreateProductResponse> => {
  const response = await fetch(`/api/lists/${list_id}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
