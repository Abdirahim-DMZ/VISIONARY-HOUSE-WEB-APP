"use client";

import { useRef, useState, useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { PageHero } from "@/components/sections";
import { motion, useInView } from "framer-motion";

const policies = [

  {
    id: "privacy",
    title: "Privacy Policy",
    content: [
      {
        heading: "Information Collection",
        text: "We collect personal information necessary to provide our services, including name, contact details, and payment information. This data is collected only with your consent and for legitimate business purposes.",
      },
      {
        heading: "Data Usage",
        text: "Your information is used solely to process bookings, communicate about services, and improve your experience. We do not sell or share your personal data with third parties for marketing purposes.",
      },
      {
        heading: "Data Security",
        text: "We implement industry-standard security measures to protect your personal information. All payment processing is conducted through secure, PCI-compliant systems.",
      },
      {
        heading: "Your Rights",
        text: "You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at privacy@visionaryhouse.com.",
      },
      {
        heading: "Cookies",
        text: "Our website uses cookies to enhance user experience and analyze site traffic. You may adjust your browser settings to refuse cookies, though this may limit some functionality.",
      },
    ],
  },
  {
    id: "media",
    title: "Media & Photography Policy",
    content: [
      {
        heading: "On-Site Photography",
        text: "Photography and video recording for personal and business use is permitted within your booked space. Professional media productions require advance approval.",
      },
      {
        heading: "Social Media Usage",
        text: "We encourage guests to share their experience on social media. Please tag @VisionaryHouse and use #VisionaryHouse when posting.",
      },
      {
        heading: "Privacy of Other Guests",
        text: "Please be respectful of other guests' privacy. Do not photograph or record individuals without their explicit consent.",
      },
      {
        heading: "Marketing Permissions",
        text: "By using our facilities, you may be asked to provide consent for Visionary House to use photographs or videos featuring you for marketing purposes. Participation is entirely voluntary.",
      },
      {
        heading: "Media Studio Usage",
        text: "Professional equipment and studio usage is subject to our media services agreement. All content created remains the property of the client unless otherwise agreed.",
      },
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation Policy",
    content: [
      {
        heading: "Standard Cancellations",
        text: "Cancellations made 48 hours or more before the scheduled booking will receive a full refund. Cancellations made 24-48 hours prior will receive a 50% refund. Cancellations made less than 24 hours before the booking are non-refundable.",
      },
      {
        heading: "Event Space Bookings",
        text: "For event space reservations, we require 7 days notice for a full refund. Cancellations made 3-7 days prior will receive a 50% refund. Cancellations made less than 3 days before are non-refundable.",
      },
      {
        heading: "Force Majeure",
        text: "In cases of force majeure (natural disasters, government restrictions, etc.), we will work with you to reschedule or provide store credit for future use.",
      },
      {
        heading: "Rescheduling",
        text: "Bookings may be rescheduled free of charge up to 24 hours before the original booking time, subject to availability.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment Terms",
    content: [
      {
        heading: "Accepted Payment Methods",
        text: "We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and corporate invoicing for established accounts.",
      },
      {
        heading: "Deposit Requirements",
        text: "Event space bookings require a 50% deposit at the time of booking. The remaining balance is due 48 hours before the event date.",
      },
      {
        heading: "Corporate Accounts",
        text: "Approved corporate accounts may request NET 30 payment terms. Please contact our accounts team to apply for corporate billing privileges.",
      },
      {
        heading: "Additional Charges",
        text: "Any additional services or overtime charges incurred during your booking will be invoiced within 5 business days following your event.",
      },
    ],
  },
];

export default function Policies() {
  const navSectionRef = useRef<HTMLDivElement>(null);
  const policiesSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const navInView = useInView(navSectionRef, { amount: 0.2, once: false });
  const policiesInView = useInView(policiesSectionRef, { amount: 0.05, once: false });
  const contactInView = useInView(contactSectionRef, { amount: 0.1, once: false });
  const [navKey, setNavKey] = useState(0);
  const [policiesKey, setPoliciesKey] = useState(0);
  const [contactKey, setContactKey] = useState(0);
  const prevNavInView = useRef(false);
  const prevPoliciesInView = useRef(false);
  const prevContactInView = useRef(false);

  useEffect(() => {
    if (navInView && !prevNavInView.current) setNavKey((k) => k + 1);
    prevNavInView.current = navInView;
  }, [navInView]);

  useEffect(() => {
    if (policiesInView && !prevPoliciesInView.current) setPoliciesKey((k) => k + 1);
    prevPoliciesInView.current = policiesInView;
  }, [policiesInView]);

  useEffect(() => {
    if (contactInView && !prevContactInView.current) setContactKey((k) => k + 1);
    prevContactInView.current = contactInView;
  }, [contactInView]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Layout>
      <PageHero
        eyebrow="Legal"
        title="Policies & Terms"
        description="Transparency is fundamental to trust. Review our policies to understand how we operate and protect your interests."
        backgroundImage="/assets/4.jpg"
        sectionClassName="py-32 md:py-40 overflow-hidden"
        titleClassName="text-primary-foreground"
        eyebrowClassName="text-accent font-medium tracking-widest uppercase text-sm mb-4"
      />

      {/* Quick Navigation */}
      <section ref={navSectionRef} className="py-8 bg-secondary border-b border-border">
        <div className="container-premium">
          <motion.div
            key={navKey}
            className="flex flex-wrap justify-center gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2, margin: "50px 0px 50px 0px" }}
          >
            {policies.map((policy) => (
              <motion.a
                key={policy.id}
                href={`#${policy.id}`}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
                variants={fadeInUp}
              >
                {policy.title}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Policies Content */}
      <section ref={policiesSectionRef} className="section-padding bg-background min-h-[400px]">
        <div className="container-premium">
          <div className="max-w-4xl mx-auto space-y-16">
            {policies.map((policy, index) => (
              <motion.div
                key={`${policy.id}-${policiesKey}`}
                id={policy.id}
                className="scroll-mt-32"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15, margin: "50px 0px 50px 0px" }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <span className="shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-heading font-bold">
                    {index + 1}
                  </span>
                  <h2 className="heading-section text-foreground">{policy.title}</h2>
                </div>
                <motion.div
                  className="space-y-8 pl-14"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: false, amount: 0.1, margin: "50px 0px 50px 0px" }}
                >
                  {policy.content.map((section, sectionIndex) => (
                    <motion.div key={sectionIndex} variants={fadeInUp}>
                      <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                        {section.heading}
                      </h3>
                      <p className="text-body">
                        {section.text}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
                {index < policies.length - 1 && (
                  <div className="divider-gold mt-16 ml-14" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact for Questions */}
      <section ref={contactSectionRef} className="py-16 bg-secondary">
        <motion.div
          key={contactKey}
          className="container-premium text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15, margin: "50px 0px 50px 0px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="heading-section mb-4">
            Questions About Our Policies?
          </h3>
          <p className="text-body mb-6">
            Our team is happy to clarify any points. Contact us at{" "}
            <a
              href="mailto:legal@visionaryhouse.com"
              className="text-accent hover:underline"
            >
              legal@visionaryhouse.com
            </a>
          </p>
          <p className="text-small">
            Last updated: January 2026
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}
