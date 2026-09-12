import { useSettings } from "@/lib/store";

export type Contact = {
  address_ar: string;
  address_en: string;
  phone: string;
  whatsapp: string;
  email: string;
  maps_url: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp_message_ar?: string;
  whatsapp_message_en?: string;
};

export type HourRow = { day_ar: string; day_en: string; time_ar: string; time_en: string };

export type Shipping = {
  fee: number;
  free_over: number;
  min_order: number;
  delivery_time_ar: string;
  delivery_time_en: string;
};

const defaults = {
  contact: {
    address_ar: "المنيا، مصر",
    address_en: "Minya, Egypt",
    phone: "+20 100 000 0000",
    whatsapp: "+20 100 000 0000",
    email: "info@animalworld.eg",
    maps_url: "https://www.google.com/maps?q=Minya,+Egypt&output=embed",
  } as Contact,
  hours: [] as HourRow[],
  shipping: {
    fee: 50,
    free_over: 1000,
    min_order: 0,
    delivery_time_ar: "خلال 24 ساعة داخل المنيا",
    delivery_time_en: "Within 24 hours inside Minya",
  } as Shipping,
  appointments: { slots: [] as string[], closed_days: [] as number[] },
  payments: { cod: true, card: false, online: false },
};

export function useSiteInfo() {
  const { data } = useSettings();
  const contact = { ...defaults.contact, ...((data?.["contact"] ?? {}) as Partial<Contact>) };
  const hours = ((data?.["hours"]?.["items"] as HourRow[] | undefined) ?? defaults.hours) as HourRow[];
  const shipping = { ...defaults.shipping, ...((data?.["shipping"] ?? {}) as Partial<Shipping>) };
  const appointments = {
    ...defaults.appointments,
    ...((data?.["appointments"] ?? {}) as Partial<typeof defaults.appointments>),
  };
  const payments = {
    ...defaults.payments,
    ...((data?.["payments"] ?? {}) as Partial<typeof defaults.payments>),
  };
  const general = (data?.["general"] ?? {}) as Record<string, string>;
  return { contact, hours, shipping, appointments, payments, general };
}

export function waLink(phone: string, message?: string) {
  const digits = (phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
