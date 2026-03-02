/**
 * Maps Strapi chat quick-action icon names (enumeration values) to Lucide React components.
 * Keep in sync with Strapi component chat.quick-action-button enum.
 */
import {
  Droplets,
  UserCircle,
  Phone,
  Receipt,
  HelpCircle,
  Utensils,
  Coffee,
  FileText,
  MessageCircle,
  AlertCircle,
  Mail,
  Star,
  Heart,
  Wrench,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const CHAT_ICON_MAP: Record<string, LucideIcon> = {
  Droplets,
  UserCircle,
  Phone,
  Receipt,
  HelpCircle,
  Utensils,
  Coffee,
  FileText,
  MessageCircle,
  AlertCircle,
  Mail,
  Star,
  Heart,
  Wrench,
  Sparkles,
};

const DEFAULT_ICON = HelpCircle;

export function getChatQuickActionIcon(iconName: string): LucideIcon {
  const key = String(iconName ?? "").trim();
  return CHAT_ICON_MAP[key] ?? DEFAULT_ICON;
}
