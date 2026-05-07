import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Bell,
  Gift,
  Image,
  Link as LinkIcon,
  MessagesSquare,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { DEFAULT_LIST_FEATURE_FLAGS } from "@/lib/list-feature-flags";

export type ListNavFeature = {
  value: string;
  label: string;
  icon: LucideIcon;
  section: "functionalities" | "management";
};

const BASE_FEATURES: ListNavFeature[] = [
  { value: "products", label: "Presentes", icon: Gift, section: "functionalities" },
  { value: "gallery", label: "Galeria", icon: Image, section: "functionalities" },
  { value: "notes", label: "Recados", icon: MessagesSquare, section: "functionalities" },
  { value: "share", label: "Compartilhar", icon: LinkIcon, section: "functionalities" },
  { value: "guests", label: "Convidados", icon: Users, section: "management" },
  { value: "payments", label: "Pagamentos", icon: Banknote, section: "management" },
  { value: "notifications", label: "Notificacoes", icon: Bell, section: "management" },
  { value: "features", label: "Funcionalidades", icon: SlidersHorizontal, section: "management" },
  { value: "settings", label: "Configuracoes", icon: Settings, section: "management" },
];

type FeatureFlags = {
  attendance_confirmation_enabled?: boolean;
  notes_enabled?: boolean;
  contributions_enabled?: boolean;
  share_enabled?: boolean;
  selection_notifications_enabled?: boolean;
};

export const getVisibleListNavFeatures = (flags?: FeatureFlags): ListNavFeature[] => {
  const resolvedFlags = {
    ...DEFAULT_LIST_FEATURE_FLAGS,
    ...flags,
  };

  return BASE_FEATURES.filter((feature) => {
    if (feature.value === "notes") {
      return resolvedFlags.notes_enabled;
    }

    if (feature.value === "share") {
      return resolvedFlags.share_enabled;
    }

    if (feature.value === "guests") {
      return resolvedFlags.attendance_confirmation_enabled;
    }

    return true;
  });
};
