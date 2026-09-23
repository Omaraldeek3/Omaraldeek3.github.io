import type { Locale } from "@/content/locales";

export const saasCopy = {
  ar: {
    brand: "لوحة الأعمال",
    loading: "جارٍ تحميل اللوحة…",
    storageNote: "بياناتك محفوظة في متصفحك فقط، ولا تُرسل إلى أي خادم.",
    reset: "استعادة البيانات التجريبية",
    resetConfirm: "ستُحذف تعديلاتك وتعود البيانات التجريبية. متابعة؟",
    apps: { overview: "نظرة عامة", crm: "العملاء", invoices: "الفواتير", bookings: "الحجوزات", inventory: "المخزون" },
    appsHint: {
      overview: "كل الأنظمة في شاشة واحدة",
      crm: "مسار الصفقات من أول تواصل إلى الإغلاق",
      invoices: "فواتير ببنود وضريبة وحالة دفع",
      bookings: "تقويم أسبوعي يمنع التعارض",
      inventory: "كميات وحدود دنيا وحركة مخزون",
    },
    add: "إضافة", cancel: "إلغاء", save: "حفظ", remove: "حذف", search: "بحث…", total: "الإجمالي", none: "لا شيء هنا بعد.",
    overview: {
      pipeline: "قيمة الصفقات المفتوحة", collected: "المُحصّل", outstanding: "مستحق غير مدفوع", weekBookings: "حجوزات هذا الأسبوع",
      lowStock: "أصناف تحت الحد", revenue: "الإيرادات المحصّلة آخر ستة أشهر", attention: "يحتاج انتباهك",
      overdue: "فاتورة متأخرة", low: "مخزون منخفض", out: "نفد من المخزون", today: "حجز اليوم", allGood: "لا شيء متأخر. كل شيء على ما يرام.",
      conversion: "نسبة الفوز", deals: "صفقة",
    },
    crm: {
      stages: { new: "جديد", contacted: "تم التواصل", proposal: "عرض سعر", won: "ربح", lost: "خسارة" },
      name: "الاسم", company: "الشركة", value: "القيمة", stage: "المرحلة", addLead: "عميل محتمل جديد",
      forward: "نقل للمرحلة التالية", back: "إرجاع للمرحلة السابقة", dragHint: "اسحب البطاقة بين الأعمدة، أو استخدم الأسهم.",
      invalid: "أدخل اسماً وقيمة صحيحة.",
    },
    invoices: {
      number: "الرقم", client: "العميل", issued: "التاريخ", due: "الاستحقاق", amount: "المبلغ", status: "الحالة",
      states: { draft: "مسودة", sent: "مُرسلة", paid: "مدفوعة", overdue: "متأخرة" },
      newInvoice: "فاتورة جديدة", item: "البند", qty: "الكمية", price: "السعر", addLine: "بند آخر", tax: "الضريبة",
      subtotal: "المجموع قبل الضريبة", dueIn: "الاستحقاق بعد (يوم)", markSent: "إرسال", markPaid: "تسجيل الدفع",
      exportCsv: "تصدير CSV", invalid: "أدخل اسم العميل وبنداً واحداً على الأقل بسعر صحيح.", filterAll: "الكل",
      view: "عرض",
    },
    bookings: {
      services: { consult: "استشارة", design: "جلسة تصميم", review: "مراجعة", call: "مكالمة" },
      prev: "الأسبوع السابق", next: "الأسبوع التالي", thisWeek: "هذا الأسبوع", name: "الاسم", service: "الخدمة",
      day: "اليوم", start: "البداية", duration: "المدة (دقيقة)", newBooking: "حجز جديد",
      conflict: "هذا الوقت يتعارض مع حجز آخر في اليوم نفسه.", outside: "ساعات العمل من ٨ صباحاً حتى ٨ مساءً.",
      invalid: "أدخل اسماً ومدة صحيحة.", cancelBooking: "إلغاء الحجز", weekTotal: "ساعات محجوزة هذا الأسبوع",
    },
    inventory: {
      sku: "الرمز", name: "الصنف", stock: "الكمية", min: "الحد الأدنى", price: "سعر الوحدة", value: "قيمة المخزون",
      states: { ok: "متوفر", low: "منخفض", out: "نفد" }, in: "إدخال", out: "إخراج", newProduct: "صنف جديد",
      movements: "آخر الحركات", sale: "بيع", restock: "توريد", invalid: "أدخل اسماً ورمزاً وكمية صحيحة.",
      adjust: "الكمية", notEnough: "لا يكفي المخزون لهذه الكمية.",
    },
  },
  en: {
    brand: "Business panel",
    loading: "Loading the panel…",
    storageNote: "Your data is saved in your browser only and never sent to a server.",
    reset: "Restore demo data",
    resetConfirm: "Your changes will be removed and the demo data restored. Continue?",
    apps: { overview: "Overview", crm: "Clients", invoices: "Invoices", bookings: "Bookings", inventory: "Inventory" },
    appsHint: {
      overview: "Every system on one screen",
      crm: "The deal pipeline from first contact to close",
      invoices: "Invoices with line items, tax and payment state",
      bookings: "A weekly calendar that refuses double bookings",
      inventory: "Stock, minimum levels and movements",
    },
    add: "Add", cancel: "Cancel", save: "Save", remove: "Delete", search: "Search…", total: "Total", none: "Nothing here yet.",
    overview: {
      pipeline: "Open pipeline value", collected: "Collected", outstanding: "Outstanding", weekBookings: "Bookings this week",
      lowStock: "Items below minimum", revenue: "Revenue collected, last six months", attention: "Needs your attention",
      overdue: "Overdue invoice", low: "Low stock", out: "Out of stock", today: "Booking today", allGood: "Nothing overdue. Everything is in order.",
      conversion: "Win rate", deals: "deals",
    },
    crm: {
      stages: { new: "New", contacted: "Contacted", proposal: "Proposal", won: "Won", lost: "Lost" },
      name: "Name", company: "Company", value: "Value", stage: "Stage", addLead: "New lead",
      forward: "Move to next stage", back: "Move to previous stage", dragHint: "Drag a card between columns, or use the arrows.",
      invalid: "Enter a name and a valid value.",
    },
    invoices: {
      number: "Number", client: "Client", issued: "Issued", due: "Due", amount: "Amount", status: "Status",
      states: { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue" },
      newInvoice: "New invoice", item: "Item", qty: "Qty", price: "Price", addLine: "Another line", tax: "Tax",
      subtotal: "Subtotal", dueIn: "Due in (days)", markSent: "Send", markPaid: "Record payment",
      exportCsv: "Export CSV", invalid: "Enter a client and at least one line with a valid price.", filterAll: "All",
      view: "View",
    },
    bookings: {
      services: { consult: "Consultation", design: "Design session", review: "Review", call: "Call" },
      prev: "Previous week", next: "Next week", thisWeek: "This week", name: "Name", service: "Service",
      day: "Day", start: "Start", duration: "Duration (min)", newBooking: "New booking",
      conflict: "That time overlaps another booking on the same day.", outside: "Working hours are 8 am to 8 pm.",
      invalid: "Enter a name and a valid duration.", cancelBooking: "Cancel booking", weekTotal: "Hours booked this week",
    },
    inventory: {
      sku: "SKU", name: "Item", stock: "Stock", min: "Minimum", price: "Unit price", value: "Stock value",
      states: { ok: "In stock", low: "Low", out: "Out" }, in: "Stock in", out: "Stock out", newProduct: "New item",
      movements: "Latest movements", sale: "Sale", restock: "Restock", invalid: "Enter a name, a SKU and a valid quantity.",
      adjust: "Quantity", notEnough: "There is not enough stock for that quantity.",
    },
  },
} satisfies Record<Locale, unknown>;

export type SaasCopy = (typeof saasCopy)["en"];

export function formatters(locale: Locale) {
  const tag = locale === "ar" ? "ar-EG" : "en-US";
  const money = new Intl.NumberFormat(tag, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const number = new Intl.NumberFormat(tag);
  const short = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short" });
  const weekday = new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric" });
  const month = new Intl.DateTimeFormat(tag, { month: "short" });
  const toDate = (day: string) => {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const time = (minutes: number) => {
    const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
    return new Intl.DateTimeFormat(tag, { hour: "numeric", minute: "2-digit" }).format(date);
  };
  return {
    money: (value: number) => money.format(value),
    number: (value: number) => number.format(value),
    day: (day: string) => short.format(toDate(day)),
    weekday: (day: string) => weekday.format(toDate(day)),
    month: (day: string) => month.format(toDate(day)),
    time,
  };
}

export type Formatters = ReturnType<typeof formatters>;
