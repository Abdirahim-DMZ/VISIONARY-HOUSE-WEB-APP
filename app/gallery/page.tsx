"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { PageHero } from "@/components/sections";
import { motion } from "framer-motion";
import { fetchGalleryPage, isStrapiConfigured } from "@/lib/strapi";
import { getGalleryPageHeroImageUrl, mapGalleryPageImages } from "@/lib/strapi/mappers";

const fallbackGalleryItems = [
  { src: "/assets/1.jpg", alt: "Executive boardroom with city view", title: "Executive boardroom with city view", category: "All" },
  { src: "/assets/2.jpg", alt: "Premium conference hall setup", title: "Premium conference hall setup", category: "All" },
  { src: "/assets/3.jpg", alt: "Modern meeting room with presentation screen", title: "Modern meeting room with presentation screen", category: "All" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: galleryPageData, isLoading: galleryPageLoading, isError: galleryPageError } = useQuery({
    queryKey: ["strapi", "gallery-page"],
    queryFn: fetchGalleryPage,
    enabled: isStrapiConfigured(),
    staleTime: 60_000,
  });

  const heroEyebrow = galleryPageData?.heroEyebrow ?? "Gallery";
  const heroTitle = galleryPageData?.heroTitle ?? "Experience Our Spaces";
  const heroDescription = galleryPageData?.heroDescription ?? "Take a visual tour of our premium facilities and discover the environments where business excellence thrives.";
  const heroImageSrc = getGalleryPageHeroImageUrl(galleryPageData ?? null);

  const mappedImages = mapGalleryPageImages(galleryPageData ?? null);
  const galleryItems = mappedImages.length > 0 ? mappedImages : fallbackGalleryItems;

  const categories = useMemo(() => {
    const cats = Array.from(new Set(galleryItems.map((i) => i.category).filter(Boolean)));
    if (cats.length <= 1) return ["All"];
    return ["All", ...cats.sort()];
  }, [galleryItems]);

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const isLoading = isStrapiConfigured() && galleryPageLoading;
  const isError = isStrapiConfigured() && galleryPageError;

  return (
    <Layout>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: "70%" }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.2 }}
            style={{ originX: 0 }}
          />
        </div>
      )}
      {isError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-center py-2 px-4 text-sm">
          Unable to load latest content. Showing default content.
        </div>
      )}
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        description={heroDescription}
        imageSrc={heroImageSrc}
        imageAlt=""
        titleClassName="text-[#B7974B]"
        sectionClassName="py-32 md:py-40 overflow-hidden"
      />

      {/* Gallery Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          {categories.length > 1 && (
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              {categories.map((category) => (
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
          )}

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.src ? `${item.title}-${index}` : index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.25 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                onClick={() => setSelectedImage(item.src)}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer shadow-elevated"
              >
                <Image
                  src={item.src}
                  alt={item.alt || item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  quality={85}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div>
                    <p className="text-primary-foreground font-medium">{item.title || item.alt}</p>
                    {item.category && item.category !== "All" && (
                      <p className="text-primary-foreground/70 text-sm">{item.category}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-primary/50 hover:bg-primary/70 text-primary-foreground hover:text-accent transition-all z-10"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              className="relative max-w-[95vw] max-h-[90vh] w-auto h-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Gallery image"
                width={1600}
                height={900}
                quality={90}
                className="object-contain rounded-lg shadow-elevated max-w-full max-h-[90vh] w-auto h-auto"
                priority
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </Layout>
  );
}

