export type CreateGiftIntentRequest = {
  shareId: string;
  productId: string;
  guest_name?: string;
  guest_phone?: string;
  guest_message?: string;
};

type RedirectGiftIntentResponse = {
  ok: true;
  purchase_type: "redirect";
  redirect_url: string;
  gift_intent_id: string;
};

type QrCodeGiftIntentResponse = {
  ok: true;
  purchase_type: "qrcode";
  qr_code_image_url: string;
  amount: number;
  currency: string;
  gift_intent_id: string;
};

export type CreateGiftIntentResponse =
  | RedirectGiftIntentResponse
  | QrCodeGiftIntentResponse;

export const createGiftIntent = async ({
  shareId,
  productId,
  guest_name,
  guest_phone,
  guest_message,
}: CreateGiftIntentRequest): Promise<CreateGiftIntentResponse> => {
  const response = await fetch(`/api/share/${shareId}/products/${productId}/gift`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      guest_name,
      guest_phone,
      guest_message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
