import { ListNote } from "@/services/notes/note-types";

export type GetSharedNotesRequest = {
  shareId: string;
};

export type GetSharedNotesResponse = ListNote[];

export const getSharedNotes = async ({
  shareId,
}: GetSharedNotesRequest): Promise<GetSharedNotesResponse> => {
  const response = await fetch(`/api/share/${shareId}/notes`, {
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
