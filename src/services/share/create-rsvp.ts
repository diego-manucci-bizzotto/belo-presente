import { GuestStatus } from "@/services/guests/create-guest";

export type CreateRsvpRequest = {
  shareId: string;
  name: string;
  email?: string;
  phone?: string;
  note?: string;
  status: GuestStatus;
};

export type CreateRsvpResponse = {
  id: string;
  list_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  status: GuestStatus;
  created_at: string;
  is_active: boolean;
};

export const createRsvp = async ({
  shareId,
  name,
  email,
  phone,
  note,
  status,
}: CreateRsvpRequest): Promise<CreateRsvpResponse> => {
  const response = await fetch(`/api/share/${shareId}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      note,
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
