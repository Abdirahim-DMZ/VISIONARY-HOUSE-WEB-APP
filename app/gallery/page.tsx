"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Layout } from "@/components/layout/layout";
import { motion } from "framer-motion";

const categories = ["All", "Event Spaces", "Lounge", "Offices", "Media Studio"];

// Updated gallery images using real assets, grouped by category
const galleryItems = [
  // Event spaces
  { src: "/assets/1.jpg", alt: "Executive boardroom with city view", category: "Event Spaces" },
  { src: "/assets/2.jpg", alt: "Premium conference hall setup", category: "Event Spaces" },
  { src: "/assets/4.jpg", alt: "Large event space with ambient lighting", category: "Event Spaces" },

  // Lounge
  { src: "/assets/5.jpg", alt: "Professional lounge area with seating", category: "Lounge" },
  { src: "/assets/q3.jpg", alt: "Private lounge corner for informal meetings", category: "Lounge" },

  // Offices / virtual offices
  { src: "/assets/3.jpg", alt: "Modern virtual office workstation", category: "Offices" },
  { src: "/assets/q4.jpg", alt: "Focused work zone with clean design", category: "Offices" },

  // Media studio
  { src: "/assets/q1.jpg", alt: "Professional media studio with lighting", category: "Media Studio" },
  { src: "/assets/q2.jpg", alt: "Podcast recording setup in studio", category: "Media Studio" },
  { src: "/assets/q5.jpg", alt: "Creative production environment", category: "Media Studio" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Animation variants consistent with Home / About / Services
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-hero">
        <motion.div
          className="container-premium text-center"
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
          <motion.div
            key={activeCategory}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.2 }}
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item.src}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
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
          </motion.div>
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

