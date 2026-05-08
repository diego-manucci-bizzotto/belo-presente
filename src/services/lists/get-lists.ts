
import { ListBackgroundTheme } from "@/lib/list-background-theme";

export type GetListsResponse = {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: number;
  share_id: string;
  active: boolean;
  background_theme: ListBackgroundTheme;
}[];

export const getLists = async (): Promise<GetListsResponse> => {
  const response = await fetch('/api/lists', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}
