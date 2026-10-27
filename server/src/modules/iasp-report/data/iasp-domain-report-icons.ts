import {
  BodyPartMuscleIcon,
  Brain02Icon,
  Shield01Icon,
  SparklesIcon,
  Sun03Icon,
  UserIcon,
  VegetarianFoodIcon,
  WalkingIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

/** Hugeicons for IAS-P domain rows (report PDF + HTML preview). */
export const IASP_DOMAIN_REPORT_ICONS: Record<string, IconSvgElement> = {
  "basic-self-care": BodyPartMuscleIcon,
  "daily-life": Sun03Icon,
  mobility: WalkingIcon,
  thinking: Brain02Icon,
  health: SparklesIcon,
  nutrition: VegetarianFoodIcon,
  social: UserIcon,
  safety: Shield01Icon,
};
