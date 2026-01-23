import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Visionary House - Premium Business Environment",
    template: "%s | Visionary House",
  },
  description:
    "A premium business ecosystem designed for visionary founders, executives, and enterprises seeking excellence. Featuring event spaces, lounge suites, virtual offices, and professional media services.",
  keywords: [
    "premium business environment",
    "event space rental",
    "virtual office",
    "media studio",
    "coworking space",
    "boardroom rental",
    "professional workspace",
    "business lounge",
    "visionary entrepreneurs",
  ],
  authors: [{ name: "Visionary House" }],
  creator: "Visionary House",
  publisher: "Visionary House",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://visionaryhouse.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://visionaryhouse.com",
    title: "Visionary House - Premium Business Environment",
    description:
      "A premium business ecosystem designed for visionary founders, executives, and enterprises seeking excellence.",
    siteName: "Visionary House",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Visionary House - Premium Business Environment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visionary House - Premium Business Environment",
    description:
      "A premium business ecosystem designed for visionary founders, executives, and enterprises seeking excellence.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${lora.variable}`}>
      <body className="font-sans">
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

