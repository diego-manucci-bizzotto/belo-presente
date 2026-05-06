import { ListNote } from "@/services/notes/note-types";

export type GetNotesRequest = {
  listId: string;
};

export type GetNotesResponse = ListNote[];

export const getNotes = async ({ listId }: GetNotesRequest): Promise<GetNotesResponse> => {
  const response = await fetch(`/api/lists/${listId}/notes`, {
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
