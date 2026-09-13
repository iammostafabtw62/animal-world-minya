import { Link, createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Truck,
} from "lucide-react";

import { Mascot } from "@/components/Mascot";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo } from "@/lib/site-info";
import {
  discountPercent,
  useArticles,
  useCategories,
  useProducts,
  useServices,
  useTestimonials,
} from "@/lib/store";
import { Stars } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "عالم الحيوان | Animal World — متجر ورعاية بيطرية في المنيا" },
      {
        name: "description",
        content:
          "عالم الحيوان: متجر مستلزمات حيوانات أليفة وعيادة بيطرية في المنيا، مصر. طعام، ألعاب، أدوية، وحجز مواعيد بيطرية أونلاين.",
      },
      { property: "og:title", content: "عالم الحيوان | Animal World — المنيا، مصر" },
      {
        property: "og:description",
        content: "كل ما يحتاجه حيوانك الأليف في مكان واحد — منتجات ورعاية بيطرية في المنيا.",
      },
    ],
  }),
});

function SectionHeader({ title, href }: { title: string; href?: "/shop" | "/blog" | "/services" }) {
  const { t } = useI18n();
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-black md:text-3xl">{title}</h2>
      {href ? (
        <Link to={href} className="text-sm font-bold text-primary hover:underline">
          {t("cta.viewAll")}
        </Link>
      ) : null}
    </div>
  );
}

function Home() {
  const { t, locale, L } = useI18n();
  const { contact, shipping } = useSiteInfo();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: services } = useServices();
  const { data: articles } = useArticles();
  const { data: testimonials } = useTestimonials();

  const list = products ?? [];
  const bestSellers = list.filter((p) => p.is_best_seller).slice(0, 8);
  const offers = list.filter((p) => discountPercent(p) > 0).slice(0, 8);
  const vetPicks = list.filter((p) => p.is_vet_pick).slice(0, 4);

  const why = [
    { Icon: MapPin, ar: "في قلب المنيا", en: "Right here in Minya" },
    { Icon: Stethoscope, ar: "خبرة بيطرية", en: "Veterinary expertise" },
    { Icon: ShieldCheck, ar: "منتجات أصلية", en: "Authentic products" },
    { Icon: MessageCircle, ar: "دعم العملاء", en: "Customer support" },
    { Icon: Truck, ar: "توصيل سريع", en: "Fast delivery" },
    { Icon: CalendarCheck, ar: "حجز المواعيد", en: "Easy booking" },
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="surface-hero relative overflow-hidden">
        <div className="paw-dots absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-xs font-bold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              {locale === "ar" ? contact.address_ar : contact.address_en}
            </span>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.25] md:text-5xl">
              {locale === "ar"
                ? "كل ما يحتاجه حيوانك الأليف... في مكان واحد"
                : "Everything Your Pet Needs, All in One Place."}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-muted-foreground">
              {locale === "ar"
                ? "منتجات مختارة بعناية، رعاية بيطرية متخصصة، وكل ما يحتاجه حيوانك الأليف ليعيش حياة صحية وسعيدة."
                : "Carefully selected products, expert veterinary care, and everything your pet needs for a healthy, happy life."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7 font-bold shadow-lift">
                <Link to="/shop">
                  <ShoppingCart className="h-5 w-5" />
                  {t("cta.shop")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-2 px-7 font-bold"
              >
                <Link to="/services">
                  <Stethoscope className="h-5 w-5" />
                  {t("cta.book")}
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Mascot which="pair" which-key="pair" className="mx-auto w-full max-w-xl" animation="bob" loading="eager" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionHeader title={t("home.categories")} href="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {(categories ?? []).slice(0, 12).map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.slug }}
              className="group rounded-3xl border border-border/70 bg-card p-4 text-center shadow-soft transition-transform hover:-translate-y-1"
            >
              <span className="grid h-16 w-full place-items-center overflow-hidden rounded-2xl bg-primary-soft text-3xl">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={L(c, "name")}
                    loading="lazy"
                    className="h-16 w-full object-cover"
                  />
                ) : (
                  "🐾"
                )}
              </span>
              <span className="mt-3 block text-sm font-bold group-hover:text-primary">
                {L(c, "name")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by pet */}
      <section className="bg-sand py-14">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeader title={t("home.pets")} />
          <div className="grid gap-5 md:grid-cols-2">
            {(
              [
                { pet: "dog", label: t("pet.dog"), which: "dog" as const },
                { pet: "cat", label: t("pet.cat"), which: "cat" as const },
              ]
            ).map((p) => (
              <Link
                key={p.pet}
                to="/shop"
                search={{ pet: p.pet }}
                className="flex items-center gap-4 overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-soft transition-transform hover:-translate-y-1"
              >
                <Mascot which={p.which} className="w-28" animation="wag" />
                <div>
                  <h3 className="font-display text-xl font-black">{p.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {locale === "ar" ? "طعام ومستلزمات وألعاب" : "Food, supplies and toys"}
                  </p>
                  <span className="mt-3 inline-block text-sm font-bold text-primary">
                    {t("cta.shop")} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionHeader title={t("home.bestSellers")} href="/shop" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-3xl" />
              ))
            : bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Offers */}
      {offers.length > 0 ? (
        <section className="bg-sand py-14">
          <div className="mx-auto max-w-7xl px-5">
            <SectionHeader title={t("home.offers")} href="/shop" />
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {offers.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Vet picks + expertise */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl bg-primary-soft p-8">
            <Mascot which="cat" className="w-32" animation="tilt" />
            <h2 className="mt-4 font-display text-2xl font-black">{t("home.expertise")}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {locale === "ar"
                ? "فريقنا البيطري يختار المنتجات التي ينصح بها لصحة حيوانك الأليف، ويتابع حالته قبل وبعد العلاج."
                : "Our veterinary team hand-picks the products they recommend and follows your pet before and after treatment."}
            </p>
            <Button asChild className="mt-5 rounded-full font-bold">
              <Link to="/services">{t("cta.book")}</Link>
            </Button>
          </div>
          <div>
            <h2 className="mb-5 font-display text-2xl font-black">{t("home.vetPicks")}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {vetPicks.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-sand py-14">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeader title={t("home.services")} href="/services" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(services ?? []).slice(0, 4).map((s) => (
              <Link
                key={s.id}
                to="/services"
                className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft transition-transform hover:-translate-y-1"
              >
                <span className="brand-gradient grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground">
                  <Stethoscope className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{L(s, "name")}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {L(s, "description")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionHeader title={t("home.why")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {why.map(({ Icon, ar, en }) => (
            <div key={ar} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-5">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-bold">{locale === "ar" ? ar : en}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {locale === "ar" ? shipping.delivery_time_ar : shipping.delivery_time_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {(testimonials ?? []).length > 0 ? (
        <section className="bg-sand py-14">
          <div className="mx-auto max-w-7xl px-5">
            <SectionHeader title={t("home.reviews")} />
            <div className="grid gap-5 md:grid-cols-3">
              {(testimonials ?? []).slice(0, 3).map((r) => (
                <figure key={r.id} className="rounded-3xl border border-border/70 bg-card p-6">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-3 text-sm leading-7 text-muted-foreground">
                    {locale === "ar" ? r.text_ar : (r.text_en ?? r.text_ar)}
                  </blockquote>
                  <figcaption className="mt-4 font-bold">{r.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Articles */}
      {(articles ?? []).length > 0 ? (
        <section className="mx-auto max-w-7xl px-5 py-14">
          <SectionHeader title={t("home.articles")} href="/blog" />
          <div className="grid gap-5 md:grid-cols-3">
            {(articles ?? []).slice(0, 3).map((a) => (
              <Link
                key={a.id}
                to="/blog/$slug"
                params={{ slug: a.slug }}
                className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition-transform hover:-translate-y-1"
              >
                <div className="aspect-[16/9] bg-muted">
                  {a.cover_url ? (
                    <img
                      src={a.cover_url}
                      alt={L(a, "title")}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold">{L(a, "title")}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {L(a, "excerpt")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Location */}
      <section className="mx-auto max-w-7xl px-5 pb-14">
        <SectionHeader title={t("home.location")} />
        <div className="overflow-hidden rounded-3xl border border-border/70 shadow-soft">
          <iframe
            title={locale === "ar" ? "موقع عالم الحيوان" : "Animal World location"}
            src={contact.maps_url}
            loading="lazy"
            className="h-80 w-full"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
