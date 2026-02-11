"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, Users, Video, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { SectionHeader, CtaSection } from "@/components/sections";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/constants/animations";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { fetchHomepage, fetchServices, fetchTestimonials, fetchFaqs, isStrapiConfigured } from "@/lib/strapi";
import {
  mapHomepageHeroSlides,
  mapServicesPreview,
  mapHomepageServicesPreview,
  mapDifferentiators,
  mapTestimonials,
  mapFaqs,
  getWhyChooseUsImageUrl,
  type MappedHeroSlide,
  type MappedServicePreview,
  type MappedTestimonial,
  type MappedFaq,
} from "@/lib/strapi/mappers";

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/autoplay';

const iconMap = { Building2, Users, Briefcase, Video } as const;

// Fallback data when Strapi is not configured or fetch fails
const fallbackHeroSlides: MappedHeroSlide[] = [
  { title: "Where Business", highlight: "Excellence", subtitle: "Meets Premium Experience", description: "A complete business ecosystem designed for visionary founders, leaders, and enterprises seeking an environment that reflects their standard of excellence.", heading: "Welcome to Visionary House", image: "/assets/1.jpg" },
  { title: "Premium Event", highlight: "Spaces", subtitle: "For Visionary Leaders", description: "Host conferences, board meetings, and corporate gatherings in our sophisticated venues that reflect your professional standards.", heading: "Welcome to Visionary House", image: "/assets/2.jpg" },
  { title: "Professional", highlight: "Virtual Offices", subtitle: "Your Business Presence", description: "Establish your business with prestigious addresses, mail handling, and call answering services that project confidence.", heading: "Welcome to Visionary House", image: "/assets/3.jpg" },
];

const fallbackServices: MappedServicePreview[] = [
  { title: "Event Space", description: "Sophisticated venues for conferences, board meetings, and corporate gatherings.", icon: "Building2", image: "/assets/4.jpg", href: "/services#event-space" },
  { title: "Lounge Suite", description: "Premium relaxation spaces designed for professional comfort and private conversations.", icon: "Users", image: "/assets/5.jpg", href: "/services#lounge" },
  { title: "Virtual Offices", description: "Professional business presence with mail handling, call answering, and registered addresses.", icon: "Briefcase", image: "/assets/6.jpg", href: "/services#virtual-offices" },
  { title: "Media Services", description: "State-of-the-art studios for podcasts, video production, and professional content creation.", icon: "Video", image: "/assets/q1.jpg", href: "/services#media" },
];

const fallbackDifferentiators = [
  "Premium, professional-grade experience",
  "Flexible booking with transparent pricing",
  "Professional and reliable service",
  "Prime business district location",
  "Dedicated concierge support",
  "Modern, well-appointed facilities",
];

const fallbackTestimonials: MappedTestimonial[] = [
  { quote: "Visionary House has transformed how we conduct business meetings. The facilities are impeccable, and the service is consistently exceptional.", author: "Victoria Chen", title: "CEO, Meridian Capital" },
  { quote: "A truly premium experience. From booking to departure, every detail is handled with professionalism and care.", author: "Marcus Thompson", title: "Managing Director, Atlas Ventures" },
  { quote: "The virtual office service has given our startup the credibility we needed. Highly recommend to any serious business.", author: "Sarah Mitchell", title: "Founder, Catalyst Tech" },
];

const fallbackFaqs: MappedFaq[] = [
  { question: "What services does Visionary House offer?", answer: "We provide a comprehensive business ecosystem including event spaces for conferences and meetings, premium lounge suites for professional relaxation, virtual office services with mail handling and call answering, and state-of-the-art media studios for content creation." },
  { question: "How do I book an event space or meeting room?", answer: "You can book spaces through our website by selecting your preferred date, time, and space type. Our team will confirm availability within 24 hours and provide you with all necessary details. For urgent bookings, please contact our concierge team directly." },
  { question: "What are the benefits of a virtual office?", answer: "Our virtual office services provide your business with a prestigious address, professional mail handling, dedicated phone answering service, and access to meeting rooms when needed. It's perfect for establishing credibility while maintaining flexibility." },
  { question: "Are the facilities suitable for corporate events?", answer: "Absolutely. Our event spaces are designed specifically for corporate gatherings, from board meetings to large conferences. We offer professional-grade AV equipment, high-speed internet, catering services, and dedicated support staff to ensure your event runs smoothly." },
  { question: "What makes Visionary House different from other business centers?", answer: "We focus on providing a premium, professional-grade experience with attention to every detail. Our prime location, modern facilities, transparent pricing, flexible booking options, and dedicated concierge support set us apart. We understand that your business environment reflects your professional standards." },
  { question: "Can I schedule a tour before booking?", answer: "Yes, we encourage prospective clients to schedule a tour of our facilities. Contact us through the website or call our concierge team to arrange a convenient time. We'll walk you through our spaces and discuss how we can meet your specific business needs." },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const { data: homepageData, isLoading: homepageLoading, isError: homepageError } = useQuery({
    queryKey: ["strapi", "homepage"],
    queryFn: fetchHomepage,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });
  const { data: servicesData, isLoading: servicesLoading, isError: servicesError } = useQuery({
    queryKey: ["strapi", "services"],
    queryFn: fetchServices,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });
  const { data: testimonialsData, isLoading: testimonialsLoading, isError: testimonialsError } = useQuery({
    queryKey: ["strapi", "testimonials"],
    queryFn: fetchTestimonials,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });
  const { data: faqsData, isLoading: faqsLoading, isError: faqsError } = useQuery({
    queryKey: ["strapi", "faqs"],
    queryFn: fetchFaqs,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });

  const homepage = homepageData ?? null;
  const servicesFromHome = mapHomepageServicesPreview(homepage);
  const servicesFromApi = mapServicesPreview(servicesData ?? null);
  const strapiConfigured = isStrapiConfigured();
  const isLoading = strapiConfigured && homepageLoading;
  const isError = strapiConfigured && homepageError;
  const heroSlides = isError ? fallbackHeroSlides : (mapHomepageHeroSlides(homepage) || fallbackHeroSlides);
  const servicesPreview = servicesFromHome ?? servicesFromApi ?? fallbackServices;
  const differentiators = isError ? fallbackDifferentiators : (mapDifferentiators(homepage) || fallbackDifferentiators);
  const testimonialsErrorFlag = strapiConfigured && testimonialsError;
  const faqsErrorFlag = strapiConfigured && faqsError;
  const testimonials = testimonialsErrorFlag ? fallbackTestimonials : (mapTestimonials(testimonialsData ?? null) || fallbackTestimonials);
  const faqs = faqsErrorFlag ? fallbackFaqs : (mapFaqs(faqsData ?? null) || fallbackFaqs);
  const whyChooseUsImageUrl = getWhyChooseUsImageUrl(homepage);

  const services = servicesPreview.map((s) => ({
    ...s,
    icon: iconMap[s.icon as keyof typeof iconMap] ?? Building2,
  }));

  const servicesEyebrow = homepage?.servicesEyebrow ?? "Our Services";
  const servicesTitle = homepage?.servicesTitle ?? "A Complete Business Ecosystem";
  const servicesDescription = homepage?.servicesDescription ?? "From prestigious event spaces to professional virtual offices, we provide everything your business needs to project confidence and success.";
  const whyEyebrow = homepage?.whyChooseUsEyebrow ?? "Why Choose Us";
  const whyTitle = homepage?.whyChooseUsTitle ?? "Trusted by Industry Leaders";
  const whyBody = homepage?.whyChooseUsBody ?? "We understand that your business environment reflects your professional standards. Visionary House provides the premium experience your reputation demands.";
  const testimonialsEyebrow = homepage?.testimonialsEyebrow ?? "Testimonials";
  const testimonialsTitle = homepage?.testimonialsTitle ?? "What Our Clients Say";
  const faqEyebrow = homepage?.faqEyebrow ?? "FAQ";
  const faqTitle = homepage?.faqTitle ?? "Frequently Asked Questions";
  const faqDescription = homepage?.faqDescription ?? "Find answers to common questions about our services and facilities.";
  const ctaTitle = homepage?.ctaTitle ?? "Ready to Elevate Your Business?";
  const ctaDescription = homepage?.ctaDescription ?? "Experience the premium environment your business deserves. Schedule a visit or book your space today.";
  const ctaPrimaryLabel = homepage?.ctaPrimaryLabel ?? "Book Now";
  const ctaPrimaryHref = homepage?.ctaPrimaryHref ?? "/book";
  const ctaSecondaryLabel = homepage?.ctaSecondaryLabel ?? "Schedule a Visit";
  const ctaSecondaryHref = homepage?.ctaSecondaryHref ?? "/contact";
  const serviceCtaLabel = homepage?.serviceCta ?? "View All Services";
  const serviceCtaHref = homepage?.serviceCtaHref ?? "/services";
  const whyStatNumber = homepage?.whyChooseUsStatNumber ?? "500+";
  const whyStatLabel = homepage?.whyChooseUsStatLabel ?? "Visionary clients trust us";

  return (
    <Layout>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: "70%" }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.2 }}
            style={{ originX: 0 }}
          />
        </div>
      )}
      {isError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-center py-2 px-4 text-sm">
          Unable to load latest content. Showing default content.
        </div>
      )}
      {/* Hero Carousel Section - show skeleton while loading */}
      {isLoading ? (
        <section className="relative md:h-[calc(100vh-80px)] h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-charcoal">
          <div className="absolute inset-0 bg-gradient-hero opacity-90 z-0" />
          <div className="relative z-10 container-premium text-center text-primary-foreground">
            <Skeleton className="h-4 w-24 mx-auto mb-4 bg-primary-foreground/20" />
            <Skeleton className="h-14 w-full max-w-2xl mx-auto mb-6 bg-primary-foreground/20" />
            <Skeleton className="h-14 w-3/4 max-w-xl mx-auto mb-6 bg-primary-foreground/20" />
            <Skeleton className="h-6 w-full max-w-lg mx-auto mb-10 bg-primary-foreground/20" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-40 bg-primary-foreground/20" />
              <Skeleton className="h-12 w-40 bg-primary-foreground/20" />
            </div>
          </div>
        </section>
      ) : (
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
            delay: 6000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={1600}
          allowTouchMove={true}
          onSwiper={(swiper) => setSwiperInstance(swiper)}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
          className="w-full h-full absolute inset-0 z-10 hero-swiper"
          style={{ 
            '--swiper-wrapper-transition-timing-function': 'cubic-bezier(0.65, 0, 0.35, 1)'
          } as React.CSSProperties}
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full">
                <div className="relative h-full w-full flex items-center justify-center bg-charcoal">
                  {/* Image layer: premium crossfade + subtle Ken Burns zoom (fashion-theme style) */}
                  <div
                    className="hero-slide-image-layer"
                    style={{ opacity: currentSlide === index ? 1 : 0 }}
                    aria-hidden
                  >
                    <div
                      className="hero-slide-ken-burns"
                      style={{
                        transform: currentSlide === index ? 'scale(1.08)' : 'scale(1)',
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
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.65, 0, 0.35, 1] }}
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
                          delay: 0.4, 
                          duration: 0.9,
                          ease: [0.65, 0, 0.35, 1]
                        }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        {slide.heading ?? "Welcome to Visionary House"}
                      </motion.p>

                      {/* Main Heading with Smooth Entrance */}
                      <motion.h1
                        key={`heading-${index}-${currentSlide}`}
                        className="heading-display text-primary-foreground mb-6"
                        initial={{ opacity: 0, y: 40 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ 
                          delay: 0.6, 
                          duration: 1,
                          ease: [0.65, 0, 0.35, 1]
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
                        className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10"
                        initial={{ opacity: 0, y: 25 }}
                        animate={currentSlide === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                        transition={{ 
                          delay: 0.9, 
                          duration: 0.9,
                          ease: [0.65, 0, 0.35, 1]
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
                          delay: 1.2, 
                          duration: 0.8,
                          ease: [0.65, 0, 0.35, 1]
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
      )}

      {/* Services Preview Section - show skeleton while loading */}
      {strapiConfigured && (homepageLoading || servicesLoading) ? (
        <section className="section-padding bg-background">
          <div className="container-premium">
            <div className="mb-12">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-96 mb-2" />
              <Skeleton className="h-5 w-full max-w-2xl" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[16/10] w-full rounded-md" />
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
      <section className="section-padding bg-background">
        <div className="container-premium">
          <SectionHeader
            eyebrow={servicesEyebrow}
            title={servicesTitle}
            description={servicesDescription}
          />

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
                      <p className="text-small">
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
            <Link href={serviceCtaHref}>
              <Button variant="premium-outline" size="lg">
                {serviceCtaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      )}

      {/* Why Choose Us Section - show skeleton while loading */}
      {strapiConfigured && homepageLoading ? (
        <section className="section-padding bg-secondary">
          <div className="container-premium">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-5 w-full max-w-md" />
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              </div>
              <Skeleton className="aspect-square rounded-lg" />
            </div>
          </div>
        </section>
      ) : (
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
                {whyEyebrow}
              </p>
              <h2 className="heading-section text-foreground mb-6">
                {whyTitle}
              </h2>
            <p className="text-body mb-8">
              {whyBody}
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
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-elevated relative">
                <Image
                  src={whyChooseUsImageUrl}
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
                <p className="font-heading text-4xl md:text-5xl font-bold text-accent mb-1">{whyStatNumber}</p>
                <p className="text-sm text-primary-foreground/70">{whyStatLabel}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

      {/* Testimonials Section - show skeleton while loading */}
      {strapiConfigured && testimonialsLoading ? (
        <section className="section-padding bg-background">
          <div className="container-premium">
            <div className="mb-12">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 p-6 rounded-lg border">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-24 mt-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
      <section className="section-padding bg-background">
        <div className="container-premium">
          <SectionHeader
            eyebrow={testimonialsEyebrow}
            title={testimonialsTitle}
            titleClassName="text-foreground"
          />

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
                <p className="text-body mb-6">
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
      )}

      {/* FAQ Section – data from Strapi FAQs API (GET /api/faqs) when Strapi is configured */}
      <section className="section-padding bg-secondary">
        <div className="container-premium">
          <SectionHeader
            eyebrow={faqEyebrow}
            title={faqTitle}
            description={faqDescription}
          />

          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {faqsLoading && isStrapiConfigured() ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question ?? index} value={`item-${index}`} className="border-border">
                    <AccordionTrigger className="font-sans text-left hover:text-accent text-foreground font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-body">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </motion.div>
        </div>
      </section>

      <CtaSection
        title={ctaTitle}
        description={ctaDescription}
        sectionClassName="py-24"
      >
        <Link href={ctaPrimaryHref}>
          <Button variant="gold" size="xl" className="bg-[#B08D39] text-[#FFF]">
            {ctaPrimaryLabel}
          </Button>
        </Link>
        <Link href={ctaSecondaryHref}>
          <Button variant="premium-outline" size="xl">
            {ctaSecondaryLabel}
          </Button>
        </Link>
      </CtaSection>
    </Layout>
  );
}

