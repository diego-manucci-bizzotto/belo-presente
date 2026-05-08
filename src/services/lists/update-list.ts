import { GetListResponse } from "@/services/lists/get-list";
import { ListBackgroundTheme } from "@/lib/list-background-theme";

export type UpdateListRequest = {
  listId: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
  background_theme: ListBackgroundTheme;
};

export const updateList = async ({
  listId,
  title,
  description,
  category,
  active,
  background_theme,
}: UpdateListRequest): Promise<GetListResponse> => {
  const response = await fetch(`/api/lists/${listId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      category,
      active,
      background_theme,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
