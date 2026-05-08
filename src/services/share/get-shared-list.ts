import { ListBackgroundTheme } from "@/lib/list-background-theme";

export type GetSharedListRequest = {
  shareId: string;
};

export type SharedListResponse = {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: number;
  share_id: string;
  active: boolean;
  background_theme: ListBackgroundTheme;
  features: {
    attendance_confirmation_enabled: boolean;
    notes_enabled: boolean;
    contributions_enabled: boolean;
    share_enabled: boolean;
    selection_notifications_enabled: boolean;
  };
};

export const getSharedList = async ({
  shareId,
}: GetSharedListRequest): Promise<SharedListResponse> => {
  const response = await fetch(`/api/share/${shareId}`, {
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
