"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Menu, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {UniversalSearchBar} from "@/components/sections";
import {cn} from "@/lib/utils";
import logo from "../../public/assets/logo.png";
import Image from "next/image";

const navLinks = [
    {href: "/", label: "Home"},
    {href: "/about", label: "About"},
    {href: "/services", label: "Services"},
    {href: "/gallery", label: "Gallery"},
    {href: "/bookings", label: "My Bookings"},
    {href: "/contact", label: "Contact"},
];

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                        aria-label="Visionary House home"
                    >
                        <div className="relative h-12 md:h-16 flex items-center">
                            <Image
                                src={logo}
                                alt="Visionary House logo"
                                className="h-full w-auto object-cover"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation + Search + CTA */}
                    <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                        <nav className="flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors duration-200 relative py-1",
                                        isActive(link.href)
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {link.label}
                                    {isActive(link.href) && (
                                        <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-accent"/>
                                    )}
                                </Link>
                            ))}
                        </nav>


                    </div>

                    <div className="hidden lg:flex items-center justify-between">
                        <div className="w-[260px] xl:w-[320px] pr-4">
                            <UniversalSearchBar
                                variant="light"
                                className="max-w-none mx-0"
                                inputClassName="h-10"
                            />
                        </div>

                        <Link href="/book">
                            <Button variant="gold" size="default">
                                Book Now
                            </Button>
                        </Link>
                    </div>
                    {/*<div className="hidden lg:flex items-center gap-4">*/}
                    {/*  <Link href="/policies">*/}
                    {/*    <Button variant="ghost" size="sm">*/}
                    {/*      Policies*/}
                    {/*    </Button>*/}
                    {/*  </Link>*/}
                    {/*  <Link href="/book">*/}
                    {/*    <Button variant="gold" size="default">*/}
                    {/*      Book Now*/}
                    {/*    </Button>*/}
                    {/*  </Link>*/}
                    {/*</div>*/}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 text-foreground"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="lg:hidden bg-background border-t border-border animate-fade-in">
                    <nav className="container-premium py-6 flex flex-col gap-4">
                        <div className="pb-2">
                            <UniversalSearchBar
                                variant="light"
                                className="max-w-none mx-0"
                                onNavigate={() => setIsOpen(false)}
                            />
                        </div>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "text-base font-medium py-2 transition-colors",
                                    isActive(link.href)
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {/*<Link href="/" onClick={() => setIsOpen(false)}>*/}
                        {/*  <Button variant="ghost" className="w-full justify-start px-0">*/}
                        {/*    Policies*/}
                        {/*  </Button>*/}
                        {/*</Link>*/}
                        <Link href="/book" onClick={() => setIsOpen(false)}>
                            <Button variant="gold" className="w-full mt-2">
                                Book Now
                            </Button>
                        </Link>
                        {/*<Link href="/policies" onClick={() => setIsOpen(false)}>*/}
                        {/*  <Button variant="ghost" className="w-full justify-start px-0">*/}
                        {/*    Policies*/}
                        {/*  </Button>*/}
                        {/*</Link>*/}
                        {/*<Link href="/book" onClick={() => setIsOpen(false)}>*/}
                        {/*  <Button variant="gold" className="w-full mt-2">*/}
                        {/*    Book Now*/}
                        {/*  </Button>*/}
                        {/*</Link>*/}
                    </nav>
                </div>
            )}
        </header>
    );
}

