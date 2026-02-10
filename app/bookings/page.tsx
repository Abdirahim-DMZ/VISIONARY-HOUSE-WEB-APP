"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/layout";
import { PageHero } from "@/components/sections";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Clock, MapPin, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { fetchBookingSettings, findBookingByReference, isStrapiConfigured } from "@/lib/strapi";
import { getBookingSettingsHeroImageUrl } from "@/lib/strapi/mappers";

export default function Bookings() {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<any>(null);

  const { data: bookingSettingsData, isLoading: bookingSettingsLoading, isError: bookingSettingsError } = useQuery({
    queryKey: ["strapi", "booking-settings"],
    queryFn: fetchBookingSettings,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });

  const heroEyebrow = bookingSettingsData?.heroEyebrow ?? "My Bookings";
  const heroTitle = bookingSettingsData?.heroTitle ?? "Manage Your Booking";
  const heroDescription = bookingSettingsData?.heroDescription ?? "View, modify, or cancel your booking. Enter your reference number and email address below.";
  const heroImageSrc = getBookingSettingsHeroImageUrl(bookingSettingsData ?? null);

  const findSectionTitle = bookingSettingsData?.findBookingSectionTitle ?? "Find Your Booking";
  const findSectionDescription = bookingSettingsData?.findBookingSectionDescription ?? "Enter your booking reference number and email address to view your booking details.";
  const bookingRefLabel = bookingSettingsData?.bookingRefLabel ?? "Booking Reference Number *";
  const bookingRefPlaceholder = bookingSettingsData?.bookingRefPlaceholder ?? "e.g., VH-2024-001234";
  const emailLabel = bookingSettingsData?.emailLabel ?? "Email Address *";
  const emailPlaceholder = bookingSettingsData?.emailPlaceholder ?? "your@email.com";

  const ctaTitle = bookingSettingsData?.ctaTitle ?? "Need Help?";
  const ctaDescription = bookingSettingsData?.ctaDescription ?? "Can't find your booking or need assistance? Our team is here to help.";
  const ctaPrimaryLabel = bookingSettingsData?.ctaPrimaryLabel ?? "Contact Support";
  const ctaPrimaryHref = bookingSettingsData?.ctaPrimaryHref?.trim() || "/contact";
  const ctaSecondaryLabel = bookingSettingsData?.ctaSecondaryLabel ?? "Make a New Booking";
  const ctaSecondaryHref = bookingSettingsData?.ctaSecondaryHref?.trim() || "/book";

  const isLoading = isStrapiConfigured() && bookingSettingsLoading;
  const isError = isStrapiConfigured() && bookingSettingsError;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referenceNumber || !email) {
      toast({
        title: "Missing Information",
        description: "Please provide both reference number and email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await findBookingByReference(referenceNumber.trim(), email.trim());

      if (!result) {
        setBooking(null);
        toast({
          title: "Booking Not Found",
          description: "No booking found with the provided details. Please check your reference number and email.",
          variant: "destructive",
        });
        return;
      }

      const raw: any = result;
      const attrs = (raw.attributes ?? raw) || {};
      const serviceAttrs = attrs.service?.data?.attributes ?? {};

      setBooking({
        referenceNumber: attrs.referenceNumber ?? raw.referenceNumber ?? "",
        customerName: attrs.customerName ?? raw.customerName ?? "",
        customerEmail: attrs.customerEmail ?? raw.customerEmail ?? "",
        customerPhone: attrs.customerPhone ?? raw.customerPhone ?? "",
        companyName: attrs.companyName ?? raw.companyName ?? "",
        date: attrs.date ?? raw.date ?? "",
        endDate: attrs.endDate ?? raw.endDate ?? "",
        startTime: attrs.startTime ?? raw.startTime ?? "",
        endTime: attrs.endTime ?? raw.endTime ?? "",
        attendees: attrs.attendees ?? raw.attendees ?? null,
        message: attrs.message ?? raw.message ?? "",
        status: attrs.status ?? raw.status ?? "",
        totalPrice: attrs.totalPrice ?? raw.totalPrice ?? null,
        currency: attrs.currency ?? raw.currency ?? "",
        eventType: attrs.eventType ?? raw.eventType ?? "",
        guestType: attrs.guestType ?? raw.guestType ?? "",
        roomSpace: attrs.roomSpace ?? raw.roomSpace ?? "",
        serviceType: attrs.eventType ?? raw.eventType ?? serviceAttrs.name ?? "",
      });
    } catch (error) {
      console.error("Error finding booking:", error);
      setBooking(null);
      toast({
        title: "Error",
        description: "Something went wrong while looking up your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
    <main className="min-h-screen">
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
        sectionClassName="py-32 md:py-40 overflow-hidden"
        titleClassName="text-[#B7974B]"
      />

      {/* Search Section */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="heading-card">{findSectionTitle}</CardTitle>
                  <CardDescription className="text-body">
                    {findSectionDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reference">{bookingRefLabel}</Label>
                      <Input
                        id="reference"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder={bookingRefPlaceholder}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{emailLabel}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={emailPlaceholder}
                        required
                      />
                    </div>
                    <Button type="submit" variant="gold" className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Find My Booking
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Details (shown when found) */}
            {booking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="mt-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="heading-card">Booking Details</CardTitle>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {booking.status
                          ? booking.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
                          : "Confirmed"}
                      </Badge>
                    </div>
                    <CardDescription className="text-body">Reference: {booking.referenceNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Date & Time</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.date} • {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Service</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.serviceType}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.customerEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.customerPhone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-secondary py-16">
        <div className="container-premium">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="heading-section mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {ctaTitle}
            </motion.h2>
            <motion.p 
              className="text-body mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {ctaDescription}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button variant="outline" asChild>
                <a href={ctaPrimaryHref}>{ctaPrimaryLabel}</a>
              </Button>
              <Button variant="gold" asChild>
                <a href={ctaSecondaryHref}>{ctaSecondaryLabel}</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
    </Layout>
  );
}
