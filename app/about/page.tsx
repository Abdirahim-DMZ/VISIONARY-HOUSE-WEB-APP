"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Shield, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { PageHero, CtaSection, PageHeroSkeleton } from "@/components/sections";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/constants/animations";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchAboutPage, isStrapiConfigured } from "@/lib/strapi";
import { getAboutHeroImageUrl, getAboutStoryImageUrl, mapAboutStoryParagraphs, mapAboutStats, mapAboutValues } from "@/lib/strapi/mappers";

const valueIconMap = { Award, Shield, Users, Clock } as const;

const fallbackStats = [
    { value: "10+", label: "Years of Excellence" },
    { value: "500+", label: "Visionary Clients" },
    { value: "2,000+", label: "Events Hosted" },
    { value: "98%", label: "Client Satisfaction" },
];

const fallbackValues = [
    { icon: "Award" as const, title: "Excellence", description: "We maintain the highest standards in every aspect of our service, from facilities to client interactions." },
    { icon: "Shield" as const, title: "Trust", description: "Your business dealings require discretion and reliability. We uphold unwavering confidentiality and dependability." },
    { icon: "Users" as const, title: "Professionalism", description: "Our team embodies the professionalism that reflects positively on every client who walks through our doors." },
    { icon: "Clock" as const, title: "Flexibility", description: "Business demands adaptability. Our services are designed to accommodate your evolving needs seamlessly." },
];

const fallbackStoryParagraphs = [
    "Visionary House was founded with a singular vision: to create a business environment that matches the caliber of the professionals who use it. We recognized that visionary founders, leaders, and enterprises deserve more than generic office spaces—they deserve an ecosystem that elevates their work.",
    "Today, Visionary House stands as a testament to that vision. Our facilities combine architectural elegance with practical functionality, creating spaces where important decisions are made, relationships are forged, and businesses thrive.",
    "From intimate boardroom meetings to large-scale corporate events, from virtual office solutions to professional media production, we provide the complete infrastructure for business success.",
];

export default function About() {
    const { data: aboutData, isLoading: aboutLoading, isError: aboutError } = useQuery({
        queryKey: ["strapi", "about-page"],
        queryFn: fetchAboutPage,
        enabled: isStrapiConfigured(),
        staleTime: 60_000,
    });

    const isLoading = isStrapiConfigured() && aboutLoading;
    const isError = isStrapiConfigured() && aboutError;
    const heroEyebrow = aboutData?.heroEyebrow ?? "About Us";
    const heroTitle = aboutData?.heroTitle ?? "The Complete Business Ecosystem";
    const heroDescription = aboutData?.heroDescription ?? "Visionary House is where ambition meets sophistication—a premium business environment designed for those who demand excellence.";
    const heroImageSrc = getAboutHeroImageUrl(aboutData ?? null);
    const storyEyebrow = aboutData?.storyEyebrow ?? "Our Story";
    const storyTitle = aboutData?.storyTitle ?? "Built for Business Leaders";
    const storyParagraphs = isError ? fallbackStoryParagraphs : (mapAboutStoryParagraphs(aboutData ?? null).length > 0 ? mapAboutStoryParagraphs(aboutData ?? null) : fallbackStoryParagraphs);
    const storyCta = aboutData?.storyCta ?? "Explore Our Services";
    const storyCtaHref = aboutData?.storyCtaHref ?? "/services";
    const storyImageSrc = getAboutStoryImageUrl(aboutData ?? null);

    const statsFromApi = mapAboutStats(aboutData ?? null);
    const stats = isError ? fallbackStats : (statsFromApi.length > 0 ? statsFromApi : fallbackStats);

    const valuesFromApi = mapAboutValues(aboutData ?? null);
    const values = isError ? fallbackValues : (valuesFromApi.length > 0 ? valuesFromApi : fallbackValues);

    const valuesEyebrow = aboutData?.valuesEyebrow ?? "Our Values";
    const valuesTitle = aboutData?.valuesTitle ?? "The Principles That Guide Us";
    const valuesDescription = aboutData?.valuesDescription ?? "Every interaction, every space, and every service at Visionary House is shaped by our unwavering commitment to these core values.";
    const missionEyebrow = aboutData?.missionEyebrow ?? "Our Mission";
    const missionQuote = aboutData?.missionQuote ?? "To provide an unparalleled professional experience that empowers business leaders to focus on what matters most—their success.";
    const ctaTitle = aboutData?.ctaTitle ?? "Experience Visionary House";
    const ctaDescription = aboutData?.ctaDescription ?? "We invite you to discover the difference a premium business environment can make. Schedule a private tour of our facilities today.";
    const ctaPrimaryLabel = aboutData?.ctaPrimaryLabel ?? "Schedule a Tour";
    const ctaPrimaryHref = aboutData?.ctaPrimaryHref ?? "/contact";
    const ctaSecondaryLabel = aboutData?.ctaSecondaryLabel ?? "Book Now";
    const ctaSecondaryHref = aboutData?.ctaSecondaryHref ?? "/book";

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
                sectionClassName="py-32 md:py-40 overflow-hidden"
                titleClassName="text-[#B7974B]"
            />
            )}

            {/* Our Story Section - show skeleton while loading */}
            {isLoading ? (
            <section className="section-padding bg-background">
                <div className="container-premium">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-5 w-full max-w-2xl" />
                            <Skeleton className="h-5 w-full max-w-2xl" />
                            <Skeleton className="h-5 w-3/4 max-w-xl" />
                        </div>
                        <Skeleton className="aspect-[4/5] rounded-lg" />
                    </div>
                </div>
            </section>
            ) : (
            <section className="section-padding bg-background">
                <div className="container-premium">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
                                {storyEyebrow}
                            </p>
                            <h2 className="heading-section text-foreground mb-6">
                                {storyTitle}
                            </h2>
                            <div className="space-y-4 text-body">
                                {storyParagraphs.map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                            <motion.div 
                                className="mt-8"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                <Link href={storyCtaHref}>
                                    <Button variant="premium" size="lg">
                                        {storyCta}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div 
                            className="relative"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-elevated relative">
                                <Image
                                    src={storyImageSrc}
                                    alt="Professional boardroom and business environment"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover object-center"
                                />
                            </div>
                            <motion.div 
                                className="divider-gold w-24 absolute -bottom-4 left-8"
                                initial={{ opacity: 0, scaleX: 0 }}
                                whileInView={{ opacity: 1, scaleX: 1 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
            )}

            {/* Stats Section - show skeleton while loading */}
            {isLoading ? (
            <section className="py-16 bg-secondary">
                <div className="container-premium">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="text-center">
                                <Skeleton className="h-12 w-20 mx-auto mb-2" />
                                <Skeleton className="h-4 w-24 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            ) : (
            <section className="py-16 bg-secondary">
                <div className="container-premium">
                    <motion.div 
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: false, amount: 0.3 }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={stat.label || index} 
                                className="text-center"
                                variants={fadeInUp}
                            >
                                <p className="font-heading text-4xl md:text-5xl font-bold text-accent mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
            )}

            {/* Our Values Section - show skeleton while loading */}
            {isLoading ? (
            <section className="section-padding bg-background">
                <div className="container-premium">
                    <div className="text-center mb-16">
                        <Skeleton className="h-4 w-20 mx-auto mb-4" />
                        <Skeleton className="h-10 w-80 mx-auto mb-6" />
                        <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 rounded-lg border space-y-4">
                                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                                <Skeleton className="h-6 w-24 mx-auto" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            ) : (
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
                            {valuesEyebrow}
                        </p>
                        <h2 className="heading-section text-foreground mb-6">
                            {valuesTitle}
                        </h2>
                        <p className="text-body max-w-2xl mx-auto">
                            {valuesDescription}
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: false, amount: 0.2 }}
                    >
                        {values.map((value, index) => {
                            const IconComponent = valueIconMap[value.icon] ?? Award;
                            return (
                                <motion.div
                                    key={value.title || index}
                                    className="card-premium text-center"
                                    variants={fadeInUp}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="inline-flex p-4 bg-secondary rounded-full mb-6">
                                        <IconComponent className="h-8 w-8 text-accent" />
                                    </div>
                                    <h3 className="heading-card text-foreground mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm">{value.description}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>
            )}

            {/* Mission Section - show skeleton while loading */}
            {isLoading ? (
            <section className="section-padding bg-primary">
                <div className="container-premium">
                    <div className="max-w-3xl mx-auto text-center">
                        <Skeleton className="h-4 w-20 mx-auto mb-4 bg-primary-foreground/20" />
                        <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-8 bg-primary-foreground/20" />
                    </div>
                </div>
            </section>
            ) : (
            <section className="section-padding bg-primary">
                <div className="container-premium">
                    <motion.div
                        className="max-w-3xl mx-auto text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.p
                            className="text-accent font-medium tracking-widest uppercase text-sm mb-4"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            {missionEyebrow}
                        </motion.p>
                        <motion.h2
                            className="heading-section text-primary-foreground mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            &quot;{missionQuote}&quot;
                        </motion.h2>
                        <motion.div
                            className="divider-gold mx-auto"
                            initial={{ opacity: 0, scaleX: 0 }}
                            whileInView={{ opacity: 1, scaleX: 1 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        />
                    </motion.div>
                </div>
            </section>
            )}

            <CtaSection
                title={ctaTitle}
                description={ctaDescription}
                sectionClassName="section-padding bg-background"
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