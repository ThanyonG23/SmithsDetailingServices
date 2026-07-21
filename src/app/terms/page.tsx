import type { Metadata } from "next";
import LegalPage, { LegalSection, LegalList } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms & Conditions | Smiths Detailing Services",
  description:
    "The terms that apply when you book car detailing with Smiths Detailing Services in Cairns.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="21 July 2026"
      intro={`These terms apply when you book or receive detailing services from ${BUSINESS.name}. By booking with us, you agree to them. We've kept them in plain English.`}
    >
      <LegalSection heading="1. Who we are">
        <p>
          {BUSINESS.name} is a car detailing business operating from {BUSINESS.address}. You can
          reach us on {BUSINESS.phone} or at {BUSINESS.email}.
        </p>
      </LegalSection>

      <LegalSection heading="2. Quotes and pricing">
        <p>
          Any price we give you by text, phone or email is an estimate based on the information you
          give us about your vehicle and what it needs.
        </p>
        <p>
          We confirm the final price once we&apos;ve seen the vehicle in person. If the condition is
          significantly different to what was described (for example heavy pet hair, mould, smoke
          damage, excessive soiling, or paint in worse condition than expected), the job may take
          longer and cost more. We&apos;ll always tell you and get your approval before doing extra
          work or charging more.
        </p>
      </LegalSection>

      <LegalSection heading="3. Bookings">
        <p>
          Bookings are made by text message, phone or email. Your booking is confirmed once
          we&apos;ve replied and agreed a day with you.
        </p>
        <p>
          Timeframes we give are estimates. Detailing times vary with the size and condition of the
          vehicle. We&apos;ll keep you updated if a job is running longer than expected.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cancellations and no-shows">
        <p>
          If you need to cancel or reschedule, please let us know as early as you reasonably can so
          we can offer the spot to someone else. We understand things come up.
        </p>
        <p>
          If you don&apos;t show up without letting us know, or repeatedly cancel at the last
          minute, we may ask for a deposit before booking you in again.
        </p>
      </LegalSection>

      <LegalSection heading="5. Payment">
        <p>
          Payment is due when the work is finished and the vehicle is ready for collection, unless
          we&apos;ve agreed something different with you in writing.
        </p>
      </LegalSection>

      <LegalSection heading="6. Our satisfaction guarantee">
        <p>
          <strong className="text-brand-green">If you&apos;re not happy, you don&apos;t pay.</strong>{" "}
          We mean it. If you&apos;re not satisfied with the work we&apos;ve done, tell us at
          collection or as soon as reasonably possible afterwards, and we&apos;ll put it right at no
          extra cost. If we can&apos;t make it right, you don&apos;t pay for that service.
        </p>
        <p>
          To be clear about what this covers: it applies to the quality of the detailing work we
          performed. It doesn&apos;t cover pre-existing damage, faults unrelated to our work, normal
          wear and tear, or results we told you upfront couldn&apos;t be achieved on your vehicle.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your vehicle and personal belongings">
        <LegalList
          items={[
            "Please remove cash, wallets, phones, sunglasses, tools, paperwork and anything else valuable before you drop your vehicle off.",
            "We take care with your property, but we are not responsible for loss of or damage to personal items left in the vehicle.",
            "Please make sure the vehicle is registered and roadworthy if it needs to be moved.",
            "Let us know about anything we should be aware of, such as loose trim, aftermarket paint or wrap, existing damage, or parts that need special care.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="8. What detailing can and can't do">
        <p>
          Detailing dramatically improves how a vehicle looks, but it isn&apos;t panel work and it
          can&apos;t undo everything. Depending on your vehicle&apos;s condition, some things may not
          be fully removable, including deep scratches and chips, etched or sun-damaged paint,
          permanent stains, burns, tears, cracked trim, and long-standing odours.
        </p>
        <p>
          Paint correction works by removing a very fine layer of clear coat. On vehicles with thin,
          previously repainted or already heavily corrected paint, there are limits to what can be
          done safely. We&apos;ll always tell you what&apos;s realistically achievable before we
          start.
        </p>
      </LegalSection>

      <LegalSection heading="9. Photos and marketing">
        <p>
          We often photograph and film the vehicles we work on and share them on our website and
          social media. If you&apos;d prefer we didn&apos;t use images of your vehicle, just tell us
          — before or after the job — and we&apos;ll leave it out or remove it.
        </p>
      </LegalSection>

      <LegalSection heading="10. Your rights under Australian Consumer Law">
        <p>
          Our services come with guarantees that cannot be excluded under the Australian Consumer
          Law. Nothing in these terms excludes, restricts or modifies any right or remedy you have
          under that law.
        </p>
        <p>
          To the extent permitted by law, and other than those guarantees, our liability is limited
          to re-supplying the service or paying the reasonable cost of having it re-supplied.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to these terms">
        <p>
          We may update these terms from time to time. The version published on this page at the
          time of your booking is the one that applies to you.
        </p>
      </LegalSection>

      <LegalSection heading="12. Governing law">
        <p>These terms are governed by the laws of Queensland, Australia.</p>
      </LegalSection>
    </LegalPage>
  );
}
