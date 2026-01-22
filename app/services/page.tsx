import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Building2, Users, Briefcase, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";

export const metadata: Metadata = {
  title: "Services",
  description:
    "From event hosting to virtual presence, we provide comprehensive solutions designed for professional businesses. Explore our event spaces, lounge suites, virtual offices, and media services.",
};

const services = [
  {
    id: "event-space",
    title: "Event Space",
    subtitle: "Premium Venues for Every Occasion",
    icon: Building2,
    image: "/assets/service-event.jpg",
    description: "Our sophisticated event spaces are designed to accommodate everything from intimate board meetings to large-scale corporate conferences. Each venue features state-of-the-art technology, elegant furnishings, and impeccable attention to detail.",
    features: [
      "Boardrooms for 4-20 attendees",
      "Conference halls for up to 100 guests",
      "Advanced AV equipment included",
      "High-speed fiber connectivity",
      "Catering services available",
      "Dedicated event coordinator",
      "Flexible room configurations",
      "Climate-controlled environment",
    ],
  },
  {
    id: "lounge",
    title: "Lounge Suite",
    subtitle: "Professional Comfort & Privacy",
    icon: Users,
    image: "/assets/service-lounge.jpg",
    description: "The Lounge Suite offers an exclusive retreat for professionals seeking a refined environment for relaxation, informal meetings, or focused work. Designed with premium materials and thoughtful amenities, it provides the perfect balance of comfort and professionalism.",
    features: [
      "Private meeting alcoves",
      "Premium leather seating",
      "Complimentary refreshments",
      "High-speed WiFi throughout",
      "Business center access",
      "Quiet work zones",
      "Concierge service",
      "Secure lockers",
    ],
  },
  {
    id: "virtual-offices",
    title: "Virtual Offices",
    subtitle: "Professional Presence, Maximum Flexibility",
    icon: Briefcase,
    image: "/assets/service-virtual.jpg",
    description: "Establish a prestigious business address without the overhead of traditional office space. Our virtual office solutions provide the professional infrastructure your business needs, with the flexibility to work from anywhere.",
    features: [
      "Prime business district address",
      "Professional mail handling",
      "Call answering service",
      "Meeting room credits included",
      "Business registration support",
      "Personalized phone number",
      "Package receiving & forwarding",
      "Access to lounge facilities",
    ],
  },
  {
    id: "media",
    title: "Media Services",
    subtitle: "Professional Content Production",
    icon: Video,
    image: "/assets/service-media.jpg",
    description: "Our state-of-the-art media studios are equipped for professional-grade podcast recording, video production, and content creation. Whether you're launching a corporate podcast or producing training videos, we provide the tools and environment for excellence.",
    features: [
      "Soundproofed recording studios",
      "Professional lighting setup",
      "4K video capabilities",
      "Podcast-ready equipment",
      "Green screen available",
      "Technical support on-site",
      "Post-production services",
      "Content strategy consulting",
    ],
  },
];

export default function Services() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-hero">
        <div className="container-premium text-center">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
            Our Services
          </p>
          <h1 className="heading-display text-primary-foreground mb-6">
            Everything Your Business Needs
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            From event hosting to virtual presence, we provide comprehensive 
            solutions designed for professional businesses.
          </p>
        </div>
      </section>

      {/* Services Detail Sections */}
      {services.map((service, index) => (
        <section 
          key={service.id} 
          id={service.id}
          className={`section-padding ${index % 2 === 0 ? 'bg-background' : 'bg-secondary'}`}
        >
          <div className="container-premium">
            <div className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={index % 2 !== 0 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <service.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-accent font-medium tracking-widest uppercase text-xs">
                      {service.subtitle}
                    </p>
                  </div>
                </div>
                <h2 className="heading-section text-foreground mb-6">
                  {service.title}
                </h2>
                <p className="text-body mb-8">
                  {service.description}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-accent" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/book">
                  <Button variant="gold" size="lg">
                    Book {service.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className={index % 2 !== 0 ? 'lg:order-1' : ''}>
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-elevated relative">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="section-padding bg-primary">
        <div className="container-premium text-center">
          <h2 className="heading-section text-primary-foreground mb-6">
            Need a Custom Solution?
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto mb-10">
            Our team can create bespoke packages tailored to your specific business 
            requirements. Contact us to discuss your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="hero" size="xl">
                Request a Quote
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="hero-outline" size="xl">
                Book Standard Service
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

