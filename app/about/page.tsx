"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Shield, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { motion } from "framer-motion";

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
            {/* Hero Section */}
            <section className="relative py-32 md:py-40 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/assets/1.jpg"
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                    />
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
                        About Us
                    </motion.p>
                    <motion.h1 
                        className="heading-display text-primary-foreground mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        The Complete Business Ecosystem
                    </motion.h1>
                    <motion.p 
                        className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Visionary House is where ambition meets sophistication—a premium business
                        environment designed for those who demand excellence.
                    </motion.p>
                </motion.div>
            </section>

            {/* Our Story Section */}
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
                            <motion.div 
                                className="mt-8"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                <Link href="/services">
                                    <Button variant="premium" size="lg">
                                        Explore Our Services
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div 
                            className="relative"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-elevated relative">
                                <Image
                                    src="/assets/q3.jpg"
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

            {/* Stats Section */}
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
                                key={index} 
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

            {/* Our Values Section */}
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
                            Our Values
                        </p>
                        <h2 className="heading-section text-foreground mb-6">
                            The Principles That Guide Us
                        </h2>
                        <p className="text-body max-w-2xl mx-auto">
                            Every interaction, every space, and every service at Visionary House
                            is shaped by our unwavering commitment to these core values.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: false, amount: 0.2 }}
                    >
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="card-premium text-center"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="inline-flex p-4 bg-secondary rounded-full mb-6">
                                    <value.icon className="h-8 w-8 text-accent" />
                                </div>
                                <h3 className="heading-card text-foreground mb-3">{value.title}</h3>
                                <p className="text-muted-foreground text-sm">{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
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
                            Our Mission
                        </motion.p>
                        <motion.h2
                            className="heading-section text-primary-foreground mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            &quot;To provide an unparalleled professional experience that empowers
                            business leaders to focus on what matters most—their success.&quot;
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

            {/* CTA Section */}
            <section className="section-padding bg-background">
                <motion.div
                    className="container-premium text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="heading-section text-foreground mb-6">
                        Experience Visionary House
                    </h2>
                    <p className="text-body max-w-2xl mx-auto mb-10">
                        We invite you to discover the difference a premium business environment
                        can make. Schedule a private tour of our facilities today.
                    </p>
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
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
                    </motion.div>
                </motion.div>
            </section>
        </Layout>
    );
}