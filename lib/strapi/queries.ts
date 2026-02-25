/**
 * Strapi API query helpers.
 * Use populate and sort as needed for your Strapi version (v4 vs v5 query format may differ).
 */

import { strapiFetch, isStrapiConfigured } from "./client";
import type {
  StrapiSingleResponse,
  StrapiCollectionResponse,
  GlobalAttr,
  HomepageAttr,
  AboutPageAttr,
  StrapiService,
  StrapiServiceLayout,
  StrapiRoomSpace,
  StrapiAddOn,
  StrapiEventType,
  StrapiTestimonial,
  StrapiFaq,
  StrapiNavLink,
  StrapiGalleryCategory,
  StrapiGalleryItem,
  StrapiBooking,
  StrapiGuestType,
  BookingSettingsAttr,
  ConfigsAttr,
  ServicePageAttr,
  GalleryPageAttr,
  ContactPageAttr,
  BookPageAttr,
  PoliciesPageAttr,
} from "./types";

const POPULATE_DEEP = "populate=*"; // adjust for nested relations if needed, e.g. populate[image]=*

// ---- Single types ----
export async function fetchGlobal(): Promise<GlobalAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiSingleResponse<{ id: number; attributes: GlobalAttr }>>(
      `/api/global?${POPULATE_DEEP}`
    );
    return res?.data?.attributes ?? null;
  } catch {
    return null;
  }
}

export async function fetchHomepage(): Promise<HomepageAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiSingleResponse<{ id: number; attributes?: HomepageAttr } & Partial<HomepageAttr>>>(
      `/api/homepage?populate[homeService][populate][serviceImage]=true&populate[heroSection][populate][bgImage]=true&populate[homeWhyChooseFeature][populate]=true&populate[whyChooseUsImage][populate]=true`
    );
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: HomepageAttr }).attributes ?? (raw as HomepageAttr);
  } catch {
    return null;
  }
}

export async function fetchAboutPage(): Promise<AboutPageAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiSingleResponse<{ id: number; attributes?: AboutPageAttr } & Partial<AboutPageAttr>>>(
      `/api/about-page?${POPULATE_DEEP}`
    );
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: AboutPageAttr }).attributes ?? (raw as AboutPageAttr);
  } catch {
    return null;
  }
}

export async function fetchServicePage(): Promise<ServicePageAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiSingleResponse<{ id: number; attributes?: ServicePageAttr } & Partial<ServicePageAttr>>>(
      `/api/service-page?populate[serviceComponent][populate][feature]=true&populate[serviceComponent][populate][image]=true&populate[heroImage][populate]=true`
    );
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: ServicePageAttr }).attributes ?? (raw as ServicePageAttr);
  } catch {
    return null;
  }
}

export async function fetchGalleryPage(): Promise<GalleryPageAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiSingleResponse<{ id: number; attributes?: GalleryPageAttr } & Partial<GalleryPageAttr>>>(
      `/api/gallery-page?populate[heroImage][populate]=true&populate[image][populate][image]=true`
    );
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: GalleryPageAttr }).attributes ?? (raw as GalleryPageAttr);
  } catch {
    return null;
  }
}

export async function fetchContactPage(): Promise<ContactPageAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiSingleResponse<{ id: number; attributes?: ContactPageAttr } & Partial<ContactPageAttr>>>(
      `/api/contact-page?populate[heroBackgroundImage][populate]=true`
    );
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: ContactPageAttr }).attributes ?? (raw as ContactPageAttr);
  } catch {
    return null;
  }
}

export async function fetchBookPage(): Promise<BookPageAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiSingleResponse<{ id: number; attributes?: BookPageAttr } & Partial<BookPageAttr>>>(
      `/api/book-from-page?populate[heroImage][populate]=true&populate[feature][populate]=true&populate[helpCard][populate]=true`
    );
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: BookPageAttr }).attributes ?? (raw as BookPageAttr);
  } catch {
    return null;
  }
}

export async function fetchBookingSettings(): Promise<BookingSettingsAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<
      StrapiSingleResponse<{ id: number; attributes?: BookingSettingsAttr } & Partial<BookingSettingsAttr>>
    >(`/api/booking-settings?populate[heroImage][populate]=true`);
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: BookingSettingsAttr }).attributes ?? (raw as BookingSettingsAttr);
  } catch {
    return null;
  }
}

export async function fetchConfigs(): Promise<ConfigsAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<
      StrapiSingleResponse<{ id: number; attributes?: ConfigsAttr } & Partial<ConfigsAttr>>
    >(`/api/configs`);
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: ConfigsAttr }).attributes ?? (raw as ConfigsAttr);
  } catch {
    return null;
  }
}

export async function fetchPoliciesPage(): Promise<PoliciesPageAttr | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<
      StrapiSingleResponse<{ id: number; attributes?: PoliciesPageAttr } & Partial<PoliciesPageAttr>>
    >(
      `/api/policies-page?populate[heroBackgroundImage][populate]=true&populate[policies][populate][content]=true`
    );
    const raw = res?.data;
    if (!raw) return null;
    return (raw as { attributes?: PoliciesPageAttr }).attributes ?? (raw as PoliciesPageAttr);
  } catch {
    return null;
  }
}

// ---- Collection types ----
export async function fetchServices(): Promise<StrapiService[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiService>>(
      `/api/services?${POPULATE_DEEP}&sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchServiceLayouts(serviceSlug?: string): Promise<StrapiServiceLayout[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const filter = serviceSlug ? `&filters[service][slug][$eq]=${encodeURIComponent(serviceSlug)}` : "";
    const res = await strapiFetch<StrapiCollectionResponse<StrapiServiceLayout>>(
      `/api/service-layouts?${POPULATE_DEEP}&sort=sortOrder:asc${filter}`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchRoomSpaces(): Promise<StrapiRoomSpace[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiRoomSpace>>(
      `/api/room-spaces?${POPULATE_DEEP}&sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAddOns(): Promise<StrapiAddOn[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiAddOn>>(
      `/api/add-ons?${POPULATE_DEEP}&sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchEventTypes(): Promise<StrapiEventType[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiEventType>>(
      `/api/event-types?${POPULATE_DEEP}&sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchGuestTypes(): Promise<StrapiGuestType[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiGuestType>>(
      `/api/guest-types?${POPULATE_DEEP}&sort=guestType:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchTestimonials(): Promise<StrapiTestimonial[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiTestimonial>>(
      `/api/testimonials?sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchFaqs(): Promise<StrapiFaq[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiFaq>>(
      `/api/faqs?sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchNavLinks(): Promise<StrapiNavLink[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiNavLink>>(
      `/api/nav-links?sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchGalleryCategories(): Promise<StrapiGalleryCategory[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiGalleryCategory>>(
      `/api/gallery-categories?sort=sortOrder:asc`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchGalleryItems(categorySlug?: string): Promise<StrapiGalleryItem[]> {
  if (!isStrapiConfigured()) return [];
  try {
    const filter = categorySlug
      ? `&filters[category][slug][$eq]=${encodeURIComponent(categorySlug)}`
      : "";
    const res = await strapiFetch<StrapiCollectionResponse<StrapiGalleryItem>>(
      `/api/gallery-items?${POPULATE_DEEP}&sort=sortOrder:asc${filter}`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

// ---- Booking: create (via Next.js API that calls Strapi) and find by reference ----
export async function findBookingByReference(
  referenceNumber: string,
  customerEmail: string
): Promise<StrapiBooking | null> {
  if (!isStrapiConfigured()) return null;
  try {
    const res = await strapiFetch<StrapiCollectionResponse<StrapiBooking>>(
      `/api/bookings?filters[referenceNumber][$eq]=${encodeURIComponent(referenceNumber)}&filters[customerEmail][$eq]=${encodeURIComponent(customerEmail)}&${POPULATE_DEEP}`
    );
    const first = res?.data?.[0];
    return first ?? null;
  } catch {
    return null;
  }
}
