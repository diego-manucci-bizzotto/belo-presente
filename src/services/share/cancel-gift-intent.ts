export type CancelGiftIntentRequest = {
  shareId: string;
  productId: string;
  giftIntentId: string;
  guest_phone: string;
};

type CancelGiftIntentResponse = {
  ok: boolean;
};

export const cancelGiftIntent = async ({
  shareId,
  productId,
  giftIntentId,
  guest_phone,
}: CancelGiftIntentRequest): Promise<CancelGiftIntentResponse> => {
  const response = await fetch(`/api/share/${shareId}/products/${productId}/gift/${giftIntentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      guest_phone,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
