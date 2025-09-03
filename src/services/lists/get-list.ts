
export type GetListRequest = {
  listId: number;
}

type GetListResponse = {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: number;
  share_id: string;
  active: boolean;
}

export const getList = async ({listId} : GetListRequest) : Promise<GetListResponse> => {
  const response = await fetch(`/api/lists/${listId}`, {
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
};
