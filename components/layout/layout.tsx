import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutProps {
  children: React.ReactNode;
  /** When true, hide header and footer (e.g. for reception and chat pages) */
  bare?: boolean;
}

export function Layout({ children, bare = false }: LayoutProps) {
  if (bare) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-18 md:pt-20">{children}</main>
      <Footer />
    </div>
  );
}



