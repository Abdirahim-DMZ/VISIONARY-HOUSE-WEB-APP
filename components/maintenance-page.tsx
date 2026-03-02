import { Key } from "lucide-react";

/**
 * Full-page "Website Under Maintenance" view.
 * Shown when Strapi config maintenance_mode is true; all routes display only this page.
 * Matches Visionary House design: Lora serif title, Poppins body, gold accent, cream background.
 */
export function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12 font-sans">
      <div className="max-w-xl mx-auto w-full text-center">
        {/* Brand */}
        <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-16">
          Visionary House
        </p>

        {/* Key icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-muted/80 flex items-center justify-center border border-border shadow-sm">
            <Key className="w-10 h-10 text-accent" strokeWidth={1.25} aria-hidden />
          </div>
        </div>

        {/* Title with gold underline (site style) */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.5rem] font-bold tracking-tight text-foreground">
          Website Under Maintenance
        </h1>
        <div className="mt-4 mb-8 mx-auto w-16 h-0.5 bg-accent rounded-full" aria-hidden />

        {/* Body */}
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto">
          We are currently performing scheduled maintenance to improve your experience.
          Please check back shortly.
        </p>
        <p className="mt-6 text-muted-foreground text-sm sm:text-base">
          Thank you for your patience.
        </p>

        {/* Separator & signature */}
        <div className="mt-10 pt-6 border-t border-border max-w-xs mx-auto">
          <span className="text-foreground/90 text-sm font-medium tracking-wide">
            — Visionary House
          </span>
        </div>
      </div>
    </div>
  );
}
