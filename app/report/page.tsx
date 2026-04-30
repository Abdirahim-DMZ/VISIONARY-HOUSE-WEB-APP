"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Activity, CalendarRange, CircleDollarSign, CreditCard, FileSpreadsheet, FileText, Loader2, LogOut, TrendingUp, Users } from "lucide-react";
import { PageHero } from "@/components/sections";
import { fetchBookingsForReport, isStrapiConfigured, type StrapiBooking } from "@/lib/strapi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * PDF colors aligned with `app/globals.css` light theme (charcoal primary, champagne gold accent,
 * muted text, soft borders). Used only for PDF export — no ad-hoc palette.
 */
const PDF_PALETTE = {
  /** hsl(220 25% 12%) — --primary / charcoal */
  charcoal: [24, 32, 44] as const,
  /** hsl(220 10% 45%) — --muted-foreground */
  muted: [98, 108, 124] as const,
  /** hsl(38 60% 55%) — --accent / --gold (matches hero gold ~ #B7974B) */
  gold: [183, 151, 75] as const,
  /** hsl(40 15% 88%) — --border */
  border: [226, 222, 214] as const,
  /** card / background */
  surface: [255, 255, 255] as const,
  /** hsl(40 15% 94%) — --muted, subtle stripe */
  surfaceMuted: [245, 244, 242] as const,
} as const;

type ReportBooking = {
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  roomSpace: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  eventDuration: string;
  attendees: number;
  addOns: string[];
  addOnsTotalPrice: number;
  totalPrice: number;
  amountPaid: number;
  remainingPayment: number;
  paymentStatus: string;
  paymentDate: string;
  paymentCount: number;
  loanStatus: string;
  dueDate: string;
  bookingDate: string;
  discount: number;
  notes: string;
  statusOfBooking: string;
};

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function extractAddOnNames(addOnsValue: unknown): string[] {
  if (!addOnsValue) return [];

  const readName = (value: unknown): string => {
    if (!value || typeof value !== "object") return "";
    const record = value as { name?: unknown; attributes?: { name?: unknown } };
    const name = record.attributes?.name ?? record.name;
    return typeof name === "string" ? name.trim() : "";
  };

  // Strapi v4/v5 relation wrappers: { data: [...] } or { data: {...} }
  if (typeof addOnsValue === "object" && "data" in (addOnsValue as Record<string, unknown>)) {
    const data = (addOnsValue as { data?: unknown }).data;
    if (Array.isArray(data)) return data.map(readName).filter(Boolean);
    return readName(data) ? [readName(data)] : [];
  }

  // Some responses may already be a direct array of add-on objects
  if (Array.isArray(addOnsValue)) return addOnsValue.map(readName).filter(Boolean);

  // Edge case: single object
  const one = readName(addOnsValue);
  return one ? [one] : [];
}

function extractAddOnTotalPrice(addOnsValue: unknown, attendees: number): number {
  if (!addOnsValue) return 0;

  const readPrice = (value: unknown): number => {
    if (!value || typeof value !== "object") return 0;
    const record = value as { price?: unknown; attributes?: { price?: unknown } };
    return toNumber(record.attributes?.price ?? record.price ?? 0);
  };

  const perPersonTotal = (() => {
    if (typeof addOnsValue === "object" && "data" in (addOnsValue as Record<string, unknown>)) {
      const data = (addOnsValue as { data?: unknown }).data;
      if (Array.isArray(data)) return data.reduce((sum, item) => sum + readPrice(item), 0);
      return readPrice(data);
    }

    if (Array.isArray(addOnsValue)) return addOnsValue.reduce((sum, item) => sum + readPrice(item), 0);

    return readPrice(addOnsValue);
  })();

  return perPersonTotal * Math.max(attendees, 0);
}

function extractRoomSpace(layoutValue: unknown): string {
  if (!layoutValue || typeof layoutValue !== "object") return "-";

  const readName = (value: unknown): string => {
    if (!value || typeof value !== "object") return "";
    const record = value as { name?: unknown; title?: unknown; attributes?: { name?: unknown; title?: unknown } };
    const name = record.attributes?.name ?? record.name ?? record.attributes?.title ?? record.title;
    return typeof name === "string" ? name.trim() : "";
  };

  // Strapi relation wrapper: { data: {...} }
  if ("data" in (layoutValue as Record<string, unknown>)) {
    const data = (layoutValue as { data?: unknown }).data;
    return readName(data) || "-";
  }

  return readName(layoutValue) || "-";
}

function mapBookings(raw: StrapiBooking[]): ReportBooking[] {
  return raw.map((item) => {
    const source = ((item as unknown as { attributes?: Record<string, unknown> }).attributes ?? item) as Record<string, unknown>;
    const payments = Array.isArray(source.payments) ? (source.payments as Array<Record<string, unknown>>) : [];
    const addOns = extractAddOnNames(source.addOns);
    const attendees = toNumber(source.attendees);
    const addOnsTotalPrice = extractAddOnTotalPrice(source.addOns, attendees);
    const roomSpace =
      (typeof source.roomSpace === "string" && source.roomSpace.trim() ? source.roomSpace.trim() : "") ||
      extractRoomSpace(source.layout);
    const amountPaid = payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
    const paymentDates = payments
      .map((payment) =>
        String(payment.cashReceivedDate ?? payment.bankTransferDate ?? payment.cardTransactionDate ?? "").trim(),
      )
      .filter(Boolean)
      .sort();
    const totalPrice = toNumber(source.totalPrice);
    const remainingPayment = toNumber(source.remainingPayment) || Math.max(totalPrice - amountPaid, 0);
    const statusOfBooking = String(source.statusOfBooking ?? "Pending");
    const paymentStatus = remainingPayment <= 0 ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid";
    const loanStatus = remainingPayment > 0 ? "Pending" : "Cleared";
    const date = String(source.date ?? "");
    const dayOfWeek = date ? format(new Date(date), "EEEE") : "";
    const startTime = String(source.startTime ?? "");
    const endTime = String(source.endTime ?? "");
    const createdAt = String(source.createdAt ?? "");
    const eventDuration = (() => {
      if (!startTime || !endTime) return "-";
      const [sh, sm] = startTime.split(":").map((v) => Number(v));
      const [eh, em] = endTime.split(":").map((v) => Number(v));
      if (![sh, sm, eh, em].every(Number.isFinite)) return "-";
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      const diff = Math.max(endMin - startMin, 0);
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      if (h && m) return `${h}h ${m}m`;
      if (h) return `${h}h`;
      return `${m}m`;
    })();

    return {
      referenceNumber: String(source.referenceNumber ?? ""),
      customerName: String(source.customerName ?? ""),
      customerEmail: String(source.customerEmail ?? ""),
      customerPhone: String(source.customerPhone ?? ""),
      eventType: String(source.eventType ?? ""),
      roomSpace,
      date,
      dayOfWeek,
      startTime,
      endTime,
      eventDuration,
      attendees,
      addOns,
      addOnsTotalPrice,
      totalPrice,
      amountPaid,
      remainingPayment,
      paymentStatus,
      paymentDate: paymentDates[paymentDates.length - 1] ?? "",
      paymentCount: payments.length,
      loanStatus,
      dueDate: String(source.endDate ?? source.date ?? ""),
      bookingDate: createdAt ? format(new Date(createdAt), "yyyy-MM-dd") : "",
      discount: toNumber(source.discount),
      notes: String(source.message ?? "").trim(),
      statusOfBooking,
    };
  });
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
}

export default function ReportPage() {
  const router = useRouter();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["strapi", "report-bookings"],
    queryFn: fetchBookingsForReport,
    enabled: isStrapiConfigured(),
    staleTime: 30_000,
    retry: false,
  });

  useEffect(() => {
    if (isError && error instanceof Error && error.message === "REPORT_UNAUTHORIZED") {
      router.replace("/report/login?redirect=/report");
    }
  }, [isError, error, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/report-auth/logout", { method: "POST" });
      router.replace("/report/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const bookings = useMemo(() => mapBookings(data ?? []), [data]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (!booking.date) return false;
      if (!fromDate && !toDate) return true;
      const value = booking.date;
      const withinStart = fromDate ? value >= fromDate : true;
      const withinEnd = toDate ? value <= toDate : true;
      return withinStart && withinEnd;
    });
  }, [bookings, fromDate, toDate]);

  const summary = useMemo(() => {
    const totalEvents = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.amountPaid, 0);
    const totalInvoiced = filteredBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const outstandingAmount = filteredBookings.reduce((sum, booking) => sum + booking.remainingPayment, 0);
    const loanCount = filteredBookings.filter((booking) => booking.remainingPayment > 0).length;
    const paymentsReceivedCount = filteredBookings.reduce((sum, booking) => sum + booking.paymentCount, 0);
    return { totalEvents, totalRevenue, totalInvoiced, outstandingAmount, loanCount, paymentsReceivedCount };
  }, [filteredBookings]);

  const dashboardKpis = useMemo(() => {
    const collectionRate = summary.totalInvoiced > 0 ? (summary.totalRevenue / summary.totalInvoiced) * 100 : 0;
    const avgEventValue = summary.totalEvents > 0 ? summary.totalInvoiced / summary.totalEvents : 0;
    const avgPaymentCount = summary.totalEvents > 0 ? summary.paymentsReceivedCount / summary.totalEvents : 0;
    return { collectionRate, avgEventValue, avgPaymentCount };
  }, [summary]);

  const monthlyChartData = useMemo(() => {
    const bucket = new Map<string, { month: string; monthKey: string; charged: number; collected: number; events: number }>();
    for (const booking of filteredBookings) {
      if (!booking.date) continue;
      const month = format(new Date(booking.date), "MMM yyyy");
      const monthKey = format(new Date(booking.date), "yyyy-MM");
      const current = bucket.get(monthKey) ?? { month, monthKey, charged: 0, collected: 0, events: 0 };
      current.charged += booking.totalPrice;
      current.collected += booking.amountPaid;
      current.events += 1;
      bucket.set(monthKey, current);
    }
    return Array.from(bucket.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [filteredBookings]);

  const paymentStatusChartData = useMemo(() => {
    const bucket = { Paid: 0, Partial: 0, Unpaid: 0 };
    for (const booking of filteredBookings) {
      if (booking.paymentStatus === "Paid") bucket.Paid += 1;
      else if (booking.paymentStatus === "Partial") bucket.Partial += 1;
      else bucket.Unpaid += 1;
    }
    return [
      { status: "Paid", count: bucket.Paid },
      { status: "Partial", count: bucket.Partial },
      { status: "Unpaid", count: bucket.Unpaid },
    ];
  }, [filteredBookings]);

  const topEventTypes = useMemo(() => {
    const eventMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const booking of filteredBookings) {
      const name = booking.eventType || "Unspecified";
      const current = eventMap.get(name) ?? { name, count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += booking.totalPrice;
      eventMap.set(name, current);
    }
    return Array.from(eventMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredBookings]);

  const chartConfig = {
    charged: { label: "Revenue Charged", color: "hsl(var(--chart-1))" },
    collected: { label: "Revenue Collected", color: "hsl(var(--chart-2))" },
    events: { label: "Events", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const detailedRows = useMemo(
    () =>
      filteredBookings.map((booking) => ({
        dateTimeDay: `${booking.date}\n${booking.startTime} - ${booking.endTime}\n${booking.dayOfWeek || "-"}`,
        customer: `${booking.customerName}\n${booking.customerEmail}\n${booking.customerPhone || "-"}`,
        event: `${booking.eventType || "N/A"}\nStatus: ${booking.statusOfBooking}`,
        roomSpace: booking.roomSpace || "-",
        duration: booking.eventDuration,
        participants: booking.attendees,
        addOns:
          booking.addOnsTotalPrice > 0
            ? [booking.addOns.length ? booking.addOns.join(", ") : "", `Total: ${formatMoney(booking.addOnsTotalPrice)}`]
                .filter((line) => line.trim().length > 0)
                .join("\n")
            : "",
        amount: `Charged: ${formatMoney(booking.totalPrice)}\nPaid: ${formatMoney(booking.amountPaid)}`,
        payment: `${booking.paymentStatus}\nDate: ${booking.paymentDate || "-"}\nCount: ${booking.paymentCount}`,
        loanCredit: `${booking.loanStatus}\nOutstanding: ${formatMoney(booking.remainingPayment)}\nDue: ${booking.dueDate || "-"}`,
        bookingDiscountNotes: `Booking: ${booking.bookingDate || "-"}\nDiscount: ${formatMoney(booking.discount)}\nNotes: ${booking.notes || "-"}`,
      })),
    [filteredBookings],
  );

  const calculations = useMemo(() => {
    const totalParticipants = filteredBookings.reduce((sum, booking) => sum + booking.attendees, 0);
    const totalAddOnsCost = filteredBookings.reduce((sum, booking) => sum + booking.addOnsTotalPrice, 0);
    const totalDiscount = filteredBookings.reduce((sum, booking) => sum + booking.discount, 0);
    const totalOutstanding = filteredBookings.reduce((sum, booking) => sum + booking.remainingPayment, 0);
    const totalPaid = filteredBookings.reduce((sum, booking) => sum + booking.amountPaid, 0);
    const totalCharged = filteredBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    return { totalParticipants, totalAddOnsCost, totalDiscount, totalOutstanding, totalPaid, totalCharged };
  }, [filteredBookings]);

  const exportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const workbook = XLSX.utils.book_new();
      const detailSheet = XLSX.utils.json_to_sheet(
        filteredBookings.map((booking) => ({
          Date: booking.date || "-",
          Time: `${booking.startTime || "-"} - ${booking.endTime || "-"}`,
          Day: booking.dayOfWeek || "-",
          "Customer Name": booking.customerName || "-",
          Email: booking.customerEmail || "-",
          "Phone Number": booking.customerPhone || "-",
          Event: booking.eventType || "N/A",
          "Room/Space": booking.roomSpace || "-",
          "Booking Status": booking.statusOfBooking || "-",
          Duration: booking.eventDuration || "-",
          Participants: booking.attendees,
          "Add-ons": booking.addOnsTotalPrice > 0 ? booking.addOns.join(", ") : "",
          "Add-ons Total": booking.addOnsTotalPrice > 0 ? formatMoney(booking.addOnsTotalPrice) : "",
          "Total Amount": formatMoney(booking.totalPrice),
          "Amount Paid": formatMoney(booking.amountPaid),
          "Remaining Amount": formatMoney(booking.remainingPayment),
          "Payment Status": booking.paymentStatus || "-",
          "Payment Date": booking.paymentDate || "-",
          "Payment Count": booking.paymentCount,
          Loan: booking.loanStatus || "-",
          "Due Date": booking.dueDate || "-",
          "Booking Date": booking.bookingDate || "-",
          Discount: formatMoney(booking.discount),
          Notes: booking.notes || "-",
        })),
      );
      XLSX.utils.sheet_add_aoa(detailSheet, [[]], { origin: -1 });
      XLSX.utils.sheet_add_json(
        detailSheet,
        [
          {
            Date: "TOTALS",
            Time: "-",
            Day: "-",
            "Customer Name": "-",
            Email: "-",
            "Phone Number": "-",
            Event: "-",
            "Room/Space": "-",
            "Booking Status": "-",
            Duration: "-",
            Participants: calculations.totalParticipants,
            "Add-ons": "",
            "Add-ons Total": formatMoney(calculations.totalAddOnsCost),
            "Total Amount": formatMoney(calculations.totalCharged),
            "Amount Paid": formatMoney(calculations.totalPaid),
            "Remaining Amount": formatMoney(calculations.totalOutstanding),
            "Payment Status": "-",
            "Payment Date": "-",
            "Payment Count": summary.paymentsReceivedCount,
            Loan: String(summary.loanCount),
            "Due Date": "-",
            "Booking Date": "-",
            Discount: formatMoney(calculations.totalDiscount),
            Notes: "-",
          },
        ],
        { origin: -1, skipHeader: true },
      );
      XLSX.utils.sheet_add_aoa(
        detailSheet,
        [
          [],
          ["CALCULATION", "VALUE"],
          ["Date Range", `${fromDate || "All"} to ${toDate || "All"}`],
          ["Total Events", String(summary.totalEvents)],
          ["Total Participants", String(calculations.totalParticipants)],
          ["Total Add-ons Cost", formatMoney(calculations.totalAddOnsCost)],
          ["Total Charged", formatMoney(calculations.totalCharged)],
          ["Total Paid", formatMoney(calculations.totalPaid)],
          ["Total Outstanding", formatMoney(calculations.totalOutstanding)],
          ["Total Discount", formatMoney(calculations.totalDiscount)],
          ["Loans", String(summary.loanCount)],
          ["Payments Received (count)", String(summary.paymentsReceivedCount)],
        ],
        { origin: -1 },
      );
      XLSX.utils.book_append_sheet(workbook, detailSheet, "Details View");
      XLSX.writeFile(workbook, `visionary-report-${fromDate || "all"}-${toDate || "all"}.xlsx`);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const exportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const marginX = 40;
      const tableMargin = { left: marginX, right: marginX };
      const headStyles = {
        fillColor: [...PDF_PALETTE.gold] as [number, number, number],
        textColor: [...PDF_PALETTE.charcoal] as [number, number, number],
        fontStyle: "bold" as const,
      };
      const tableBodyStyles = {
        fontSize: 7,
        cellPadding: 3,
        overflow: "linebreak" as const,
        textColor: [...PDF_PALETTE.charcoal] as [number, number, number],
        lineColor: [...PDF_PALETTE.border] as [number, number, number],
        lineWidth: 0.25,
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...PDF_PALETTE.charcoal);
      doc.text("Visionary House - Report", marginX, 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...PDF_PALETTE.muted);
      doc.text(`Date Range: ${fromDate || "All"} to ${toDate || "All"}`, marginX, 58);
      doc.text(`Total Events: ${summary.totalEvents}`, marginX, 74);
      doc.text(`Total Revenue: ${formatMoney(summary.totalRevenue)}`, marginX + 140, 74);
      doc.text(`Outstanding: ${formatMoney(summary.outstandingAmount)}`, marginX + 300, 74);
      doc.text(`Loans: ${summary.loanCount}`, marginX + 460, 74);
      doc.text(`Payments Received: ${summary.paymentsReceivedCount}`, marginX + 540, 74);

      autoTable(doc, {
        startY: 88,
        margin: tableMargin,
        head: [[
          "Date / Time / Day",
          "Customer",
          "Event",
          "Room/Space",
          "Duration",
          "Participants",
          "Add-ons",
          "Amount",
          "Payment",
          "Loan/Credit",
          "Booking/Discount/Notes",
        ]],
        body: detailedRows.map((row) => [
          row.dateTimeDay,
          row.customer,
          row.event,
          row.roomSpace,
          row.duration,
          String(row.participants),
          row.addOns,
          row.amount,
          row.payment,
          row.loanCredit,
          row.bookingDiscountNotes,
        ]),
        headStyles,
        styles: { ...tableBodyStyles, fillColor: [...PDF_PALETTE.surface] as [number, number, number] },
        alternateRowStyles: { fillColor: [...PDF_PALETTE.surfaceMuted] as [number, number, number] },
        tableLineColor: [...PDF_PALETTE.border] as [number, number, number],
        tableLineWidth: 0.25,
      });

      autoTable(doc, {
        startY: (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY
          ? ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY as number) + 16
          : 110,
        margin: tableMargin,
        head: [["Metric", "Value"]],
        body: [
          ["Total Events", String(summary.totalEvents)],
          ["Total Participants", String(calculations.totalParticipants)],
          ["Total Add-ons Cost", formatMoney(calculations.totalAddOnsCost)],
          ["Total Charged", formatMoney(calculations.totalCharged)],
          ["Total Paid", formatMoney(calculations.totalPaid)],
          ["Total Outstanding", formatMoney(calculations.totalOutstanding)],
          ["Total Discount", formatMoney(calculations.totalDiscount)],
          ["Loans", String(summary.loanCount)],
          ["Payments Received (count)", String(summary.paymentsReceivedCount)],
        ],
        headStyles,
        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: "linebreak",
          textColor: [...PDF_PALETTE.charcoal] as [number, number, number],
          lineColor: [...PDF_PALETTE.border] as [number, number, number],
          lineWidth: 0.25,
          fillColor: [...PDF_PALETTE.surface] as [number, number, number],
        },
        alternateRowStyles: { fillColor: [...PDF_PALETTE.surfaceMuted] as [number, number, number] },
        tableLineColor: [...PDF_PALETTE.border] as [number, number, number],
        tableLineWidth: 0.25,
      });

      doc.save(`visionary-report-${fromDate || "all"}-${toDate || "all"}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <>
      <main className="pt-5 pb-24 md:pb-28">
        <div className="container-premium space-y-6">
          {isError && !(error instanceof Error && error.message === "REPORT_UNAUTHORIZED") ? (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Could not load report data</CardTitle>
                <CardDescription>{error instanceof Error ? error.message : "Something went wrong."}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1.5">
                  <CardTitle className="text-xl">Dashboard Controls</CardTitle>
                  <CardDescription>Filter date range, review performance metrics, and export the exact visible report.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={exportExcel} disabled={isExportingExcel || isLoading}>
                    {isExportingExcel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                    Export Excel
                  </Button>
                  <Button variant="gold" onClick={exportPdf} disabled={isExportingPdf || isLoading}>
                    {isExportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Export PDF
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    Sign out
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-border/70 bg-background p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CalendarRange className="h-4 w-4 text-[#B08D39]" />
                    From Date
                  </div>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="rounded-lg border border-border/70 bg-background p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CalendarRange className="h-4 w-4 text-[#B08D39]" />
                    To Date
                  </div>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Collection Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{dashboardKpis.collectionRate.toFixed(1)}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">Collected vs invoiced amount</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Event Value</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{formatMoney(dashboardKpis.avgEventValue)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Average charged per event</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="summary" className="space-y-5">
            <TabsList className="grid w-full max-w-[360px] grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Records</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Events</p>
                      <p className="mt-2 text-3xl font-semibold">{summary.totalEvents}</p>
                    </div>
                    <div className="rounded-lg bg-[#B08D39]/10 p-2.5"><Activity className="h-5 w-5 text-[#B08D39]" /></div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue Collected</p>
                      <p className="mt-2 text-3xl font-semibold">{formatMoney(summary.totalRevenue)}</p>
                    </div>
                    <div className="rounded-lg bg-[#B08D39]/10 p-2.5"><CircleDollarSign className="h-5 w-5 text-[#B08D39]" /></div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Invoiced</p>
                      <p className="mt-2 text-3xl font-semibold">{formatMoney(summary.totalInvoiced)}</p>
                    </div>
                    <div className="rounded-lg bg-[#B08D39]/10 p-2.5"><CreditCard className="h-5 w-5 text-[#B08D39]" /></div>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Outstanding</p>
                      <p className="mt-2 text-3xl font-semibold">{formatMoney(summary.outstandingAmount)}</p>
                    </div>
                    <Badge variant="outline" className="mt-1">{summary.loanCount} open</Badge>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="flex items-start justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment Entries</p>
                      <p className="mt-2 text-3xl font-semibold">{summary.paymentsReceivedCount}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Avg {dashboardKpis.avgPaymentCount.toFixed(1)} / event</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-gradient-to-br from-[#B08D39]/10 via-background to-background shadow-sm">
                  <CardContent className="p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status Snapshot</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Loans/Credit Cases</span>
                      <span className="text-xl font-semibold">{summary.loanCount}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Collection Efficiency</span>
                      <span className="text-xl font-semibold">{dashboardKpis.collectionRate.toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Average Attendees</p>
                      <Users className="h-4 w-4 text-[#B08D39]" />
                    </div>
                    <p className="mt-2 text-3xl font-semibold">
                      {summary.totalEvents > 0
                        ? (filteredBookings.reduce((sum, booking) => sum + booking.attendees, 0) / summary.totalEvents).toFixed(1)
                        : "0.0"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Per event in current filtered range</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Add-on Revenue Share</p>
                      <TrendingUp className="h-4 w-4 text-[#B08D39]" />
                    </div>
                    <p className="mt-2 text-3xl font-semibold">
                      {summary.totalInvoiced > 0
                        ? `${((calculations.totalAddOnsCost / summary.totalInvoiced) * 100).toFixed(1)}%`
                        : "0.0%"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Contribution from add-ons to charged amount</p>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Outstanding/Event</p>
                      <CircleDollarSign className="h-4 w-4 text-[#B08D39]" />
                    </div>
                    <p className="mt-2 text-3xl font-semibold">
                      {formatMoney(summary.totalEvents > 0 ? summary.outstandingAmount / summary.totalEvents : 0)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Pending balance spread per event</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-5 xl:grid-cols-5">
                <Card className="border-border/70 shadow-sm xl:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Trend</CardTitle>
                    <CardDescription>Monthly comparison of charged vs collected revenue.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer className="h-[300px] w-full" config={chartConfig}>
                      <BarChart data={monthlyChartData} barCategoryGap={18}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) =>
                            new Intl.NumberFormat("en-US", {
                              notation: "compact",
                              maximumFractionDigits: 1,
                            }).format(Number(value))
                          }
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name) => [
                                formatMoney(Number(value)),
                                name === "charged" ? "Revenue Charged" : "Revenue Collected",
                              ]}
                            />
                          }
                        />
                        <Bar dataKey="charged" fill="#B08D39" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="collected" fill="#1F2937" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#B08D39]" />
                        Revenue Charged
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#1F2937]" />
                        Revenue Collected
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 shadow-sm xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Events by Month</CardTitle>
                    <CardDescription>Number of events scheduled each month.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer className="h-[300px] w-full" config={chartConfig}>
                      <BarChart data={monthlyChartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="events" fill="#B08D39" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-5 xl:grid-cols-5">
                <Card className="border-border/70 shadow-sm xl:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Status Distribution</CardTitle>
                    <CardDescription>How bookings are split by paid, partial, and unpaid status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer className="h-[260px] w-full" config={chartConfig}>
                      <BarChart data={paymentStatusChartData} barCategoryGap={30}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="status" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#B08D39" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="border-border/70 shadow-sm xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Event Types</CardTitle>
                    <CardDescription>Most frequent event categories in the selected period.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topEventTypes.length ? (
                      topEventTypes.map((event) => (
                        <div key={event.name} className="rounded-md border border-border/60 bg-muted/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium">{event.name}</p>
                            <Badge variant="outline">{event.count} events</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">Charged: {formatMoney(event.revenue)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No event type data for this range.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="detailed">
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Event-Level Records</CardTitle>
                    <CardDescription>All event, customer, payment, and credit details for the selected range.</CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit">Total Records: {filteredBookings.length}</Badge>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading report data...
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto rounded-md border border-border/70">
                      <Table className="min-w-[1180px]">
                        <TableHeader className="bg-muted/40">
                          <TableRow>
                            <TableHead className="min-w-[180px]">Date / Time / Day</TableHead>
                            <TableHead className="min-w-[230px]">Customer</TableHead>
                            <TableHead className="min-w-[190px]">Event</TableHead>
                            <TableHead className="min-w-[120px]">Duration</TableHead>
                            <TableHead className="min-w-[110px]">Participants</TableHead>
                            <TableHead className="min-w-[210px]">Add-ons</TableHead>
                            <TableHead className="min-w-[170px]">Amount</TableHead>
                            <TableHead className="min-w-[150px]">Payment</TableHead>
                            <TableHead className="min-w-[200px]">Loan/Credit</TableHead>
                            <TableHead className="min-w-[210px]">Booking/Discount/Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((booking) => (
                            <TableRow key={`${booking.referenceNumber}-${booking.date}`}>
                              <TableCell className="align-top whitespace-nowrap">
                                <div>{booking.date}</div>
                                <div>{booking.startTime} - {booking.endTime}</div>
                                <div className="text-xs text-muted-foreground">{booking.dayOfWeek || "-"}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium break-words">{booking.customerName}</div>
                                <div className="text-xs text-muted-foreground break-all">{booking.customerEmail}</div>
                                <div className="text-xs text-muted-foreground">{booking.customerPhone || "-"}</div>
                              </TableCell>
                              <TableCell className="align-top">
                                <div>{booking.eventType || "N/A"}</div>
                                <Badge variant="outline" className="mt-1">{booking.statusOfBooking}</Badge>
                              </TableCell>
                              <TableCell className="align-top">{booking.eventDuration}</TableCell>
                              <TableCell className="align-top">{booking.attendees || "-"}</TableCell>
                              <TableCell className="align-top whitespace-normal break-words">
                                <div>{booking.addOns.length ? booking.addOns.join(", ") : "-"}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Total: {formatMoney(booking.addOnsTotalPrice)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>Charged: {formatMoney(booking.totalPrice)}</div>
                                <div className="text-xs text-muted-foreground">Paid: {formatMoney(booking.amountPaid)}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={booking.paymentStatus === "Paid" ? "default" : "secondary"}>{booking.paymentStatus}</Badge>
                                <div className="text-xs text-muted-foreground mt-1">Date: {booking.paymentDate || "-"}</div>
                                <div className="text-xs text-muted-foreground">Count: {booking.paymentCount}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={booking.loanStatus === "Cleared" ? "default" : "outline"}>{booking.loanStatus}</Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Outstanding: {formatMoney(booking.remainingPayment)}
                                </div>
                                <div className="text-xs text-muted-foreground">Due: {booking.dueDate || "-"}</div>
                              </TableCell>
                              <TableCell className="align-top">
                                <div className="text-xs text-muted-foreground">Booking: {booking.bookingDate || "-"}</div>
                                <div className="text-xs text-muted-foreground">Discount: {formatMoney(booking.discount)}</div>
                                <div className="text-xs text-muted-foreground break-words">Notes: {booking.notes || "-"}</div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredBookings.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                                No records for selected date range.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
