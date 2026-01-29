"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  heroContentTransition,
  heroDescriptionTransition,
  heroEyebrowTransition,
  heroTitleTransition,
} from "@/lib/constants/animations";

export interface PageHeroProps {
  /** Short label above the title (e.g. "Our Services", "Contact Us") */
  eyebrow: string;
  /** Main headline */
  title: string;
  /** Optional description below the title */
  description?: string;
  /**
   * Background: CSS url() string for background-image (e.g. "/assets/1.jpg").
   * Used as style={{ backgroundImage: `url(${backgroundImage})` }}.
   */
  backgroundImage?: string;
  /**
   * Alternative to backgroundImage: use Next/Image for background.
   * When set, backgroundImage is ignored.
   */
  imageSrc?: string;
  imageAlt?: string;
  /** Extra class for the section element (e.g. overflow-hidden, padding variants) */
  sectionClassName?: string;
  /** Class for the title (e.g. text-[#B7974B] or text-primary-foreground) */
  titleClassName?: string;
  /** Class for the eyebrow text (e.g. text-accent or text-primary-foreground) */
  eyebrowClassName?: string;
}

const defaultTitleClassName = "text-[#B7974B]";
const defaultEyebrowClassName = "text-primary-foreground font-medium tracking-widest uppercase text-sm mb-4";

export function PageHero({
  eyebrow,
  title,
  description,
  backgroundImage,
  imageSrc,
  imageAlt = "",
  sectionClassName = "",
  titleClassName = defaultTitleClassName,
  eyebrowClassName = defaultEyebrowClassName,
}: PageHeroProps) {
  const sectionClasses = `relative ${sectionClassName || "section-padding"}`.trim();

  return (
    <section className={sectionClasses}>
      {/* Background */}
      <div className="absolute inset-0">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              }}
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          </>
        )}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 container-premium text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={heroContentTransition}
      >
        <motion.p
          className={eyebrowClassName}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={heroEyebrowTransition}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          className={`heading-display mb-6 ${titleClassName}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={heroTitleTransition}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={heroDescriptionTransition}
          >
            {description}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
