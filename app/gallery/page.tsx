"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Layout } from "@/components/layout/layout";
import { motion } from "framer-motion";

const categories = ["All", "Event Spaces", "Lounge", "Offices", "Media Studio"];

// Updated gallery images using all assets, grouped into existing categories
const galleryItems = [
  // Event spaces
  { src: "/assets/1.jpg", alt: "Executive boardroom with city view", category: "Event Spaces" },
  { src: "/assets/2.jpg", alt: "Premium conference hall setup", category: "Event Spaces" },
  { src: "/assets/3.jpg", alt: "Modern meeting room with presentation screen", category: "Event Spaces" },
  { src: "/assets/4.jpg", alt: "Large event space with ambient lighting", category: "Event Spaces" },
  // { src: "/assets/6.jpg", alt: "Elegant conference seating arrangement", category: "Event Spaces" },
  // { src: "/assets/214b46de-ce52-47d9-b376-dca5f6032a89.png", alt: "Visionary House event graphic", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.21.jpeg", alt: "Event space prepared for guests", category: "Event Spaces" },
  // { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.21 (1).jpeg", alt: "Alternate angle of premium event space", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.22.jpeg", alt: "Event seating with warm lighting", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.22 (1).jpeg", alt: "Boardroom style event setup", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23.jpeg", alt: "Conference room with presentation ready", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23 (1).jpeg", alt: "Event space with projector and screen", category: "Event Spaces" },
  // { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23 (2).jpeg", alt: "Conference table with comfortable seating", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23 (3).jpeg", alt: "Event space detail shot", category: "Event Spaces" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.23 (4).jpeg", alt: "Evening event ambience", category: "Event Spaces" },

  // Lounge
  { src: "/assets/5.jpg", alt: "Professional lounge area with seating", category: "Lounge" },
  { src: "/assets/q3.jpg", alt: "Private lounge corner for informal meetings", category: "Lounge" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.07.36.jpeg", alt: "Relaxed lounge seating area", category: "Lounge" },
  // { src: "/assets/WhatsApp Image 2025-07-10 at 22.07.36 (1).jpeg", alt: "Lounge space with warm lighting", category: "Lounge" },
  { src: "/assets/WhatsApp Image 2025-07-10 at 22.08.07.jpeg", alt: "Lounge space with decor details", category: "Lounge" },

  // Offices / virtual offices
  { src: "/assets/q4.jpg", alt: "Focused work zone with clean design", category: "Offices" },
  { src: "/assets/q6.tiff", alt: "Quiet corner for focused work", category: "Offices" },

  // Media studio
  { src: "/assets/q1.jpg", alt: "Professional media studio with lighting", category: "Media Studio" },
  { src: "/assets/q2.jpg", alt: "Podcast recording setup in studio", category: "Media Studio" },
  { src: "/assets/q5.jpg", alt: "Creative production environment", category: "Media Studio" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative section-padding">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/2.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        <motion.div
          className="relative z-10 container-premium text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="text-accent font-medium tracking-widest uppercase text-sm mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Gallery
          </motion.p>
          <motion.h1
            className="heading-display text-primary-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Experience Our Spaces
          </motion.h1>
          <motion.p
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Take a visual tour of our premium facilities and discover the
            environments where business excellence thrives.
          </motion.p>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding bg-background">
        <div className="container-premium">
          {/* Category Filter */}
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

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.src}
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
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  quality={85}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div>
                    <p className="text-primary-foreground font-medium">{item.alt}</p>
                    <p className="text-primary-foreground/70 text-sm">{item.category}</p>
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

