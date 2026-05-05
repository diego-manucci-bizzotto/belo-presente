import { CreateProductResponse } from "@/services/products/create-product";

export type GetProductsRequest = {
  listId: string;
};

export type GetProductsResponse = CreateProductResponse[];

export const getProducts = async ({ listId }: GetProductsRequest): Promise<GetProductsResponse> => {
  const response = await fetch(`/api/lists/${listId}/products`, {
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
