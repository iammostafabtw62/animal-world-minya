import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, MessageCircle, ShoppingCart, User } from "lucide-react";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo, waLink } from "@/lib/site-info";

function WhatsAppButton() {
  const { locale } = useI18n();
  const { contact } = useSiteInfo();
  const message =
    (locale === "ar" ? contact.whatsapp_message_ar : contact.whatsapp_message_en) ?? undefined;
  return (
    <a
      href={waLink(contact.whatsapp, message)}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-20 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-105 md:bottom-6 ltr:right-5 rtl:left-5"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

function MobileTabBar() {
  const { t } = useI18n();
  const { count } = useCart();
  const items = [
    { to: "/", label: t("nav.home"), Icon: Home },
    { to: "/shop", label: t("nav.shop"), Icon: LayoutGrid },
    { to: "/cart", label: t("nav.cart"), Icon: ShoppingCart },
    { to: "/account", label: t("nav.account"), Icon: User },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground"
            >
              <Icon className="h-5 w-5" />
              {to === "/cart" && count > 0 ? (
                <span className="absolute top-1 grid h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[9px] font-black text-secondary-foreground ltr:right-6 rtl:left-6">
                  {count}
                </span>
              ) : null}
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
      <MobileTabBar />
    </div>
  );
}
