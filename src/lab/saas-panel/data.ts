"use client";

import type { Locale } from "@/content/locales";
import { addDays, createStore, isoDay, type Store } from "./store";

export const stages = ["new", "contacted", "proposal", "won", "lost"] as const;
export type Stage = (typeof stages)[number];

export type Lead = {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: Stage;
  created: string;
};

export type LineItem = { id: string; desc: string; qty: number; price: number };
export type InvoiceStatus = "draft" | "sent" | "paid";
export type Invoice = {
  id: string;
  number: string;
  client: string;
  issued: string;
  due: string;
  items: LineItem[];
  tax: number;
  status: InvoiceStatus;
};

export const services = ["consult", "design", "review", "call"] as const;
export type Service = (typeof services)[number];
export type Booking = {
  id: string;
  name: string;
  service: Service;
  day: string;
  /** Minutes after midnight. */
  start: number;
  duration: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  min: number;
  price: number;
};

export type Movement = {
  id: string;
  productId: string;
  change: number;
  day: string;
  note: string;
};

type Seed = {
  people: [string, string][];
  items: string[];
  products: [string, string][];
  notes: { sale: string; restock: string };
};

const seeds: Record<Locale, Seed> = {
  ar: {
    people: [
      ["سارة الخطيب", "مخبز السنابل"],
      ["محمد عودة", "عودة للتجارة"],
      ["ليان حداد", "استوديو ضوء"],
      ["يوسف منصور", "منصور للعقارات"],
      ["رنا الأحمد", "عيادة نبض"],
      ["خالد سليم", "سليم للنقل"],
      ["هبة يوسف", "متجر حرفة"],
      ["عمر ناصر", "ناصر للطاقة"],
    ],
    items: ["تصميم هوية بصرية", "صفحة هبوط", "ساعات دعم فني", "إعداد نظام أتمتة", "استضافة سنوية"],
    products: [
      ["لوح أكريليك ٣ مم", "ACR-03"],
      ["لوح خشب MDF ٤ مم", "MDF-04"],
      ["لوح خشب زان ٦ مم", "BCH-06"],
      ["ورق نقل حراري", "TRF-A4"],
      ["حلقات مفاتيح معدنية", "KEY-RG"],
      ["علب هدايا كرتون", "BOX-SM"],
    ],
    notes: { sale: "طلب عميل", restock: "توريد جديد" },
  },
  en: {
    people: [
      ["Sarah Khatib", "Sanabel Bakery"],
      ["Mohammad Odeh", "Odeh Trading"],
      ["Layan Haddad", "Daw Studio"],
      ["Yousef Mansour", "Mansour Estates"],
      ["Rana Ahmad", "Nabd Clinic"],
      ["Khaled Salim", "Salim Logistics"],
      ["Hiba Yousef", "Hirfa Store"],
      ["Omar Nasser", "Nasser Energy"],
    ],
    items: ["Brand identity design", "Landing page", "Support hours", "Automation setup", "Annual hosting"],
    products: [
      ["Acrylic sheet 3 mm", "ACR-03"],
      ["MDF board 4 mm", "MDF-04"],
      ["Beech plywood 6 mm", "BCH-06"],
      ["Heat transfer paper", "TRF-A4"],
      ["Metal key rings", "KEY-RG"],
      ["Small gift boxes", "BOX-SM"],
    ],
    notes: { sale: "Customer order", restock: "New delivery" },
  },
};

/** Monday of the week that contains `day`. */
export function weekStart(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const offset = (date.getDay() + 6) % 7;
  return addDays(day, -offset);
}

function seedLeads(locale: Locale): Lead[] {
  const { people } = seeds[locale];
  const today = isoDay();
  const plan: [Stage, number][] = [
    ["new", 1200], ["new", 800], ["contacted", 2400], ["contacted", 650],
    ["proposal", 3800], ["proposal", 1500], ["won", 2900], ["lost", 900],
  ];
  return plan.map(([stage, value], index) => ({
    id: `lead-${index}`,
    name: people[index][0],
    company: people[index][1],
    value,
    stage,
    created: addDays(today, -index * 3),
  }));
}

function seedInvoices(locale: Locale): Invoice[] {
  const { people, items } = seeds[locale];
  const today = isoDay();
  const plan: { client: number; ago: number; lines: [number, number, number][]; status: InvoiceStatus }[] = [
    { client: 6, ago: 150, lines: [[0, 1, 1400]], status: "paid" },
    { client: 2, ago: 120, lines: [[1, 1, 900], [2, 4, 45]], status: "paid" },
    { client: 0, ago: 92, lines: [[3, 1, 2200]], status: "paid" },
    { client: 4, ago: 61, lines: [[1, 1, 950], [4, 1, 180]], status: "paid" },
    { client: 1, ago: 33, lines: [[0, 1, 1600], [2, 6, 45]], status: "paid" },
    { client: 3, ago: 40, lines: [[3, 1, 1800]], status: "sent" },
    { client: 5, ago: 9, lines: [[2, 10, 45], [4, 1, 180]], status: "sent" },
    { client: 7, ago: 2, lines: [[1, 1, 1100]], status: "draft" },
  ];
  return plan.map((entry, index) => {
    const issued = addDays(today, -entry.ago);
    return {
      id: `inv-${index}`,
      number: `INV-${String(1041 + index)}`,
      client: people[entry.client][1],
      issued,
      due: addDays(issued, 14),
      items: entry.lines.map(([item, qty, price], line) => ({
        id: `line-${index}-${line}`,
        desc: items[item],
        qty,
        price,
      })),
      tax: 16,
      status: entry.status,
    };
  });
}

function seedBookings(locale: Locale): Booking[] {
  const { people } = seeds[locale];
  const monday = weekStart(isoDay());
  const plan: [number, Service, number, number, number][] = [
    [0, "consult", 9 * 60 + 30, 60, 0],
    [0, "call", 13 * 60, 30, 1],
    [1, "design", 10 * 60, 90, 2],
    [2, "review", 11 * 60, 60, 3],
    [2, "call", 15 * 60 + 30, 30, 4],
    [3, "consult", 9 * 60, 60, 5],
    [4, "design", 13 * 60 + 30, 120, 6],
    [5, "review", 10 * 60 + 30, 45, 7],
  ];
  return plan.map(([day, service, start, duration, person], index) => ({
    id: `book-${index}`,
    name: people[person][0],
    service,
    day: addDays(monday, day),
    start,
    duration,
  }));
}

function seedProducts(locale: Locale): Product[] {
  const { products } = seeds[locale];
  const plan: [number, number, number][] = [
    [42, 20, 6.5], [8, 15, 4.2], [26, 10, 9.8], [3, 12, 0.6], [140, 50, 0.35], [0, 30, 1.1],
  ];
  return plan.map(([stock, min, price], index) => ({
    id: `prod-${index}`,
    name: products[index][0],
    sku: products[index][1],
    stock,
    min,
    price,
  }));
}

function seedMovements(locale: Locale): Movement[] {
  const { notes } = seeds[locale];
  const today = isoDay();
  const plan: [number, number, number, keyof Seed["notes"]][] = [
    [0, 20, 6, "restock"], [1, -6, 5, "sale"], [4, 100, 4, "restock"],
    [3, -9, 3, "sale"], [5, -30, 2, "sale"], [2, -4, 1, "sale"],
  ];
  return plan.map(([product, change, ago, note], index) => ({
    id: `move-${index}`,
    productId: `prod-${product}`,
    change,
    day: addDays(today, -ago),
    note: notes[note],
  }));
}

export type Stores = {
  leads: Store<Lead[]>;
  invoices: Store<Invoice[]>;
  bookings: Store<Booking[]>;
  products: Store<Product[]>;
  movements: Store<Movement[]>;
};

const byLocale: Partial<Record<Locale, Stores>> = {};

/** Each language keeps its own demo data, seeded in that language. */
export function getStores(locale: Locale): Stores {
  return (byLocale[locale] ??= {
    leads: createStore(`saas-leads-${locale}-v1`, () => seedLeads(locale)),
    invoices: createStore(`saas-invoices-${locale}-v1`, () => seedInvoices(locale)),
    bookings: createStore(`saas-bookings-${locale}-v1`, () => seedBookings(locale)),
    products: createStore(`saas-products-${locale}-v1`, () => seedProducts(locale)),
    movements: createStore(`saas-movements-${locale}-v1`, () => seedMovements(locale)),
  });
}

export function invoiceTotals(invoice: Invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = (subtotal * invoice.tax) / 100;
  return { subtotal, tax, total: subtotal + tax };
}

/** A sent invoice past its due date is overdue; the stored status stays "sent". */
export function invoiceState(invoice: Invoice, today = isoDay()): InvoiceStatus | "overdue" {
  if (invoice.status === "sent" && invoice.due < today) return "overdue";
  return invoice.status;
}

export function stockState(product: Product): "out" | "low" | "ok" {
  if (product.stock <= 0) return "out";
  if (product.stock < product.min) return "low";
  return "ok";
}
