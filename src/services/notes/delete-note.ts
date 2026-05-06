export type DeleteNoteRequest = {
  list_id: string;
  note_id: string;
};

type DeleteNoteResponse = {
  ok: boolean;
};

export const deleteNote = async ({
  list_id,
  note_id,
}: DeleteNoteRequest): Promise<DeleteNoteResponse> => {
  const response = await fetch(`/api/lists/${list_id}/notes/${note_id}`, {
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
