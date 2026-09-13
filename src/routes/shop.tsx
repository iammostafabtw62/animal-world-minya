import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/Mascot";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { discountPercent, effectivePrice, useCategories, useProducts } from "@/lib/store";

type ShopSearch = {
  q?: string;
  category?: string;
  pet?: string;
  brand?: string;
  sort?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    pet: typeof search["pet"] === "string" ? search["pet"] : undefined,
    brand: typeof search["brand"] === "string" ? search["brand"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
  }),
  component: Shop,
  head: () => ({
    meta: [
      { title: "المتجر | عالم الحيوان — مستلزمات الحيوانات الأليفة في المنيا" },
      {
        name: "description",
        content:
          "تسوق طعام ومستلزمات وألعاب وأدوية القطط والكلاب من عالم الحيوان في المنيا مع توصيل سريع.",
      },
      { property: "og:title", content: "المتجر | عالم الحيوان" },
      {
        property: "og:description",
        content: "منتجات أصلية لحيوانك الأليف مع توصيل داخل المنيا.",
      },
    ],
  }),
});

function Shop() {
  const { t, locale, L } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");

  const setParam = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const brands = useMemo(
    () => Array.from(new Set((products ?? []).map((p) => p.brand).filter(Boolean) as string[])),
    [products],
  );

  const filtered = useMemo(() => {
    let list = [...(products ?? [])];
    const q = (search.q ?? "").trim().toLowerCase();
    if (q)
      list = list.filter((p) =>
        [p.name_ar, p.name_en, p.brand ?? "", p.sku ?? ""].join(" ").toLowerCase().includes(q),
      );
    if (search.category) {
      const cat = (categories ?? []).find((c) => c.slug === search.category);
      if (cat) list = list.filter((p) => p.category_id === cat.id);
    }
    if (search.pet) list = list.filter((p) => p.pet_type === search.pet || p.pet_type === "all");
    if (search.brand) list = list.filter((p) => p.brand === search.brand);
    if (inStock) list = list.filter((p) => p.stock > 0);
    if (onSale) list = list.filter((p) => discountPercent(p) > 0);
    const max = Number(maxPrice);
    if (max > 0) list = list.filter((p) => effectivePrice(p) <= max);

    switch (search.sort) {
      case "priceAsc":
        list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case "priceDesc":
        list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "bestSelling":
        list.sort((a, b) => Number(b.is_best_seller) - Number(a.is_best_seller));
        break;
      case "newest":
        list.sort((a, b) => b.created_at.localeCompare(a.created_at));
        break;
      default:
        break;
    }
    return list;
  }, [products, categories, search, inStock, onSale, maxPrice]);

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block font-bold">{t("shop.category")}</Label>
        <Select
          value={search.category ?? "all"}
          onValueChange={(v) => setParam({ category: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("shop.all")}</SelectItem>
            {(categories ?? []).map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {L(c, "name")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block font-bold">{t("shop.petType")}</Label>
        <Select
          value={search.pet ?? "all"}
          onValueChange={(v) => setParam({ pet: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pet.all")}</SelectItem>
            <SelectItem value="dog">{t("pet.dog")}</SelectItem>
            <SelectItem value="cat">{t("pet.cat")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {brands.length > 0 ? (
        <div>
          <Label className="mb-2 block font-bold">{t("shop.brand")}</Label>
          <Select
            value={search.brand ?? "all"}
            onValueChange={(v) => setParam({ brand: v === "all" ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("shop.all")}</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div>
        <Label htmlFor="maxPrice" className="mb-2 block font-bold">
          {t("shop.price")} ({locale === "ar" ? "حتى" : "up to"})
        </Label>
        <Input
          id="maxPrice"
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
          placeholder="1000"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Checkbox checked={inStock} onCheckedChange={(v) => setInStock(v === true)} />
          {t("shop.inStockOnly")}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <Checkbox checked={onSale} onCheckedChange={(v) => setOnSale(v === true)} />
          {t("shop.onSaleOnly")}
        </label>
      </div>
    </div>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-display text-3xl font-black">{t("shop.title")}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Input
            value={search.q ?? ""}
            onChange={(e) => setParam({ q: e.target.value || undefined })}
            placeholder={t("shop.search")}
            className="max-w-xs rounded-full"
          />
          <Select
            value={search.sort ?? "recommended"}
            onValueChange={(v) => setParam({ sort: v === "recommended" ? undefined : v })}
          >
            <SelectTrigger className="w-48 rounded-full">
              <SelectValue placeholder={t("shop.sort")} />
            </SelectTrigger>
            <SelectContent>
              {["recommended", "newest", "priceAsc", "priceDesc", "rating", "bestSelling"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {t(`sort.${s}`)}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                {t("shop.filters")}
              </Button>
            </SheetTrigger>
            <SheetContent side={locale === "ar" ? "right" : "left"} className="w-80 overflow-y-auto p-6">
              <h2 className="mb-6 mt-6 font-display text-lg font-black">{t("shop.filters")}</h2>
              {Filters}
            </SheetContent>
          </Sheet>
          <span className="ms-auto text-sm text-muted-foreground">
            {filtered.length} {t("shop.results")}
          </span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-32 rounded-3xl border border-border/70 bg-card p-5">
              <h2 className="mb-5 font-display font-black">{t("shop.filters")}</h2>
              {Filters}
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-3xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState which="cat" title={t("shop.empty")} />
            ) : (
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
