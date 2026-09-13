import { Link, createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/Mascot";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo } from "@/lib/site-info";
import { formatPrice } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "سلة التسوق | عالم الحيوان" },
      { name: "description", content: "راجع منتجات سلتك وأكمل طلبك من عالم الحيوان في المنيا." },
      { property: "og:title", content: "سلة التسوق | عالم الحيوان" },
      { property: "og:description", content: "راجع منتجاتك وأكمل الطلب." },
    ],
  }),
});

function CartPage() {
  const { t, locale, L } = useI18n();
  const { items, subtotal, setQty, remove, clear } = useCart();
  const { shipping } = useSiteInfo();

  const shippingFee = subtotal >= Number(shipping.free_over) || subtotal === 0 ? 0 : Number(shipping.fee);
  const total = subtotal + shippingFee;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-display text-3xl font-black">{t("cart.title")}</h1>

        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              which="dog"
              title={t("cart.empty")}
              action={
                <Button asChild className="rounded-full font-bold">
                  <Link to="/shop">{t("cta.shop")}</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.product_id}
                  className="flex gap-4 rounded-3xl border border-border/70 bg-card p-4"
                >
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted"
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={L(item, "name")}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full place-items-center text-2xl">🐾</span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      className="font-bold hover:text-primary"
                    >
                      {L(item, "name")}
                    </Link>
                    <p className="mt-1 text-sm text-primary">
                      {formatPrice(item.unit_price, locale)}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQty(item.product_id, item.quantity - 1)}
                        aria-label="-"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQty(item.product_id, item.quantity + 1)}
                        aria-label="+"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ms-auto text-destructive"
                        onClick={() => remove(item.product_id)}
                        aria-label={t("cta.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="hidden self-center font-display text-lg font-black sm:block">
                    {formatPrice(item.unit_price * item.quantity, locale)}
                  </div>
                </li>
              ))}
              <li>
                <Button variant="ghost" className="text-destructive" onClick={clear}>
                  {t("cart.clear")}
                </Button>
              </li>
            </ul>

            <aside className="h-fit rounded-3xl border border-border/70 bg-card p-6 shadow-soft lg:sticky lg:top-32">
              <h2 className="font-display text-lg font-black">{t("cart.total")}</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                  <dd className="font-bold">{formatPrice(subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("cart.shipping")}</dt>
                  <dd className="font-bold">
                    {shippingFee === 0 ? t("cart.free") : formatPrice(shippingFee, locale)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-bold">{t("cart.total")}</dt>
                  <dd className="font-display font-black text-primary">
                    {formatPrice(total, locale)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                {locale === "ar" ? shipping.delivery_time_ar : shipping.delivery_time_en}
              </p>
              <Button asChild className="mt-5 w-full rounded-full font-bold">
                <Link to="/checkout">{t("cta.checkout")}</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
