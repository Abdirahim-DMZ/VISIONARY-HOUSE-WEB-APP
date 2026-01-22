import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ExecutiveHub - Premium Executive Business Environment",
    template: "%s | ExecutiveHub",
  },
  description:
    "A premium executive ecosystem designed for founders, executives, and enterprises seeking excellence. Featuring event spaces, lounge suites, virtual offices, and professional media services.",
  keywords: [
    "executive office space",
    "premium business environment",
    "event space rental",
    "virtual office",
    "media studio",
    "coworking space",
    "boardroom rental",
    "executive lounge",
    "professional workspace",
  ],
  authors: [{ name: "ExecutiveHub" }],
  creator: "ExecutiveHub",
  publisher: "ExecutiveHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://executivehub.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://executivehub.com",
    title: "ExecutiveHub - Premium Executive Business Environment",
    description:
      "A premium executive ecosystem designed for founders, executives, and enterprises seeking excellence.",
    siteName: "ExecutiveHub",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ExecutiveHub - Premium Business Environment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExecutiveHub - Premium Executive Business Environment",
    description:
      "A premium executive ecosystem designed for founders, executives, and enterprises seeking excellence.",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
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

