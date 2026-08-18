import type { Metadata } from 'next';
import { LegalDocument, LegalSection } from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Privacy Policy | Nivarak',
  description: 'How Nivarak collects, uses, and protects personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="17 August 2026"
      showBackLink={false}
    >
      <LegalSection title="1. Information we collect">
        <p>
          Nivarak collects account details such as your name, email, and phone number,
          along with care-related information you or authorised users enter on the
          platform. We also collect limited technical data needed to operate and secure
          the service.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>
          We use this information to create and manage your account, provide assessment
          and care management features, communicate about the service, and protect the
          security and integrity of Nivarak.
        </p>
      </LegalSection>

      <LegalSection title="3. Sharing">
        <p>
          Care information is shared only with users who are authorised for that patient
          or organisation. We do not sell personal information. Service providers who
          help us operate Nivarak may process data only as needed to provide those
          services.
        </p>
      </LegalSection>

      <LegalSection title="4. Retention and security">
        <p>
          We retain information for as long as needed to provide the service and meet
          legal or clinical record requirements. We use administrative, technical, and
          organisational measures to protect personal data.
        </p>
      </LegalSection>

      <LegalSection title="5. Your choices">
        <p>
          You may request access to, correction of, or deletion of personal information
          associated with your account, subject to applicable law and care-record
          obligations. Contact your Nivarak administrator to make a request.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          If you have questions about this privacy policy, contact your Nivarak
          administrator.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
