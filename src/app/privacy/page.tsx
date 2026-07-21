import type { Metadata } from "next";
import LegalPage, { LegalSection, LegalList } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy | Smiths Detailing Services",
  description:
    "How Smiths Detailing Services collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="21 July 2026"
      intro={`This policy explains what personal information ${BUSINESS.name} collects, why we collect it, and what we do with it. We keep it simple: we only collect what we need to quote and do your job, and we don't sell it to anyone.`}
    >
      <LegalSection heading="1. What we collect">
        <p>The information we collect is what you give us when you get in touch or book a job:</p>
        <LegalList
          items={[
            "Your name and contact details (mobile number, and email address if you use it).",
            "Details about your vehicle: make, model, condition, and what you'd like done.",
            "The content of messages you send us by text, email or social media.",
            "Photos and video of your vehicle taken while we work on it.",
            "Your address, only if it's relevant to the job or an invoice.",
          ]}
        />
        <p>
          We don&apos;t collect or store your payment card details. We don&apos;t ask for sensitive
          information (like health or financial records), and you don&apos;t need to give us any.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we collect it">
        <p>
          Almost always directly from you: by text message, phone call, email, social media message,
          or in person when you drop your vehicle off.
        </p>
      </LegalSection>

      <LegalSection heading="3. Why we use it">
        <LegalList
          items={[
            "To give you a quote and answer your questions.",
            "To book your vehicle in and confirm the day.",
            "To contact you about your job, including when your vehicle is ready.",
            "To invoice you and keep our business records.",
            "To improve our service.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Text messages">
        <p>
          Our website&apos;s main contact button opens your own messaging app with a pre-filled
          message. Nothing is sent until you press send — we only receive your number and message
          once you choose to send it.
        </p>
        <p>
          We use your number to talk to you about your quote and your job. We won&apos;t add you to
          marketing texts unless you&apos;ve agreed to it, and you can tell us to stop contacting you
          at any time.
        </p>
      </LegalSection>

      <LegalSection heading="5. Photos of your vehicle">
        <p>
          We may photograph or film your vehicle and share the results on our website and social
          media. If you&apos;d rather we didn&apos;t, just tell us and we won&apos;t — or we&apos;ll
          take it down if it&apos;s already up.
        </p>
      </LegalSection>

      <LegalSection heading="6. Who we share it with">
        <p>
          We don&apos;t sell your information, and we don&apos;t share it for anyone else&apos;s
          marketing. We only share it where we need to run the business, for example:
        </p>
        <LegalList
          items={[
            "Our website host and email provider, who store data on our behalf.",
            "Our accountant or bookkeeper, for invoicing and tax records.",
            "Anyone we're required to share it with by law.",
          ]}
        />
        <p>
          If you leave us a Google review, that review and whatever name you use are public on
          Google, and are governed by Google&apos;s own privacy policy rather than this one.
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookies and analytics">
        <p>
          This website doesn&apos;t use advertising or tracking cookies, and we don&apos;t run
          analytics that profile you. Our host may keep standard server logs (such as IP addresses)
          for security and reliability. If we add analytics later, we&apos;ll update this page.
        </p>
      </LegalSection>

      <LegalSection heading="8. How we store and protect it">
        <p>
          Your information is kept on password-protected phones, computers and reputable cloud
          services. We take reasonable steps to protect it from misuse, loss and unauthorised
          access.
        </p>
        <p>
          We keep it only as long as we need it for the job and our record-keeping obligations, then
          delete it or let it lapse.
        </p>
      </LegalSection>

      <LegalSection heading="9. Accessing or correcting your information">
        <p>
          You can ask us what information we hold about you, ask us to correct it, or ask us to
          delete it. Contact us using the details below and we&apos;ll deal with it promptly. There
          may be occasions where we need to keep certain records (for example tax records) even
          after a deletion request.
        </p>
      </LegalSection>

      <LegalSection heading="10. Complaints">
        <p>
          If you&apos;re unhappy with how we&apos;ve handled your information, please contact us
          first — we&apos;d like the chance to fix it. If you&apos;re still not satisfied, you can
          contact the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to this policy">
        <p>
          We may update this policy from time to time. The current version is always the one
          published on this page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
