import { Contribution } from "@/services/contributions/contribution-types";

export type GetContributionsRequest = {
  listId: string;
};

export type GetContributionsResponse = Contribution[];

export const getContributions = async ({
  listId,
}: GetContributionsRequest): Promise<GetContributionsResponse> => {
  const response = await fetch(`/api/lists/${listId}/contributions`, {
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

