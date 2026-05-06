export type DeleteProductRequest = {
  list_id: string;
  product_id: string;
};

type DeleteProductResponse = {
  ok: boolean;
};

export const deleteProduct = async ({
  list_id,
  product_id,
}: DeleteProductRequest): Promise<DeleteProductResponse> => {
  const response = await fetch(`/api/lists/${list_id}/products/${product_id}`, {
    method: "DELETE",
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
