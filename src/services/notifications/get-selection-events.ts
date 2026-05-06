export type SelectionEventType = "selected" | "deselected";

export type SelectionEvent = {
  id: string;
  list_id: string;
  product_id: string;
  product_name: string;
  guest_name: string;
  event_type: SelectionEventType;
  created_at: string;
};

export type GetSelectionEventsRequest = {
  listId: string;
};

export type GetSelectionEventsResponse = SelectionEvent[];

export const getSelectionEvents = async ({
  listId,
}: GetSelectionEventsRequest): Promise<GetSelectionEventsResponse> => {
  const response = await fetch(`/api/lists/${listId}/selection-events`, {
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
