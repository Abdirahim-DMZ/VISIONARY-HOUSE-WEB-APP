"use client";

import { motion } from "framer-motion";
import { viewportDefault } from "@/lib/constants/animations";

export interface SectionHeaderProps {
  /** Optional short label above the title (e.g. "Our Services", "Testimonials") */
  eyebrow?: string;
  /** Section title (h2) */
  title: string;
  /** Optional description paragraph below the title */
  description?: string;
  /** Whether to render with motion (use when section is in view) */
  animated?: boolean;
  /** Extra class for the wrapper */
  className?: string;
  /** Optional title className override */
  titleClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  animated = true,
  className = "",
  titleClassName = "text-foreground",
}: SectionHeaderProps) {
  const content = (
    <>
      {eyebrow && (
        <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
          {eyebrow}
        </p>
      )}
      <h2 className={`heading-section ${description ? "mb-6" : ""} ${titleClassName}`.trim()}>
        {title}
      </h2>
      {description && (
        <p className="text-body max-w-2xl mx-auto">{description}</p>
      )}
    </>
  );

  const wrapperClass = `text-center mb-16 ${className}`.trim();

  if (animated) {
    return (
      <motion.div
        className={wrapperClass}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportDefault}
        transition={{ duration: 0.6 }}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
