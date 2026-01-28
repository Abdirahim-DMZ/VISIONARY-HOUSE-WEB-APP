"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Building2, Users, Briefcase, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { motion } from "framer-motion";

const services = [
  {
    id: "event-space",
    title: "Event Space",
    subtitle: "Premium Venues for Every Occasion",
    icon: Building2,
    image: "/assets/1.jpg",
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
    image: "/assets/2.jpg",
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
    image: "/assets/3.jpg",
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
    image: "/assets/4.jpg",
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
  // Animation variants matching Home and About pages
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative section-padding">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/1.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        <motion.div 
          className="relative z-10 container-premium text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p 
            className="text-accent font-medium tracking-widest uppercase text-sm mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our Services
          </motion.p>
          <motion.h1 
            className="heading-display text-primary-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Everything Your Business Needs
          </motion.h1>
          <motion.p 
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            From event hosting to virtual presence, we provide comprehensive 
            solutions designed for professional businesses.
          </motion.p>
        </motion.div>
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
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className={index % 2 !== 0 ? 'lg:order-2' : ''}
              >
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
                <motion.div 
                  className="grid sm:grid-cols-2 gap-3 mb-8"
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: false, amount: 0.2 }}
                >
                  {service.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={fadeInUp}
                      className="flex items-center gap-3"
                    >
                      <div className="shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-accent" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>
                <Link href="/book">
                  <Button variant="gold" size="lg" className="group">
                    Book {service.title}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className={index % 2 !== 0 ? 'lg:order-1' : ''}
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-elevated relative group">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="section-padding">
        <motion.div 
          className="container-premium text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-section text-foreground mb-6">
            Need a Custom Solution?
          </h2>
          <p className="text-body max-w-2xl mx-auto mb-10">
            Our team can create bespoke packages tailored to your specific business 
            requirements. Contact us to discuss your needs.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link href="/contact">
              <Button variant="gold" size="xl" className="bg-[#B08D39] text-[#FFF]">
                Request a Quote
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="premium-outline" size="xl">
                Book Standard Service
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}

