/**
 * Generate booking invoice PDF in Next.js (same layout as Strapi).
 * Uses the same logic as visionary-house-strapi booking-invoice-pdf.
 * Booking shape can be Strapi REST: flat or { attributes: { ... } }.
 */
import PDFDocument from "pdfkit";

type PaymentEntry = {
  paymentMode: string;
  cashReceivedAmount?: number | string | null;
  cashReceivedDate?: string | null;
  cashReceivedBy?: string | null;
  cashNotes?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankTransactionId?: string | null;
  bankTransferDate?: string | null;
  bankReference?: string | null;
  bankingNotes?: string | null;
  cardLastFourDigits?: string | null;
  cardType?: string | null;
  cardTransactionId?: string | null;
  cardTransactionDate?: string | null;
  cardNotes?: string | null;
  amount?: number | string | null;
};

type AddOnItem = { name?: string; price?: number | string };

export type InvoiceBookingData = {
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  roomSpace?: string | null;
  totalPrice: number | string;
  currency: string;
  discount?: number | string | null;
  discountReason?: string | null;
  payments?: PaymentEntry[] | null;
  addOns?: AddOnItem[] | null;
  eventType?: string | null;
};

function getAttr<T>(raw: Record<string, unknown>, key: string): T {
  const val = raw[key] ?? (raw.attributes as Record<string, unknown>)?.[key];
  return val as T;
}

/** Build invoice data from Strapi REST booking (flat or { attributes }). */
export function buildInvoiceDataFromBooking(raw: Record<string, unknown>): InvoiceBookingData {
  const dateRaw = getAttr<unknown>(raw, "date");
  const dateStr =
    dateRaw instanceof Date
      ? dateRaw.toISOString().slice(0, 10)
      : typeof dateRaw === "string"
        ? dateRaw.slice(0, 10)
        : "";
  const paymentsRaw = getAttr<unknown>(raw, "payments");
  const paymentsList = Array.isArray(paymentsRaw) ? paymentsRaw : (paymentsRaw && typeof paymentsRaw === "object" && "data" in paymentsRaw && Array.isArray((paymentsRaw as { data: unknown[] }).data)) ? (paymentsRaw as { data: unknown[] }).data : [];
  const payments = Array.isArray(paymentsList) ? paymentsList : [];

  const addOnsRaw = getAttr<unknown>(raw, "addOns");
  const addOnsList = Array.isArray(addOnsRaw) ? addOnsRaw : (addOnsRaw && typeof addOnsRaw === "object" && "data" in addOnsRaw && Array.isArray((addOnsRaw as { data: unknown[] }).data)) ? (addOnsRaw as { data: unknown[] }).data : [];
  const addOns = Array.isArray(addOnsList)
    ? addOnsList.map((a: unknown) => {
        const o = (a as Record<string, unknown>) ?? {};
        const attrs = (o.attributes ?? o) as Record<string, unknown>;
        return {
          name: (attrs.name ?? o.name) as string,
          price: (attrs.price ?? o.price) as number | string,
        };
      })
    : [];

  const get = (key: string) => getAttr<unknown>(raw, key);
  const totalPriceRaw = get("totalPrice");
  const totalPriceNum = totalPriceRaw != null && totalPriceRaw !== "" ? Number(totalPriceRaw) : 0;

  return {
    referenceNumber: String(get("referenceNumber") ?? ""),
    customerName: String(get("customerName") ?? ""),
    customerEmail: String(get("customerEmail") ?? ""),
    customerPhone: (get("customerPhone") as string) ?? null,
    date: dateStr,
    startTime: String(get("startTime") ?? ""),
    endTime: String(get("endTime") ?? ""),
    roomSpace: (get("roomSpace") as string) ?? null,
    totalPrice: Number.isFinite(totalPriceNum) ? totalPriceNum : 0,
    currency: String(get("currency") ?? "USD"),
    discount: get("discount") != null ? Number(get("discount")) : null,
    discountReason: (get("discountReason") as string) ?? null,
    payments: payments.map((p: unknown) => {
      const x = (p as Record<string, unknown>) ?? {};
      const attrs = (x.attributes ?? x) as Record<string, unknown>;
      const val = (key: string) => attrs[key] ?? x[key];
      return {
        paymentMode: String(val("paymentMode") ?? ""),
        cashReceivedAmount: val("cashReceivedAmount") as number | string | null | undefined,
        cashReceivedDate: val("cashReceivedDate") as string | null | undefined,
        cashReceivedBy: val("cashReceivedBy") as string | null | undefined,
        cashNotes: val("cashNotes") as string | null | undefined,
        bankName: val("bankName") as string | null | undefined,
        bankAccountNumber: val("bankAccountNumber") as string | null | undefined,
        bankTransactionId: val("bankTransactionId") as string | null | undefined,
        bankTransferDate: val("bankTransferDate") as string | null | undefined,
        bankReference: val("bankReference") as string | null | undefined,
        bankingNotes: val("bankingNotes") as string | null | undefined,
        cardLastFourDigits: val("cardLastFourDigits") as string | null | undefined,
        cardType: val("cardType") as string | null | undefined,
        cardTransactionId: val("cardTransactionId") as string | null | undefined,
        cardTransactionDate: val("cardTransactionDate") as string | null | undefined,
        cardNotes: val("cardNotes") as string | null | undefined,
        amount: val("amount") as number | string | null | undefined,
      } as PaymentEntry;
    }),
    addOns,
    eventType: (get("eventType") as string) ?? null,
  };
}

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return v != null ? String(v).trim() : "";
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const s = String(d).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s || "—";
}

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Layout constants (A4: 595 x 842 pt) — match Strapi email attachment template
const MARGIN = 50;
const PAGE_WIDTH = 595;
const CONTENT_RIGHT = PAGE_WIDTH - MARGIN;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const LABEL_X = 50;
const VALUE_X = 175;
const AMOUNT_X = CONTENT_RIGHT - 120;
const AMOUNT_WIDTH = 120;
const LINE_HEIGHT = 15;
// Font sizes (Header, Booking, Bill To, Charges only — Payment History unchanged)
const FONT_HEADING = 24;
const FONT_SUBTITLE = 10;
const FONT_SECTION_TITLE = 12;
const FONT_BODY = 10;
const FONT_SMALL = 9;
// Vertical margins for sections above Payment History only
const GAP_HEADER_AFTER_TITLE = 0.35;
const GAP_HEADER_AFTER_SUBTITLE = 0.5;
const GAP_HEADER_AFTER_LINE = 1.5;
const GAP_AFTER_BOOKING = 1;
const GAP_AFTER_BILL_TO = 1.8;
const GAP_SECTION_TITLE_UNDER = 0.3;
const GAP_SECTION_TITLE_AFTER = 0.6;
const CHARGES_ROW_GAP = 0.45;
const CHARGES_GAP_AFTER_BLOCK = 0.6;
const CHARGES_GAP_AFTER_DISCOUNT = 0.5;
const GAP_AFTER_TOTAL = 1.2;

// Brand colors (Visionary House website)
const COLORS = {
  gold: "#B7974B",
  dark: "#1a1f2e",
  muted: "#6b7280",
  lightBg: "#f9f7f4",
  border: "#e8e4dc",
};

function writeLabelValue(doc: PDFKit.PDFDocument, label: string, value: string, y: number): void {
  doc.font("Helvetica-Bold").fillColor(COLORS.dark).text(label, LABEL_X, y);
  doc.font("Helvetica").fillColor(COLORS.dark).text(value, VALUE_X, y);
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.font("Helvetica-Bold").fontSize(FONT_SECTION_TITLE).fillColor(COLORS.dark).text(title, LABEL_X, doc.y);
  doc.moveDown(GAP_SECTION_TITLE_UNDER);
  doc.strokeColor(COLORS.gold).lineWidth(1.5).moveTo(LABEL_X, doc.y).lineTo(LABEL_X + 80, doc.y).stroke();
  doc.moveDown(GAP_SECTION_TITLE_AFTER);
}

export function generateInvoicePdf(data: InvoiceBookingData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN });
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const totalPrice = num(data.totalPrice);
    const discountPct = num(data.discount);
    const discountAmount = discountPct > 0 ? totalPrice * (discountPct / 100) : 0;
    const finalAmount = totalPrice - discountAmount;
    const currency = str(data.currency) || "USD";

    // —— Header (brand styling) ——
    doc.fontSize(FONT_HEADING).font("Helvetica-Bold").fillColor(COLORS.dark).text("Visionary House", { align: "center" });
    doc.moveDown(GAP_HEADER_AFTER_TITLE);
    doc.fontSize(FONT_SUBTITLE).font("Helvetica").fillColor(COLORS.gold).text("Invoice", { align: "center" });
    doc.moveDown(GAP_HEADER_AFTER_SUBTITLE);
    doc.strokeColor(COLORS.border).lineWidth(0.5).moveTo(MARGIN, doc.y).lineTo(CONTENT_RIGHT, doc.y).stroke();
    doc.moveDown(GAP_HEADER_AFTER_LINE);

    doc.fontSize(FONT_BODY).fillColor(COLORS.dark);

    // —— Booking details (label + value columns) ——
    let y = doc.y;
    writeLabelValue(doc, "Booking Reference:", str(data.referenceNumber), y);
    y += LINE_HEIGHT;
    writeLabelValue(doc, "Date of Booking:", formatDate(data.date), y);
    y += LINE_HEIGHT;
    writeLabelValue(doc, "Time:", `${str(data.startTime)} – ${str(data.endTime)}`, y);
    y += LINE_HEIGHT;
    if (str(data.roomSpace)) {
      writeLabelValue(doc, "Room/Space:", str(data.roomSpace), y);
      y += LINE_HEIGHT;
    }
    doc.y = y;
    doc.moveDown(GAP_AFTER_BOOKING);

    // —— Bill To ——
    drawSectionTitle(doc, "Bill To");
    doc.fontSize(FONT_BODY).fillColor(COLORS.dark);
    let billToY = doc.y;
    writeLabelValue(doc, "Name:", str(data.customerName) || "—", billToY);
    billToY += LINE_HEIGHT;
    writeLabelValue(doc, "Email:", str(data.customerEmail) || "—", billToY);
    billToY += LINE_HEIGHT;
    writeLabelValue(doc, "Phone:", str(data.customerPhone) || "—", billToY);
    doc.y = billToY;
    doc.moveDown(GAP_AFTER_BILL_TO);

    // —— Charges ——
    const addOns = Array.isArray(data.addOns) ? data.addOns : [];
    const addOnsTotal = addOns.reduce((s, a) => s + num(a.price), 0);
    const baseAmount = totalPrice - addOnsTotal;

    drawSectionTitle(doc, "Charges");
    doc.fontSize(FONT_BODY).fillColor(COLORS.dark);
    y = doc.y;
    if (addOns.length > 0 && baseAmount >= 0) {
      doc.font("Helvetica").text("Service (hourly / base)", LABEL_X, y);
      doc.font("Helvetica").text(formatCurrency(baseAmount, currency), AMOUNT_X, y, { width: AMOUNT_WIDTH, align: "right" });
      doc.moveDown(CHARGES_ROW_GAP);
      y = doc.y;
      addOns.forEach((a) => {
        doc.font("Helvetica").text(str(a.name) || "Add-on", LABEL_X, y);
        doc.font("Helvetica").text(formatCurrency(num(a.price), currency), AMOUNT_X, y, { width: AMOUNT_WIDTH, align: "right" });
        doc.moveDown(CHARGES_ROW_GAP);
        y = doc.y;
      });
    } else {
      doc.font("Helvetica").text("Service (hourly / base)", LABEL_X, y);
      doc.font("Helvetica").text(formatCurrency(totalPrice, currency), AMOUNT_X, y, { width: AMOUNT_WIDTH, align: "right" });
    }
    doc.moveDown(CHARGES_GAP_AFTER_BLOCK);

    if (discountPct > 0) {
      y = doc.y;
      doc.font("Helvetica").fillColor(COLORS.dark).text(`Discount (${discountPct}%)`, LABEL_X, y);
      doc.font("Helvetica").text(`- ${formatCurrency(discountAmount, currency)}`, AMOUNT_X, y, { width: AMOUNT_WIDTH, align: "right" });
      doc.moveDown(CHARGES_ROW_GAP);
      if (str(data.discountReason)) {
        doc.fontSize(FONT_SMALL).fillColor(COLORS.muted).text(`Reason: ${str(data.discountReason)}`, LABEL_X, doc.y);
        doc.fontSize(FONT_BODY).fillColor(COLORS.dark);
        doc.moveDown(0.3);
      }
      doc.moveDown(CHARGES_GAP_AFTER_DISCOUNT);
    }

    const payments = Array.isArray(data.payments) ? data.payments : [];
    const paidAmount = payments.reduce((sum, p) => sum + (num(p.amount) || num(p.cashReceivedAmount)), 0);
    const pendingAmount = Math.max(0, finalAmount - paidAmount);

    y = doc.y;
    doc.font("Helvetica-Bold").fillColor(COLORS.dark).text("Total Amount (after discount)", LABEL_X, y);
    doc.font("Helvetica-Bold").text(formatCurrency(finalAmount, currency), AMOUNT_X, y, { width: AMOUNT_WIDTH, align: "right" });
    doc.moveDown(0.4);
    y = doc.y;
    doc.font("Helvetica-Bold").fillColor(COLORS.dark).text("Paid Amount", LABEL_X, y);
    doc.font("Helvetica-Bold").text(formatCurrency(paidAmount, currency), AMOUNT_X, y, { width: AMOUNT_WIDTH, align: "right" });
    doc.moveDown(0.4);
    if (pendingAmount > 0) {
      y = doc.y;
      doc.font("Helvetica-Bold").fillColor(COLORS.dark).text("Pending Amount", LABEL_X, y);
      doc.font("Helvetica-Bold").fillColor(COLORS.gold).text(formatCurrency(pendingAmount, currency), AMOUNT_X, y, { width: AMOUNT_WIDTH, align: "right" });
      doc.moveDown(0.4);
    }
    doc.moveDown(GAP_AFTER_TOTAL);

    // —— Payment History (card-style, brand colors) ——
    if (payments.length > 0) {
      drawSectionTitle(doc, "Payment History");
      const detailIndent = LABEL_X + 12;
      const cardPaddingV = 14;
      const cardPaddingH = 12;
      const PAYMENT_AMOUNT_PADDING_RIGHT = 14;
      const PAYMENT_AMOUNT_X = CONTENT_RIGHT - AMOUNT_WIDTH - PAYMENT_AMOUNT_PADDING_RIGHT;
      const PAYMENT_CARD_LEFT = LABEL_X;
      const PAYMENT_CARD_WIDTH = CONTENT_WIDTH;
      const gapHeaderToDetails = 10;
      const detailLineSpacing = 12;
      const gapBetweenCards = 14;

      payments.forEach((p, i) => {
        const mode = str(p.paymentMode);
        const amount = num(p.amount) || num(p.cashReceivedAmount);
        const startY = doc.y;
        const detailLines = mode === "Cash" ? [p.cashReceivedDate, p.cashReceivedBy, p.cashNotes].filter(Boolean).length
          : mode === "Banking" ? [p.bankName, p.bankAccountNumber, p.bankTransactionId, p.bankTransferDate, p.bankReference, p.bankingNotes].filter(Boolean).length
          : [p.cardType, p.cardLastFourDigits, p.cardTransactionId, p.cardTransactionDate, p.cardNotes].filter(Boolean).length;
        const cardHeight = Math.max(56, cardPaddingV * 2 + LINE_HEIGHT + gapHeaderToDetails + detailLines * detailLineSpacing);

        doc.fillColor(COLORS.lightBg).rect(PAYMENT_CARD_LEFT, startY, PAYMENT_CARD_WIDTH, cardHeight).fill();
        doc.strokeColor(COLORS.border).lineWidth(0.5).rect(PAYMENT_CARD_LEFT, startY, PAYMENT_CARD_WIDTH, cardHeight).stroke();
        doc.fillColor(COLORS.dark);
        doc.y = startY + cardPaddingV;

        const rowY = doc.y;
        doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.gold).text(`Payment ${i + 1}`, LABEL_X + cardPaddingH, rowY);
        doc.font("Helvetica-Bold").fillColor(COLORS.dark).text(` · ${mode}`, LABEL_X + cardPaddingH + 58, rowY);
        if (amount > 0) doc.font("Helvetica").fillColor(COLORS.dark).text(formatCurrency(amount, currency), PAYMENT_AMOUNT_X, rowY, { width: AMOUNT_WIDTH, align: "right" });
        doc.y = rowY + LINE_HEIGHT + gapHeaderToDetails;

        if (mode === "Cash") {
          if (p.cashReceivedDate) { doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text(`Date received: ${formatDate(p.cashReceivedDate)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.cashReceivedBy)) { doc.text(`Received by: ${str(p.cashReceivedBy)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.cashNotes)) { doc.text(`Notes: ${str(p.cashNotes)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
        } else if (mode === "Banking") {
          if (str(p.bankName)) { doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text(`Bank: ${str(p.bankName)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.bankAccountNumber)) { doc.text(`Account: ${str(p.bankAccountNumber)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.bankTransactionId)) { doc.text(`Transaction ID: ${str(p.bankTransactionId)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (p.bankTransferDate) { doc.text(`Date: ${formatDate(String(p.bankTransferDate))}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.bankReference)) { doc.text(`Reference: ${str(p.bankReference)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.bankingNotes)) { doc.text(`Notes: ${str(p.bankingNotes)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
        } else if (mode === "Card") {
          if (str(p.cardType)) { doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text(`Card: ${str(p.cardType)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.cardLastFourDigits)) { doc.text(`Last 4 digits: ${str(p.cardLastFourDigits)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.cardTransactionId)) { doc.text(`Transaction ID: ${str(p.cardTransactionId)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (p.cardTransactionDate) { doc.text(`Date: ${formatDate(String(p.cardTransactionDate))}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
          if (str(p.cardNotes)) { doc.text(`Notes: ${str(p.cardNotes)}`, detailIndent + cardPaddingH, doc.y); doc.moveDown(0.7); }
        }

        doc.y = startY + cardHeight + gapBetweenCards;
      });
      doc.moveDown(0.3);
    }

    doc.fontSize(9).fillColor(COLORS.muted).text("Thank you for your booking. — Visionary House", MARGIN, doc.page.height - 80, { align: "center", width: doc.page.width - MARGIN * 2 });
    doc.end();
  });
}
