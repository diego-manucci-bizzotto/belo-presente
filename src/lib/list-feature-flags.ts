export type ListFeatureFlags = {
  list_id: string;
  attendance_confirmation_enabled: boolean;
  notes_enabled: boolean;
  contributions_enabled: boolean;
  share_enabled: boolean;
  selection_notifications_enabled: boolean;
};

export const DEFAULT_LIST_FEATURE_FLAGS = {
  attendance_confirmation_enabled: true,
  notes_enabled: true,
  contributions_enabled: false,
  share_enabled: true,
  selection_notifications_enabled: true,
} as const;
