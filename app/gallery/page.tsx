"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Layout } from "@/components/layout/layout";

const categories = ["All", "Event Spaces", "Lounge", "Offices", "Media Studio"];

const galleryItems = [
  { src: "/assets/hero-bg.jpg", alt: "Professional boardroom with city view", category: "Event Spaces" },
  { src: "/assets/service-event.jpg", alt: "Premium conference hall", category: "Event Spaces" },
  { src: "/assets/service-lounge.jpg", alt: "Professional lounge area", category: "Lounge" },
  { src: "/assets/service-virtual.jpg", alt: "Modern virtual office setup", category: "Offices" },
  { src: "/assets/service-media.jpg", alt: "Professional media studio", category: "Media Studio" },
  { src: "/assets/service-lounge.jpg", alt: "Private meeting alcove", category: "Lounge" },
  { src: "/assets/hero-bg.jpg", alt: "Sunset view from boardroom", category: "Event Spaces" },
  { src: "/assets/service-event.jpg", alt: "Conference setup", category: "Event Spaces" },
  { src: "/assets/service-media.jpg", alt: "Podcast recording room", category: "Media Studio" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-hero">
        <div className="container-premium text-center">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
            Gallery
          </p>
          <h1 className="heading-display text-primary-foreground mb-6">
            Experience Our Spaces
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Take a visual tour of our premium facilities and discover the 
            environments where business excellence thrives.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(item.src)}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div>
                    <p className="text-primary-foreground font-medium">{item.alt}</p>
                    <p className="text-primary-foreground/70 text-sm">{item.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-primary/50 hover:bg-primary/70 text-primary-foreground hover:text-accent transition-all z-10"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-[95vw] max-h-[90vh] w-auto h-auto">
              <Image
                src={selectedImage}
                alt="Gallery image"
                width={1920}
                height={1080}
                quality={100}
                className="object-contain rounded-lg shadow-elevated max-w-full max-h-[90vh] w-auto h-auto"
                onClick={(e) => e.stopPropagation()}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

