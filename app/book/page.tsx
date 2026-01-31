"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { PageHero } from "@/components/sections";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  DollarSign,
  CheckCircle2,
  Info,
  MapPin,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  serviceTypeNames, 
  bookingAddOns, 
  serviceLayouts,
  bookingConfig,
  eventTypes 
} from "@/lib/data/booking-config";
import {
  calculateBookingPrice,
  formatTime,
  timeToMinutes,
  generateBookingReference,
  getTotalDurationMinutes
} from "@/lib/utils/booking-utils";
import type { BookingFormData } from "@/lib/types/booking";
import coffee from '../../public/assets/coffee.jpg'

export default function Book() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);

  // Email format: local@domain.tld (e.g. admin@gmail.com)
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = (email: string) => EMAIL_REGEX.test(email.trim());

  // Refs for form fields to enable scrolling
  const serviceTypeRef = useRef<HTMLButtonElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);
  const endDateRef = useRef<HTMLButtonElement>(null);
  const startTimeRef = useRef<HTMLButtonElement>(null);
  const endTimeRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const attendeesRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    eventType: "",
    serviceType: "",
    date: "",
    endDate: "",
    startTime: "",
    endTime: "",
    attendees: "",
    layoutId: "",
    addOns: [],
    message: "",
  });

  const selectedEventType = eventTypes.find((e) => e.id === formData.eventType);
  const isMultiDay = selectedEventType?.isMultiDay ?? false;

  // Sync endDate (Date) from formData.endDate for calendar display
  useEffect(() => {
    if (formData.endDate) {
      const d = new Date(formData.endDate);
      if (!isNaN(d.getTime())) setEndDate(d);
    } else {
      setEndDate(undefined);
    }
  }, [formData.endDate]);

  // Calculate price whenever relevant fields change (supports multi-day via getTotalDurationMinutes)
  useEffect(() => {
    if (formData.serviceType && formData.date && formData.startTime && formData.endTime) {
      const totalMinutes = isMultiDay && formData.endDate
        ? getTotalDurationMinutes(formData.date, formData.startTime, formData.endDate, formData.endTime)
        : timeToMinutes(formData.endTime) - timeToMinutes(formData.startTime);
      if (totalMinutes > 0) {
        const price = calculateBookingPrice(
          formData.serviceType,
          totalMinutes,
          formData.addOns,
          bookingAddOns
        );
        setTotalPrice(price);
      }
    }
  }, [formData.serviceType, formData.date, formData.endDate, formData.startTime, formData.endTime, formData.addOns, isMultiDay]);

  // Validate time slot: only require end after start (no min/max duration restriction)
  useEffect(() => {
    if (!formData.startTime || !formData.endTime) {
      setValidationErrors([]);
      return;
    }
    const errors: string[] = [];
    if (isMultiDay && formData.endDate) {
      const total = getTotalDurationMinutes(formData.date, formData.startTime, formData.endDate, formData.endTime);
      if (total <= 0) {
        errors.push("End date & time must be after start date & time");
        setIsAvailable(false);
      } else {
        setIsAvailable(true);
      }
    } else {
      const startM = timeToMinutes(formData.startTime);
      const endM = timeToMinutes(formData.endTime);
      if (endM <= startM) {
        errors.push("End time must be after start time");
        setIsAvailable(false);
      } else {
        setIsAvailable(true);
      }
    }
    setValidationErrors(errors);
  }, [formData.date, formData.endDate, formData.startTime, formData.endTime, isMultiDay]);

  const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const fieldName = e.target.name;
    let value = e.target.value;

    // 🔒 Allow only digits for attendees
    if (fieldName === "attendees") {
      value = value.replace(/\D/g, ""); // removes letters, symbols, spaces

      if (!value) {
        setAttendeesError(null);
      } else {
        const num = Number(value);
        const hasSelectedLayouts = selectedLayoutIds.length > 0;
        const layoutsForCapacity = hasSelectedLayouts
            ? selectedLayoutIds
            : formData.layoutId
                ? [formData.layoutId]
                : [];

        let totalCapacity: number | undefined;
        if (layoutsForCapacity.length > 0 && formData.serviceType) {
          const layouts = serviceLayouts[formData.serviceType] || [];
          const capacities = layouts
              .filter((l) => layoutsForCapacity.includes(l.id))
              .map((l) => l.capacity);

          if (capacities.length > 0) {
            totalCapacity = capacities.reduce((sum, c) => sum + c, 0);
          }
        }

        if (
            totalCapacity !== undefined &&
            !Number.isNaN(num) &&
            num > totalCapacity
        ) {
          setAttendeesError(
              `Expected attendees cannot exceed the combined capacity of the selected layouts (${totalCapacity} guests).`
          );
        } else {
          setAttendeesError(null);
        }
      }
    }

    if (fieldName === "phone") {
      value = value.replace(/\D/g, "");

      if (value.length > 10) {
        value = value.slice(0, 10);
      }

      if (value.length === 0) {
        setFieldErrors((prev) => ({ ...prev, phone: false }));
      } else if (value.length < 10) {
        setFieldErrors((prev) => ({ ...prev, phone: true }));
      } else {
        setFieldErrors((prev) => ({ ...prev, phone: false }));
      }
    }

    setFormData({
      ...formData,
      [fieldName]: value,
    });

    // Clear field error when typing
    if (fieldErrors[fieldName]) {
      setFieldErrors({
        ...fieldErrors,
        [fieldName]: false,
      });
    }
    if (fieldName === "email") {
      setEmailErrorMessage(null);
    }
  };


  const handleEventTypeChange = (value: string) => {
    const event = eventTypes.find((e) => e.id === value);
    if (!event) return;
    setFormData((prev) => ({
      ...prev,
      eventType: value,
      serviceType: event.serviceType,
      layoutId: "",
      ...(event.isMultiDay ? {} : { endDate: "" }),
    }));
    setSelectedLayoutIds([]);
    if (fieldErrors.serviceType) {
      setFieldErrors({ ...fieldErrors, serviceType: false });
    }
  };

  const handleLayoutToggle = (value: string) => {
    setSelectedLayoutIds((prev) => {
      const exists = prev.includes(value);
      const next = exists ? prev.filter((id) => id !== value) : [...prev, value];
      // Keep first selected layout in formData.layoutId for compatibility
      setFormData((current) => ({
        ...current,
        layoutId: next[0] ?? "",
      }));
      return next;
    });
  };

  const handleDialogLayoutToggle = (value: string) => {
    setDialogLayoutIds((prev) => {
      const exists = prev.includes(value);
      return exists ? prev.filter((id) => id !== value) : [...prev, value];
    });
  };

  const handleLayoutDialogSave = () => {
    setSelectedLayoutIds(dialogLayoutIds);
    setFormData((current) => ({
      ...current,
      layoutId: dialogLayoutIds[0] ?? "",
    }));
    setIsLayoutDialogOpen(false);
    setLayoutSearchQuery("");
  };

  const handleLayoutDialogCancel = () => {
    setDialogLayoutIds(selectedLayoutIds);
    setIsLayoutDialogOpen(false);
    setLayoutSearchQuery("");
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
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
  const [layoutSearchQuery, setLayoutSearchQuery] = useState("");
  const [selectedLayoutIds, setSelectedLayoutIds] = useState<string[]>([]);
  const [dialogLayoutIds, setDialogLayoutIds] = useState<string[]>([]);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);

  // Minutes restricted to 00, 15, 30, 45 only
  const MINUTES_QUARTER = [0, 15, 30, 45];
  const snapToQuarter = (m: number) => MINUTES_QUARTER.reduce((prev, curr) =>
    Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev
  );

  // Parse "HH:mm" to { hour12, minute, ampm } for display (hour12 is 1-12); minute snapped to quarter
  const parseTime = (time: string): { hour12: number; minute: number; ampm: "AM" | "PM" } => {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return { hour12: 12, minute: 0, ampm: "AM" };
    const [h, m] = time.split(":").map(Number);
    const hour24 = h;
    const minute = snapToQuarter(m);
    const ampm: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return { hour12, minute, ampm };
  };
  // Build "HH:mm" from hour12 (1-12), minute (0|15|30|45), ampm
  const buildTime = (hour12: number, minute: number, ampm: "AM" | "PM") => {
    const m = MINUTES_QUARTER.includes(minute) ? minute : snapToQuarter(minute);
    let hour24 = hour12 === 12 ? (ampm === "AM" ? 0 : 12) : (ampm === "PM" ? hour12 + 12 : hour12);
    return `${String(hour24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const AMPM = ["AM", "PM"] as const;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setFormData({
        ...formData,
        date: format(selectedDate, "yyyy-MM-dd"),
      });
      setIsDatePickerOpen(false);
      if (fieldErrors.date) {
        setFieldErrors({ ...fieldErrors, date: false });
      }
    }
  };

  const handleEndDateSelect = (selectedDate: Date | undefined) => {
    setEndDate(selectedDate);
    if (selectedDate) {
      setFormData({
        ...formData,
        endDate: format(selectedDate, "yyyy-MM-dd"),
      });
      setIsEndDatePickerOpen(false);
      if (fieldErrors.endDate) {
        setFieldErrors({ ...fieldErrors, endDate: false });
      }
    }
  };

  const scrollToField = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      const yOffset = -150; // Offset for sticky header
      const element = ref.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      // Focus the element after scrolling
      setTimeout(() => {
        element.focus();
      }, 500);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const errors: Record<string, boolean> = {};
      let firstInvalidField: React.RefObject<HTMLElement> | null = null;
      
      if (!formData.eventType || !formData.serviceType) {
        errors.serviceType = true;
        if (!firstInvalidField) firstInvalidField = serviceTypeRef;
      }
      if (!formData.date) {
        errors.date = true;
        if (!firstInvalidField) firstInvalidField = dateRef;
      }
      if (isMultiDay && !formData.endDate) {
        errors.endDate = true;
        if (!firstInvalidField) firstInvalidField = endDateRef;
      }
      if (formData.endDate && formData.date && formData.endDate < formData.date) {
        errors.endDate = true;
        if (!firstInvalidField) firstInvalidField = endDateRef;
      }
      if (!formData.startTime) {
        errors.startTime = true;
        if (!firstInvalidField) firstInvalidField = startTimeRef;
      }
      if (!formData.endTime) {
        errors.endTime = true;
        if (!firstInvalidField) firstInvalidField = endTimeRef;
      }
      if (!formData.attendees?.trim()) {
        errors.attendees = true;
        if (!firstInvalidField && attendeesRef) firstInvalidField = attendeesRef as unknown as React.RefObject<HTMLElement>;
      }
      if (attendeesError) {
        errors.attendees = true;
        if (!firstInvalidField && attendeesRef) {
          firstInvalidField = attendeesRef as unknown as React.RefObject<HTMLElement>;
        }
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast({
          title: "Missing Information",
          description: attendeesError
            ? attendeesError
            : "Please fill in all required fields for booking details",
          variant: "destructive",
        });
        if (firstInvalidField) {
          scrollToField(firstInvalidField);
        }
        return false;
      }
      
      if (!isAvailable) {
        const timeErrors: Record<string, boolean> = {
          startTime: true,
          endTime: true,
        };
        setFieldErrors(timeErrors);
        toast({
          title: "Invalid Time Slot",
          description: validationErrors[0] || "Please select a valid time slot",
          variant: "destructive",
        });
        scrollToField(startTimeRef);
        return false;
      }
    }
    
    if (step === 2) {
      const errors: Record<string, boolean> = {};
      let firstInvalidField: React.RefObject<HTMLElement> | null = null;

      if (!formData.name?.trim()) {
        errors.name = true;
        if (!firstInvalidField) firstInvalidField = nameRef;
      }
      const emailTrimmed = formData.email?.trim() ?? "";
      if (!emailTrimmed) {
        errors.email = true;
        setEmailErrorMessage("Please enter your email address.");
        if (!firstInvalidField) firstInvalidField = emailRef;
      } else if (!isValidEmail(formData.email)) {
        errors.email = true;
        setEmailErrorMessage("Please enter a valid email address (e.g. admin@gmail.com).");
        if (!firstInvalidField) firstInvalidField = emailRef;
      } else {
        setEmailErrorMessage(null);
      }
      if (!formData.phone?.trim()) {
        errors.phone = true;
        if (!firstInvalidField) firstInvalidField = phoneRef;
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        const toastDescription = errors.email
          ? (emailTrimmed ? "Please enter a valid email address (e.g. admin@gmail.com)." : "Please enter your email address.")
          : "Please fill in all required contact fields";
        toast({
          title: "Missing Information",
          description: toastDescription,
          variant: "destructive",
        });
        if (firstInvalidField) {
          scrollToField(firstInvalidField);
        }
        return false;
      }
    }

    if (step === 3) {
      const errors: Record<string, boolean> = {};
      let firstInvalidField: React.RefObject<HTMLElement> | null = null;

      if (!formData.eventType || !formData.serviceType) {
        errors.serviceType = true;
        if (!firstInvalidField) firstInvalidField = serviceTypeRef;
      }
      if (!formData.date) {
        errors.date = true;
        if (!firstInvalidField) firstInvalidField = dateRef;
      }
      if (isMultiDay && !formData.endDate) {
        errors.endDate = true;
        if (!firstInvalidField) firstInvalidField = endDateRef;
      }
      if (formData.endDate && formData.date && formData.endDate < formData.date) {
        errors.endDate = true;
        if (!firstInvalidField) firstInvalidField = endDateRef;
      }
      if (!formData.startTime) {
        errors.startTime = true;
        if (!firstInvalidField) firstInvalidField = startTimeRef;
      }
      if (!formData.endTime) {
        errors.endTime = true;
        if (!firstInvalidField) firstInvalidField = endTimeRef;
      }
      if (!formData.attendees?.trim()) {
        errors.attendees = true;
        if (!firstInvalidField && attendeesRef) firstInvalidField = attendeesRef as unknown as React.RefObject<HTMLElement>;
      }
      if (attendeesError) {
        errors.attendees = true;
        if (!firstInvalidField && attendeesRef) firstInvalidField = attendeesRef as unknown as React.RefObject<HTMLElement>;
      }
      if (!isAvailable) {
        errors.startTime = true;
        errors.endTime = true;
        if (!firstInvalidField) firstInvalidField = startTimeRef;
      }
      if (!formData.name?.trim()) {
        errors.name = true;
        if (!firstInvalidField) firstInvalidField = nameRef;
      }
      const emailTrimmedStep3 = formData.email?.trim() ?? "";
      if (!emailTrimmedStep3) {
        errors.email = true;
        if (!firstInvalidField) firstInvalidField = emailRef;
      } else if (!isValidEmail(formData.email)) {
        errors.email = true;
        setEmailErrorMessage("Please enter a valid email address (e.g. admin@gmail.com).");
        if (!firstInvalidField) firstInvalidField = emailRef;
      }
      if (!formData.phone?.trim()) {
        errors.phone = true;
        if (!firstInvalidField) firstInvalidField = phoneRef;
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast({
          title: "Missing Information",
          description: "Please complete all required fields. Use Previous to review your booking details.",
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
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        eventType: "",
        serviceType: "",
        date: "",
        endDate: "",
        startTime: "",
        endTime: "",
        attendees: "",
        layoutId: "",
        addOns: [],
        message: "",
      });
      setDate(undefined);
      setEndDate(undefined);
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

  const selectedLayouts = availableLayouts.filter((l) =>
    selectedLayoutIds.includes(l.id)
  );

  const selectedAddOns = bookingAddOns.filter((a) => formData.addOns.includes(a.id));

  const totalAttendeesCapacity =
    selectedLayouts.length > 0
      ? selectedLayouts.reduce((sum, layout) => sum + layout.capacity, 0)
      : undefined;

  const totalDurationMinutes =
    formData.date && formData.startTime && formData.endTime
      ? isMultiDay && formData.endDate
        ? getTotalDurationMinutes(
            formData.date,
            formData.startTime,
            formData.endDate,
            formData.endTime
          )
        : timeToMinutes(formData.endTime) - timeToMinutes(formData.startTime)
      : 0;
  const duration = totalDurationMinutes / 60;

  return (
    <Layout>
    <main className="min-h-screen pb-20">
      <PageHero
        eyebrow="Reserve Your Space"
        title="Book Your Premium Environment"
        description="Reserve your ideal business environment in just a few steps. Professional spaces designed for visionary minds."
        backgroundImage="/assets/4.jpg"
        sectionClassName="py-32 md:py-28"
        titleClassName="text-[#B7974B]"
      />

      {/* Booking Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="heading-card">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-body">
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

      {/* Layout / Setup Image Gallery Modal */}
      <Dialog
        open={isLayoutDialogOpen}
        onOpenChange={(open) => {
          setIsLayoutDialogOpen(open);
          if (open) {
            // Start dialog with current committed selection
            setDialogLayoutIds(selectedLayoutIds);
          } else {
            setLayoutSearchQuery("");
          }
        }}
      >
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Choose a Layout</DialogTitle>
            <DialogDescription>
              Select a layout to see capacity and setup details. Click an image to select.
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search layouts by name, capacity, or description..."
                value={layoutSearchQuery}
                onChange={(e) => setLayoutSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-2 focus:border-accent"
              />
            </div>
          </div>

          {/* Filtered Layouts Grid with Scroll - Show only 2 rows */}
          <div className="overflow-y-auto pr-3 max-h-[420px] custom-scrollbar">
            {(() => {
              const filteredLayouts = availableLayouts.filter((layout) => {
                if (!layoutSearchQuery.trim()) return true;
                const query = layoutSearchQuery.toLowerCase();
                return (
                  layout.name.toLowerCase().includes(query) ||
                  layout.description.toLowerCase().includes(query) ||
                  layout.capacity.toString().includes(query)
                );
              });

              if (filteredLayouts.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground">No layouts found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search terms
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-4">
                  {filteredLayouts.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => {
                        handleDialogLayoutToggle(layout.id);
                      }}
                      className={cn(
                        "group relative w-full overflow-hidden rounded-lg border-2 text-left transition-colors duration-200",
                        dialogLayoutIds.includes(layout.id)
                          ? "border-accent ring-2 ring-accent/30 bg-accent/5"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      {/* Mobile & tablet: horizontal card with image left, details right */}
                      <div className="flex lg:hidden w-full items-stretch h-full">
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden">
                          {layout.image ? (
                            <Image
                              src={layout.image}
                              alt={layout.name}
                              fill
                              // sizes="(max-width: 1024px) 40vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-muted flex items-center justify-center">
                              <span className="text-xl font-heading text-muted-foreground">
                                {layout.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 px-3 flex flex-col justify-center gap-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground line-clamp-1">
                            {layout.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Capacity: {layout.capacity}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {layout.description}
                          </p>
                        </div>
                      </div>

                      {/* Desktop (lg+): original card layout with hover overlay */}
                      <div className="hidden lg:block w-full">
                        <div className="relative w-full aspect-[4/3]">
                          <div className="absolute inset-0 overflow-hidden rounded-lg">
                            {layout.image ? (
                              <Image
                                src={layout.image}
                                alt={layout.name}
                                fill
                                sizes="(max-width: 640px) 50vw, 20vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                <span className="text-xl font-heading text-muted-foreground">
                                  {layout.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end pt-4 pb-11 px-3">
                            <p className="text-white font-semibold text-xs sm:text-sm">{layout.name}</p>
                            <p className="text-white/90 text-xs mt-1">Capacity: {layout.capacity}</p>
                            <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{layout.description}</p>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/95 border-t border-border rounded-b-lg">
                            <p className="text-foreground font-medium text-xs sm:text-sm truncate">
                              {layout.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-11"
              onClick={handleLayoutDialogCancel}
            >
              Cancel
            </Button>
            <div className="flex-1 sm:text-right">
              {dialogLayoutIds.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2 sm:mb-1">
                  Combined capacity of selected layouts:{" "}
                  <span className="font-semibold">
                    {availableLayouts
                      .filter((l) => dialogLayoutIds.includes(l.id))
                      .reduce((sum, l) => sum + l.capacity, 0)}{" "}
                    guests
                  </span>
                </p>
              )}
              <Button
                type="button"
                variant="gold"
                size="lg"
                className="w-full sm:w-auto h-11"
                onClick={handleLayoutDialogSave}
                disabled={dialogLayoutIds.length === 0}
              >
                Save Layout Selection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Steps - on mobile scrolls with content (no sticky) to avoid layering/bleed; on desktop stays sticky */}
      <section className="bg-white border-b shadow-md md:sticky md:top-20 md:z-30 md:isolate">
        <div className="container-premium py-6">
          <motion.div 
            className="flex items-center justify-center gap-2 sm:gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-12 2xl:py-28 bg-cream">
        <div className="container-premium">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-premium">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Booking Details */}
                    {currentStep === 1 && (
                      <div className="space-y-8 animate-fade-in">
                        <div>
                          <h2 className="heading-card mb-2">
                            Booking Details
                          </h2>
                          <p className="text-body mb-6">
                            Choose your event type, date & time, and layout
                          </p>
                        </div>

                        <div className="space-y-6">
                          {/* Event Type */}
                          <div className="space-y-2">
                            <Label htmlFor="eventType" className="text-base font-medium">
                              Event Type *
                            </Label>
                            <Select
                              value={formData.eventType}
                              onValueChange={handleEventTypeChange}
                            >
                              <SelectTrigger 
                                ref={serviceTypeRef}
                                id="eventType"
                                className={cn(
                                  "h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors",
                                  fieldErrors.serviceType && "border-red-500 hover:border-red-600 focus:border-red-600"
                                )}
                              >
                                <SelectValue placeholder="Choose your event type (small or large)" />
                              </SelectTrigger>
                              <SelectContent className="shadow-elevated overflow-y-auto w-[var(--radix-select-trigger-width)] sm:w-auto">
                                {eventTypes.map((event) => (
                                  <SelectItem key={event.id} value={event.id} className="text-base py-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-accent" />
                                        <span className="font-medium">{event.label}</span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="hidden xs:inline-flex text-[11px] px-2 py-0.5 rounded-full border-accent/40 text-accent bg-accent/5"
                                      >
                                        {event.isMultiDay ? "Multi Day" : "Single Day"}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Date & Time - Multi-day: row1 Start Date + Start Time, row2 End Date + End Time; Single-day: Date then Start/End time */}
                          <div className="space-y-6">
                            {isMultiDay ? (
                              <>
                                {/* Multi-day: Row 1 - Start Date | Start Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-base font-medium">Start Date *</Label>
                                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          ref={dateRef}
                                          variant="outline"
                                          className={cn(
                                            "w-full h-14 justify-start text-left font-normal border-2 transition-colors hover:bg-[#FFF] hover:text-[#B08D39]",
                                            !date && "text-muted-foreground",
                                            date && "border-accent/30",
                                            fieldErrors.date && "border-red-500 hover:border-red-600"
                                          )}
                                        >
                                          <CalendarIcon className="mr-3 h-5 w-5 text-accent shrink-0" />
                                          <span className="text-base text-black truncate">
                                            {date ? format(date, "EEEE, MMMM dd, yyyy") : "Select start date"}
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
                                  <div className="space-y-2">
                                    <Label htmlFor="startTime" className="text-base font-medium flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-accent" />
                                      Start Time *
                                    </Label>
                                    <Popover open={isStartTimeOpen} onOpenChange={setIsStartTimeOpen}>
                                      <PopoverTrigger asChild>
                                        <button
                                          ref={startTimeRef}
                                          type="button"
                                          id="startTime"
                                          className={cn(
                                            "flex h-14 w-full items-center justify-between rounded-md border-2 bg-background px-4 text-left text-base transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
                                            fieldErrors.startTime && "border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-500"
                                          )}
                                        >
                                          <span className={formData.startTime ? "text-foreground" : "text-muted-foreground"}>
                                            {formData.startTime ? formatTime(formData.startTime) : "-- : --"}
                                          </span>
                                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 shadow-elevated" align="start" sideOffset={4}>
                                        <div className="flex border-b border-border">
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {HOURS_12.map((h) => {
                                              const current = parseTime(formData.startTime);
                                              const isSelected = current.hour12 === h;
                                              return (
                                                <button
                                                  key={h}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(h, current.minute, current.ampm);
                                                    setFormData({ ...formData, startTime: next });
                                                    if (fieldErrors.startTime) setFieldErrors({ ...fieldErrors, startTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(h).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {MINUTES_QUARTER.map((m) => {
                                              const current = parseTime(formData.startTime);
                                              const isSelected = current.minute === m;
                                              return (
                                                <button
                                                  key={m}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, m, current.ampm);
                                                    setFormData({ ...formData, startTime: next });
                                                    if (fieldErrors.startTime) setFieldErrors({ ...fieldErrors, startTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(m).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-12">
                                            {AMPM.map((a) => {
                                              const current = parseTime(formData.startTime);
                                              const isSelected = current.ampm === a;
                                              return (
                                                <button
                                                  key={a}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, current.minute, a);
                                                    setFormData({ ...formData, startTime: next });
                                                    if (fieldErrors.startTime) setFieldErrors({ ...fieldErrors, startTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {a}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground px-3 py-2 border-t border-border">Select hour, minute (00/15/30/45), and AM/PM</p>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                {/* Multi-day: Row 2 - End Date | End Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-base font-medium">End Date *</Label>
                                    <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          ref={endDateRef}
                                          variant="outline"
                                          className={cn(
                                            "w-full h-14 justify-start text-left font-normal border-2 transition-colors hover:bg-[#FFF] hover:text-[#B08D39]",
                                            !endDate && "text-muted-foreground",
                                            endDate && "border-accent/30",
                                            fieldErrors.endDate && "border-red-500 hover:border-red-600"
                                          )}
                                        >
                                          <CalendarIcon className="mr-3 h-5 w-5 text-accent shrink-0" />
                                          <span className="text-base text-black truncate">
                                            {endDate ? format(endDate, "EEEE, MMMM dd, yyyy") : "Select end date"}
                                          </span>
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 shadow-elevated" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={endDate}
                                          onSelect={handleEndDateSelect}
                                          disabled={(d) => {
                                            if (!formData.date) return d < new Date();
                                            const start = new Date(formData.date);
                                            return d < start || d < new Date();
                                          }}
                                          initialFocus
                                          className="rounded-lg border-0"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="endTime" className="text-base font-medium flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-accent" />
                                      End Time *
                                    </Label>
                                    <Popover open={isEndTimeOpen} onOpenChange={setIsEndTimeOpen}>
                                      <PopoverTrigger asChild>
                                        <button
                                          ref={endTimeRef}
                                          type="button"
                                          id="endTime"
                                          className={cn(
                                            "flex h-14 w-full items-center justify-between rounded-md border-2 bg-background px-4 text-left text-base transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
                                            fieldErrors.endTime && "border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-500"
                                          )}
                                        >
                                          <span className={formData.endTime ? "text-foreground" : "text-muted-foreground"}>
                                            {formData.endTime ? formatTime(formData.endTime) : "-- : --"}
                                          </span>
                                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 shadow-elevated" align="start" sideOffset={4}>
                                        <div className="flex border-b border-border">
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {HOURS_12.map((h) => {
                                              const current = parseTime(formData.endTime);
                                              const isSelected = current.hour12 === h;
                                              return (
                                                <button
                                                  key={h}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(h, current.minute, current.ampm);
                                                    setFormData({ ...formData, endTime: next });
                                                    if (fieldErrors.endTime) setFieldErrors({ ...fieldErrors, endTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(h).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {MINUTES_QUARTER.map((m) => {
                                              const current = parseTime(formData.endTime);
                                              const isSelected = current.minute === m;
                                              return (
                                                <button
                                                  key={m}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, m, current.ampm);
                                                    setFormData({ ...formData, endTime: next });
                                                    if (fieldErrors.endTime) setFieldErrors({ ...fieldErrors, endTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(m).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-12">
                                            {AMPM.map((a) => {
                                              const current = parseTime(formData.endTime);
                                              const isSelected = current.ampm === a;
                                              return (
                                                <button
                                                  key={a}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, current.minute, a);
                                                    setFormData({ ...formData, endTime: next });
                                                    if (fieldErrors.endTime) setFieldErrors({ ...fieldErrors, endTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {a}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground px-3 py-2 border-t border-border">Select hour, minute (00/15/30/45), and AM/PM</p>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Single-day: existing layout - Date full width, then Start Time | End Time */}
                                <div className="space-y-2">
                                  <Label className="text-base font-medium">Date *</Label>
                                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        ref={dateRef}
                                        variant="outline"
                                        className={cn(
                                          "w-full h-14 justify-start text-left font-normal border-2 transition-colors hover:bg-[#FFF] hover:text-[#B08D39]",
                                          !date && "text-muted-foreground",
                                          date && "border-accent/30",
                                          fieldErrors.date && "border-red-500 hover:border-red-600"
                                        )}
                                      >
                                        <CalendarIcon className="mr-3 h-5 w-5 text-accent" />
                                        <span className="text-base text-black ">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  <div className="space-y-2">
                                    <Label htmlFor="startTime" className="text-base font-medium flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-accent" />
                                      Start Time *
                                    </Label>
                                    <Popover open={isStartTimeOpen} onOpenChange={setIsStartTimeOpen}>
                                      <PopoverTrigger asChild>
                                        <button
                                          ref={startTimeRef}
                                          type="button"
                                          id="startTime"
                                          className={cn(
                                            "flex h-14 w-full items-center justify-between rounded-md border-2 bg-background px-4 text-left text-base transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
                                            fieldErrors.startTime && "border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-500"
                                          )}
                                        >
                                          <span className={formData.startTime ? "text-foreground" : "text-muted-foreground"}>
                                            {formData.startTime ? formatTime(formData.startTime) : "-- : --"}
                                          </span>
                                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 shadow-elevated" align="start" sideOffset={4}>
                                        <div className="flex border-b border-border">
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {HOURS_12.map((h) => {
                                              const current = parseTime(formData.startTime);
                                              const isSelected = current.hour12 === h;
                                              return (
                                                <button
                                                  key={h}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(h, current.minute, current.ampm);
                                                    setFormData({ ...formData, startTime: next });
                                                    if (fieldErrors.startTime) setFieldErrors({ ...fieldErrors, startTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(h).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {MINUTES_QUARTER.map((m) => {
                                              const current = parseTime(formData.startTime);
                                              const isSelected = current.minute === m;
                                              return (
                                                <button
                                                  key={m}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, m, current.ampm);
                                                    setFormData({ ...formData, startTime: next });
                                                    if (fieldErrors.startTime) setFieldErrors({ ...fieldErrors, startTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(m).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-12">
                                            {AMPM.map((a) => {
                                              const current = parseTime(formData.startTime);
                                              const isSelected = current.ampm === a;
                                              return (
                                                <button
                                                  key={a}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, current.minute, a);
                                                    setFormData({ ...formData, startTime: next });
                                                    if (fieldErrors.startTime) setFieldErrors({ ...fieldErrors, startTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {a}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground px-3 py-2 border-t border-border">Select hour, minute (00/15/30/45), and AM/PM</p>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="endTime" className="text-base font-medium flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-accent" />
                                      End Time *
                                    </Label>
                                    <Popover open={isEndTimeOpen} onOpenChange={setIsEndTimeOpen}>
                                      <PopoverTrigger asChild>
                                        <button
                                          ref={endTimeRef}
                                          type="button"
                                          id="endTime"
                                          className={cn(
                                            "flex h-14 w-full items-center justify-between rounded-md border-2 bg-background px-4 text-left text-base transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
                                            fieldErrors.endTime && "border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-500"
                                          )}
                                        >
                                          <span className={formData.endTime ? "text-foreground" : "text-muted-foreground"}>
                                            {formData.endTime ? formatTime(formData.endTime) : "-- : --"}
                                          </span>
                                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0 shadow-elevated" align="start" sideOffset={4}>
                                        <div className="flex border-b border-border">
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {HOURS_12.map((h) => {
                                              const current = parseTime(formData.endTime);
                                              const isSelected = current.hour12 === h;
                                              return (
                                                <button
                                                  key={h}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(h, current.minute, current.ampm);
                                                    setFormData({ ...formData, endTime: next });
                                                    if (fieldErrors.endTime) setFieldErrors({ ...fieldErrors, endTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(h).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-14 border-r border-border">
                                            {MINUTES_QUARTER.map((m) => {
                                              const current = parseTime(formData.endTime);
                                              const isSelected = current.minute === m;
                                              return (
                                                <button
                                                  key={m}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, m, current.ampm);
                                                    setFormData({ ...formData, endTime: next });
                                                    if (fieldErrors.endTime) setFieldErrors({ ...fieldErrors, endTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {String(m).padStart(2, "0")}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex flex-col max-h-[220px] overflow-y-auto scrollbar-hide w-12">
                                            {AMPM.map((a) => {
                                              const current = parseTime(formData.endTime);
                                              const isSelected = current.ampm === a;
                                              return (
                                                <button
                                                  key={a}
                                                  type="button"
                                                  onClick={() => {
                                                    const next = buildTime(current.hour12, current.minute, a);
                                                    setFormData({ ...formData, endTime: next });
                                                    if (fieldErrors.endTime) setFieldErrors({ ...fieldErrors, endTime: false });
                                                  }}
                                                  className={cn(
                                                    "px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                                    isSelected ? "bg-[#B08D39] text-white hover:bg-[#9a7b32]" : "text-foreground"
                                                  )}
                                                >
                                                  {a}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground px-3 py-2 border-t border-border">Select hour, minute (00/15/30/45), and AM/PM</p>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Layout / Setup - click opens dialog (no dropdown) */}
                            {availableLayouts.length > 0 && (
                              <div className="space-y-3">
                                <Label className="text-base font-medium">Layout / Setup</Label>
                                <button
                                  type="button"
                                  onClick={() => setIsLayoutDialogOpen(true)}
                                  className={cn(
                                    "flex h-14 w-full items-center justify-between rounded-md border-2 bg-background px-4 text-left text-base transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
                                    selectedLayouts.length > 0 && "border-accent/30"
                                  )}
                                >
                                  <span className={selectedLayouts.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                                    {selectedLayouts.length === 0 &&
                                      "Choose your preferred layout(s)"}
                                    {selectedLayouts.length === 1 &&
                                      selectedLayouts[0].name}
                                    {selectedLayouts.length > 1 &&
                                      `${selectedLayouts.length} layouts selected`}
                                  </span>
                                  <MapPin className="h-5 w-5 shrink-0 text-accent" />
                                </button>

                                {selectedLayouts.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {selectedLayouts.map((layout) => (
                                      <div
                                        key={layout.id}
                                        className="flex items-center gap-2 rounded-full border border-accent/40 bg-background px-3 py-1 text-xs sm:text-sm"
                                      >
                                        <span className="font-medium truncate max-w-[8rem] sm:max-w-[10rem]">
                                          {layout.name}
                                        </span>
                                        <span className="text-muted-foreground whitespace-nowrap">
                                          {layout.capacity} ppl
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="attendees" className="text-base font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-accent" />
                                Expected Attendees *
                              </Label>
                              <Input
                                ref={attendeesRef}
                                id="attendees"
                                name="attendees"
                                type="text"
                                value={formData.attendees}
                                onChange={handleChange}
                                placeholder="Enter number of attendees"
                                className={cn(
                                  "h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors",
                                  (fieldErrors.attendees || attendeesError) && "border-red-500 hover:border-red-600 focus:border-red-600"
                                )}
                                min="1"
                              />
                              {totalAttendeesCapacity !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  Combined capacity for selected layout
                                  {selectedLayouts.length > 1 ? "s" : ""}:{" "}
                                  <span className="font-semibold">
                                    {totalAttendeesCapacity} guests
                                  </span>
                                </p>
                              )}
                              {(fieldErrors.attendees || attendeesError) && (
                                <p className="text-xs text-red-600">
                                  {attendeesError ?? "Please enter the expected number of attendees."}
                                </p>
                              )}
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
                          <h2 className="heading-card mb-2">
                            Your Information
                          </h2>
                          <p className="text-body mb-6">
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
                                ref={nameRef}
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Enter your full name"
                                className={cn(
                                  "h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors",
                                  fieldErrors.name && "border-red-500 hover:border-red-600 focus:border-red-600"
                                )}
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
                                ref={emailRef}
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@gmail.com"
                                className={cn(
                                  "h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors",
                                  fieldErrors.email && "border-red-500 hover:border-red-600 focus:border-red-600"
                                )}
                              />
                              {fieldErrors.email && (
                                <p className="text-xs text-red-600">
                                  {emailErrorMessage ?? "Please enter a valid email address (e.g. admin@gmail.com)."}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-base font-medium">
                                Phone Number *
                              </Label>
                              <Input
                                ref={phoneRef}
                                id="phone"
                                name="phone"
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]{10}"
                                maxLength={10}
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="+1 (555) 000-0000"
                                className={cn(
                                  "h-14 text-base border-2 hover:border-accent/50 focus:border-accent transition-colors",
                                  fieldErrors.phone && "border-red-500 hover:border-red-600 focus:border-red-600"
                                )}
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
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => handleAddOnToggle(addOn.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleAddOnToggle(addOn.id);
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-4 p-5 border-2 rounded-xl transition-all group cursor-pointer",
                                    formData.addOns.includes(addOn.id)
                                      ? "border-accent bg-accent/10 shadow-sm"
                                      : "border-border hover:border-accent/50 hover:bg-accent/5 hover:shadow-sm"
                                  )}
                                >
                                  {/* Visually hidden checkbox for accessibility; entire card remains clickable */}
                                  <span onClick={(e) => e.stopPropagation()} className="sr-only">
                                    <Checkbox
                                      id={addOn.id}
                                      checked={formData.addOns.includes(addOn.id)}
                                      onCheckedChange={() => handleAddOnToggle(addOn.id)}
                                      className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                    />
                                  </span>

                                  {/* Left image / icon area */}
                                  <div
                                    aria-hidden="true"
                                    className={cn(
                                      "relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border bg-white shadow-sm",
                                      formData.addOns.includes(addOn.id)
                                        ? "border-accent bg-accent/10"
                                        : "border-border"
                                    )}
                                  >
                                    {/*<span className="text-lg font-heading font-semibold text-accent">*/}
                                    {/*  {addOn.name.charAt(0)}*/}
                                    {/*</span>*/}
                                    <div className="relative w-full h-full">
                                      <Image
                                          src={addOn.img || ""}
                                          alt="coffee"
                                          fill
                                          className="object-cover rounded-lg"
                                      />
                                    </div>
                                  </div>

                                  {/* Right content area */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                      <label
                                        htmlFor={addOn.id}
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-base font-semibold leading-none cursor-pointer group-hover:text-accent transition-colors"
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
                          <h2 className="heading-card mb-2">
                            Review Your Booking
                          </h2>
                          <p className="text-body mb-6">
                            Please review all details before confirming
                          </p>
                        </div>

                        <div className="space-y-6">
                          {/* Service Details */}
                          <div className="bg-cream rounded-lg p-6 space-y-4">
                            <h3 className="heading-card flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-accent" />
                              Service Details
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Event Type</p>
                                <p className="font-medium">{selectedEventType?.label ?? selectedService}</p>
                              </div>
                              {selectedLayouts.length > 0 && (
                                <div>
                                  <p className="text-muted-foreground mb-1">Layouts</p>
                                  <div className="space-y-1">
                                    {selectedLayouts.map((layout) => (
                                      <p key={layout.id} className="font-medium text-sm">
                                        {layout.name}{" "}
                                        <span className="text-muted-foreground">
                                          ({layout.capacity} ppl)
                                        </span>
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground mb-1">{isMultiDay ? "Start Date" : "Date"}</p>
                                <p className="font-medium">{date ? format(date, "PPPP") : ""}</p>
                              </div>
                              {isMultiDay && formData.endDate && (
                                <div>
                                  <p className="text-muted-foreground mb-1">End Date</p>
                                  <p className="font-medium">{format(new Date(formData.endDate), "PPPP")}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground mb-1">Time</p>
                                <p className="font-medium">
                                  {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                                  {duration > 0 && <span className="text-muted-foreground ml-2">({duration.toFixed(1)}h)</span>}
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
                            <h3 className="heading-card">Contact Information</h3>
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
                              <h3 className="heading-card">Selected Add-ons</h3>
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
                              <h3 className="heading-card">Special Requirements</h3>
                              <p className="text-body">{formData.message}</p>
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
            </motion.div>

            {/* Sidebar Summary */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.5 }}
            >
              <div className="sticky top-40 space-y-6">
                {/* Price Summary */}
                <Card className="shadow-premium">
                  <CardHeader>
                    <CardTitle className="heading-card flex items-center gap-2">
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
                              <span className="font-medium">{duration.toFixed(2)} hours</span>
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
                              ${totalPrice.toFixed(2)}
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
                    <CardTitle className="heading-card text-white">Need Assistance?</CardTitle>
                    <CardDescription className="text-body text-white/90">
                      Our team is here to help
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>Call us: (123) 456-7890</p>
                    <p>Email: bookings@visionaryhouse.com</p>
                    <Button variant="outline" asChild>
                      <a href="/contact">Contact Support</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-premium">
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <motion.div 
              className="text-center"
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="heading-card mb-2">
                Instant Confirmation
              </h3>
              <p className="text-small">
                Receive booking confirmation and details immediately via email
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="heading-card mb-2">
                Dedicated Support
              </h3>
              <p className="text-small">
                Personal assistance throughout your booking and event
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent mb-4">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="heading-card mb-2">
                Flexible Modifications
              </h3>
              <p className="text-small">
                Easy booking changes up to 48 hours before your event
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
    </Layout>
  );
}
