"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";

export default function NotFound() {
  return (
    <Layout>
      <section className="section-padding bg-background min-h-[70vh] flex items-center">
        <div className="container-premium text-center">
          <div className="max-w-2xl mx-auto">
            <p className="font-heading text-8xl md:text-9xl font-bold text-accent mb-6">
              404
            </p>
            <h1 className="heading-display text-foreground mb-6">
              Page Not Found
            </h1>
            <p className="text-body mb-10">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. 
              Let&apos;s get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="gold" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Button>
              </Link>
              <Button
                variant="premium-outline"
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

