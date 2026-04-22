import { Header } from "@/components/layout/header";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-18 md:pt-20">{children}</main>
    </div>
  );
}
