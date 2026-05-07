export type ContributionStatus = "pending" | "received" | "cancelled";

export type Contribution = {
  id: string;
  list_id: string;
  contributor_name: string;
  contributor_contact: string | null;
  message: string | null;
  amount: number;
  currency: string;
  status: ContributionStatus;
  created_at: string;
  is_active: boolean;
};

