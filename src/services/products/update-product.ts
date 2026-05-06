import { CreateProductResponse, ProductPurchaseType } from "@/services/products/create-product";

export type UpdateProductRequest = {
  list_id: string;
  product_id: string;
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

export const updateProduct = async ({
  list_id,
  product_id,
  product,
}: UpdateProductRequest): Promise<CreateProductResponse> => {
  const response = await fetch(`/api/lists/${list_id}/products/${product_id}`, {
    method: "PATCH",
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
