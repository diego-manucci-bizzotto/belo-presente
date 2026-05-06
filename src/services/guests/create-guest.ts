export type GuestStatus = "pending" | "confirmed" | "declined";

export type CreateGuestRequest = {
  list_id: string;
  guest: {
    name: string;
    email?: string;
    phone?: string;
    note?: string;
    status: GuestStatus;
  };
};

export type CreateGuestResponse = {
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

export const createGuest = async ({ list_id, guest }: CreateGuestRequest): Promise<CreateGuestResponse> => {
  const response = await fetch(`/api/lists/${list_id}/guests`, {
    method: "POST",
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
