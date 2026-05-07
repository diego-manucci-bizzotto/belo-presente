export type CancelGiftIntentRequest = {
  shareId: string;
  productId: string;
  giftIntentId: string;
};

type CancelGiftIntentResponse = {
  ok: boolean;
};

export const cancelGiftIntent = async ({
  shareId,
  productId,
  giftIntentId,
}: CancelGiftIntentRequest): Promise<CancelGiftIntentResponse> => {
  const response = await fetch(`/api/share/${shareId}/products/${productId}/gift/${giftIntentId}`, {
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
