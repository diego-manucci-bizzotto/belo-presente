
export type CreateListRequest = {
  title: string;
  description: string;
  category: string;
}

type CreateListResponse = {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: number;
  share_id: string;
  active: boolean;
}

export const createList = async (list : CreateListRequest) : Promise<CreateListResponse> => {
  const response = await fetch('/api/lists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(list),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
