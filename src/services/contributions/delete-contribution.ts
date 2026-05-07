export type DeleteContributionRequest = {
  list_id: string;
  contribution_id: string;
};

type DeleteContributionResponse = {
  ok: boolean;
};

export const deleteContribution = async ({
  list_id,
  contribution_id,
}: DeleteContributionRequest): Promise<DeleteContributionResponse> => {
  const response = await fetch(`/api/lists/${list_id}/contributions/${contribution_id}`, {
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

