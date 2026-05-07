import { ProductPurchaseType } from "@/services/products/create-product";

export type MonetizationIntentMetric = {
  purchase_type: ProductPurchaseType;
  status: string;
  currency: string;
  intents_count: number;
  total_amount: number | null;
};

export type MonetizationTopProductMetric = {
  product_id: string;
  product_name: string;
  purchase_type: ProductPurchaseType;
  currency: string;
  total_intents: number;
  active_intents: number;
  cancelled_intents: number;
  estimated_amount: number;
};

export type GetMonetizationSummaryRequest = {
  listId: string;
};

export type GetMonetizationSummaryResponse = {
  intents: MonetizationIntentMetric[];
  top_products: MonetizationTopProductMetric[];
};

export const getMonetizationSummary = async ({
  listId,
}: GetMonetizationSummaryRequest): Promise<GetMonetizationSummaryResponse> => {
  const response = await fetch(`/api/lists/${listId}/monetization/summary`, {
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

