"use client";

import {useState, useEffect} from "react";
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
    const [drawerShown, setDrawerShown] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const openDrawer = () => {
        setIsOpen(true);
        setDrawerShown(false);
        setIsClosing(false);
    };

    const closeDrawer = () => {
        setIsClosing(true);
        setDrawerShown(false);
    };

    const handleDrawerTransitionEnd = () => {
        if (isClosing) {
            setIsOpen(false);
            setIsClosing(false);
        }
    };

    // Slide-in: after mount with isOpen, show drawer
    useEffect(() => {
        if (isOpen) {
            const id = requestAnimationFrame(() => setDrawerShown(true));
            return () => cancelAnimationFrame(id);
        }
    }, [isOpen]);

    // Prevent background page scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isOpen]);

    // Close drawer on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeDrawer();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    {/*<Link*/}
                    {/*    href="/"*/}
                    {/*    className="flex items-center gap-2"*/}
                    {/*    aria-label="Visionary House home"*/}
                    {/*>*/}
                    {/*    <div className="relative h-12 md:h-16 flex items-center">*/}
                    {/*        <Image*/}
                    {/*            src={logo}*/}
                    {/*            alt="Visionary House logo"*/}
                    {/*            className="h-full w-auto object-cover"*/}
                    {/*            priority*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</Link>*/}

                    <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Visionary <span className="text-accent">House</span>
            </span>
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
                        onClick={openDrawer}
                        className="lg:hidden p-2 text-foreground"
                        aria-label="Open menu"
                    >
                        <Menu size={24}/>
                    </button>
                </div>
            </div>
            </header>
            {/* Mobile: Side drawer + overlay */}
            {isOpen && (
                <>
                    <div
                        className={cn(
                            "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden",
                            drawerShown ? "opacity-100" : "opacity-0"
                        )}
                        onClick={closeDrawer}
                        aria-hidden
                    />
                    <div
                        className={cn(
                            "fixed left-0 top-0 bottom-0 z-[70] w-full min-h-screen sm:w-[min(320px,85vw)] sm:min-h-0 bg-background shadow-xl transition-transform duration-300 ease-out lg:hidden flex flex-col",
                            drawerShown ? "translate-x-0" : "-translate-x-full"
                        )}
                        onTransitionEnd={handleDrawerTransitionEnd}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                    >
                        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-border shrink-0">
                            {/*<Link href="/" className="flex items-center gap-2" onClick={closeDrawer}>*/}
                                {/*<div className="relative h-10 w-auto flex items-center">*/}
                                {/*    <Image*/}
                                {/*        src={logo}*/}
                                {/*        alt="Visionary House"*/}
                                {/*        className="h-10 w-auto object-cover"*/}
                                {/*    />*/}
                                {/*</div>*/}


                            {/*</Link>*/}
                            <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Visionary <span className="text-accent">House</span>
            </span>
                            </Link>
                            <button
                                onClick={closeDrawer}
                                className="p-2 rounded-md text-foreground hover:bg-muted transition-colors touch-manipulation"
                                aria-label="Close menu"
                            >
                                <X size={24}/>
                            </button>
                        </div>
                        <nav className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-8 min-h-0">
                            <div className="pb-5">
                                <UniversalSearchBar
                                    variant="light"
                                    className="max-w-none mx-0"
                                    onNavigate={closeDrawer}
                                />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeDrawer}
                                        className={cn(
                                            "text-lg font-medium py-4 px-4 rounded-lg transition-colors touch-manipulation",
                                            isActive(link.href)
                                                ? "text-foreground bg-accent/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted active:bg-muted"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <Link href="/book" onClick={closeDrawer} className="mt-6 block">
                                <Button variant="gold" size="lg" className="w-full h-12 text-base font-semibold">
                                    Book Now
                                </Button>
                            </Link>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}

