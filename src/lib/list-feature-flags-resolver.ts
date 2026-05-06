import { PoolClient } from "pg";
import { DEFAULT_LIST_FEATURE_FLAGS } from "@/lib/list-feature-flags";
import { ListFeatureFlagsDAO } from "@/daos/list-feature-flags-dao";

export const resolveListFeatureFlags = async (
  listId: string,
  client?: PoolClient
) => {
  const flags = await ListFeatureFlagsDAO.getByListId(listId, client);

  if (flags) {
    return flags;
  }

  return {
    list_id: listId,
    ...DEFAULT_LIST_FEATURE_FLAGS,
  };
};
