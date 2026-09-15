import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/Mascot";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatPrice, useProducts } from "@/lib/store";

type AccountSearch = { tab?: string };

export const Route = createFileRoute("/_authenticated/account")({
  validateSearch: (s: Record<string, unknown>): AccountSearch => ({
    tab: typeof s["tab"] === "string" ? s["tab"] : undefined,
  }),
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "حسابي | عالم الحيوان" },
      { name: "description", content: "تابع طلباتك ومواعيدك البيطرية وحيواناتك الأليفة والمفضلة." },
      { property: "og:title", content: "حسابي | عالم الحيوان" },
      { property: "og:description", content: "طلباتك ومواعيدك في مكان واحد." },
    ],
  }),
});

function ProfileTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "", city: "", address: "" });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile)
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        address: profile.address ?? "",
      });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, email: user!.email, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("common.saved"));
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error(t("common.error")),
  });

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div>
        <Label htmlFor="fn">{t("checkout.name")}</Label>
        <Input
          id="fn"
          maxLength={100}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="ph">{t("checkout.phone")}</Label>
        <Input
          id="ph"
          dir="ltr"
          maxLength={20}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="ci">{t("checkout.city")}</Label>
        <Input
          id="ci"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="ad">{t("checkout.street")}</Label>
        <Input
          id="ad"
          maxLength={500}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <Button type="submit" className="rounded-full font-bold">
        {t("cta.save")}
      </Button>
    </form>
  );
}

function OrdersTab() {
  const { t, locale, L } = useI18n();
  const { user } = useAuth();
  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if ((orders ?? []).length === 0)
    return (
      <EmptyState
        which="dog"
        title={t("account.noOrders")}
        action={
          <Button asChild className="rounded-full font-bold">
            <Link to="/shop">{t("cta.shop")}</Link>
          </Button>
        }
      />
    );

  return (
    <ul className="space-y-4">
      {(orders ?? []).map((o) => (
        <li key={o.id} className="rounded-3xl border border-border/70 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-display font-black">{o.order_number}</span>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              {t(`status.${o.status}`)}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(o.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
            </span>
            <span className="font-display font-black text-primary">
              {formatPrice(Number(o.total), locale)}
            </span>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {(o.order_items ?? []).map((i: Record<string, unknown>) => (
              <li key={i["id"] as string}>
                {L(i as never, "name")} × {String(i["quantity"])}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function PetsTab() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", species: "dog", breed: "", age: "" });

  const { data: pets } = useQuery({
    queryKey: ["my-pets", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("pets").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pets").insert({ user_id: user!.id, ...form });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ name: "", species: "dog", breed: "", age: "" });
      queryClient.invalidateQueries({ queryKey: ["my-pets"] });
      toast.success(t("common.saved"));
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("pets").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-pets"] }),
  });

  return (
    <div className="space-y-6">
      <ul className="grid gap-4 sm:grid-cols-2">
        {(pets ?? []).map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4"
          >
            <span className="text-3xl">{p.species === "cat" ? "🐱" : "🐶"}</span>
            <div className="flex-1">
              <p className="font-bold">{p.name}</p>
              <p className="text-sm text-muted-foreground">
                {p.breed} {p.age ? `• ${p.age}` : ""}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => del.mutate(p.id)} aria-label="delete">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>

      <form
        className="grid max-w-2xl gap-4 rounded-3xl border border-border/70 bg-card p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div>
          <Label htmlFor="pn">{t("book.petName")}</Label>
          <Input
            id="pn"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Label>{t("book.petSpecies")}</Label>
          <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
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
        <div>
          <Label htmlFor="br">{locale === "ar" ? "السلالة" : "Breed"}</Label>
          <Input
            id="br"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ag">{locale === "ar" ? "العمر" : "Age"}</Label>
          <Input
            id="ag"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </div>
        <Button type="submit" className="rounded-full font-bold sm:col-span-2">
          {t("cta.add")}
        </Button>
      </form>
    </div>
  );
}

function AppointmentsTab() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["my-appointments", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user!.id)
        .order("appointment_date", { ascending: false });
      return data ?? [];
    },
  });

  if ((data ?? []).length === 0)
    return (
      <EmptyState
        which="cat"
        title={locale === "ar" ? "لا توجد مواعيد بعد." : "No appointments yet."}
        action={
          <Button asChild className="rounded-full font-bold">
            <Link to="/services">{t("cta.book")}</Link>
          </Button>
        }
      />
    );

  return (
    <ul className="space-y-3">
      {(data ?? []).map((a) => (
        <li
          key={a.id}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card p-4"
        >
          <span className="font-bold">{a.appointment_date}</span>
          <span className="text-muted-foreground">{a.appointment_time}</span>
          <span className="text-muted-foreground">{a.pet_name}</span>
          <span className="ms-auto rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            {t(`status.${a.status}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function WishlistTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: products } = useProducts();
  const { data: ids } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", user!.id);
      return (data ?? []).map((r) => r.product_id);
    },
  });

  const items = (products ?? []).filter((p) => (ids ?? []).includes(p.id));
  if (items.length === 0)
    return (
      <EmptyState
        which="cat"
        title={t("account.wishlistEmpty")}
        action={
          <Button asChild className="rounded-full font-bold">
            <Link to="/shop">{t("cta.shop")}</Link>
          </Button>
        }
      />
    );

  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function AccountPage() {
  const { t } = useI18n();
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-black">{t("account.title")}</h1>
          {isAdmin ? (
            <Button asChild variant="outline" className="rounded-full font-bold">
              <Link to="/admin">{t("nav.admin")}</Link>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            className="ms-auto text-destructive"
            onClick={async () => {
              await signOut();
              navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
            {t("nav.signout")}
          </Button>
        </div>

        <Tabs
          defaultValue={search.tab ?? "profile"}
          className="mt-8"
          onValueChange={(v) => navigate({ to: "/account", search: { tab: v } })}
        >
          <TabsList className="flex-wrap">
            <TabsTrigger value="profile">{t("account.profile")}</TabsTrigger>
            <TabsTrigger value="orders">{t("account.orders")}</TabsTrigger>
            <TabsTrigger value="pets">{t("account.pets")}</TabsTrigger>
            <TabsTrigger value="appointments">{t("account.appointments")}</TabsTrigger>
            <TabsTrigger value="wishlist">{t("account.wishlist")}</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="pt-6">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="orders" className="pt-6">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="pets" className="pt-6">
            <PetsTab />
          </TabsContent>
          <TabsContent value="appointments" className="pt-6">
            <AppointmentsTab />
          </TabsContent>
          <TabsContent value="wishlist" className="pt-6">
            <WishlistTab />
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}
