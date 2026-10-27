import {
  AccidentIcon,
  Alert02Icon,
  ArrowRight01Icon,
  BellIcon,
  BodyWeightIcon,
  Calendar03Icon,
  CallIcon,
  Chart01Icon,
  CheckmarkCircle02Icon,
  DangerIcon,
  File02Icon,
  HelpCircleIcon,
  Home01Icon,
  Hospital01Icon,
  InformationCircleIcon,
  Location01Icon,
  Medicine01Icon,
  Search01Icon,
  Shield01Icon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Circle, Path, Rect, Svg, View } from "@react-pdf/renderer";
import type { IaspRedFlagId } from "../data/iasp-red-flags-data.js";

export const PDF_RED_FLAG_ICONS: Record<IaspRedFlagId, IconSvgElement> = {
  two_or_more_falls: AccidentIcon,
  missed_incorrect_medicines: Medicine01Icon,
  unsafe_decisions: DangerIcon,
  significant_weight_loss: BodyWeightIcon,
  social_isolation: UserGroupIcon,
  recurrent_hospital_admissions: Hospital01Icon,
  caregiver_struggling: UserIcon,
  no_emergency_response: CallIcon,
};

export const PDF_GUIDANCE_ICONS: IconSvgElement[] = [
  File02Icon,
  Medicine01Icon,
  Shield01Icon,
  BellIcon,
];

export const PdfReportIcons = {
  calendar: Calendar03Icon,
  location: Location01Icon,
  file: File02Icon,
  info: InformationCircleIcon,
  alert: Alert02Icon,
  search: Search01Icon,
  check: CheckmarkCircle02Icon,
  sparkles: SparklesIcon,
  arrowRight: ArrowRight01Icon,
  home: Home01Icon,
  chart: Chart01Icon,
  help: HelpCircleIcon,
  medicine: Medicine01Icon,
  shield: Shield01Icon,
  bell: BellIcon,
} as const;

/** Official WhatsApp mark (filled), for PDF CTAs. */
const WHATSAPP_MARK_PATH =
  "M307.546 52.566C273.709 18.684 228.706.017 180.756 0 81.951 0 1.538 80.404 1.504 179.235c-.017 31.594 8.242 62.432 23.928 89.609L0 361.736l95.024-24.925c26.179 14.285 55.659 21.805 85.655 21.814h.077c98.788 0 179.21-80.413 179.244-179.244.017-47.898-18.608-92.926-52.454-126.807v-.008Zm-126.79 275.788h-.06c-26.73-.008-52.952-7.194-75.831-20.765l-5.44-3.231-56.391 14.791 15.05-54.981-3.542-5.638c-14.912-23.721-22.793-51.139-22.776-79.286.035-82.14 66.867-148.973 149.051-148.973 39.793.017 77.198 15.53 105.328 43.695 28.131 28.157 43.61 65.596 43.593 105.398-.035 82.149-66.867 148.982-148.982 148.982v.008Zm81.719-111.577c-4.478-2.243-26.497-13.073-30.606-14.568-4.108-1.496-7.09-2.243-10.073 2.243-2.982 4.487-11.568 14.577-14.181 17.559-2.613 2.991-5.226 3.361-9.704 1.117-4.477-2.243-18.908-6.97-36.02-22.226-13.313-11.878-22.304-26.54-24.916-31.027-2.613-4.486-.275-6.91 1.959-9.136 2.011-2.011 4.478-5.234 6.721-7.847 2.244-2.613 2.983-4.486 4.478-7.469 1.496-2.991.748-5.603-.369-7.847-1.118-2.243-10.073-24.289-13.812-33.253-3.636-8.732-7.331-7.546-10.073-7.692-2.613-.13-5.595-.155-8.586-.155-2.991 0-7.839 1.118-11.947 5.604-4.108 4.486-15.677 15.324-15.677 37.361s16.047 43.344 18.29 46.335c2.243 2.991 31.585 48.225 76.51 67.632 10.684 4.615 19.029 7.374 25.535 9.437 10.727 3.412 20.49 2.931 28.208 1.779 8.604-1.289 26.498-10.838 30.228-21.298 3.73-10.46 3.73-19.433 2.613-21.298-1.117-1.865-4.108-2.991-8.586-5.234l.008-.017Z";

export function PdfWhatsappIcon({
  size = 20,
  color = "#25D366",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 360 362">
      <Path fill={color} fillRule="evenodd" d={WHATSAPP_MARK_PATH} />
    </Svg>
  );
}

type PdfIconProps = {
  icon: IconSvgElement;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/** Renders a Hugeicons `IconSvgElement` inside react-pdf SVG. */
export function PdfIcon({
  icon,
  size = 14,
  color = "#6B7280",
  strokeWidth = 1.5,
}: PdfIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icon.map(([tag, attrs], index) => {
        const stroke = color;
        if (tag === "path" && typeof attrs.d === "string") {
          return (
            <Path
              key={String(attrs.key ?? index)}
              d={attrs.d}
              stroke={stroke}
              strokeWidth={Number(attrs.strokeWidth ?? strokeWidth)}
              strokeLinecap={(attrs.strokeLinecap as "round") ?? "round"}
              strokeLinejoin={(attrs.strokeLinejoin as "round") ?? "round"}
              fill="none"
            />
          );
        }
        if (tag === "circle") {
          return (
            <Circle
              key={String(attrs.key ?? index)}
              cx={Number(attrs.cx ?? 12)}
              cy={Number(attrs.cy ?? 12)}
              r={Number(attrs.r ?? 10)}
              stroke={stroke}
              strokeWidth={Number(attrs.strokeWidth ?? strokeWidth)}
              strokeLinecap={(attrs.strokeLinecap as "round") ?? "round"}
              strokeLinejoin={(attrs.strokeLinejoin as "round") ?? "round"}
              fill="none"
            />
          );
        }
        if (tag === "rect") {
          return (
            <Rect
              key={String(attrs.key ?? index)}
              x={Number(attrs.x ?? 0)}
              y={Number(attrs.y ?? 0)}
              width={Number(attrs.width ?? 0)}
              height={Number(attrs.height ?? 0)}
              rx={attrs.rx != null ? Number(attrs.rx) : undefined}
              stroke={stroke}
              strokeWidth={Number(attrs.strokeWidth ?? strokeWidth)}
              strokeLinecap={(attrs.strokeLinecap as "round") ?? "round"}
              strokeLinejoin={(attrs.strokeLinejoin as "round") ?? "round"}
              fill="none"
            />
          );
        }
        return null;
      })}
    </Svg>
  );
}

export function PdfIconBadge({
  icon,
  size = 14,
  color = "#6C318E",
  bg = "#f3eff6",
  box = 22,
  borderRadius,
}: {
  icon: IconSvgElement;
  size?: number;
  color?: string;
  bg?: string;
  box?: number;
  borderRadius?: number;
}) {
  return (
    <View
      style={{
        width: box,
        height: box,
        borderRadius: borderRadius ?? 6,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PdfIcon icon={icon} size={size} color={color} />
    </View>
  );
}
