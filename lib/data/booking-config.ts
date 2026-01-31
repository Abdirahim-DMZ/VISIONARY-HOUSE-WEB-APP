import { BookingConfig, ServiceLayout, BookingAddOn } from '@/lib/types/booking';
import coffee from '../../public/assets/coffee.jpg'


// Event types: map to serviceType and control single-day vs multi-day date/time UI
export type EventTypeKind = {
  id: string;
  label: string;
  serviceType: string; // key of serviceTypeNames / serviceLayouts
  isMultiDay: boolean;
};

export const eventTypes: EventTypeKind[] = [
  { id: 'meeting', label: 'Meeting / Small Event (single day)', serviceType: 'event-space', isMultiDay: false },
  { id: 'conference', label: 'Conference / Large Event (multi-day)', serviceType: 'event-space', isMultiDay: true },
  { id: 'board-meeting', label: 'Board Meeting (single day)', serviceType: 'event-space', isMultiDay: false },
  { id: 'training', label: 'Training / Workshop (multi-day)', serviceType: 'event-space', isMultiDay: true },
  { id: 'reception', label: 'Networking / Reception (single day)', serviceType: 'event-space', isMultiDay: false },
  { id: 'media-recording', label: 'Media Recording (multi-day)', serviceType: 'media-studio', isMultiDay: true },
  { id: 'lounge-meeting', label: 'Lounge / Casual Meeting (single day)', serviceType: 'lounge', isMultiDay: false },
  { id: 'virtual-office', label: 'Virtual Office (single day)', serviceType: 'virtual-office', isMultiDay: false },
];

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

// Service Layouts (with optional image for layout gallery modal)
export const serviceLayouts: Record<string, ServiceLayout[]> = {
  'event-space': [
    {
      id: 'boardroom',
      name: 'Boardroom Setup',
      capacity: 20,
      description: 'Traditional boardroom layout with conference table',
      image: '/assets/1.jpg',
    },
    {
      id: 'theater',
      name: 'Theater Style',
      capacity: 100,
      description: 'Auditorium-style seating for presentations',
      image: '/assets/2.jpg',
    },
    {
      id: 'classroom',
      name: 'Classroom Setup',
      capacity: 50,
      description: 'Tables and chairs in rows for training sessions',
      image: '/assets/3.jpg',
    },
    {
      id: 'cocktail',
      name: 'Cocktail Setup',
      capacity: 80,
      description: 'Standing reception with high tables',
      image: '/assets/4.jpg',
    },
    {
      id: 'u-shape',
      name: 'U-Shape Setup',
      capacity: 30,
      description: 'U-shaped arrangement for interactive discussions',
      image: '/assets/5.jpg',
    },
    {
      id: 'banquet',
      name: 'Banquet Style',
      capacity: 60,
      description: 'Round tables for formal dining and networking',
      image: '/assets/6.jpg',
    },
    {
      id: 'hollow-square',
      name: 'Hollow Square',
      capacity: 24,
      description: 'Square arrangement for board meetings',
      image: '/assets/q4.jpg',
    },
    {
      id: 'cabaret',
      name: 'Cabaret Style',
      capacity: 45,
      description: 'Round tables with chairs facing presentation area',
      image: '/assets/q5.jpg',
    },
    {
      id: 'reception',
      name: 'Reception Setup',
      capacity: 120,
      description: 'Open space for networking and mingling',
      image: '/assets/q1.jpg',
    },
    {
      id: 'workshop',
      name: 'Workshop Layout',
      capacity: 40,
      description: 'Flexible setup for hands-on activities',
      image: '/assets/q2.jpg',
    },
    {
      id: 'conference',
      name: 'Conference Style',
      capacity: 70,
      description: 'Formal conference setup with podium',
      image: '/assets/q3.jpg',
    },
    {
      id: 'exhibition',
      name: 'Exhibition Space',
      capacity: 150,
      description: 'Open floor plan for displays and booths',
      image: '/assets/1.jpg',
    },
  ],
  'lounge': [
    {
      id: 'private-alcove',
      name: 'Private Alcove',
      capacity: 4,
      description: 'Intimate seating for small meetings',
      image: '/assets/5.jpg',
    },
    {
      id: 'open-lounge',
      name: 'Open Lounge Access',
      capacity: 12,
      description: 'Full access to lounge facilities',
      image: '/assets/q3.jpg',
    },
  ],
  'media-studio': [
    {
      id: 'podcast',
      name: 'Podcast Setup',
      capacity: 4,
      description: 'Audio recording with professional equipment',
      image: '/assets/q1.jpg',
    },
    {
      id: 'video',
      name: 'Video Production',
      capacity: 6,
      description: '4K video recording with green screen',
      image: '/assets/q2.jpg',
    },
  ],
  'virtual-office': [],
};

// Available Add-ons
export const bookingAddOns: BookingAddOn[] = [
  // Catering — Food (Breakfast, Lunch) and Refreshments (Snacks, Beverages)
  {
    id: 'coffee-tea',
    name: 'Coffee & Tea Service',
    description: 'Continuous coffee and tea service throughout the event',
    price: 150,
    category: 'catering',
    subcategory: 'beverages',
    img: "/assets/coffee.jpg",
  },
  {
    id: 'breakfast',
    name: 'Continental Breakfast',
    description: 'Pastries, fruits, yogurt, and beverages',
    price: 350,
    category: 'catering',
    subcategory: 'breakfast',
    img: "/assets/breakfast.jpg",
  },
  {
    id: 'lunch',
    name: 'Catered Lunch',
    description: 'Full lunch service with choice of menu',
    price: 650,
    category: 'catering',
    subcategory: 'lunch',
    img: "/assets/catered-lunch.jpg",
  },
  {
    id: 'snacks',
    name: 'Premium Snacks',
    description: 'Selection of healthy snacks and refreshments',
    price: 200,
    category: 'catering',
    subcategory: 'snacks',
    img: "/assets/Premium-snacks.jpg",
  },
  
  // Equipment
  {
    id: 'projector',
    name: 'Projector & Screen',
    description: 'HD projector with large screen',
    price: 100,
    category: 'equipment',
    img: "/assets/Projector-Screen.png",
  },
  {
    id: 'video-conf',
    name: 'Video Conferencing',
    description: 'Professional video conferencing setup',
    price: 200,
    category: 'equipment',
    img: "/assets/Video-conferencing.png",
  },
  {
    id: 'sound-system',
    name: 'Premium Sound System',
    description: 'Professional audio system with microphones',
    price: 250,
    category: 'equipment',
    img: "/assets/Premium-sound-system.png",
  },
  {
    id: 'recording',
    name: 'Session Recording',
    description: 'Professional recording of your event',
    price: 300,
    category: 'equipment',
    img: "/assets/Session-recording.png",
  },
  
  // Services
  {
    id: 'tech-support',
    name: 'Technical Support',
    description: 'On-site technical assistance throughout event',
    price: 200,
    category: 'services',
    img: "/assets/Technical-support.png",
  },
  {
    id: 'event-coordinator',
    name: 'Event Coordinator',
    description: 'Dedicated event coordinator for seamless execution',
    price: 400,
    category: 'services',
    img: "/assets/event-coordinator.png",
  },
  {
    id: 'photography',
    name: 'Professional Photography',
    description: 'Event photography with edited photos',
    price: 500,
    category: 'services',
    img: "/assets/photography.png",
  },
  {
    id: 'setup-cleanup',
    name: 'Setup & Cleanup',
    description: 'Complete setup and post-event cleanup',
    price: 150,
    category: 'services',
    img: "/assets/setup-cleanup.png",
  },
];

// Service Type Display Names
export const serviceTypeNames: Record<string, string> = {
  'event-space': 'Event Space',
  'lounge': 'Lounge Suite',
  'virtual-office': 'Virtual Office',
  'media-studio': 'Media Studio',
};



