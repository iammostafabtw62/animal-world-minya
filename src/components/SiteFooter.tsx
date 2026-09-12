import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import logoMark from "@/assets/logo-mark.png";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo, waLink } from "@/lib/site-info";

export function SiteFooter() {
  const { t, locale } = useI18n();
  const { contact, hours } = useSiteInfo();

  return (
    <footer className="mt-16 border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logoMark} alt="Animal World" width={40} height={40} className="h-10 w-10" />
            <span className="font-display text-lg font-black text-primary">عالم الحيوان</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {locale === "ar"
              ? "عالم الحيوان — مكان واحد لكل ما يحتاجه حيوانك الأليف. عيادة بيطرية ومتجر مستلزمات في المنيا."
              : "Animal World — everything your pet needs in one place. Veterinary clinic and pet store in Minya."}
          </p>
        </div>

        <div>
          <h3 className="font-display font-bold">{t("nav.shop")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-primary">
                {t("shop.title")}
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-primary">
                {t("services.title")}
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-primary">
                {t("nav.blog")}
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-primary">
                {t("account.title")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold">{t("nav.contact")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {locale === "ar" ? contact.address_ar : contact.address_en}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a dir="ltr" href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                {contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
              <a dir="ltr" href={waLink(contact.whatsapp)} className="hover:text-primary">
                {contact.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href={`mailto:${contact.email}`} className="hover:text-primary">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold">{t("common.hours")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {hours.map((h) => (
              <li key={h.day_ar} className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  {locale === "ar" ? h.day_ar : h.day_en} — {locale === "ar" ? h.time_ar : h.time_en}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} عالم الحيوان — Animal World • Veterinary Care • Pet Products •
        Pet Wellness
      </div>
    </footer>
  );
}
