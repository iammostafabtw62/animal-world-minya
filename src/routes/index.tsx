import { createFileRoute } from "@tanstack/react-router";
import {
  ShoppingCart,
  Stethoscope,
  HeartPulse,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Truck,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import logoMark from "@/assets/logo-mark.png";
import mascotsPair from "@/assets/mascots-pair.png";
import mascotDog from "@/assets/mascot-dog.png";
import mascotCat from "@/assets/mascot-cat.png";
import { brand, location, services, trustPoints } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "عالم الحيوان | Animal World — رعاية بيطرية ومنتجات في المنيا" },
      {
        name: "description",
        content:
          "عالم الحيوان — عيادة بيطرية ومتجر مستلزمات حيوانات أليفة في المنيا، مصر. كل ما يحتاجه حيوانك الأليف في مكان واحد.",
      },
      { property: "og:title", content: "عالم الحيوان | Animal World — المنيا، مصر" },
      {
        property: "og:description",
        content: "رعاية بيطرية متخصصة ومنتجات مختارة بعناية لحيوانك الأليف في المنيا.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const serviceIcons = {
  products: ShoppingCart,
  vet: Stethoscope,
  wellness: HeartPulse,
} as const;

const trustIcons = [MapPin, Stethoscope, ShieldCheck, MessageCircle, Truck, CalendarCheck];

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-3">
      <img src={logoMark} alt="شعار عالم الحيوان" width={44} height={44} className="h-11 w-11" />
      <span className="leading-tight">
        <span className="block font-display text-lg font-black text-primary">عالم الحيوان</span>
        <span className="block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">
          ANIMAL WORLD
        </span>
      </span>
    </a>
  );
}

function Index() {
  return (
    <div id="top" dir="rtl" lang="ar" className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#services" className="transition-colors hover:text-primary">
              خدماتنا
            </a>
            <a href="#minya" className="transition-colors hover:text-primary">
              عن عالم الحيوان
            </a>
            <a href="#contact" className="transition-colors hover:text-primary">
              تواصل معنا
            </a>
          </nav>
          <a
            href="#contact"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
          >
            احجز موعدًا
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="surface-hero relative overflow-hidden">
        <div className="paw-dots absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-xs font-bold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              {location.cityAr} — {location.cityEn}
            </span>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.25] text-foreground md:text-5xl">
              {brand.taglineAr}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-muted-foreground">
              منتجات مختارة بعناية، رعاية بيطرية متخصصة، وكل ما يحتاجه حيوانك الأليف ليعيش حياة صحية
              وسعيدة.
            </p>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{brand.taglineEn}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-lift transition-transform hover:scale-[1.03]"
              >
                <ShoppingCart className="h-5 w-5" />
                تسوق الآن
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary/25 bg-card px-7 py-3.5 font-bold text-primary transition-colors hover:bg-primary-soft"
              >
                <Stethoscope className="h-5 w-5" />
                احجز موعدًا
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-6 bottom-6 h-24 rounded-[50%] bg-primary/10 blur-2xl" aria-hidden />
            <img
              src={mascotsPair}
              alt="كلب وقطة عالم الحيوان — الكلب يحمل حقيبة تسوق والقطة ترتدي معطف الطبيب البيطري"
              width={1200}
              height={1008}
              className="relative mx-auto w-full max-w-xl drop-shadow-xl"
            />
            <div className="relative -mt-4 flex justify-center gap-3 text-xs font-bold">
              <span className="rounded-full bg-card px-4 py-2 text-primary shadow-soft">
                🛍️ تسوق مع الكلب
              </span>
              <span className="rounded-full bg-card px-4 py-2 text-primary shadow-soft">
                🩺 استشر القطة
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl font-black md:text-4xl">
            رعاية متكاملة تحت سقف واحد
          </h2>
          <p className="mt-3 text-muted-foreground">
            Veterinary Care • Pet Products • Pet Wellness
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcons[service.id as keyof typeof serviceIcons];
            return (
              <article
                key={service.id}
                className="rounded-3xl border border-border/70 bg-card p-7 shadow-soft transition-transform hover:-translate-y-1"
              >
                <span className="brand-gradient inline-flex h-13 w-13 items-center justify-center rounded-2xl p-3.5 text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{service.titleAr}</h3>
                <p className="text-xs font-semibold tracking-wide text-accent-foreground/70">
                  {service.titleEn}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{service.descAr}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Minya trust */}
      <section id="minya" className="bg-sand py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-3xl font-black leading-snug md:text-4xl">
              رعاية حقيقية لحيوانك الأليف في المنيا
            </h2>
            <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
              في عالم الحيوان، نجمع بين المنتجات التي يحتاجها حيوانك الأليف والرعاية البيطرية التي
              تمنحك راحة البال.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {trustPoints.map((point, i) => {
                const Icon = trustIcons[i] ?? Sparkles;
                return (
                  <div
                    key={point.titleAr}
                    className="flex gap-3 rounded-2xl border border-border/60 bg-card p-4"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-bold">{point.titleAr}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{point.descAr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-end justify-center gap-2">
            <img
              src={mascotDog}
              alt="كلب عالم الحيوان يلوّح بترحيب"
              width={800}
              height={912}
              loading="lazy"
              className="w-1/2 max-w-56 drop-shadow-lg"
            />
            <img
              src={mascotCat}
              alt="قطة عالم الحيوان بمعطف الطبيب البيطري"
              width={800}
              height={912}
              loading="lazy"
              className="w-1/2 max-w-56 drop-shadow-lg"
            />
            <span className="absolute -top-2 right-1/2 translate-x-1/2 rounded-full bg-card px-5 py-2 text-sm font-bold text-primary shadow-soft">
              نعتني بكل حيوان أليف 🐾
            </span>
          </div>
        </div>
      </section>

      {/* Contact & location */}
      <section id="contact" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2 className="font-display text-3xl font-black md:text-4xl">تواصل معنا وزُرنا</h2>
        <p className="mt-3 text-muted-foreground">
          عالم الحيوان — {location.cityAr} / {location.cityEn}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-bold">العنوان</h3>
                <p className="text-sm text-muted-foreground">{location.addressAr}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={`tel:${location.phone.replace(/\s/g, "")}`}
                className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
              >
                <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-bold">الهاتف</h3>
                  <p dir="ltr" className="text-sm text-muted-foreground">
                    {location.phone}
                  </p>
                </div>
              </a>
              <a
                href={`https://wa.me/${location.whatsapp.replace(/\D/g, "")}`}
                className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
              >
                <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-bold">واتساب</h3>
                  <p dir="ltr" className="text-sm text-muted-foreground">
                    {location.whatsapp}
                  </p>
                </div>
              </a>
            </div>
            <div className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-bold">مواعيد العمل</h3>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {location.hours.map((h) => (
                    <li key={h.dayAr} className="flex justify-between gap-6">
                      <span>{h.dayAr}</span>
                      <span>{h.timeAr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/70 shadow-soft">
            <iframe
              title="موقع عالم الحيوان على الخريطة — المنيا، مصر"
              src={location.mapsUrl}
              loading="lazy"
              className="h-full min-h-80 w-full"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground">
            عالم الحيوان — مكان واحد لكل ما يحتاجه حيوانك الأليف. {location.cityAr}
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Animal World — Veterinary Care • Pet Products • Pet
            Wellness
          </p>
        </div>
      </footer>
    </div>
  );
}
