"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Users, Video, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';

// Hero carousel slides (using existing assets)
const heroSlides = [
  {
    title: "Where Business",

    highlight: "Excellence",
    subtitle: "Meets Premium Experience",
    description: "A complete business ecosystem designed for visionary founders, leaders, and enterprises seeking an environment that reflects their standard of excellence.",
    image: "/assets/1.jpg",
  },
  {
    title: "Premium Event",
    highlight: "Spaces",
    subtitle: "For Visionary Leaders",
    description: "Host conferences, board meetings, and corporate gatherings in our sophisticated venues that reflect your professional standards.",
    image: "/assets/2.jpg",
  },
  {
    title: "Professional",
    highlight: "Virtual Offices",
    subtitle: "Your Business Presence",
    description: "Establish your business with prestigious addresses, mail handling, and call answering services that project confidence.",
    image: "/assets/3.jpg",
  },
];

const services = [
  {
    title: "Event Space",
    description: "Sophisticated venues for conferences, board meetings, and corporate gatherings.",
    icon: Building2,
    image: "/assets/4.jpg",
    href: "/services#event-space",
  },
  {
    title: "Lounge Suite",
    description: "Premium relaxation spaces designed for professional comfort and private conversations.",
    icon: Users,
    image: "/assets/5.jpg",
    href: "/services#lounge",
  },
  {
    title: "Virtual Offices",
    description: "Professional business presence with mail handling, call answering, and registered addresses.",
    icon: Briefcase,
    image: "/assets/6.jpg",
    href: "/services#virtual-offices",
  },
  {
    title: "Media Services",
    description: "State-of-the-art studios for podcasts, video production, and professional content creation.",
    icon: Video,
    image: "/assets/q1.jpg",
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

const faqs = [
  {
    question: "What services does Visionary House offer?",
    answer: "We provide a comprehensive business ecosystem including event spaces for conferences and meetings, premium lounge suites for professional relaxation, virtual office services with mail handling and call answering, and state-of-the-art media studios for content creation.",
  },
  {
    question: "How do I book an event space or meeting room?",
    answer: "You can book spaces through our website by selecting your preferred date, time, and space type. Our team will confirm availability within 24 hours and provide you with all necessary details. For urgent bookings, please contact our concierge team directly.",
  },
  {
    question: "What are the benefits of a virtual office?",
    answer: "Our virtual office services provide your business with a prestigious address, professional mail handling, dedicated phone answering service, and access to meeting rooms when needed. It's perfect for establishing credibility while maintaining flexibility.",
  },
  {
    question: "Are the facilities suitable for corporate events?",
    answer: "Absolutely. Our event spaces are designed specifically for corporate gatherings, from board meetings to large conferences. We offer professional-grade AV equipment, high-speed internet, catering services, and dedicated support staff to ensure your event runs smoothly.",
  },
  {
    question: "What makes Visionary House different from other business centers?",
    answer: "We focus on providing a premium, professional-grade experience with attention to every detail. Our prime location, modern facilities, transparent pricing, flexible booking options, and dedicated concierge support set us apart. We understand that your business environment reflects your professional standards.",
  },
  {
    question: "Can I schedule a tour before booking?",
    answer: "Yes, we encourage prospective clients to schedule a tour of our facilities. Contact us through the website or call our concierge team to arrange a convenient time. We'll walk you through our spaces and discuss how we can meet your specific business needs.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  // Animation variants
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
      {/* Hero Carousel Section */}
      <section className="relative md:h-[calc(100vh-80px)] h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-charcoal">
        {/* Permanent Dark Background Layer */}
        <div className="absolute inset-0 bg-gradient-hero opacity-90 z-0" />
        
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{
            crossFade: true
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={800}
          allowTouchMove={true}
          onSwiper={(swiper) => setSwiperInstance(swiper)}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
          className="w-full h-full absolute inset-0 z-10"
          style={{ 
            '--swiper-wrapper-transition-timing-function': 'ease-in-out'
          } as React.CSSProperties}
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full">
                <div className="relative h-full w-full flex items-center justify-center bg-charcoal">
                  {/* Background Image - Smooth scale animation without conditional logic */}
                  <div className="absolute inset-0">
                    <div
                      className="absolute inset-0 transition-transform duration-[6000ms] ease-out"
                      style={{
                        transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
                        willChange: 'transform'
                      }}
                    >
                      <Image
                        src={slide.image}
                        alt=""
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-hero opacity-80" />
                    </div>
                  </div>

                  {/* Animated Overlay Accent Line */}
                  <motion.div
                    key={`line-${index}-${currentSlide}`}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent z-10"
                    initial={{ width: "0%", opacity: 0 }}
                    animate={currentSlide === index ? { width: "100%", opacity: 1 } : { width: "0%", opacity: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ willChange: 'width, opacity' }}
                  />

                  {/* Content Container with Layered Animation */}
                  <div className="relative z-20 container-premium text-center text-primary-foreground py-20">
                    <div className="max-w-4xl mx-auto">
                      {/* Top Tag with Elegant Entrance */}
                      <motion.p 
                        key={`welcome-${index}-${currentSlide}`}
                        className="text-accent font-medium tracking-widest uppercase text-sm mb-6 inline-block"
                        initial={{ opacity: 0, y: -20 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                        transition={{ 
                          delay: 0.3, 
                          duration: 0.6,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        Welcome to Visionary House
                      </motion.p>

                      {/* Main Heading with Smooth Entrance */}
                      <motion.h1
                        key={`heading-${index}-${currentSlide}`}
                        className="heading-display text-primary-foreground mb-6"
                        initial={{ opacity: 0, y: 40 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ 
                          delay: 0.5, 
                          duration: 0.8,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        {slide.title}
                        <br />
                        <span className="text-accent">{slide.highlight}</span>
                        <br />
                        {slide.subtitle}
                      </motion.h1>

                      {/* Description with Fade and Slide */}
                      <motion.p 
                        key={`description-${index}-${currentSlide}`}
                        className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10"
                        initial={{ opacity: 0, y: 25 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                        transition={{ 
                          delay: 0.8, 
                          duration: 0.7,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        {slide.description}
                      </motion.p>

                      {/* CTA Buttons with Scale and Reveal */}
                      <motion.div 
                        key={`buttons-${index}-${currentSlide}`}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ 
                          delay: 1.1, 
                          duration: 0.6,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <motion.div
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link href="/book">
                            <Button variant="hero" size="xl" className="bg-[#B08D39] text-[#FFF] shadow-gold">
                              Book Your Experience
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                          </Link>
                        </motion.div>
                        <motion.div
                          whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link href="/services">
                            <Button variant="hero-outline" size="xl">
                              Explore Services
                            </Button>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Decorative Animated Elements */}
                  {/* <motion.div
                    key={`scroll-${index}-${currentSlide}`}
                    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20"
                    initial={{ opacity: 0, y: -20 }}
                    animate={currentSlide === index ? { opacity: 0.6, y: 0 } : { opacity: 0, y: -20 }}
                    transition={{ 
                      delay: 2,
                      duration: 0.8,
                      repeat: currentSlide === index ? Infinity : 0,
                      repeatType: "reverse",
                      repeatDelay: 0.5
                    }}
                  >
                    <div className="w-6 h-10 border-2 border-accent/40 rounded-full flex items-start justify-center p-2">
                      <motion.div
                        className="w-1.5 h-2 bg-accent rounded-full"
                        animate={{ y: [0, 12, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                  </motion.div> */}
                </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Services Preview Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
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
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Link 
                  href={service.href}
                  className="group card-premium overflow-hidden block"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-md mb-6 relative">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
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
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/services">
              <Button variant="premium-outline" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding bg-secondary">
        <div className="container-premium">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
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
              <motion.div 
                className="grid sm:grid-cols-2 gap-4"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: false, amount: 0.3 }}
              >
                {differentiators.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center gap-3"
                    variants={fadeInUp}
                  >
                    <div className="shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-elevated relative">
                <Image
                  src="/assets/q2.jpg"
                  alt="Premium professional lounge"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <motion.div 
                className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground p-8 rounded-lg shadow-elevated hidden md:block"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="font-heading text-4xl font-bold text-accent mb-1">500+</p>
                <p className="text-sm text-primary-foreground/70">Visionary clients trust us</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
              Testimonials
            </p>
            <h2 className="heading-section text-foreground">
              What Our Clients Say
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="card-premium"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-secondary">
        <div className="container-premium">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
              FAQ
            </p>
            <h2 className="heading-section text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Find answers to common questions about our services and facilities.
            </p>
          </motion.div>

          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left hover:text-accent text-foreground font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <motion.div 
          className="container-premium text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="heading-section text-foreground mb-6">
            Ready to Elevate Your Business?
          </h2>
          <p className="text-body max-w-2xl mx-auto mb-10">
            Experience the premium environment your business deserves.
            Schedule a visit or book your space today.
          </p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link href="/book">
              <Button variant="gold" size="xl" className="bg-[#B08D39] text-[#FFF]">
                Book Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="premium-outline" size="xl">
                Schedule a Visit
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}

