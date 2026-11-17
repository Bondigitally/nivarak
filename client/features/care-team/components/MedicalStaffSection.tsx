"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Call02Icon,
  Mail02Icon,
} from "@hugeicons/core-free-icons";
import { TruncateHoverMarquee } from "@/components/shared/TruncateHoverMarquee";
import {
  dashboardCardClass,
  memberPortraitCardBodyClass,
  memberPortraitCardClass,
  memberPortraitCardGridClass,
  memberPortraitCardMediaClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import { typo } from "@/lib/tokens/typography";
import {
  cardShadowCss,
  cardShadowHoverCss,
} from "@/lib/tokens/elevation";
import { cn } from "@/lib/utils";
import type { MedicalStaffMember } from "../data/care-team-data";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

const staffImageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

function ContactRow({
  icon,
  children,
}: {
  icon: typeof Mail02Icon;
  children: string;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <span className="inline-flex size-4 shrink-0 text-muted-foreground" aria-hidden>
        <HugeiconsIcon
          icon={icon}
          size={BADGE_ICON_SIZE}
          strokeWidth={ICON_STROKE}
          color="currentColor"
          absoluteStrokeWidth
        />
      </span>
      <span className={cn(typo.bodyS, "text-muted-foreground")}>{children}</span>
    </div>
  );
}

function MedicalStaffCard({ member }: { member: MedicalStaffMember }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const restShadow = cardShadowCss;
  const hoverShadow = cardShadowHoverCss;

  const staffCardVariants = {
    rest: {
      y: 0,
      boxShadow: restShadow,
    },
    hover: {
      y: -3,
      boxShadow: hoverShadow,
    },
    tap: {
      y: -1,
      scale: 0.985,
      boxShadow: restShadow,
    },
  };

  return (
    <motion.article
      initial="rest"
      whileHover={reduceMotion ? undefined : "hover"}
      whileTap={reduceMotion ? undefined : "tap"}
      variants={staffCardVariants}
      transition={{ duration: 0.32, ease: CARD_EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={memberPortraitCardClass}
    >
      <div className={memberPortraitCardMediaClass}>
        <motion.div
          variants={staffImageVariants}
          transition={{ duration: 0.32, ease: CARD_EASE }}
          className="absolute inset-0 origin-center"
        >
          <Image
            src={member.imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="246px"
          />
        </motion.div>
      </div>

      <div className={memberPortraitCardBodyClass}>
        <div className="flex min-w-0 items-center gap-2">
          <TruncateHoverMarquee
            as="h3"
            hovered={hovered}
            className="flex-1"
            textClassName={cn(typo.headingS, "text-foreground")}
          >
            {member.name}
          </TruncateHoverMarquee>
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0 bg-muted text-muted-foreground",
            )}
          >
            {member.role}
          </span>
        </div>

        <ContactRow icon={Mail02Icon}>{member.email}</ContactRow>
        <ContactRow icon={Call02Icon}>{member.phone}</ContactRow>
        <ContactRow icon={Briefcase01Icon}>
          {`${member.experienceYears} Years Experience`}
        </ContactRow>
      </div>
    </motion.article>
  );
}

export function MedicalStaffSection({
  members,
}: {
  members: MedicalStaffMember[];
}) {
  return (
    <section className={cn(dashboardCardClass, "flex flex-col gap-4 p-6")}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <SectionTitle className="flex-none pr-0 text-foreground">
          Medical Staff
        </SectionTitle>
        <p className={typo.bodyM}>
          Doctors, nurses, and care coordinators assigned to you.
        </p>
      </div>
      <div className={memberPortraitCardGridClass}>
        {members.map((member) => (
          <MedicalStaffCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
