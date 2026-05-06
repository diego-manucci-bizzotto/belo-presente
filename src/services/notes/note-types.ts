export type ListNote = {
  id: string;
  list_id: string;
  author_name: string;
  author_contact: string | null;
  message: string;
  created_at: string;
  is_active: boolean;
};
