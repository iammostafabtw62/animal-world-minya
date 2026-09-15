import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import logoMark from "@/assets/logo-mark.png";
import { Mascot } from "@/components/Mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | عالم الحيوان" },
      { name: "description", content: "سجّل الدخول أو أنشئ حسابًا لمتابعة طلباتك ومواعيدك في عالم الحيوان." },
      { property: "og:title", content: "تسجيل الدخول | عالم الحيوان" },
      { property: "og:description", content: "حسابك في عالم الحيوان — الطلبات والمواعيد والمفضلة." },
    ],
  }),
});

function AuthPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/account", search: { tab: "profile" } });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) toast.success(t("auth.checkEmail"));
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) toast.error(error.message);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(t("common.error"));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account", search: { tab: "profile" } });
  };

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="surface-hero grid min-h-screen place-items-center px-5 py-12"
    >
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-8 shadow-lift">
        <div className="flex flex-col items-center text-center">
          <img src={logoMark} alt="Animal World" className="h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-black text-primary">عالم الحيوان</h1>
          <Mascot which="pair" className="mt-2 w-40" animation="bob" />
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" ? (
            <div>
              <Label htmlFor="fullName">{t("checkout.name")}</Label>
              <Input
                id="fullName"
                required
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          ) : null}
          <div>
            <Label htmlFor="email">{t("checkout.email")}</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-full font-bold">
            {mode === "signin" ? t("auth.signin") : t("auth.signup")}
          </Button>
        </form>

        <Button variant="outline" onClick={google} className="mt-3 w-full rounded-full font-bold">
          {t("auth.google")}
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
          <button
            type="button"
            className="font-bold text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? t("auth.signup") : t("auth.signin")}
          </button>
        </p>
      </div>
    </div>
  );
}
