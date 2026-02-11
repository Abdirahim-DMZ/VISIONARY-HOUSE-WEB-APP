"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Building2, Users, Briefcase, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { PageHero, CtaSection, PageHeroSkeleton } from "@/components/sections";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/constants/animations";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchServicePage, isStrapiConfigured } from "@/lib/strapi";
import { getServicePageHeroImageUrl, mapServicePageComponents } from "@/lib/strapi/mappers";

// Icons are always applied manually in the UI (not from API). Map by serviceId or by index.
const SERVICE_ICON_MAP: Record<string, typeof Building2> = {
  "event-space": Building2,
  lounge: Users,
  "virtual-offices": Briefcase,
  media: Video,
};
const SERVICE_ICONS_BY_INDEX = [Building2, Users, Briefcase, Video] as const;

const fallbackServices = [
  { id: "event-space", title: "Event Space", subtitle: "Premium Venues for Every Occasion", description: "Our sophisticated event spaces are designed to accommodate everything from intimate board meetings to large-scale corporate conferences.", image: "/assets/1.jpg", features: [] as string[] },
  { id: "lounge", title: "Lounge Suite", subtitle: "Professional Comfort & Privacy", description: "The Lounge Suite offers an exclusive retreat for professionals.", image: "/assets/2.jpg", features: [] as string[] },
  { id: "virtual-offices", title: "Virtual Offices", subtitle: "Professional Presence, Maximum Flexibility", description: "Establish a prestigious business address without the overhead of traditional office space.", image: "/assets/3.jpg", features: [] as string[] },
  { id: "media", title: "Media Services", subtitle: "Professional Content Production", description: "Our state-of-the-art media studios are equipped for professional-grade podcast recording and video production.", image: "/assets/4.jpg", features: [] as string[] },
];

export default function Services() {
  const { data: servicePageData, isLoading: servicePageLoading, isError: servicePageError } = useQuery({
    queryKey: ["strapi", "service-page"],
    queryFn: fetchServicePage,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });

  const isLoading = isStrapiConfigured() && servicePageLoading;
  const isError = isStrapiConfigured() && servicePageError;

  const heroEyebrow = servicePageData?.heroEyebrow ?? "Our Services";
  const heroTitle = servicePageData?.heroTitle ?? "Everything Your Business Needs";
  const heroDescription = servicePageData?.heroDescription ?? "From event hosting to virtual presence, we provide comprehensive solutions designed for professional businesses.";
  const heroImageSrc = getServicePageHeroImageUrl(servicePageData ?? null);

  const componentsFromApi = mapServicePageComponents(servicePageData ?? null);
  const services = isError ? fallbackServices : (componentsFromApi.length > 0 ? componentsFromApi : fallbackServices);

  const ctaTitle = servicePageData?.ctaTitle ?? "Need a Custom Solution?";
  const ctaDescription = servicePageData?.ctaDescription ?? "Our team can create bespoke packages tailored to your specific business requirements. Contact us to discuss your needs.";
  const ctaPrimaryLabel = servicePageData?.ctaPrimaryLabel ?? "Request a Quote";
  const ctaPrimaryHref = servicePageData?.ctaPrimaryHref ?? "/contact";
  const ctaSecondaryLabel = servicePageData?.ctaSecondaryLabel ?? "Book Standard Service";
  const ctaSecondaryHref = servicePageData?.ctaSecondaryHref ?? "/book";

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
      {isLoading ? (
        <PageHeroSkeleton sectionClassName="py-32 md:py-40 overflow-hidden" />
      ) : (
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        description={heroDescription}
        imageSrc={heroImageSrc}
        imageAlt=""
        titleClassName="text-[#B7974B]"
        sectionClassName="py-32 md:py-40 overflow-hidden"
      />
      )}

      {/* Services Detail Sections - show skeleton while loading */}
      {isLoading ? (
        <section className="section-padding bg-background">
          <div className="container-premium">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`py-16 ${i % 2 === 0 ? "bg-background" : "bg-secondary"}`}>
                <div className="container-premium">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-64" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                    <Skeleton className="aspect-[4/3] rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
      <>
      {services.map((service, index) => {
        const Icon =
            SERVICE_ICON_MAP[service.id] ??
            SERVICE_ICONS_BY_INDEX[index % SERVICE_ICONS_BY_INDEX.length] ??
            Building2;

        return (
            <section
                key={service.id}
                id={service.id}
                className={`section-padding ${
                    index % 2 === 0 ? "bg-background" : "bg-secondary"
                }`}
            >
              <div className="container-premium">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                  {/* TEXT SIDE */}
                  <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.6 }}
                      className={index % 2 !== 0 ? "lg:order-2" : ""}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <Icon className="h-6 w-6 text-accent" />
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

                    <p className="text-body mb-8">{service.description}</p>

                    {service.features?.length > 0 && (
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
                    )}

                    <Link href="/book">
                      <Button variant="gold" size="lg" className="group">
                        Book {service.title}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </motion.div>

                  {/* IMAGE SIDE */}
                  <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.6 }}
                      className={index % 2 !== 0 ? "lg:order-1" : ""}
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
        );
      })}
      </>
      )}

      <CtaSection
        title={ctaTitle}
        description={ctaDescription}
      >
        <Link href={ctaPrimaryHref}>
          <Button variant="gold" size="xl" className="bg-[#B08D39] text-[#FFF] group">
            {ctaPrimaryLabel}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href={ctaSecondaryHref}>
          <Button variant="premium-outline" size="xl" className="group">
            {ctaSecondaryLabel}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CtaSection>
    </Layout>
  );
}

