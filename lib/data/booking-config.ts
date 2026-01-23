import { BookingConfig, ServiceLayout, BookingAddOn } from '@/lib/types/booking';

// System Configuration
export const bookingConfig: BookingConfig = {
  bufferMinutes: 30, // 30 minutes buffer between bookings
  minBookingDuration: 60, // 1 hour minimum
  maxBookingDuration: 480, // 8 hours maximum
  advanceBookingDays: 90, // Can book up to 90 days in advance
  businessHours: {
    start: '08:00',
    end: '20:00',
  },
  blockedDates: [], // Add holiday dates here
};

// Service Layouts
export const serviceLayouts: Record<string, ServiceLayout[]> = {
  'event-space': [
    {
      id: 'boardroom',
      name: 'Boardroom Setup',
      capacity: 20,
      description: 'Traditional boardroom layout with conference table',
    },
    {
      id: 'theater',
      name: 'Theater Style',
      capacity: 100,
      description: 'Auditorium-style seating for presentations',
    },
    {
      id: 'classroom',
      name: 'Classroom Setup',
      capacity: 50,
      description: 'Tables and chairs in rows for training sessions',
    },
    {
      id: 'cocktail',
      name: 'Cocktail Setup',
      capacity: 80,
      description: 'Standing reception with high tables',
    },
  ],
  'lounge': [
    {
      id: 'private-alcove',
      name: 'Private Alcove',
      capacity: 4,
      description: 'Intimate seating for small meetings',
    },
    {
      id: 'open-lounge',
      name: 'Open Lounge Access',
      capacity: 12,
      description: 'Full access to lounge facilities',
    },
  ],
  'media-studio': [
    {
      id: 'podcast',
      name: 'Podcast Setup',
      capacity: 4,
      description: 'Audio recording with professional equipment',
    },
    {
      id: 'video',
      name: 'Video Production',
      capacity: 6,
      description: '4K video recording with green screen',
    },
  ],
  'virtual-office': [],
};

// Available Add-ons
export const bookingAddOns: BookingAddOn[] = [
  // Catering
  {
    id: 'coffee-tea',
    name: 'Coffee & Tea Service',
    description: 'Continuous coffee and tea service throughout the event',
    price: 150,
    category: 'catering',
  },
  {
    id: 'breakfast',
    name: 'Continental Breakfast',
    description: 'Pastries, fruits, yogurt, and beverages',
    price: 350,
    category: 'catering',
  },
  {
    id: 'lunch',
    name: 'Catered Lunch',
    description: 'Full lunch service with choice of menu',
    price: 650,
    category: 'catering',
  },
  {
    id: 'snacks',
    name: 'Premium Snacks',
    description: 'Selection of healthy snacks and refreshments',
    price: 200,
    category: 'catering',
  },
  
  // Equipment
  {
    id: 'projector',
    name: 'Projector & Screen',
    description: 'HD projector with large screen',
    price: 100,
    category: 'equipment',
  },
  {
    id: 'video-conf',
    name: 'Video Conferencing',
    description: 'Professional video conferencing setup',
    price: 200,
    category: 'equipment',
  },
  {
    id: 'sound-system',
    name: 'Premium Sound System',
    description: 'Professional audio system with microphones',
    price: 250,
    category: 'equipment',
  },
  {
    id: 'recording',
    name: 'Session Recording',
    description: 'Professional recording of your event',
    price: 300,
    category: 'equipment',
  },
  
  // Services
  {
    id: 'tech-support',
    name: 'Technical Support',
    description: 'On-site technical assistance throughout event',
    price: 200,
    category: 'services',
  },
  {
    id: 'event-coordinator',
    name: 'Event Coordinator',
    description: 'Dedicated event coordinator for seamless execution',
    price: 400,
    category: 'services',
  },
  {
    id: 'photography',
    name: 'Professional Photography',
    description: 'Event photography with edited photos',
    price: 500,
    category: 'services',
  },
  {
    id: 'setup-cleanup',
    name: 'Setup & Cleanup',
    description: 'Complete setup and post-event cleanup',
    price: 150,
    category: 'services',
  },
];

// Service Type Display Names
export const serviceTypeNames: Record<string, string> = {
  'event-space': 'Event Space',
  'lounge': 'Lounge Suite',
  'virtual-office': 'Virtual Office',
  'media-studio': 'Media Studio',
};



