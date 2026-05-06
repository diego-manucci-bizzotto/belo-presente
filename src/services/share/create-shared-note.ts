import { ListNote } from "@/services/notes/note-types";

export type CreateSharedNoteRequest = {
  shareId: string;
  author_name: string;
  author_contact?: string;
  message: string;
};

export const createSharedNote = async ({
  shareId,
  author_name,
  author_contact,
  message,
}: CreateSharedNoteRequest): Promise<ListNote> => {
  const response = await fetch(`/api/share/${shareId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author_name,
      author_contact,
      message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};
