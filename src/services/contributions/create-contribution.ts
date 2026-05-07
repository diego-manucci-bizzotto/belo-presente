import { Contribution, ContributionStatus } from "@/services/contributions/contribution-types";

export type CreateContributionRequest = {
  list_id: string;
  contribution: {
    contributor_name: string;
    contributor_contact?: string;
    message?: string;
    amount: number;
    currency: string;
    status: ContributionStatus;
  };
};

export type CreateContributionResponse = Contribution;

export const createContribution = async ({
  list_id,
  contribution,
}: CreateContributionRequest): Promise<CreateContributionResponse> => {
  const response = await fetch(`/api/lists/${list_id}/contributions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contribution),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};

