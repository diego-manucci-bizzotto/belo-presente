import { CreateGuestResponse } from "@/services/guests/create-guest";

export type GetGuestsRequest = {
  listId: string;
};

export type GetGuestsResponse = CreateGuestResponse[];

export const getGuests = async ({ listId }: GetGuestsRequest): Promise<GetGuestsResponse> => {
  const response = await fetch(`/api/lists/${listId}/guests`, {
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
