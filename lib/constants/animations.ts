/**
 * Shared Framer Motion animation variants used across page sections.
 * Ensures consistent motion behavior and easier maintenance.
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const heroContentTransition = { duration: 0.8 };
export const heroEyebrowTransition = { delay: 0.2, duration: 0.6 };
export const heroTitleTransition = { delay: 0.3, duration: 0.6 };
export const heroDescriptionTransition = { delay: 0.4, duration: 0.6 };

export const viewportDefault = { once: false, amount: 0.3 };
export const viewportTight = { once: false, amount: 0.2 };
