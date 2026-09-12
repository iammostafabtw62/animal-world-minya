import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";

import logoMark from "@/assets/logo-mark.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const links = [
  { to: "/", key: "nav.home" },
  { to: "/shop", key: "nav.shop" },
  { to: "/services", key: "nav.services" },
  { to: "/blog", key: "nav.blog" },
  { to: "/contact", key: "nav.contact" },
] as const;

export function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: term || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="bg-primary px-4 py-1.5 text-center text-[11px] font-semibold text-primary-foreground sm:text-xs">
        {t("home.announcement")}
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={locale === "ar" ? "right" : "left"} className="w-72 p-6">
            <nav className="mt-8 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-semibold text-foreground hover:bg-muted"
                  activeProps={{ className: "bg-primary-soft text-primary" }}
                >
                  {t(l.key)}
                </Link>
              ))}
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 font-semibold hover:bg-muted"
              >
                {t("nav.account")}
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-semibold hover:bg-muted"
                >
                  {t("nav.admin")}
                </Link>
              ) : null}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src={logoMark} alt="Animal World" width={40} height={40} className="h-10 w-10" />
          <span className="leading-tight">
            <span className="block font-display text-base font-black text-primary">
              عالم الحيوان
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
              ANIMAL WORLD
            </span>
          </span>
        </Link>

        <nav className="mx-2 hidden items-center gap-5 text-sm font-semibold text-muted-foreground lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ms-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-muted-foreground ltr:left-3 rtl:right-3" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t("shop.search")}
              aria-label={t("shop.search")}
              className="rounded-full ltr:pl-9 rtl:pr-9"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 ms-auto md:ms-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="font-bold"
            aria-label="Switch language"
          >
            {locale === "ar" ? "EN" : "ع"}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label={t("nav.wishlist")}>
            <Link to="/account" search={{ tab: "wishlist" }}>
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label={t("nav.account")}>
            <Link to={user ? "/account" : "/auth"}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
          {isAdmin ? (
            <Button variant="ghost" size="icon" asChild aria-label={t("nav.admin")}>
              <Link to="/admin">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" asChild aria-label={t("nav.cart")} className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 ? (
                <span className="absolute -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-black text-secondary-foreground ltr:-right-0.5 rtl:-left-0.5">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
