import { ListFeatureFlags } from "@/lib/list-feature-flags";

export type UpdateListFeaturesRequest = {
  listId: string;
  attendance_confirmation_enabled: boolean;
  notes_enabled: boolean;
  contributions_enabled: boolean;
  share_enabled: boolean;
  selection_notifications_enabled: boolean;
};

export type UpdateListFeaturesResponse = ListFeatureFlags;

export const updateListFeatures = async ({
  listId,
  attendance_confirmation_enabled,
  notes_enabled,
  contributions_enabled,
  share_enabled,
  selection_notifications_enabled,
}: UpdateListFeaturesRequest): Promise<UpdateListFeaturesResponse> => {
  const response = await fetch(`/api/lists/${listId}/features`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attendance_confirmation_enabled,
      notes_enabled,
      contributions_enabled,
      share_enabled,
      selection_notifications_enabled,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
