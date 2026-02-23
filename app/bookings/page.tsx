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
import { PageHero, PageHeroSkeleton } from "@/components/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Clock, MapPin, Mail, Phone, Loader2, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { fetchBookingSettings, findBookingByReference, isStrapiConfigured } from "@/lib/strapi";
import { getBookingSettingsHeroImageUrl } from "@/lib/strapi/mappers";

function formatTime12h(timeStr: string): string {
  if (!timeStr?.trim()) return timeStr ?? "";
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parts[1] ? parseInt(parts[1], 10) || 0 : 0;
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export default function Bookings() {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [bookingNotFound, setBookingNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const rawStatus = (booking?.statusOfBooking ?? "").trim();
  const statusKey = rawStatus.toLowerCase();
  // Treat "Completed" (legacy) same as "Confirm": green style, display "Confirm"
  const styleKey =
    statusKey === "confirm" || statusKey === "completed"
      ? "confirmed"
      : statusKey === "cancelled"
        ? "canceled"
        : statusKey || "pending";
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-400",
    canceled: "bg-red-100 text-red-800 border-red-300",
  };
  const statusLabel =
    rawStatus
      ? statusKey === "completed" || statusKey === "confirm"
        ? "Confirm"
        : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)
      : booking
        ? "Pending"
        : "";
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

    setIsSearching(true);
    setBookingNotFound(false);
    try {
      const result = await findBookingByReference(referenceNumber.trim(), email.trim());

      if (!result) {
        setBooking(null);
        setBookingNotFound(true);
        return;
      }

      setBookingNotFound(false);

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
        statusOfBooking: attrs.statusOfBooking ?? raw.statusOfBooking ?? "",
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
      setBookingNotFound(false);
      toast({
        title: "Error",
        description: "Something went wrong while looking up your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
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

      {/* Search Section - show skeleton while loading */}
      {isLoading ? (
      <section className="section-padding">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto">
            <div className="p-6 rounded-lg border space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </section>
      ) : (
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
                    <Button
                      type="submit"
                      variant="gold"
                      className="w-full"
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Find My Booking
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Loading placeholder while searching */}
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      <CardTitle className="heading-card text-muted-foreground">Finding your booking...</CardTitle>
                    </div>
                    <CardDescription className="text-body">Please wait while we look up your booking details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Booking Details (shown when found) */}
            {!isSearching && booking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="mt-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="heading-card">Booking Details</CardTitle>

                      <Badge
                          variant="outline"
                          className={statusStyles[styleKey] || "bg-gray-50 text-gray-700 border-gray-200"}
                      >
                        {statusLabel}
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
                              {booking.date} • {formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)}
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

            {/* Booking Not Found (shown in same card area when search returns no result) */}
            {!isSearching && bookingNotFound && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="mt-8 border-amber-200 bg-amber-50/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <SearchX className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <CardTitle className="heading-card text-amber-900">Booking Not Found</CardTitle>
                        <CardDescription className="text-body text-amber-800 mt-1">
                          No booking found with the provided details. Please check your reference number and email.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-800">
                      Make sure the reference number and email address match the ones used when you made the booking. If you need help, use the contact options below.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      )}

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
