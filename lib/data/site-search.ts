/**
 * Searchable entries for the universal website search.
 * Each entry has label (display), href, and keywords for matching.
 */
export type SiteSearchEntry = {
  label: string;
  href: string;
  keywords: string[];
  category: "page" | "service" | "action";
};

export const siteSearchEntries: SiteSearchEntry[] = [
  // Main pages
  { label: "Home", href: "/", keywords: ["home", "main", "visionary house"], category: "page" },
  { label: "About Us", href: "/about", keywords: ["about", "us", "company", "story", "team"], category: "page" },
  { label: "Services", href: "/services", keywords: ["services", "offerings", "what we offer"], category: "page" },
  { label: "Gallery", href: "/gallery", keywords: ["gallery", "photos", "images", "spaces", "venue"], category: "page" },
  { label: "My Bookings", href: "/bookings", keywords: ["bookings", "my booking", "find booking", "reference", "manage"], category: "page" },
  { label: "Contact", href: "/contact", keywords: ["contact", "support", "help", "call", "email", "reach"], category: "page" },
  // Book
  { label: "Book Now", href: "/book", keywords: ["book", "reserve", "booking", "schedule", "event space", "meeting"], category: "action" },
  // Services (detailed)
  { label: "Event Space", href: "/services#event-space", keywords: ["event", "space", "conference", "meeting", "board", "corporate"], category: "service" },
  { label: "Lounge Suite", href: "/services#lounge", keywords: ["lounge", "suite", "relaxation", "private"], category: "service" },
  { label: "Virtual Offices", href: "/services#virtual-offices", keywords: ["virtual", "office", "mail", "address", "business presence"], category: "service" },
  { label: "Media Services", href: "/services#media", keywords: ["media", "studio", "podcast", "video", "content"], category: "service" },
];
