import Link from "next/link";
import { Mail, Phone, MapPin, Linkedin, Instagram } from "lucide-react";

const footerLinks = {
  services: [
    { label: "Event Space", href: "/services#event-space" },
    { label: "Lounge Suite", href: "/services#lounge" },
    { label: "Virtual Offices", href: "/services#virtual-offices" },
    { label: "Media Services", href: "/services#media" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
    { label: "Book Now", href: "/book" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/policies#privacy" },
    { label: "Cancellation Policy", href: "/policies#cancellation" },
    { label: "Payment Terms", href: "/policies#payment" },
    { label: "Media Policy", href: "/policies#media" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-premium py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-heading text-2xl font-bold tracking-tight">
                Visionary <span className="text-accent">House</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              A premium business ecosystem designed for visionary founders, executives, and enterprises seeking excellence.
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

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={'/'}
                    // href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={'/'}
                    // href={link.href}
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
            <h4 className="font-heading text-lg font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  123 Visionary Boulevard,<br />
                  Business District, City 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent shrink-0" />
                <a
                  href="mailto:info@visionaryhouse.com"
                  className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  info@visionaryhouse.com
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
                href={'/'}
                // href={link.href}
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

