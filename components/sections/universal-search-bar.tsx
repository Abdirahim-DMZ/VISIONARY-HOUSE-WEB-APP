"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { siteSearchEntries, type SiteSearchEntry } from "@/lib/data/site-search";
import { cn } from "@/lib/utils";

export type UniversalSearchBarVariant = "dark" | "light";

export interface UniversalSearchBarProps {
  variant?: UniversalSearchBarVariant;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  placeholder?: string;
  onNavigate?: () => void;
}

function matchQuery(entry: SiteSearchEntry, query: string): boolean {
  if (!query.trim()) return false;
  const q = query.trim().toLowerCase();
  if (entry.label.toLowerCase().includes(q)) return true;
  return entry.keywords.some((k) => k.toLowerCase().includes(q));
}

function filterEntries(query: string): SiteSearchEntry[] {
  if (!query.trim()) return [];
  return siteSearchEntries.filter((e) => matchQuery(e, query)).slice(0, 8);
}

export function UniversalSearchBar({
  variant = "dark",
  className,
  inputClassName,
  iconClassName,
  placeholder = "Search pages, services, book...",
  onNavigate,
}: UniversalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = filterEntries(query);
  const showDropdown = isOpen && query.trim().length > 0;

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        listRef.current?.contains(e.target as Node) ||
        inputRef.current?.contains(e.target as Node)
      )
        return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
    onNavigate?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === "Escape") inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlightIndex]) navigateTo(results[highlightIndex].href);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const grouped = results.reduce(
    (acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    },
    {} as Record<string, SiteSearchEntry[]>
  );
  const flatIndexToHref = results.map((r) => r.href);

  return (
    <div className={cn("relative w-full max-w-xl mx-auto", className)}>
      <div className="relative">
        <Search
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none",
            variant === "dark" ? "text-primary-foreground/70" : "text-muted-foreground",
            iconClassName
          )}
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            variant === "dark"
              ? [
                  "h-12 pl-11 pr-4 rounded-lg border-2 border-primary-foreground/30 bg-primary-foreground/10",
                  "text-primary-foreground placeholder:text-primary-foreground/60",
                  "focus-visible:border-accent focus-visible:ring-accent/30 focus-visible:bg-primary-foreground/15",
                ]
              : [
                  "h-11 pl-11 pr-4 rounded-lg border border-border bg-muted/40",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus-visible:border-accent focus-visible:ring-accent/20 focus-visible:bg-background",
                ],
            inputClassName
          )}
          aria-label="Search website"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
        />
      </div>

      {showDropdown && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-background shadow-elevated overflow-hidden z-50 max-h-[280px] overflow-y-auto"
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-muted-foreground text-sm">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <ul className="py-2">
              {Object.entries(grouped).map(([category, entries]) => (
                <li key={category}>
                  <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category === "page"
                      ? "Pages"
                      : category === "service"
                        ? "Services"
                        : "Quick actions"}
                  </div>
                  {entries.map((entry) => {
                    const flatIdx = results.indexOf(entry);
                    const isHighlighted = highlightIndex === flatIdx;
                    return (
                      <Link
                        key={`${entry.href}-${entry.label}`}
                        href={entry.href}
                        role="option"
                        aria-selected={isHighlighted}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          isHighlighted
                            ? "bg-accent/15 text-accent"
                            : "text-foreground hover:bg-muted"
                        )}
                        onMouseEnter={() => setHighlightIndex(flatIdx)}
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo(entry.href);
                        }}
                      >
                        <Search className="h-4 w-4 shrink-0 opacity-60" />
                        {entry.label}
                      </Link>
                    );
                  })}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
