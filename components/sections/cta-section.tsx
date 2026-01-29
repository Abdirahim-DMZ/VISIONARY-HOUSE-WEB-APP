"use client";

import { motion } from "framer-motion";
import { viewportDefault } from "@/lib/constants/animations";

export interface CtaSectionProps {
  /** CTA heading (h2) */
  title: string;
  /** Description paragraph */
  description: string;
  /** Button(s) or links – render as children (e.g. Link + Button) */
  children: React.ReactNode;
  /** Optional section wrapper class (e.g. section-padding bg-background) */
  sectionClassName?: string;
  /** Optional title text color class */
  titleClassName?: string;
}

export function CtaSection({
  title,
  description,
  children,
  sectionClassName = "section-padding",
  titleClassName = "text-foreground",
}: CtaSectionProps) {
  return (
    <section className={sectionClassName}>
      <motion.div
        className="container-premium text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportDefault}
        transition={{ duration: 0.6 }}
      >
        <h2 className={`heading-section ${titleClassName} mb-6`}>
          {title}
        </h2>
        <p className="text-body max-w-2xl mx-auto mb-10">{description}</p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportDefault}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
