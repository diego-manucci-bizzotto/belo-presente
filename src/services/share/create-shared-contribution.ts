import { Contribution } from "@/services/contributions/contribution-types";

export type CreateSharedContributionRequest = {
  shareId: string;
  contributor_name: string;
  contributor_contact?: string;
  message?: string;
  amount: number;
  currency?: string;
};

export type CreateSharedContributionResponse = Contribution;

export const createSharedContribution = async ({
  shareId,
  contributor_name,
  contributor_contact,
  message,
  amount,
  currency,
}: CreateSharedContributionRequest): Promise<CreateSharedContributionResponse> => {
  const response = await fetch(`/api/share/${shareId}/contributions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contributor_name,
      contributor_contact,
      message,
      amount,
      currency,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
};

