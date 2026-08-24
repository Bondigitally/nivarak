import type { Metadata } from 'next';
import { LegalDocument, LegalSection } from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Nivarak',
  description: 'Terms and conditions for using Nivarak.',
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      lastUpdated="17 August 2026"
      showBackLink={false}
    >
      <LegalSection title="1. Agreement">
        <p>
          These Terms & Conditions govern your access to and use of Nivarak, including
          elderly independence assessment and care management services. By creating an
          account or using the platform, you agree to these terms.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be authorised to use Nivarak in your role as a clinician, caregiver,
          administrator, or other permitted user. You are responsible for keeping your
          account credentials confidential and for activity that occurs under your account.
        </p>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <p>
          You agree to use Nivarak only for lawful care-related purposes. You must not
          attempt to access data you are not authorised to view, interfere with the
          service, or misuse patient or caregiver information.
        </p>
      </LegalSection>

      <LegalSection title="4. Clinical and care information">
        <p>
          Nivarak supports assessment and care coordination. It does not replace
          professional clinical judgement, emergency services, or in-person care. You
          remain responsible for decisions made in your professional or caregiving role.
        </p>
      </LegalSection>

      <LegalSection title="5. Changes">
        <p>
          We may update these terms from time to time. Continued use of Nivarak after
          changes take effect constitutes acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          If you have questions about these terms, contact your Nivarak administrator.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
