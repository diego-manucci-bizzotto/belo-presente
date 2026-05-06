import { ListFeatureFlags } from "@/lib/list-feature-flags";

export type GetListFeaturesRequest = {
  listId: string;
};

export type GetListFeaturesResponse = ListFeatureFlags;

export const getListFeatures = async ({
  listId,
}: GetListFeaturesRequest): Promise<GetListFeaturesResponse> => {
  const response = await fetch(`/api/lists/${listId}/features`, {
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
