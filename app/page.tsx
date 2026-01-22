import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Users, Video, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";

export const metadata: Metadata = {
  title: "Home",
  description:
    "A complete business ecosystem designed for visionary founders, leaders, and enterprises seeking an environment that reflects their standard of excellence.",
};

const services = [
  {
    title: "Event Space",
    description: "Sophisticated venues for conferences, board meetings, and corporate gatherings.",
    icon: Building2,
    image: "/assets/service-event.jpg",
    href: "/services#event-space",
  },
  {
    title: "Lounge Suite",
    description: "Premium relaxation spaces designed for professional comfort and private conversations.",
    icon: Users,
    image: "/assets/service-lounge.jpg",
    href: "/services#lounge",
  },
  {
    title: "Virtual Offices",
    description: "Professional business presence with mail handling, call answering, and registered addresses.",
    icon: Briefcase,
    image: "/assets/service-virtual.jpg",
    href: "/services#virtual-offices",
  },
  {
    title: "Media Services",
    description: "State-of-the-art studios for podcasts, video production, and professional content creation.",
    icon: Video,
    image: "/assets/service-media.jpg",
    href: "/services#media",
  },
];

const differentiators = [
  "Premium, professional-grade experience",
  "Flexible booking with transparent pricing",
  "Professional and reliable service",
  "Prime business district location",
  "Dedicated concierge support",
  "Modern, well-appointed facilities",
];

const testimonials = [
  {
    quote: "Visionary House has transformed how we conduct business meetings. The facilities are impeccable, and the service is consistently exceptional.",
    author: "Victoria Chen",
    title: "CEO, Meridian Capital",
  },
  {
    quote: "A truly premium experience. From booking to departure, every detail is handled with professionalism and care.",
    author: "Marcus Thompson",
    title: "Managing Director, Atlas Ventures",
  },
  {
    quote: "The virtual office service has given our startup the credibility we needed. Highly recommend to any serious business.",
    author: "Sarah Mitchell",
    title: "Founder, Catalyst Tech",
  },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-premium text-center text-primary-foreground py-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-6 animate-fade-in">
              Welcome to Visionary House
            </p>
            <h1 className="heading-display text-primary-foreground mb-6 animate-fade-in-delay-1">
              Where Business
              <br />
              <span className="text-accent">Excellence</span> Meets
              <br />
              Premium Experience
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in-delay-2">
              A complete business ecosystem designed for visionary founders, leaders, and enterprises 
              seeking an environment that reflects their standard of excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
              <Link href="/book">
                <Button variant="hero" size="xl">
                  Book Your Experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="hero-outline" size="xl">
                  Explore Services
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {/*<div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">*/}
        {/*  <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-2">*/}
        {/*    <div className="w-1.5 h-3 bg-accent rounded-full" />*/}
        {/*  </div>*/}
        {/*</div>*/}
      </section>

      {/* Services Preview Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
              Our Services
            </p>
            <h2 className="heading-section text-foreground mb-6">
              A Complete Business Ecosystem
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              From prestigious event spaces to professional virtual offices, we provide 
              everything your business needs to project confidence and success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Link 
                key={service.title} 
                href={service.href}
                className="group card-premium overflow-hidden"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-md mb-6 relative">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <service.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="heading-card text-foreground mb-2 group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button variant="premium-outline" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding bg-secondary">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
                Why Choose Us
              </p>
              <h2 className="heading-section text-foreground mb-6">
                Trusted by Industry Leaders
              </h2>
            <p className="text-body mb-8">
              We understand that your business environment reflects your professional 
              standards. Visionary House provides the premium experience your reputation demands.
            </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {differentiators.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden shadow-elevated relative">
                <Image
                  src="/assets/service-lounge.jpg"
                  alt="Premium professional lounge"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground p-8 rounded-lg shadow-elevated hidden md:block">
                <p className="font-heading text-4xl font-bold text-accent mb-1">500+</p>
                <p className="text-sm text-primary-foreground/70">Visionary clients trust us</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
              Testimonials
            </p>
            <h2 className="heading-section text-foreground">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-premium">
                <div className="mb-6">
                  <svg className="h-8 w-8 text-accent/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="border-t border-border pt-6">
                  <p className="font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container-premium text-center">
          <h2 className="heading-section text-primary-foreground mb-6">
            Ready to Elevate Your Business?
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto mb-10">
            Experience the premium environment your business deserves.
            Schedule a visit or book your space today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button variant="hero" size="xl">
                Book Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="hero-outline" size="xl">
                Schedule a Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

