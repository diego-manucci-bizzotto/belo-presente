export type DeleteGuestRequest = {
  list_id: string;
  guest_id: string;
};

type DeleteGuestResponse = {
  ok: boolean;
};

export const deleteGuest = async ({
  list_id,
  guest_id,
}: DeleteGuestRequest): Promise<DeleteGuestResponse> => {
  const response = await fetch(`/api/lists/${list_id}/guests/${guest_id}`, {
    method: "DELETE",
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
