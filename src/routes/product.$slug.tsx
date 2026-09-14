import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Mascot } from "@/components/Mascot";
import { ProductCard, Stars, useWishlist } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo } from "@/lib/site-info";
import {
  discountPercent,
  effectivePrice,
  formatPrice,
  stockState,
  useProducts,
  type Product,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [
      { title: `منتج ${params.slug} | عالم الحيوان` },
      {
        name: "description",
        content: "تفاصيل المنتج، المكونات، الفوائد وطريقة الاستخدام — عالم الحيوان، المنيا.",
      },
      { property: "og:title", content: "تفاصيل المنتج | عالم الحيوان" },
      { property: "og:description", content: "منتجات أصلية لحيوانك الأليف من عالم الحيوان." },
    ],
  }),
});

function ReviewsBlock({ product }: { product: Product }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews } = useQuery({
    queryKey: ["reviews", product.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      const { error } = await supabase.from("reviews").insert({
        product_id: product.id,
        user_id: user.id,
        customer_name: (user.user_metadata?.["full_name"] as string) ?? user.email ?? "Customer",
        rating,
        comment,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      toast.success(t("product.reviewPending"));
      queryClient.invalidateQueries({ queryKey: ["reviews", product.id] });
    },
    onError: () => toast.error(t("common.error")),
  });

  return (
    <div className="space-y-6">
      {(reviews ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("product.noReviews")}</p>
      ) : (
        <ul className="space-y-4">
          {(reviews ?? []).map((r) => (
            <li key={r.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">{r.customer_name}</span>
                <Stars rating={r.rating} />
              </div>
              {r.comment ? (
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{r.comment}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form
          className="rounded-2xl border border-border/60 bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate();
          }}
        >
          <h3 className="font-bold">{t("product.writeReview")}</h3>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                aria-label={`${i}`}
                className={cn("text-2xl", i <= rating ? "opacity-100" : "opacity-30")}
              >
                ⭐
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            className="mt-3"
            rows={3}
          />
          <Button type="submit" className="mt-3 rounded-full font-bold" disabled={submit.isPending}>
            {t("cta.save")}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link to="/auth" className="font-bold text-primary hover:underline">
            {t("auth.signin")}
          </Link>
        </p>
      )}
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, locale, L } = useI18n();
  const { data: products, isLoading } = useProducts();
  const { add } = useCart();
  const { ids, toggle, signedIn } = useWishlist();
  const { shipping } = useSiteInfo();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = (products ?? []).find((p) => p.slug === slug);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <Mascot which="cat" className="mx-auto w-40" animation="tilt" />
          <h1 className="mt-6 font-display text-2xl font-black">
            {locale === "ar" ? "المنتج غير موجود" : "Product not found"}
          </h1>
          <Button asChild className="mt-5 rounded-full font-bold">
            <Link to="/shop">{t("cta.shop")}</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const price = effectivePrice(product);
  const off = discountPercent(product);
  const stock = stockState(product);
  const images = product.images?.length ? product.images : [];
  const related = (products ?? [])
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);
  const specs = Object.entries(product.specifications ?? {});

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            {t("nav.home")}
          </Link>
          {" / "}
          <Link to="/shop" className="hover:text-primary">
            {t("shop.title")}
          </Link>
          {" / "}
          <span>{L(product, "name")}</span>
        </nav>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-3xl border border-border/70 bg-muted">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={L(product, "name")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full place-items-center text-6xl">🐾</span>
              )}
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "h-16 w-16 overflow-hidden rounded-xl border-2",
                      i === activeImage ? "border-primary" : "border-transparent",
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            {product.brand ? (
              <span className="text-sm font-semibold text-muted-foreground">{product.brand}</span>
            ) : null}
            <h1 className="mt-1 font-display text-3xl font-black">{L(product, "name")}</h1>
            <div className="mt-2">
              <Stars rating={product.rating} count={product.review_count} />
            </div>

            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-3xl font-black text-primary">
                {formatPrice(price, locale)}
              </span>
              {off > 0 ? (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price, locale)}
                  </span>
                  <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-black text-destructive-foreground">
                    -{off}%
                  </span>
                </>
              ) : null}
            </div>

            <p
              className={cn(
                "mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold",
                stock === "in" && "bg-primary-soft text-primary",
                stock === "low" && "bg-secondary/30 text-secondary-foreground",
                stock === "out" && "bg-muted text-muted-foreground",
              )}
            >
              {t(`stock.${stock}`)}
            </p>

            <p className="mt-5 leading-8 text-muted-foreground">{L(product, "description")}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="-"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="+"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="rounded-full px-8 font-bold"
                disabled={stock === "out"}
                onClick={() => {
                  add(
                    {
                      product_id: product.id,
                      slug: product.slug,
                      name_ar: product.name_ar,
                      name_en: product.name_en,
                      image_url: images[0] ?? null,
                      unit_price: price,
                      stock: product.stock,
                    },
                    qty,
                  );
                  toast.success(t("cart.added"));
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {t("cta.addToCart")}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-11 w-11 rounded-full"
                aria-label={t("nav.wishlist")}
                onClick={() => {
                  if (!signedIn) {
                    toast.info(t("checkout.signinFirst"));
                    return;
                  }
                  toggle.mutate(product.id);
                }}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    ids.includes(product.id) && "fill-destructive text-destructive",
                  )}
                />
              </Button>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              {locale === "ar" ? shipping.delivery_time_ar : shipping.delivery_time_en}
            </p>
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-12">
          <TabsList className="flex-wrap">
            <TabsTrigger value="description">{t("product.description")}</TabsTrigger>
            <TabsTrigger value="ingredients">{t("product.ingredients")}</TabsTrigger>
            <TabsTrigger value="benefits">{t("product.benefits")}</TabsTrigger>
            <TabsTrigger value="usage">{t("product.usage")}</TabsTrigger>
            <TabsTrigger value="specs">{t("product.specs")}</TabsTrigger>
            <TabsTrigger value="reviews">{t("product.reviews")}</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-5 leading-8 text-muted-foreground">
            {L(product, "description")}
          </TabsContent>
          <TabsContent value="ingredients" className="pt-5 leading-8 text-muted-foreground">
            {L(product, "ingredients") || "—"}
          </TabsContent>
          <TabsContent value="benefits" className="pt-5 leading-8 text-muted-foreground">
            {L(product, "benefits") || "—"}
          </TabsContent>
          <TabsContent value="usage" className="pt-5 leading-8 text-muted-foreground">
            {L(product, "usage") || "—"}
          </TabsContent>
          <TabsContent value="specs" className="pt-5">
            <dl className="grid gap-2 sm:grid-cols-2">
              {specs.length === 0 ? <p className="text-muted-foreground">—</p> : null}
              {specs.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between rounded-xl border border-border/60 bg-card px-4 py-2 text-sm"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-bold">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="reviews" className="pt-5">
            <ReviewsBlock product={product} />
          </TabsContent>
        </Tabs>

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-5 font-display text-2xl font-black">{t("product.related")}</h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteLayout>
  );
}
