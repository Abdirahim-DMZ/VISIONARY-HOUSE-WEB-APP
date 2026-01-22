import { useState } from "react";
import { X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import heroBg from "@/assets/hero-bg.jpg";
import serviceEvent from "@/assets/service-event.jpg";
import serviceLounge from "@/assets/service-lounge.jpg";
import serviceVirtual from "@/assets/service-virtual.jpg";
import serviceMedia from "@/assets/service-media.jpg";

const categories = ["All", "Event Spaces", "Lounge", "Offices", "Media Studio"];

const galleryItems = [
  { src: heroBg, alt: "Executive boardroom with city view", category: "Event Spaces" },
  { src: serviceEvent, alt: "Premium conference hall", category: "Event Spaces" },
  { src: serviceLounge, alt: "Executive lounge area", category: "Lounge" },
  { src: serviceVirtual, alt: "Modern virtual office setup", category: "Offices" },
  { src: serviceMedia, alt: "Professional media studio", category: "Media Studio" },
  { src: serviceLounge, alt: "Private meeting alcove", category: "Lounge" },
  { src: heroBg, alt: "Sunset view from boardroom", category: "Event Spaces" },
  { src: serviceEvent, alt: "Conference setup", category: "Event Spaces" },
  { src: serviceMedia, alt: "Podcast recording room", category: "Media Studio" },
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
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-primary-foreground hover:text-accent transition-colors"
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Gallery image"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Layout>
  );
}
