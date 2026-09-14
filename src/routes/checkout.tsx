import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/Mascot";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo } from "@/lib/site-info";
import { formatPrice } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "إتمام الطلب | عالم الحيوان" },
      { name: "description", content: "أكمل بيانات التوصيل وأكد طلبك من عالم الحيوان في المنيا." },
      { property: "og:title", content: "إتمام الطلب | عالم الحيوان" },
      { property: "og:description", content: "دفع عند الاستلام وتوصيل سريع داخل المنيا." },
    ],
  }),
});

function CheckoutPage() {
  const { t, locale, L } = useI18n();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { shipping, contact, payments } = useSiteInfo();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    city: locale === "ar" ? "المنيا" : "Minya",
    area: "",
    address: "",
    notes: "",
  });
  const [payment, setPayment] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [freeShip, setFreeShip] = useState(false);
  const [saving, setSaving] = useState(false);

  const shippingFee =
    freeShip || subtotal >= Number(shipping.free_over) ? 0 : Number(shipping.fee);
  const total = Math.max(0, subtotal - discount) + shippingFee;

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();
    if (!data || subtotal < Number(data.min_order)) {
      setDiscount(0);
      setFreeShip(false);
      toast.error(locale === "ar" ? "كود غير صالح" : "Invalid coupon");
      return;
    }
    const value =
      data.discount_type === "percent" ? (subtotal * Number(data.value)) / 100 : Number(data.value);
    setDiscount(Math.round(value));
    setFreeShip(Boolean(data.free_shipping));
    toast.success(locale === "ar" ? "تم تطبيق الكود" : "Coupon applied");
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info(t("checkout.signinFirst"));
      navigate({ to: "/auth" });
      return;
    }
    if (!form.customer_name.trim() || !/^[\d+\s-]{8,20}$/.test(form.phone)) {
      toast.error(t("common.error"));
      return;
    }
    setSaving(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: form.customer_name.trim().slice(0, 100),
        phone: form.phone.trim(),
        email: form.email.trim() || user.email,
        city: form.city,
        area: form.area,
        address: form.address.slice(0, 500),
        notes: form.notes.slice(0, 500),
        subtotal,
        discount,
        shipping: shippingFee,
        total,
        coupon_code: couponCode || null,
        payment_method: payment,
      })
      .select("id, order_number")
      .single();

    if (error || !order) {
      setSaving(false);
      toast.error(t("common.error"));
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        name_ar: i.name_ar,
        name_en: i.name_en,
        image_url: i.image_url,
        unit_price: i.unit_price,
        quantity: i.quantity,
      })),
    );
    setSaving(false);
    if (itemsError) {
      toast.error(t("common.error"));
      return;
    }
    clear();
    toast.success(`${t("checkout.success")} — ${order.order_number}`);
    navigate({ to: "/account", search: { tab: "orders" } });
  };

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-16">
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
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <form onSubmit={placeOrder} className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-display text-3xl font-black">{t("checkout.title")}</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-border/70 bg-card p-6">
              <h2 className="font-display text-lg font-black">{t("checkout.info")}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">{t("checkout.name")}</Label>
                  <Input
                    id="name"
                    required
                    maxLength={100}
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t("checkout.phone")}</Label>
                  <Input
                    id="phone"
                    required
                    dir="ltr"
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">{t("checkout.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-card p-6">
              <h2 className="font-display text-lg font-black">{t("checkout.address")}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">{t("checkout.city")}</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="area">{t("checkout.area")}</Label>
                  <Input
                    id="area"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">{t("checkout.street")}</Label>
                  <Input
                    id="address"
                    required
                    maxLength={500}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">{t("checkout.notes")}</Label>
                  <Textarea
                    id="notes"
                    maxLength={500}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-card p-6">
              <h2 className="font-display text-lg font-black">{t("checkout.payment")}</h2>
              <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-3">
                {payments.cod ? (
                  <label className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm font-semibold">
                    <RadioGroupItem value="cod" />
                    {t("checkout.cod")}
                  </label>
                ) : null}
                {payments.card || payments.online ? (
                  <label className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm font-semibold">
                    <RadioGroupItem value="card" />
                    {t("checkout.card")}
                  </label>
                ) : null}
              </RadioGroup>
              <p className="mt-3 text-xs text-muted-foreground">
                {locale === "ar" ? "استفسارات الطلب: " : "Order questions: "}
                <span dir="ltr">{contact.phone}</span>
              </p>
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-border/70 bg-card p-6 shadow-soft lg:sticky lg:top-32">
            <h2 className="font-display text-lg font-black">{t("cart.title")}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.product_id} className="flex justify-between gap-3">
                  <span className="line-clamp-1 text-muted-foreground">
                    {L(i, "name")} × {i.quantity}
                  </span>
                  <span className="font-bold">{formatPrice(i.unit_price * i.quantity, locale)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={t("cart.coupon")}
                maxLength={30}
              />
              <Button type="button" variant="outline" onClick={applyCoupon}>
                {t("cta.apply")}
              </Button>
            </div>

            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                <dd className="font-bold">{formatPrice(subtotal, locale)}</dd>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-primary">
                  <dt>{t("cart.discount")}</dt>
                  <dd className="font-bold">- {formatPrice(discount, locale)}</dd>
                </div>
              ) : null}
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

            <Button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-full font-bold"
              size="lg"
            >
              {t("checkout.placeOrder")}
            </Button>
            {!user ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {t("checkout.signinFirst")}
              </p>
            ) : null}
          </aside>
        </div>
      </form>
    </SiteLayout>
  );
}
