import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import {
  discountPercent,
  effectivePrice,
  formatPrice,
  stockState,
  type Product,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: ids } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", user!.id);
      return (data ?? []).map((r) => r.product_id);
    },
  });

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("auth");
      if ((ids ?? []).includes(productId)) {
        await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
      } else {
        await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return { ids: ids ?? [], toggle, signedIn: !!user };
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= Math.round(rating) ? "fill-secondary text-secondary" : "text-border",
          )}
        />
      ))}
      {typeof count === "number" ? <span className="ms-1">({count})</span> : null}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { t, locale, L } = useI18n();
  const { add } = useCart();
  const { ids, toggle, signedIn } = useWishlist();
  const price = effectivePrice(product);
  const off = discountPercent(product);
  const stock = stockState(product);
  const name = L(product, "name");
  const image = product.images?.[0] ?? null;
  const wished = ids.includes(product.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition-transform hover:-translate-y-1">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full place-items-center text-5xl">🐾</span>
        )}
        <span className="absolute top-3 flex flex-col gap-1 ltr:left-3 rtl:right-3">
          {off > 0 ? (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[10px] font-black text-destructive-foreground">
              -{off}%
            </span>
          ) : null}
          {product.is_new ? (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-black text-secondary-foreground">
              {locale === "ar" ? "جديد" : "New"}
            </span>
          ) : null}
          {product.is_vet_pick ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-primary-foreground">
              {locale === "ar" ? "اختيار الطبيب" : "Vet Pick"}
            </span>
          ) : null}
        </span>
      </Link>

      <Button
        variant="secondary"
        size="icon"
        aria-label={t("nav.wishlist")}
        onClick={() => {
          if (!signedIn) {
            toast.info(t("checkout.signinFirst"));
            return;
          }
          toggle.mutate(product.id);
        }}
        className="absolute top-3 h-9 w-9 rounded-full bg-card/90 text-foreground hover:bg-card ltr:right-3 rtl:left-3"
      >
        <Heart className={cn("h-4 w-4", wished && "fill-destructive text-destructive")} />
      </Button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.brand ? (
          <span className="text-[11px] font-semibold text-muted-foreground">{product.brand}</span>
        ) : null}
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 font-display text-sm font-bold leading-6 hover:text-primary"
        >
          {name}
        </Link>
        <Stars rating={product.rating} count={product.review_count} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="font-display text-lg font-black text-primary">
              {formatPrice(price, locale)}
            </p>
            {off > 0 ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price, locale)}
              </p>
            ) : null}
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-[10px] font-bold",
              stock === "in" && "bg-primary-soft text-primary",
              stock === "low" && "bg-secondary/30 text-secondary-foreground",
              stock === "out" && "bg-muted text-muted-foreground",
            )}
          >
            {t(`stock.${stock}`)}
          </span>
        </div>
        <Button
          className="mt-2 w-full rounded-full font-bold"
          disabled={stock === "out"}
          onClick={() => {
            add(
              {
                product_id: product.id,
                slug: product.slug,
                name_ar: product.name_ar,
                name_en: product.name_en,
                image_url: image,
                unit_price: price,
                stock: product.stock,
              },
              1,
            );
            toast.success(t("cart.added"));
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          {t("cta.addToCart")}
        </Button>
      </div>
    </article>
  );
}
