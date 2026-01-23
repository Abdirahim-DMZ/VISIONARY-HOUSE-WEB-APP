"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Layout } from "@/components/layout/layout";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  DollarSign,
  CheckCircle2,
  Info,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  serviceTypeNames, 
  bookingAddOns, 
  serviceLayouts,
  bookingConfig 
} from "@/lib/data/booking-config";
import {
  calculateBookingPrice,
  formatTime,
  timeToMinutes,
  isWithinBusinessHours,
  isValidDuration,
  generateBookingReference
} from "@/lib/utils/booking-utils";
import type { BookingFormData } from "@/lib/types/booking";

export default function Book() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "",
    date: "",
    startTime: "",
    endTime: "",
    attendees: "",
    layoutId: "",
    addOns: [],
    message: "",
  });

  // Calculate price whenever relevant fields change
  useEffect(() => {
    if (formData.serviceType && formData.startTime && formData.endTime) {
      const duration = timeToMinutes(formData.endTime) - timeToMinutes(formData.startTime);
      if (duration > 0) {
        const price = calculateBookingPrice(
          formData.serviceType,
          duration,
          formData.addOns,
          bookingAddOns
        );
        setTotalPrice(price);
      }
    }
  }, [formData.serviceType, formData.startTime, formData.endTime, formData.addOns]);

  // Validate time slot
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const errors: string[] = [];
      
      if (!isWithinBusinessHours(formData.startTime, formData.endTime)) {
        errors.push(`Bookings must be within business hours (${bookingConfig.businessHours.start} - ${bookingConfig.businessHours.end})`);
        setIsAvailable(false);
      } else {
        const durationCheck = isValidDuration(formData.startTime, formData.endTime);
        if (!durationCheck.valid) {
          errors.push(durationCheck.message || "Invalid duration");
          setIsAvailable(false);
        } else {
          setIsAvailable(true);
        }
      }
      
      setValidationErrors(errors);
    }
  }, [formData.startTime, formData.endTime]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData({
      ...formData,
      serviceType: value,
      layoutId: "",
    });
  };

  const handleLayoutChange = (value: string) => {
    setFormData({
      ...formData,
      layoutId: value,
    });
  };

  const handleAddOnToggle = (addOnId: string) => {
    setFormData({
      ...formData,
      addOns: formData.addOns.includes(addOnId)
        ? formData.addOns.filter((id) => id !== addOnId)
        : [...formData.addOns, addOnId],
    });
  };

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setFormData({
        ...formData,
        date: format(selectedDate, "yyyy-MM-dd"),
      });
      // Auto-close the date picker
      setIsDatePickerOpen(false);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.serviceType || !formData.date || !formData.startTime || !formData.endTime) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields for booking details",
          variant: "destructive",
        });
        return false;
      }
      if (!isAvailable) {
        toast({
          title: "Invalid Time Slot",
          description: validationErrors[0] || "Please select a valid time slot",
          variant: "destructive",
        });
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required contact fields",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    const referenceNumber = generateBookingReference();
    setBookingReference(referenceNumber);
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    
    // Reset form after modal closes
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        serviceType: "",
        date: "",
        startTime: "",
        endTime: "",
        attendees: "",
        layoutId: "",
        addOns: [],
        message: "",
      });
      setDate(undefined);
      setCurrentStep(1);
      setTotalPrice(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const availableLayouts = formData.serviceType 
    ? serviceLayouts[formData.serviceType] || []
    : [];

  const selectedService = formData.serviceType 
    ? serviceTypeNames[formData.serviceType]
    : "";

  const selectedLayout = availableLayouts.find(l => l.id === formData.layoutId);
  
  const selectedAddOns = bookingAddOns.filter(a => formData.addOns.includes(a.id));

  const duration = formData.startTime && formData.endTime
    ? (timeToMinutes(formData.endTime) - timeToMinutes(formData.startTime)) / 60
    : 0;

  return (
    <Layout>
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        <div className="relative z-10 container-premium text-center">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
            Reserve Your Space
          </p>
          <h1 className="heading-display text-primary-foreground mb-6">
            Book Your Premium Environment
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Reserve your ideal business environment in just a few steps. 
            Professional spaces designed for visionary minds.
          </p>
        </div>
      </section>

      {/* Booking Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-heading font-bold">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-base">
              Your booking has been successfully confirmed. We&apos;ve sent a confirmation email to {formData.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-cream rounded-lg p-6 space-y-3">
              <p className="text-sm text-muted-foreground text-center">Your Booking Reference</p>
              <div className="bg-white border-2 border-accent rounded-lg p-4">
                <p className="text-2xl font-heading font-bold text-accent text-center tracking-wider">
                  {bookingReference}
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Please save this reference number for your records
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">What&apos;s Next?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Check your email for booking details</li>
                    <li>• You&apos;ll receive a reminder 24 hours before</li>
                    <li>• Contact us if you need to make changes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleCloseConfirmation}
              variant="gold"
              size="lg"
              className="w-full h-12 font-semibold"
            >
              Done
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="w-full h-12"
              asChild
            >
              <a href="/bookings">View My Bookings</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Steps */}
      <section className="bg-white border-b sticky top-20 z-10 shadow-md">
        <div className="container-premium py-6">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 sm:gap-3 transition-all duration-300",
                  step > currentStep && "opacity-40"
                )}>
                  <div className={cn(
                    "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-sm",
                    step === currentStep && "bg-accent text-white shadow-gold scale-110",
                    step < currentStep && "bg-green-500 text-white shadow-sm",
                    step > currentStep && "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  )}>
                    {step < currentStep ? <CheckCircle2 className="h-6 w-6" /> : step}
                  </div>
                  <span className={cn(
                    "font-semibold hidden sm:block text-sm md:text-base transition-colors",
                    step === currentStep && "text-accent",
                    step < currentStep && "text-green-600"
                  )}>
                    {step === 1 && "Booking Details"}
                    {step === 2 && "Your Information"}
                    {step === 3 && "Review & Confirm"}
                  </span>
                </div>
                {step < 3 && (
                  <div className={cn(
                    "w-12 sm:w-16 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-300",
                    step < currentStep ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section-padding bg-cream">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-premium">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Booking Details */}
                    {currentStep === 1 && (
                      <div className="space-y-8 animate-fade-in">
                        <div>
                          <h2 className="text-2xl font-heading font-bold mb-2">
                            Select Your Service
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            Choose the service type and specify your requirements
                          </p>
                        </div>

                        <div className="space-y-6">
                          {/* Service Type */}
                          <div className="space-y-2">
                            <Label htmlFor="serviceType" className="text-base font-medium">
                              Service Type *
                            </Label>
                            <Select
                              value={formData.serviceType}
                              onValueChange={handleServiceTypeChange}
                            >
                              <SelectTrigger className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors">
                                <SelectValue placeholder="Choose your preferred service" />
                              </SelectTrigger>
                              <SelectContent className="shadow-elevated">
                                {Object.entries(serviceTypeNames).map(([key, name]) => (
                                  <SelectItem key={key} value={key} className="text-base py-3">
                                    <div className="flex items-center gap-3">
                                      <MapPin className="h-5 w-5 text-accent" />
                                      <span className="font-medium">{name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Layout Selection */}
                          {availableLayouts.length > 0 && (
                            <div className="space-y-2">
                              <Label htmlFor="layout" className="text-base font-medium">
                                Layout/Setup
                              </Label>
                              <Select
                                value={formData.layoutId}
                                onValueChange={handleLayoutChange}
                              >
                                <SelectTrigger className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors">
                                  <SelectValue placeholder="Choose your preferred layout" />
                                </SelectTrigger>
                                <SelectContent className="shadow-elevated">
                                  {availableLayouts.map((layout) => (
                                    <SelectItem key={layout.id} value={layout.id} className="py-4">
                                      <div className="space-y-1">
                                        <div className="font-semibold text-base">{layout.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                          <span className="font-medium">Capacity: {layout.capacity}</span> • {layout.description}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Date & Time */}
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label className="text-base font-medium">Date *</Label>
                              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-14 justify-start text-left font-normal border-2 hover:border-accent/50 transition-colors",
                                      !date && "text-muted-foreground",
                                      date && "border-accent/30"
                                    )}
                                  >
                                    <CalendarIcon className="mr-3 h-5 w-5 text-accent" />
                                    <span className="text-base">
                                      {date ? format(date, "EEEE, MMMM dd, yyyy") : "Select your booking date"}
                                    </span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 shadow-elevated" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={handleDateSelect}
                                    disabled={(date) =>
                                      date < new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    className="rounded-lg border-0"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="startTime" className="text-base font-medium flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-accent" />
                                  Start Time *
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors pl-4 pr-4 cursor-pointer"
                                    required
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="endTime" className="text-base font-medium flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-accent" />
                                  End Time *
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors pl-4 pr-4 cursor-pointer"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="attendees" className="text-base font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-accent" />
                                Expected Attendees
                              </Label>
                              <Input
                                id="attendees"
                                name="attendees"
                                type="number"
                                value={formData.attendees}
                                onChange={handleChange}
                                placeholder="Enter number of attendees"
                                className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors"
                                min="1"
                              />
                            </div>
                          </div>

                          {/* Validation Alerts */}
                          {validationErrors.length > 0 && (
                            <Alert variant="destructive">
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                {validationErrors[0]}
                              </AlertDescription>
                            </Alert>
                          )}

                          {isAvailable && formData.startTime && formData.endTime && validationErrors.length === 0 && (
                            <Alert className="bg-green-50 text-green-900 border-green-200">
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertDescription>
                                Time slot is available!
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Business Hours Info */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex gap-3">
                              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-blue-900">
                                <p className="font-medium mb-1">Business Hours</p>
                                <p>{formatTime(bookingConfig.businessHours.start)} - {formatTime(bookingConfig.businessHours.end)}</p>
                                <p className="mt-2">Minimum booking: {bookingConfig.minBookingDuration / 60}h | Maximum: {bookingConfig.maxBookingDuration / 60}h</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-6">
                          <Button
                            type="button"
                            onClick={handleNext}
                            variant="gold"
                            size="lg"
                            className="h-14 px-8 text-base font-semibold shadow-gold hover:shadow-elevated transition-all"
                          >
                            Continue to Contact Info
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Contact Information */}
                    {currentStep === 2 && (
                      <div className="space-y-8 animate-fade-in">
                        <div>
                          <h2 className="text-2xl font-heading font-bold mb-2">
                            Your Information
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            How should we contact you about this booking?
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-base font-medium">
                                Full Name *
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                                className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="company" className="text-base font-medium">
                                Company Name
                              </Label>
                              <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Your company name"
                                className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-base font-medium">
                                Email Address *
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your.email@example.com"
                                className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-base font-medium">
                                Phone Number *
                              </Label>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="+1 (555) 000-0000"
                                className="h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message" className="text-base font-medium">
                              Special Requirements
                            </Label>
                            <Textarea
                              id="message"
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Tell us about any special requirements or requests for your booking..."
                              rows={5}
                              className="resize-none text-base border-2 hover:border-accent/50 focus:border-accent transition-colors"
                            />
                          </div>

                          {/* Add-ons Selection */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-medium">Add-ons & Extras</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Enhance your booking with our premium add-ons
                              </p>
                            </div>
                            <div className="grid gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                              {bookingAddOns.map((addOn) => (
                                <div
                                  key={addOn.id}
                                  className={cn(
                                    "flex items-start gap-4 p-5 border-2 rounded-xl transition-all group",
                                    formData.addOns.includes(addOn.id)
                                      ? "border-accent bg-accent/10 shadow-sm"
                                      : "border-border hover:border-accent/50 hover:bg-accent/5 hover:shadow-sm"
                                  )}
                                >
                                  <Checkbox
                                    id={addOn.id}
                                    checked={formData.addOns.includes(addOn.id)}
                                    onCheckedChange={() => handleAddOnToggle(addOn.id)}
                                    className="mt-1 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                      <label
                                        htmlFor={addOn.id}
                                        className="text-base font-semibold leading-none cursor-pointer group-hover:text-accent transition-colors"
                                        onClick={() => handleAddOnToggle(addOn.id)}
                                      >
                                        {addOn.name}
                                      </label>
                                      <Badge 
                                        variant="outline" 
                                        className={cn(
                                          "bg-white flex-shrink-0 font-semibold px-3 py-1",
                                          formData.addOns.includes(addOn.id) && "bg-accent text-white border-accent"
                                        )}
                                      >
                                        ${addOn.price}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                      {addOn.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between pt-6">
                          <Button
                            type="button"
                            onClick={handlePrevious}
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-base font-semibold border-2 hover:border-accent hover:text-accent transition-all"
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            onClick={handleNext}
                            variant="gold"
                            size="lg"
                            className="h-14 px-8 text-base font-semibold shadow-gold hover:shadow-elevated transition-all"
                          >
                            Review Booking
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Review & Confirm */}
                    {currentStep === 3 && (
                      <div className="space-y-8 animate-fade-in">
                        <div>
                          <h2 className="text-2xl font-heading font-bold mb-2">
                            Review Your Booking
                          </h2>
                          <p className="text-muted-foreground mb-6">
                            Please review all details before confirming
                          </p>
                        </div>

                        <div className="space-y-6">
                          {/* Service Details */}
                          <div className="bg-cream rounded-lg p-6 space-y-4">
                            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-accent" />
                              Service Details
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Service Type</p>
                                <p className="font-medium">{selectedService}</p>
                              </div>
                              {selectedLayout && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Layout</p>
                                  <p className="font-medium">{selectedLayout.name}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground mb-1">Date</p>
                                <p className="font-medium">{date ? format(date, "PPPP") : ""}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Time</p>
                                <p className="font-medium">
                                  {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                                  {duration > 0 && <span className="text-muted-foreground ml-2">({duration}h)</span>}
                                </p>
                              </div>
                              {formData.attendees && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Attendees</p>
                                  <p className="font-medium">{formData.attendees} people</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Contact Details */}
                          <div className="bg-cream rounded-lg p-6 space-y-4">
                            <h3 className="font-heading font-semibold text-lg">Contact Information</h3>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Name</p>
                                <p className="font-medium">{formData.name}</p>
                              </div>
                              {formData.company && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Company</p>
                                  <p className="font-medium">{formData.company}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground mb-1">Email</p>
                                <p className="font-medium">{formData.email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Phone</p>
                                <p className="font-medium">{formData.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Add-ons */}
                          {selectedAddOns.length > 0 && (
                            <div className="bg-cream rounded-lg p-6 space-y-4">
                              <h3 className="font-heading font-semibold text-lg">Selected Add-ons</h3>
                              <div className="space-y-2">
                                {selectedAddOns.map((addOn) => (
                                  <div key={addOn.id} className="flex justify-between items-start text-sm">
                                    <div>
                                      <p className="font-medium">{addOn.name}</p>
                                      <p className="text-xs text-muted-foreground">{addOn.description}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-white">
                                      ${addOn.price}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Special Requirements */}
                          {formData.message && (
                            <div className="bg-cream rounded-lg p-6 space-y-4">
                              <h3 className="font-heading font-semibold text-lg">Special Requirements</h3>
                              <p className="text-sm text-muted-foreground">{formData.message}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between pt-6">
                          <Button
                            type="button"
                            onClick={handlePrevious}
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-base font-semibold border-2 hover:border-accent hover:text-accent transition-all"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            variant="gold"
                            size="lg"
                            className="h-14 px-10 text-base font-semibold shadow-gold hover:shadow-elevated transition-all"
                          >
                            Confirm Booking
                            <CheckCircle2 className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-40 space-y-6">
                {/* Price Summary */}
                <Card className="shadow-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-accent" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.serviceType && duration > 0 ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service</span>
                            <span className="font-medium">{selectedService}</span>
                          </div>
                          {duration > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-medium">{duration} hours</span>
                            </div>
                          )}
                          {selectedAddOns.length > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Add-ons</span>
                              <span className="font-medium">{selectedAddOns.length} selected</span>
                            </div>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-baseline">
                          <span className="font-heading font-semibold text-lg">Total</span>
                          <div className="text-right">
                            <p className="font-heading font-bold text-2xl text-accent">
                              ${totalPrice.toLocaleString()}
                            </p>
                            {duration > 0 && (
                              <p className="text-xs text-muted-foreground">
                                ${(totalPrice / duration).toFixed(2)}/hour
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Select booking details to see pricing</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="bg-gradient-gold text-white border-0">
                  <CardHeader>
                    <CardTitle className="text-white">Need Assistance?</CardTitle>
                    <CardDescription className="text-white/90">
                      Our team is here to help
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>Call us: (123) 456-7890</p>
                    <p>Email: bookings@visionaryhouse.com</p>
                    <Button variant="outline" className="w-full bg-white text-charcoal hover:bg-white/90 mt-4" asChild>
                      <a href="/contact">Contact Support</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-premium">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Instant Confirmation
              </h3>
              <p className="text-muted-foreground text-sm">
                Receive booking confirmation and details immediately via email
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Dedicated Support
              </h3>
              <p className="text-muted-foreground text-sm">
                Personal assistance throughout your booking and event
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Flexible Modifications
              </h3>
              <p className="text-muted-foreground text-sm">
                Easy booking changes up to 48 hours before your event
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
    </Layout>
  );
}
