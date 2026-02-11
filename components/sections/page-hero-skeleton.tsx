"use client";

import { Skeleton } from "@/components/ui/skeleton";

export interface PageHeroSkeletonProps {
  /** Extra class for the section element */
  sectionClassName?: string;
}

/**
 * Skeleton loader for PageHero. Use when Strapi page data is loading.
 * Matches PageHero visual style: dark background with visible skeleton placeholders.
 */
export function PageHeroSkeleton({ sectionClassName = "" }: PageHeroSkeletonProps) {
  const sectionClasses = sectionClassName || "py-32 md:py-40 overflow-hidden";

  return (
    <section className={`relative min-h-[400px] md:min-h-[450px] flex items-center justify-center ${sectionClasses}`.trim()}>
      <div className="absolute inset-0 bg-charcoal" />
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="relative z-10 container-premium text-center w-full py-12">
        <Skeleton className="h-4 w-24 mx-auto mb-4 bg-primary-foreground/20" />
        <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-6 bg-primary-foreground/20" />
        <Skeleton className="h-12 w-3/4 max-w-xl mx-auto mb-6 bg-primary-foreground/20" />
        <Skeleton className="h-5 w-full max-w-lg mx-auto bg-primary-foreground/20" />
      </div>
    </section>
  );
}
