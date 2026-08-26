"use client";

import { useState } from "react";
import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { EditProfileSection } from "@/features/settings/components/EditProfileSection";
import { NotificationsSettingsCard } from "@/features/settings/components/NotificationsSettingsCard";
import { PrivacySettingsCard } from "@/features/settings/components/PrivacySettingsCard";
import { ProfileSettingsCard } from "@/features/settings/components/ProfileSettingsCard";
import { SecuritySettingsCard } from "@/features/settings/components/SecuritySettingsCard";
import {
  getSettingsData,
  type SettingsProfile,
} from "@/features/settings/data/settings-data";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const home = getHomeDashboardData();
  const initial = getSettingsData();
  const [profile, setProfile] = useState<SettingsProfile>(initial.profile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState(initial.notifications);

  return (
    <DashboardPageFrame notificationCount={home.notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        {editingProfile ? (
          <EditProfileSection
            profile={profile}
            languageOptions={initial.languageOptions}
            onDiscard={() => setEditingProfile(false)}
            onSave={(next) => {
              setProfile(next);
              setEditingProfile(false);
            }}
          />
        ) : (
          <ProfileSettingsCard
            profile={profile}
            languageOptions={initial.languageOptions}
            language={profile.preferredLanguage}
            onLanguageChange={(value) => {
              setProfile((current) => ({
                ...current,
                preferredLanguage: value,
              }));
            }}
            onEditProfile={() => setEditingProfile(true)}
          />
        )}

        <NotificationsSettingsCard
          preferences={notifications}
          onToggle={(id, enabled) => {
            setNotifications((current) =>
              current.map((item) =>
                item.id === id ? { ...item, enabled } : item,
              ),
            );
          }}
        />

        <PrivacySettingsCard
          title={initial.consentSummary.title}
          body={initial.consentSummary.body}
        />

        <SecuritySettingsCard
          notice={initial.securityNotice}
          sessions={initial.sessions}
        />
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
