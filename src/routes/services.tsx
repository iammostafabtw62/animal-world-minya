import { createFileRoute } from "@tanstack/react-router";
import { Clock, Stethoscope } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Mascot } from "@/components/Mascot";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useSiteInfo } from "@/lib/site-info";
import { formatPrice, useServices } from "@/lib/store";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "الخدمات البيطرية وحجز المواعيد | عالم الحيوان المنيا" },
      {
        name: "description",
        content:
          "كشف بيطري، تطعيمات، جراحة، تنظيف أسنان وخدمات العناية — احجز موعدك أونلاين في عالم الحيوان بالمنيا.",
      },
      { property: "og:title", content: "الخدمات البيطرية | عالم الحيوان" },
      { property: "og:description", content: "احجز موعد الكشف البيطري في المنيا بسهولة." },
    ],
  }),
});

function BookingDialog({ serviceId }: { serviceId?: string }) {
  const { t, locale, L } = useI18n();
  const { user } = useAuth();
  const { appointments } = useSiteInfo();
  const { data: services } = useServices();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    service_id: serviceId ?? "",
    customer_name: "",
    phone: "",
    email: "",
    pet_name: "",
    pet_species: "dog",
    pet_notes: "",
    appointment_date: "",
    appointment_time: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info(t("checkout.signinFirst"));
      return;
    }
    if (!form.appointment_date || !form.appointment_time || !form.customer_name || !form.phone) {
      toast.error(t("common.error"));
      return;
    }
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      service_id: form.service_id || null,
      customer_name: form.customer_name.slice(0, 100),
      phone: form.phone.slice(0, 20),
      email: form.email || user.email,
      pet_name: form.pet_name.slice(0, 60),
      pet_species: form.pet_species,
      pet_notes: form.pet_notes.slice(0, 500),
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
    });
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    setOpen(false);
    toast.success(t("book.success"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full font-bold">{t("cta.book")}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto" dir={locale === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="font-display">{t("book.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>{t("book.service")}</Label>
            <Select
              value={form.service_id}
              onValueChange={(v) => setForm({ ...form, service_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("book.service")} />
              </SelectTrigger>
              <SelectContent>
                {(services ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {L(s, "name")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bname">{t("checkout.name")}</Label>
              <Input
                id="bname"
                required
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bphone">{t("checkout.phone")}</Label>
              <Input
                id="bphone"
                required
                dir="ltr"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bdate">{t("book.date")}</Label>
              <Input
                id="bdate"
                type="date"
                required
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("book.time")}</Label>
              <Select
                value={form.appointment_time}
                onValueChange={(v) => setForm({ ...form, appointment_time: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("book.time")} />
                </SelectTrigger>
                <SelectContent>
                  {(appointments.slots ?? []).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pname">{t("book.petName")}</Label>
              <Input
                id="pname"
                value={form.pet_name}
                onChange={(e) => setForm({ ...form, pet_name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("book.petSpecies")}</Label>
              <Select
                value={form.pet_species}
                onValueChange={(v) => setForm({ ...form, pet_species: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">{t("pet.dog")}</SelectItem>
                  <SelectItem value="cat">{t("pet.cat")}</SelectItem>
                  <SelectItem value="other">{locale === "ar" ? "أخرى" : "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="pnotes">{t("checkout.notes")}</Label>
            <Textarea
              id="pnotes"
              value={form.pet_notes}
              onChange={(e) => setForm({ ...form, pet_notes: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full rounded-full font-bold">
            {t("book.submit")}
          </Button>
          {!user ? (
            <p className="text-center text-xs text-muted-foreground">{t("checkout.signinFirst")}</p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ServicesPage() {
  const { t, locale, L } = useI18n();
  const { data: services } = useServices();

  return (
    <SiteLayout>
      <section className="surface-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="font-display text-3xl font-black md:text-4xl">{t("services.title")}</h1>
            <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
              {locale === "ar"
                ? "فريق بيطري متخصص في المنيا يقدم الكشف والتطعيمات والجراحة والعناية اليومية لحيوانك الأليف."
                : "A specialist veterinary team in Minya offering checkups, vaccinations, surgery and daily care."}
            </p>
            <div className="mt-6">
              <BookingDialog />
            </div>
          </div>
          <Mascot which="cat" className="mx-auto w-56" animation="bob" />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 md:grid-cols-2 lg:grid-cols-3">
        {(services ?? []).map((s) => (
          <article
            key={s.id}
            className="flex flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-soft"
          >
            <span className="brand-gradient grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground">
              <Stethoscope className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">{L(s, "name")}</h2>
            <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">
              {L(s, "description")}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              {s.price ? (
                <span className="font-display font-black text-primary">
                  {formatPrice(Number(s.price), locale)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
              {s.duration_min ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {s.duration_min} {t("services.minutes")}
                </span>
              ) : null}
            </div>
            <div className="mt-4">
              <BookingDialog serviceId={s.id} />
            </div>
          </article>
        ))}
      </div>
    </SiteLayout>
  );
}
