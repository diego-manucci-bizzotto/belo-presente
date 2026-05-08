import { CreateGuestResponse, GuestAttendeeType, GuestStatus } from "@/services/guests/create-guest";

export type UpdateGuestRequest = {
  list_id: string;
  guest_id: string;
  guest: {
    name: string;
    email?: string;
    phone?: string;
    note?: string;
    status: GuestStatus;
    attendee_type?: GuestAttendeeType;
    has_companion?: boolean;
    companion_name?: string;
  };
};

export const updateGuest = async ({
  list_id,
  guest_id,
  guest,
}: UpdateGuestRequest): Promise<CreateGuestResponse> => {
  const response = await fetch(`/api/lists/${list_id}/guests/${guest_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(guest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
