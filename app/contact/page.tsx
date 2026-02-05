"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/layout";
import { PageHero, CtaSection } from "@/components/sections";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/constants/animations";
import { fetchContactPage, isStrapiConfigured } from "@/lib/strapi";
import { getContactPageHeroImageUrl } from "@/lib/strapi/mappers";

const defaultContactInfo = [
  { icon: MapPin, title: "Address", content: "123 Executive Boulevard,\nBusiness District, City 10001", href: undefined as string | undefined },
  { icon: Phone, title: "Phone", content: "+1 (234) 567-890", href: "tel:+1234567890" },
  { icon: Mail, title: "Email", content: "info@executivehub.com", href: "mailto:info@executivehub.com" },
  { icon: Clock, title: "Business Hours", content: "Monday – Friday: 8:00 AM – 8:00 PM\nSaturday: 9:00 AM – 5:00 PM", href: undefined as string | undefined },
];

function whatsappHref(phone: string | null | undefined): string {
  if (!phone?.trim()) return "https://wa.me/";
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "https://wa.me/";
}

export default function Contact() {
  const { data: contactPageData, isLoading: contactPageLoading, isError: contactPageError } = useQuery({
    queryKey: ["strapi", "contact-page"],
    queryFn: fetchContactPage,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });

  const heroEyebrow = contactPageData?.heroEyebrow ?? "Contact Us";
  const heroTitle = contactPageData?.heroTitle ?? "Get in Touch";
  const heroDescription = contactPageData?.heroDescription ?? "Have questions or need assistance? Our team is here to help. Reach out through any of the channels below.";
  const heroImageSrc = getContactPageHeroImageUrl(contactPageData ?? null);

  const contactInfo = useMemo(() => {
    if (!contactPageData) return defaultContactInfo;
    const addr = contactPageData.address?.trim();
    const phone = contactPageData.contactPhoneNo?.trim();
    const email = contactPageData.contactEmail?.trim();
    const hours = contactPageData.bussinessHours?.trim();
    if (!addr && !phone && !email && !hours) return defaultContactInfo;
    return [
      { icon: MapPin, title: "Address", content: addr || defaultContactInfo[0].content, href: undefined as string | undefined },
      { icon: Phone, title: "Phone", content: phone || defaultContactInfo[1].content, href: phone ? `tel:${phone.replace(/\s/g, "")}` : defaultContactInfo[1].href },
      { icon: Mail, title: "Email", content: email || defaultContactInfo[2].content, href: email ? `mailto:${email}` : defaultContactInfo[2].href },
      { icon: Clock, title: "Business Hours", content: hours || defaultContactInfo[3].content, href: undefined as string | undefined },
    ];
  }, [contactPageData]);

  const whatsappTitle = contactPageData?.whatsappTitle ?? "Quick Response";
  const whatsappDescription = contactPageData?.whatsappDescription ?? "For immediate assistance, reach us directly via WhatsApp.";
  const whatsappCtaLabel = contactPageData?.whatsappCtaLabel ?? "Chat on WhatsApp";
  const whatsappLink = useMemo(() => whatsappHref(contactPageData?.whatsappNumber), [contactPageData?.whatsappNumber]);
  const showWhatsApp = !!(contactPageData?.whatsappNumber?.trim() || contactPageData?.whatsappTitle || contactPageData?.whatsappDescription);

  const mapEmbedUrl = contactPageData?.mapEmbedUrl?.trim() || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878428698!3d40.74076794379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sus!4v1635959847927!5m2!1sen!2sus";
  const ctaTitle = contactPageData?.ctaTitle ?? "Ready to Book Your Space?";
  const ctaDescription = contactPageData?.ctaDescription ?? "Skip the inquiry and book your space directly through our reservation system.";
  const ctaButtonLabel = contactPageData?.ctaButtonLabel ?? "Book Now";
  const ctaButtonHref = contactPageData?.ctaButtonHref?.trim() || "/book";

  const isLoading = isStrapiConfigured() && contactPageLoading;
  const isError = isStrapiConfigured() && contactPageError;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll respond within 24 hours.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

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
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        description={heroDescription}
        imageSrc={heroImageSrc}
        imageAlt=""
        titleClassName="text-[#B7974B]"
        sectionClassName="py-32 md:py-40 overflow-hidden"
      />

      {/* Contact Content */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="heading-card text-foreground mb-8">Contact Information</h2>
              <motion.div 
                className="space-y-8"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: false, amount: 0.3 }}
              >
                {contactInfo.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex gap-4"
                    variants={fadeInUp}
                  >
                    <div className="shrink-0 p-3 bg-secondary rounded-lg h-fit">
                      <item.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-muted-foreground hover:text-accent transition-colors whitespace-pre-line"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-muted-foreground whitespace-pre-line">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* WhatsApp CTA */}
              {(showWhatsApp || !contactPageData) && (
                <motion.div 
                  className="mt-10 p-6 bg-secondary rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="h-6 w-6 text-accent" />
                    <h3 className="font-medium text-foreground">{whatsappTitle}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {whatsappDescription}
                  </p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="gold" className="w-full">
                      {whatsappCtaLabel}
                    </Button>
                  </a>
                </motion.div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div className="card-premium">
                <h2 className="heading-card text-foreground mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (234) 567-890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Please describe your inquiry in detail..."
                      rows={6}
                    />
                  </div>
                  <Button type="submit" variant="gold" size="lg">
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-secondary">
        <div className="container-premium py-8">
          <motion.div 
            className="aspect-[21/9] rounded-lg overflow-hidden shadow-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Visionary House Location"
            />
          </motion.div>
        </div>
      </section>

      <CtaSection
        title={ctaTitle}
        description={ctaDescription}
        sectionClassName="section-padding bg-background"
      >
        <Link href={ctaButtonHref}>
          <Button variant="gold" size="xl">
            {ctaButtonLabel}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </CtaSection>
    </Layout>
  );
}

