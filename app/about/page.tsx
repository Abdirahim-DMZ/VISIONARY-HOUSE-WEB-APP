import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Shield, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Visionary House is where ambition meets sophistication—a premium business environment designed for those who demand excellence.",
};

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We maintain the highest standards in every aspect of our service, from facilities to client interactions.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Your business dealings require discretion and reliability. We uphold unwavering confidentiality and dependability.",
  },
  {
    icon: Users,
    title: "Professionalism",
    description: "Our team embodies the professionalism that reflects positively on every client who walks through our doors.",
  },
  {
    icon: Clock,
    title: "Flexibility",
    description: "Business demands adaptability. Our services are designed to accommodate your evolving needs seamlessly.",
  },
];

const stats = [
  { value: "10+", label: "Years of Excellence" },
  { value: "500+", label: "Visionary Clients" },
  { value: "2,000+", label: "Events Hosted" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 md:py-40">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        <div className="relative z-10 container-premium text-center">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
            About Us
          </p>
          <h1 className="heading-display text-primary-foreground mb-6">
            The Complete Business Ecosystem
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Visionary House is where ambition meets sophistication—a premium business 
            environment designed for those who demand excellence.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
                Our Story
              </p>
              <h2 className="heading-section text-foreground mb-6">
                Built for Business Leaders
              </h2>
              <div className="space-y-4 text-body">
                <p>
                  Visionary House was founded with a singular vision: to create a business 
                  environment that matches the caliber of the professionals who use it. 
                  We recognized that visionary founders, leaders, and enterprises deserve more 
                  than generic office spaces—they deserve an ecosystem that elevates 
                  their work.
                </p>
                <p>
                  Today, Visionary House stands as a testament to that vision. Our facilities 
                  combine architectural elegance with practical functionality, creating 
                  spaces where important decisions are made, relationships are forged, 
                  and businesses thrive.
                </p>
                <p>
                  From intimate boardroom meetings to large-scale corporate events, 
                  from virtual office solutions to professional media production, we 
                  provide the complete infrastructure for business success.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/services">
                  <Button variant="premium" size="lg">
                    Explore Our Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-elevated relative">
                <Image
                  src="/assets/hero-bg.jpg"
                  alt="Professional boardroom"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="divider-gold w-24 absolute -bottom-4 left-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="container-premium">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-heading text-4xl md:text-5xl font-bold text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
              Our Values
            </p>
            <h2 className="heading-section text-foreground mb-6">
              The Principles That Guide Us
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Every interaction, every space, and every service at Visionary House 
              is shaped by our unwavering commitment to these core values.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card-premium text-center">
                <div className="inline-flex p-4 bg-secondary rounded-full mb-6">
                  <value.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="heading-card text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-primary">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
              Our Mission
            </p>
            <h2 className="heading-section text-primary-foreground mb-8">
              &quot;To provide an unparalleled professional experience that empowers 
              business leaders to focus on what matters most—their success.&quot;
            </h2>
            <div className="divider-gold mx-auto" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-background">
        <div className="container-premium text-center">
          <h2 className="heading-section text-foreground mb-6">
            Experience Visionary House
          </h2>
          <p className="text-body max-w-2xl mx-auto mb-10">
            We invite you to discover the difference a premium business environment 
            can make. Schedule a private tour of our facilities today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="gold" size="xl">
                Schedule a Tour
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="premium-outline" size="xl">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

