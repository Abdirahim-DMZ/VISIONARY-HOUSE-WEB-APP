"use client";

import { useState } from "react";
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

export default function Bookings() {
  const { toast } = useToast();
  const [referenceNumber, setReferenceNumber] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceNumber || !email) {
      toast({
        title: "Missing Information",
        description: "Please provide both reference number and email address",
        variant: "destructive",
      });
      return;
    }

    // Simulate booking lookup
    toast({
      title: "Booking Not Found",
      description: "No booking found with the provided details. Please check your reference number and email.",
      variant: "destructive",
    });
  };

  return (
    <Layout>
    <main className="min-h-screen">
      <PageHero
        eyebrow="My Bookings"
        title="Manage Your Booking"
        description="View, modify, or cancel your booking. Enter your reference number and email address below."
        backgroundImage="/assets/3.jpg"
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
                  <CardTitle className="heading-card">Find Your Booking</CardTitle>
                  <CardDescription className="text-body">
                    Enter your booking reference number and email address to view
                    your booking details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reference">Booking Reference Number *</Label>
                      <Input
                        id="reference"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="e.g., VH-2024-001234"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
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
                        Confirmed
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

                    <div className="flex gap-4 pt-4 border-t">
                      <Button variant="outline">Modify Booking</Button>
                      <Button variant="destructive">Cancel Booking</Button>
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
              Need Help?
            </motion.h2>
            <motion.p 
              className="text-body mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Can&apos;t find your booking or need assistance? Our team is here to help.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button variant="outline" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button variant="gold" asChild>
                <a href="/book">Make a New Booking</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
    </Layout>
  );
}
