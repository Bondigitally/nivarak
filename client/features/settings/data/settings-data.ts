export type SettingsProfile = {
  fullName: string;
  dateOfBirth: string;
  preferredLanguage: string;
  contactNumber: string;
  residentialAddress: string;
  avatarSrc: string;
};

export type NotificationPreference = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export type ActiveSession = {
  id: string;
  device: string;
  location: string;
  isCurrent: boolean;
};

export type SettingsData = {
  profile: SettingsProfile;
  languageOptions: string[];
  notifications: NotificationPreference[];
  consentSummary: {
    title: string;
    body: string;
    caregiverCount: number;
  };
  sessions: ActiveSession[];
  securityNotice: string;
};

export const MOCK_SETTINGS: SettingsData = {
  profile: {
    fullName: "Albert Hoffman",
    dateOfBirth: "05/12/1948",
    preferredLanguage: "English (US)",
    contactNumber: "+1 (555) 012-3456",
    residentialAddress: "4221 Vintage Way, Suite 100, San Francisco, CA 94103",
    avatarSrc: "/images/settings/profile-avatar.jpg",
  },
  languageOptions: ["English (US)", "English (UK)", "Hindi", "Spanish"],
  notifications: [
    {
      id: "medication",
      title: "Medication reminders",
      description: "Daily alerts for scheduled dosage times",
      enabled: true,
    },
    {
      id: "appointments",
      title: "Appointment updates",
      description: "Confirmations and changes for doctor visits",
      enabled: true,
    },
    {
      id: "vitals",
      title: "Vital sign alerts",
      description: "Notifications for unusual heart rate or oxygen levels",
      enabled: true,
    },
    {
      id: "newsletter",
      title: "Newsletter & Wellness tips",
      description: "Weekly curated health and aging gracefully articles",
      enabled: false,
    },
  ],
  consentSummary: {
    title: "Consent summary",
    body: "Your medical data is encrypted end-to-end. You have authorized 2 caregivers to view your vitals and medication history.",
    caregiverCount: 2,
  },
  sessions: [
    {
      id: "session-1",
      device: "MacBook Pro",
      location: "Mumbai, India",
      isCurrent: true,
    },
  ],
  securityNotice:
    "Logging out all will terminate all active sessions on this and other devices.",
};

export function getSettingsData(): SettingsData {
  return MOCK_SETTINGS;
}
