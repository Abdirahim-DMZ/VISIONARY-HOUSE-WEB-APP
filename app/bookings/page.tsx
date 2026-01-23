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
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Clock, MapPin, Mail, Phone } from "lucide-react";

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
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-16">
        <div className="container-premium">
          <div className="max-w-3xl">
            <h1 className="heading-display mb-6">Manage Your Booking</h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              View, modify, or cancel your booking. Enter your reference number
              and email address below.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="section-padding">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Find Your Booking</CardTitle>
                <CardDescription>
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

            {/* Booking Details (shown when found) */}
            {booking && (
              <Card className="mt-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Booking Details</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Confirmed
                    </Badge>
                  </div>
                  <CardDescription>Reference: {booking.referenceNumber}</CardDescription>
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
            )}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-secondary py-16">
        <div className="container-premium">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-heading font-bold mb-4">
              Need Help?
            </h2>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find your booking or need assistance? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button variant="gold" asChild>
                <a href="/book">Make a New Booking</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
    </Layout>
  );
}
