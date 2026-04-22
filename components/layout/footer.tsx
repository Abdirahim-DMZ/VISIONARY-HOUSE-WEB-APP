 "use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Instagram } from "lucide-react";
import logo from "../../public/assets/logo.png";
import Image from "next/image";

type FooterContactResponse = {
  data?: {
    address?: string;
    contactPhoneNo?: string;
    contactEmail?: string;
  };
};

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
    { label: "Book Now", href: "/book" },
  ],
  services: [
    { label: "Event Space", href: "/services#event-space" },
    { label: "Lounge Suite", href: "/services#lounge" },
    { label: "Virtual Offices", href: "/services#virtual-offices" },
    { label: "Media Services", href: "/services#media" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/policies#privacy" },
    { label: "Cancellation Policy", href: "/policies#cancellation" },
    { label: "Payment Terms", href: "/policies#payment" },
    { label: "Media Policy", href: "/policies#media" },
  ],
};

export function Footer() {
  const fallbackAddress = "123 Visionary Boulevard,\nBusiness District, City 10001";
  const fallbackPhone = "+1 (234) 567-890";
  const fallbackEmail = "info@visionaryhouse.com";
  const [address, setAddress] = useState(fallbackAddress);
  const [contactPhoneNo, setContactPhoneNo] = useState(fallbackPhone);
  const [contactEmail, setContactEmail] = useState(fallbackEmail);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await fetch("/api/contact-page", { cache: "no-store" });
        if (!response.ok) return;
        const json = (await response.json()) as FooterContactResponse;
        if (!isMounted) return;
        setAddress(json.data?.address?.trim() || fallbackAddress);
        setContactPhoneNo(json.data?.contactPhoneNo?.trim() || fallbackPhone);
        setContactEmail(json.data?.contactEmail?.trim() || fallbackEmail);
      } catch {
        // keep fallback values without changing footer UI
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const phoneHref = useMemo(
    () => `tel:${contactPhoneNo.replace(/[^\d+]/g, "")}`,
    [contactPhoneNo],
  );

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-premium py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="relative h-full flex items-center">
                <Image
                    src={logo}
                    alt="Visionary House logo"
                    className="h-full w-32 object-cover"
                    priority
                />
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              A premium business ecosystem designed for visionary founders, executives, and enterprises seeking
              excellence.
            </p>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/60 hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/60 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>



          {/* Company */}
          <div>
            <h4 className="heading-card mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="heading-card mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                  <li key={link.href}>
                    <Link
                        href={link.href}
                        className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="heading-card mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-primary-foreground/70 whitespace-pre-line">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent shrink-0" />
                <a
                  href={phoneHref}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  {contactPhoneNo}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent shrink-0" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Visionary House. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-primary-foreground/50 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

