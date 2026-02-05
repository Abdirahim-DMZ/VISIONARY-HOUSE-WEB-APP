// Booking Types and Interfaces

/** Catering subcategory: Food = breakfast, lunch; Refreshments = snacks, beverages */
export type CateringSubcategory = 'breakfast' | 'lunch' | 'snacks' | 'beverages';

export interface BookingAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'catering' | 'equipment' | 'services';
  /** Only for category 'catering': breakfast/lunch (Food) or snacks/beverages (Refreshments) */
  subcategory?: CateringSubcategory;
  img?: string;
}

export interface ServiceLayout {
  id: string;
  name: string;
  capacity: number;
  description: string;
  image?: string;
}

export interface BookingSlot {
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface Booking {
  id: string;
  referenceNumber: string;
  
  // Customer Information
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  
  // Booking Details
  serviceType: 'event-space' | 'lounge' | 'virtual-office' | 'media-studio';
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  attendees?: number;
  
  // Layout & Add-Ons
  layoutId?: string;
  addOns: string[]; // Array of Add-On IDs
  
  // Additional Info
  specialRequirements?: string;
  
  // System Fields
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  totalPrice?: number;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  eventType?: string; // id from eventTypes (drives serviceType + isMultiDay)
  guestType?: string; // Government | NGO | Corporate (UI-only)
  serviceType: string;
  date: string;
  endDate?: string; // for multi-day events; same as date when single-day
  startTime: string;
  endTime: string;
  attendees?: string;
  roomSpace?: string; // small-meeting-room | lounge | main-hall | combined-hall (UI-only)
  layoutId?: string; // hall layout when room is hall (UI-only)
  addOns: string[];
  message?: string;
}

export interface AvailabilityCheck {
  date: string;
  startTime: string;
  endTime: string;
  serviceType: string;
}

export interface AvailabilityResult {
  available: boolean;
  conflicts?: Booking[];
  message?: string;
}

export interface BookingConfig {
  bufferMinutes: number; // Buffer time between bookings
  minBookingDuration: number; // Minimum booking duration in minutes
  maxBookingDuration: number; // Maximum booking duration in minutes
  advanceBookingDays: number; // How many days in advance can users book
  businessHours: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  blockedDates: string[]; // ISO date strings
}



