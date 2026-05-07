import { Contribution, ContributionStatus } from "@/services/contributions/contribution-types";

export type UpdateContributionRequest = {
  list_id: string;
  contribution_id: string;
  contribution: {
    contributor_name: string;
    contributor_contact?: string;
    message?: string;
    amount: number;
    currency: string;
    status: ContributionStatus;
  };
};

export type UpdateContributionResponse = Contribution;

export const updateContribution = async ({
  list_id,
  contribution_id,
  contribution,
}: UpdateContributionRequest): Promise<UpdateContributionResponse> => {
  const response = await fetch(`/api/lists/${list_id}/contributions/${contribution_id}`, {
    method: "PATCH",
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

