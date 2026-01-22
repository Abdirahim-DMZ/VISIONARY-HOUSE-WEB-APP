import { useState } from "react";
import { Calendar, Clock, Users, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { toast } from "@/hooks/use-toast";

const serviceOptions = [
  { value: "event-space", label: "Event Space" },
  { value: "lounge", label: "Lounge Suite" },
  { value: "virtual-office", label: "Virtual Office" },
  { value: "media-studio", label: "Media Studio" },
  { value: "custom", label: "Custom Package" },
];

export default function Book() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    date: "",
    time: "",
    attendees: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Booking Request Received",
      description: "Our team will contact you within 24 hours to confirm your booking.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      date: "",
      time: "",
      attendees: "",
      message: "",
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-hero">
        <div className="container-premium text-center">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
            Book Now
          </p>
          <h1 className="heading-display text-primary-foreground mb-6">
            Reserve Your Space
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Complete the form below to request a booking. Our team will 
            contact you within 24 hours to confirm availability and finalize details.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="heading-card text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">1</span>
                  Contact Information
                </h2>
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
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company Ltd."
                    />
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h2 className="heading-card text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">2</span>
                  Booking Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="service">Service Required *</Label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select a service...</option>
                      {serviceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      Preferred Date *
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Preferred Time *
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="attendees" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      Number of Attendees
                    </Label>
                    <Input
                      id="attendees"
                      name="attendees"
                      type="number"
                      min="1"
                      value={formData.attendees}
                      onChange={handleChange}
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h2 className="heading-card text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">3</span>
                  Additional Information
                </h2>
                <div className="space-y-2">
                  <Label htmlFor="message">Special Requirements or Notes</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please include any special requirements, equipment needs, or additional information..."
                    rows={5}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" variant="gold" size="xl" className="w-full md:w-auto">
                  Submit Booking Request
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  By submitting this form, you agree to our{" "}
                  <a href="/policies#privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="/policies#cancellation" className="text-accent hover:underline">
                    Cancellation Policy
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Alternative */}
      <section className="py-16 bg-secondary">
        <div className="container-premium text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-6 w-6 text-accent" />
            <h3 className="heading-card text-foreground">Prefer to Speak Directly?</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Our team is available to assist you with bookings and inquiries.
          </p>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="premium" size="lg">
              Chat on WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </Layout>
  );
}
