"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Call02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { dashboardCardClass, statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type { MedicalStaffMember } from "../data/care-team-data";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

const staffCardVariants = {
  rest: {
    y: 0,
    boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)",
    borderColor: "var(--border)",
  },
  hover: {
    y: -3,
    boxShadow: "0px 8px 20px rgba(17, 24, 39, 0.10)",
    borderColor: "var(--border)",
  },
  tap: {
    y: -1,
    scale: 0.985,
    boxShadow: "0px 4px 12px rgba(17, 24, 39, 0.08)",
  },
};

const staffImageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

function ContactRow({
  icon,
  children,
}: {
  icon: typeof Mail01Icon;
  children: string;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <span className="inline-flex size-5 shrink-0 text-muted-foreground" aria-hidden>
        <HugeiconsIcon
          icon={icon}
          size={ICON_SIZE}
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
  const nameRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const container = nameRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const update = () => {
      const overflow = measure.scrollWidth - container.clientWidth;
      setShift(overflow > 1 ? overflow : 0);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [member.name]);

  const marquee = shift > 0 && hovered && !reduceMotion;

  return (
    <motion.article
      initial="rest"
      whileHover={reduceMotion ? undefined : "hover"}
      whileTap={reduceMotion ? undefined : "tap"}
      variants={staffCardVariants}
      transition={{ duration: 0.32, ease: CARD_EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex w-61.5 shrink-0 flex-col gap-4 rounded-lg border border-solid border-border bg-card p-0.75"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-md">
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

      <div className="flex flex-col gap-2 p-4">
        <div className="flex min-w-0 items-center gap-2">
          <div ref={nameRef} className="relative min-w-0 flex-1 overflow-hidden">
            <span
              ref={measureRef}
              className={cn(typo.headingL, "invisible absolute whitespace-nowrap")}
              aria-hidden
            >
              {member.name}
            </span>
            <motion.h3
              title={shift > 0 ? member.name : undefined}
              className={cn(
                typo.headingL,
                "min-w-0 whitespace-nowrap text-foreground",
                marquee ? "inline-block" : "truncate",
              )}
              animate={marquee ? { x: [0, -shift, 0] } : { x: 0 }}
              transition={
                marquee
                  ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  : undefined
              }
            >
              {member.name}
            </motion.h3>
          </div>
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0 bg-sidebar-accent text-muted-foreground",
            )}
          >
            {member.role}
          </span>
        </div>

        <ContactRow icon={Mail01Icon}>{member.email}</ContactRow>
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
      <SectionTitle
        info="Doctors, nurses, and care coordinators assigned to you, with contact details and experience."
        className="flex-none pr-0 text-foreground"
      >
        Medical Staff
      </SectionTitle>
      <div className="flex flex-wrap justify-center gap-dash-gutter lg:justify-start">
        {members.map((member) => (
          <MedicalStaffCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
