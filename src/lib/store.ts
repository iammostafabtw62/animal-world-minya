import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  ingredients_ar: string | null;
  ingredients_en: string | null;
  benefits_ar: string | null;
  benefits_en: string | null;
  usage_ar: string | null;
  usage_en: string | null;
  specifications: Record<string, unknown>;
  images: string[];
  category_id: string | null;
  brand: string | null;
  pet_type: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  low_stock_threshold: number;
  weight: string | null;
  size: string | null;
  rating: number;
  review_count: number;
  is_published: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_vet_pick: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  pet_type: string | null;
  sort_order: number;
  is_active: boolean;
};

export function effectivePrice(p: { price: number; sale_price: number | null }) {
  return p.sale_price && p.sale_price > 0 && p.sale_price < p.price ? p.sale_price : p.price;
}

export function discountPercent(p: { price: number; sale_price: number | null }) {
  const eff = effectivePrice(p);
  if (eff >= p.price) return 0;
  return Math.round(((p.price - eff) / p.price) * 100);
}

export function stockState(p: { stock: number; low_stock_threshold: number }) {
  if (p.stock <= 0) return "out" as const;
  if (p.stock <= p.low_stock_threshold) return "low" as const;
  return "in" as const;
}

export function formatPrice(value: number, locale: "ar" | "en") {
  const n = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    maximumFractionDigits: 0,
  }).format(value);
  return locale === "ar" ? `${n} ج.م` : `${n} EGP`;
}

export function useProducts(filters?: { published?: boolean }) {
  return useQuery({
    queryKey: ["products", filters?.published ?? true],
    queryFn: async () => {
      let q = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (filters?.published !== false) q = q.eq("is_published", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Category[];
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type Settings = Record<string, Record<string, unknown>>;

export function useSettings() {
  const query = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      const map: Settings = {};
      for (const row of data ?? []) map[row.key] = (row.value ?? {}) as Record<string, unknown>;
      return map;
    },
  });
  return query;
}

export function settingsGroup(settings: Settings | undefined, key: string) {
  return (settings?.[key] ?? {}) as Record<string, never>;
}
