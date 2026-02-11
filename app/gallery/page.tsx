"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { Layout } from "@/components/layout/layout";
import { PageHero, PageHeroSkeleton } from "@/components/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchGalleryPage, isStrapiConfigured } from "@/lib/strapi";
import {
  getGalleryPageHeroImageUrl,
  mapGalleryPageImages,
} from "@/lib/strapi/mappers";

const CATEGORIES = ["All", "Event Spaces", "Lounge", "Offices", "Media Studio"];

const fallbackGalleryItems = [
  { src: "/assets/1.jpg", alt: "Executive boardroom with city view", category: "Event Spaces" },
  { src: "/assets/2.jpg", alt: "Premium conference hall setup", category: "Event Spaces" },
  { src: "/assets/3.jpg", alt: "Modern meeting room with presentation screen", category: "Event Spaces" },
  { src: "/assets/4.jpg", alt: "Large event space with ambient lighting", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.21.jpeg", alt: "Event space prepared for guests", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.22.jpeg", alt: "Event seating with warm lighting", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.22 (1).jpeg", alt: "Boardroom style event setup", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23.jpeg", alt: "Conference room with presentation ready", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23 (1).jpeg", alt: "Event space with projector and screen", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23 (3).jpeg", alt: "Event space detail shot", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23 (4).jpeg", alt: "Evening event ambience", category: "Event Spaces" },

  { src: "/assets/5.jpg", alt: "Professional lounge area with seating", category: "Lounge" },
  { src: "/assets/q3.jpg", alt: "Private lounge corner for informal meetings", category: "Lounge" },

  { src: "/assets/q2.jpg", alt: "Podcast recording setup in studio", category: "Media Studio" },
  { src: "/assets/q5.jpg", alt: "Creative production environment", category: "Media Studio" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: galleryPageData, isLoading, isError } = useQuery({
    queryKey: ["strapi", "gallery-page"],
    queryFn: fetchGalleryPage,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });

  const heroEyebrow = galleryPageData?.heroEyebrow ?? "Gallery";
  const heroTitle = galleryPageData?.heroTitle ?? "Experience Our Spaces";
  const heroDescription =
      galleryPageData?.heroDescription ??
      "Take a visual tour of our premium facilities and discover the environments where business excellence thrives.";
  const heroImageSrc = getGalleryPageHeroImageUrl(galleryPageData ?? null);

  const mappedGalleryItems = useMemo(() => {
    if (!galleryPageData) return [];
    return mapGalleryPageImages(galleryPageData).map((item) => ({
      src: item.src,
      alt: item.alt || item.title || "Gallery image",
      category: item.category || "Event Spaces",
    }));
  }, [galleryPageData]);

  const isLoadingFlag = isStrapiConfigured() && isLoading;
  const isErrorFlag = isStrapiConfigured() && isError;
  const galleryItems =
      isErrorFlag
          ? fallbackGalleryItems
          : (mappedGalleryItems.length > 0 ? mappedGalleryItems : fallbackGalleryItems);

  const filteredItems =
      activeCategory === "All"
          ? galleryItems
          : galleryItems.filter((item) => item.category === activeCategory);

  return (
      <Layout>
        {isErrorFlag && (
            <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-center py-2 text-sm">
              Unable to load latest content. Showing default gallery.
            </div>
        )}

        {isLoadingFlag ? (
            <PageHeroSkeleton sectionClassName="py-32 md:py-40 overflow-hidden" />
        ) : (
        <PageHero
            eyebrow={heroEyebrow}
            title={heroTitle}
            description={heroDescription}
            imageSrc={heroImageSrc}
            imageAlt=""
            titleClassName="text-[#B7974B]"
            sectionClassName="py-32 md:py-40 overflow-hidden"
        />
        )}

        {/* Gallery section - show skeleton while loading */}
        {isLoadingFlag ? (
        <section className="section-padding bg-background">
          <div className="container-premium">
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {CATEGORIES.map((c) => (
                <Skeleton key={c} className="h-10 w-24 rounded-full" />
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          </div>
        </section>
        ) : (
        <section className="section-padding bg-background">
          <div className="container-premium">
            <motion.div
                className="flex flex-wrap justify-center gap-3 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
              {CATEGORIES.map((category) => (
                  <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          activeCategory === category
                              ? "bg-primary text-primary-foreground shadow-gold"
                              : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                      }`}
                  >
                    {category}
                  </button>
              ))}
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                  <motion.div
                      key={`${item.src}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.4, delay: index * 0.03 }}
                      onClick={() => setSelectedImage(item.src)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer shadow-elevated"
                  >
                    <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        quality={85}
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div>
                        <p className="text-primary-foreground font-medium">
                          {item.alt}
                        </p>
                        <p className="text-primary-foreground/70 text-sm">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>
        )}

        {selectedImage && (
            <motion.div
                className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setSelectedImage(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
              <button
                  className="absolute top-6 right-6 p-2 rounded-full bg-primary/50 text-primary-foreground"
                  onClick={() => setSelectedImage(null)}
              >
                <X size={28} />
              </button>

              <motion.div
                  className="relative max-w-[95vw] max-h-[90vh]"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  onClick={(e) => e.stopPropagation()}
              >
                <Image
                    src={selectedImage}
                    alt="Gallery image"
                    width={1600}
                    height={900}
                    className="object-contain rounded-lg shadow-elevated max-h-[90vh]"
                    priority
                />
              </motion.div>
            </motion.div>
        )}
      </Layout>
  );
}
