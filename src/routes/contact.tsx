import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Mascot } from "@/components/Mascot";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo, waLink } from "@/lib/site-info";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "تواصل معنا وزُرنا | عالم الحيوان — المنيا، مصر" },
      {
        name: "description",
        content: "عنوان عالم الحيوان في المنيا، أرقام الهاتف والواتساب، مواعيد العمل والموقع على الخريطة.",
      },
      { property: "og:title", content: "تواصل معنا | عالم الحيوان المنيا" },
      { property: "og:description", content: "زُرنا في المنيا أو تواصل معنا عبر الواتساب." },
    ],
  }),
});

function ContactPage() {
  const { t, locale } = useI18n();
  const { contact, hours } = useSiteInfo();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-display text-3xl font-black">{t("nav.contact")}</h1>
            <p className="mt-2 text-muted-foreground">
              {locale === "ar" ? contact.address_ar : contact.address_en}
            </p>
          </div>
          <Mascot which="dog" className="ms-auto w-28" animation="wag" />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="font-bold">{t("common.address")}</h2>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar" ? contact.address_ar : contact.address_en}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5 hover:border-primary/40"
              >
                <Phone className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-bold">{t("common.phone")}</h2>
                  <p dir="ltr" className="text-sm text-muted-foreground">
                    {contact.phone}
                  </p>
                </div>
              </a>
              <a
                href={waLink(contact.whatsapp)}
                className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5 hover:border-primary/40"
              >
                <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="font-bold">{t("common.whatsapp")}</h2>
                  <p dir="ltr" className="text-sm text-muted-foreground">
                    {contact.whatsapp}
                  </p>
                </div>
              </a>
            </div>
            <a
              href={`mailto:${contact.email}`}
              className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5 hover:border-primary/40"
            >
              <Mail className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="font-bold">Email</h2>
                <p dir="ltr" className="text-sm text-muted-foreground">
                  {contact.email}
                </p>
              </div>
            </a>
            <div className="flex gap-3 rounded-2xl border border-border/70 bg-card p-5">
              <Clock className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1">
                <h2 className="font-bold">{t("common.hours")}</h2>
                <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                  {hours.map((h) => (
                    <li key={h.day_ar} className="flex justify-between gap-6">
                      <span>{locale === "ar" ? h.day_ar : h.day_en}</span>
                      <span>{locale === "ar" ? h.time_ar : h.time_en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/70 shadow-soft">
            <iframe
              title={locale === "ar" ? "موقع عالم الحيوان" : "Animal World location"}
              src={contact.maps_url}
              loading="lazy"
              className="h-full min-h-96 w-full"
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
