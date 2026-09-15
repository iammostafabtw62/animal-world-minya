import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarCheck,
  Images,
  Layers,
  MessageSquare,
  Newspaper,
  PawPrint,
  Pencil,
  Percent,
  Plus,
  Settings as SettingsIcon,
  ShoppingBag,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Mascot } from "@/components/Mascot";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/store";

type AdminSearch = { section?: string };

export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: (s: Record<string, unknown>): AdminSearch => ({
    section: typeof s["section"] === "string" ? s["section"] : undefined,
  }),
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "لوحة التحكم | عالم الحيوان" },
      { name: "description", content: "إدارة المنتجات والطلبات والمواعيد ومحتوى موقع عالم الحيوان." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "لوحة التحكم | عالم الحيوان" },
      { property: "og:description", content: "إدارة المتجر والعيادة." },
    ],
  }),
});

type FieldType = "text" | "number" | "textarea" | "bool" | "select" | "array";
type Field = {
  key: string;
  labelAr: string;
  labelEn: string;
  type: FieldType;
  options?: { value: string; label: string }[];
};

type Resource = {
  id: string;
  table: string;
  labelAr: string;
  labelEn: string;
  icon: typeof ShoppingBag;
  orderBy?: { column: string; ascending: boolean };
  primary: string[];
  fields: Field[];
  canCreate?: boolean;
};

const petTypes = [
  { value: "all", label: "الكل / All" },
  { value: "dog", label: "كلاب / Dogs" },
  { value: "cat", label: "قطط / Cats" },
  { value: "bird", label: "طيور / Birds" },
  { value: "fish", label: "أسماك / Fish" },
];

const orderStatuses = ["new", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const apptStatuses = ["pending", "confirmed", "completed", "cancelled"];

const resources: Resource[] = [
  {
    id: "products",
    table: "products",
    labelAr: "المنتجات",
    labelEn: "Products",
    icon: ShoppingBag,
    orderBy: { column: "created_at", ascending: false },
    primary: ["name_ar", "price", "stock"],
    canCreate: true,
    fields: [
      { key: "slug", labelAr: "المعرّف (slug)", labelEn: "Slug", type: "text" },
      { key: "name_ar", labelAr: "الاسم بالعربية", labelEn: "Name (AR)", type: "text" },
      { key: "name_en", labelAr: "الاسم بالإنجليزية", labelEn: "Name (EN)", type: "text" },
      { key: "description_ar", labelAr: "الوصف بالعربية", labelEn: "Description (AR)", type: "textarea" },
      { key: "description_en", labelAr: "الوصف بالإنجليزية", labelEn: "Description (EN)", type: "textarea" },
      { key: "ingredients_ar", labelAr: "المكوّنات (عربي)", labelEn: "Ingredients (AR)", type: "textarea" },
      { key: "benefits_ar", labelAr: "الفوائد (عربي)", labelEn: "Benefits (AR)", type: "textarea" },
      { key: "usage_ar", labelAr: "طريقة الاستخدام (عربي)", labelEn: "Usage (AR)", type: "textarea" },
      { key: "images", labelAr: "روابط الصور (سطر لكل صورة)", labelEn: "Image URLs", type: "array" },
      { key: "brand", labelAr: "الماركة", labelEn: "Brand", type: "text" },
      { key: "sku", labelAr: "كود المنتج", labelEn: "SKU", type: "text" },
      { key: "pet_type", labelAr: "نوع الحيوان", labelEn: "Pet type", type: "select", options: petTypes },
      { key: "price", labelAr: "السعر", labelEn: "Price", type: "number" },
      { key: "sale_price", labelAr: "سعر العرض", labelEn: "Sale price", type: "number" },
      { key: "stock", labelAr: "المخزون", labelEn: "Stock", type: "number" },
      { key: "low_stock_threshold", labelAr: "حد التنبيه", labelEn: "Low stock alert", type: "number" },
      { key: "is_published", labelAr: "منشور", labelEn: "Published", type: "bool" },
      { key: "is_featured", labelAr: "مميّز", labelEn: "Featured", type: "bool" },
      { key: "is_best_seller", labelAr: "الأكثر مبيعًا", labelEn: "Best seller", type: "bool" },
      { key: "is_new", labelAr: "جديد", labelEn: "New", type: "bool" },
      { key: "is_vet_pick", labelAr: "اختيار الطبيب", labelEn: "Vet pick", type: "bool" },
      { key: "seo_title", labelAr: "عنوان SEO", labelEn: "SEO title", type: "text" },
      { key: "seo_description", labelAr: "وصف SEO", labelEn: "SEO description", type: "textarea" },
    ],
  },
  {
    id: "categories",
    table: "categories",
    labelAr: "الأقسام",
    labelEn: "Categories",
    icon: Layers,
    orderBy: { column: "sort_order", ascending: true },
    primary: ["name_ar", "pet_type", "sort_order"],
    canCreate: true,
    fields: [
      { key: "slug", labelAr: "المعرّف", labelEn: "Slug", type: "text" },
      { key: "name_ar", labelAr: "الاسم بالعربية", labelEn: "Name (AR)", type: "text" },
      { key: "name_en", labelAr: "الاسم بالإنجليزية", labelEn: "Name (EN)", type: "text" },
      { key: "description_ar", labelAr: "الوصف (عربي)", labelEn: "Description (AR)", type: "textarea" },
      { key: "image_url", labelAr: "رابط الصورة", labelEn: "Image URL", type: "text" },
      { key: "pet_type", labelAr: "نوع الحيوان", labelEn: "Pet type", type: "select", options: petTypes },
      { key: "sort_order", labelAr: "الترتيب", labelEn: "Sort order", type: "number" },
      { key: "is_active", labelAr: "مفعّل", labelEn: "Active", type: "bool" },
    ],
  },
  {
    id: "orders",
    table: "orders",
    labelAr: "الطلبات",
    labelEn: "Orders",
    icon: BarChart3,
    orderBy: { column: "created_at", ascending: false },
    primary: ["order_number", "customer_name", "total", "status"],
    fields: [
      { key: "customer_name", labelAr: "اسم العميل", labelEn: "Customer", type: "text" },
      { key: "phone", labelAr: "الهاتف", labelEn: "Phone", type: "text" },
      { key: "city", labelAr: "المدينة", labelEn: "City", type: "text" },
      { key: "address", labelAr: "العنوان", labelEn: "Address", type: "textarea" },
      {
        key: "status",
        labelAr: "حالة الطلب",
        labelEn: "Status",
        type: "select",
        options: orderStatuses.map((s) => ({ value: s, label: s })),
      },
      {
        key: "payment_status",
        labelAr: "حالة الدفع",
        labelEn: "Payment status",
        type: "select",
        options: ["pending", "paid", "refunded"].map((s) => ({ value: s, label: s })),
      },
      { key: "notes", labelAr: "ملاحظات", labelEn: "Notes", type: "textarea" },
    ],
  },
  {
    id: "appointments",
    table: "appointments",
    labelAr: "المواعيد",
    labelEn: "Appointments",
    icon: CalendarCheck,
    orderBy: { column: "appointment_date", ascending: false },
    primary: ["customer_name", "appointment_date", "appointment_time", "status"],
    fields: [
      { key: "customer_name", labelAr: "اسم العميل", labelEn: "Customer", type: "text" },
      { key: "phone", labelAr: "الهاتف", labelEn: "Phone", type: "text" },
      { key: "pet_name", labelAr: "اسم الحيوان", labelEn: "Pet name", type: "text" },
      { key: "appointment_date", labelAr: "التاريخ", labelEn: "Date", type: "text" },
      { key: "appointment_time", labelAr: "الوقت", labelEn: "Time", type: "text" },
      {
        key: "status",
        labelAr: "الحالة",
        labelEn: "Status",
        type: "select",
        options: apptStatuses.map((s) => ({ value: s, label: s })),
      },
      { key: "pet_notes", labelAr: "ملاحظات", labelEn: "Notes", type: "textarea" },
    ],
  },
  {
    id: "services",
    table: "services",
    labelAr: "الخدمات البيطرية",
    labelEn: "Services",
    icon: Stethoscope,
    orderBy: { column: "sort_order", ascending: true },
    primary: ["name_ar", "price", "duration_min"],
    canCreate: true,
    fields: [
      { key: "slug", labelAr: "المعرّف", labelEn: "Slug", type: "text" },
      { key: "name_ar", labelAr: "الاسم بالعربية", labelEn: "Name (AR)", type: "text" },
      { key: "name_en", labelAr: "الاسم بالإنجليزية", labelEn: "Name (EN)", type: "text" },
      { key: "description_ar", labelAr: "الوصف (عربي)", labelEn: "Description (AR)", type: "textarea" },
      { key: "description_en", labelAr: "الوصف (إنجليزي)", labelEn: "Description (EN)", type: "textarea" },
      { key: "price", labelAr: "السعر", labelEn: "Price", type: "number" },
      { key: "duration_min", labelAr: "المدة (دقيقة)", labelEn: "Duration (min)", type: "number" },
      { key: "sort_order", labelAr: "الترتيب", labelEn: "Sort order", type: "number" },
      { key: "is_active", labelAr: "مفعّل", labelEn: "Active", type: "bool" },
    ],
  },
  {
    id: "banners",
    table: "banners",
    labelAr: "البانرات",
    labelEn: "Banners",
    icon: Images,
    orderBy: { column: "sort_order", ascending: true },
    primary: ["title_ar", "is_active", "sort_order"],
    canCreate: true,
    fields: [
      { key: "title_ar", labelAr: "العنوان (عربي)", labelEn: "Title (AR)", type: "text" },
      { key: "title_en", labelAr: "العنوان (إنجليزي)", labelEn: "Title (EN)", type: "text" },
      { key: "subtitle_ar", labelAr: "وصف (عربي)", labelEn: "Subtitle (AR)", type: "text" },
      { key: "image_url", labelAr: "رابط الصورة", labelEn: "Image URL", type: "text" },
      { key: "cta_label_ar", labelAr: "نص الزر (عربي)", labelEn: "CTA (AR)", type: "text" },
      { key: "link", labelAr: "الرابط", labelEn: "Link", type: "text" },
      { key: "sort_order", labelAr: "الترتيب", labelEn: "Sort order", type: "number" },
      { key: "is_active", labelAr: "مفعّل", labelEn: "Active", type: "bool" },
    ],
  },
  {
    id: "coupons",
    table: "coupons",
    labelAr: "الكوبونات",
    labelEn: "Coupons",
    icon: Percent,
    orderBy: { column: "created_at", ascending: false },
    primary: ["code", "discount_type", "value", "is_active"],
    canCreate: true,
    fields: [
      { key: "code", labelAr: "الكود", labelEn: "Code", type: "text" },
      {
        key: "discount_type",
        labelAr: "نوع الخصم",
        labelEn: "Type",
        type: "select",
        options: [
          { value: "percent", label: "% نسبة" },
          { value: "fixed", label: "مبلغ ثابت" },
        ],
      },
      { key: "value", labelAr: "القيمة", labelEn: "Value", type: "number" },
      { key: "min_order", labelAr: "أقل قيمة طلب", labelEn: "Min order", type: "number" },
      { key: "free_shipping", labelAr: "شحن مجاني", labelEn: "Free shipping", type: "bool" },
      { key: "is_active", labelAr: "مفعّل", labelEn: "Active", type: "bool" },
    ],
  },
  {
    id: "articles",
    table: "articles",
    labelAr: "المقالات",
    labelEn: "Articles",
    icon: Newspaper,
    orderBy: { column: "published_at", ascending: false },
    primary: ["title_ar", "author", "is_published"],
    canCreate: true,
    fields: [
      { key: "slug", labelAr: "المعرّف", labelEn: "Slug", type: "text" },
      { key: "title_ar", labelAr: "العنوان (عربي)", labelEn: "Title (AR)", type: "text" },
      { key: "title_en", labelAr: "العنوان (إنجليزي)", labelEn: "Title (EN)", type: "text" },
      { key: "excerpt_ar", labelAr: "مقتطف (عربي)", labelEn: "Excerpt (AR)", type: "textarea" },
      { key: "body_ar", labelAr: "المحتوى (عربي)", labelEn: "Body (AR)", type: "textarea" },
      { key: "body_en", labelAr: "المحتوى (إنجليزي)", labelEn: "Body (EN)", type: "textarea" },
      { key: "cover_url", labelAr: "صورة الغلاف", labelEn: "Cover URL", type: "text" },
      { key: "author", labelAr: "الكاتب", labelEn: "Author", type: "text" },
      { key: "is_published", labelAr: "منشور", labelEn: "Published", type: "bool" },
    ],
  },
  {
    id: "reviews",
    table: "reviews",
    labelAr: "التقييمات",
    labelEn: "Reviews",
    icon: MessageSquare,
    orderBy: { column: "created_at", ascending: false },
    primary: ["customer_name", "rating", "is_approved"],
    fields: [
      { key: "customer_name", labelAr: "الاسم", labelEn: "Name", type: "text" },
      { key: "rating", labelAr: "التقييم", labelEn: "Rating", type: "number" },
      { key: "comment", labelAr: "التعليق", labelEn: "Comment", type: "textarea" },
      { key: "is_approved", labelAr: "معتمد", labelEn: "Approved", type: "bool" },
    ],
  },
  {
    id: "testimonials",
    table: "testimonials",
    labelAr: "آراء العملاء",
    labelEn: "Testimonials",
    icon: MessageSquare,
    orderBy: { column: "sort_order", ascending: true },
    primary: ["name", "rating", "is_approved"],
    canCreate: true,
    fields: [
      { key: "name", labelAr: "الاسم", labelEn: "Name", type: "text" },
      { key: "text_ar", labelAr: "الرأي (عربي)", labelEn: "Text (AR)", type: "textarea" },
      { key: "text_en", labelAr: "الرأي (إنجليزي)", labelEn: "Text (EN)", type: "textarea" },
      { key: "rating", labelAr: "التقييم", labelEn: "Rating", type: "number" },
      { key: "sort_order", labelAr: "الترتيب", labelEn: "Sort order", type: "number" },
      { key: "is_approved", labelAr: "معتمد", labelEn: "Approved", type: "bool" },
    ],
  },
  {
    id: "homepage_sections",
    table: "homepage_sections",
    labelAr: "أقسام الصفحة الرئيسية",
    labelEn: "Homepage sections",
    icon: Layers,
    orderBy: { column: "sort_order", ascending: true },
    primary: ["key", "title_ar", "is_visible"],
    fields: [
      { key: "title_ar", labelAr: "العنوان (عربي)", labelEn: "Title (AR)", type: "text" },
      { key: "title_en", labelAr: "العنوان (إنجليزي)", labelEn: "Title (EN)", type: "text" },
      { key: "subtitle_ar", labelAr: "وصف (عربي)", labelEn: "Subtitle (AR)", type: "text" },
      { key: "sort_order", labelAr: "الترتيب", labelEn: "Sort order", type: "number" },
      { key: "is_visible", labelAr: "ظاهر", labelEn: "Visible", type: "bool" },
    ],
  },
];

function toFormValue(v: unknown, type: FieldType) {
  if (type === "array") return Array.isArray(v) ? v.join("\n") : "";
  if (type === "bool") return Boolean(v);
  return v === null || v === undefined ? "" : String(v);
}

function fromFormValue(v: unknown, type: FieldType) {
  if (type === "array")
    return String(v)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  if (type === "bool") return Boolean(v);
  if (type === "number") return v === "" ? null : Number(v);
  return v === "" ? null : v;
}

function RecordDialog({
  resource,
  record,
  open,
  onOpenChange,
}: {
  resource: Resource;
  record: Record<string, unknown> | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(
      resource.fields.map((f) => [f.key, toFormValue(record?.[f.key], f.type)]),
    ),
  );

  const save = useMutation({
    mutationFn: async () => {
      const payload = Object.fromEntries(
        resource.fields.map((f) => [f.key, fromFormValue(form[f.key], f.type)]),
      );
      if (record?.["id"]) {
        const { error } = await supabase
          .from(resource.table as never)
          .update(payload as never)
          .eq("id", record["id"] as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(resource.table as never).insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(ar ? "تم الحفظ" : "Saved");
      queryClient.invalidateQueries({ queryKey: ["admin", resource.id] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {record ? (ar ? "تعديل" : "Edit") : ar ? "إضافة جديد" : "Add new"} —{" "}
            {ar ? resource.labelAr : resource.labelEn}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {resource.fields.map((f) => (
            <div
              key={f.key}
              className={f.type === "textarea" || f.type === "array" ? "sm:col-span-2" : ""}
            >
              <Label htmlFor={f.key}>{ar ? f.labelAr : f.labelEn}</Label>
              {f.type === "bool" ? (
                <div className="pt-2">
                  <Switch
                    id={f.key}
                    checked={Boolean(form[f.key])}
                    onCheckedChange={(v) => setForm({ ...form, [f.key]: v })}
                  />
                </div>
              ) : f.type === "select" ? (
                <Select
                  value={String(form[f.key] ?? "")}
                  onValueChange={(v) => setForm({ ...form, [f.key]: v })}
                >
                  <SelectTrigger id={f.key}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(f.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "textarea" || f.type === "array" ? (
                <Textarea
                  id={f.key}
                  rows={4}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <Input
                  id={f.key}
                  type={f.type === "number" ? "number" : "text"}
                  step="any"
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="rounded-full font-bold"
          >
            {ar ? "حفظ" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResourceTable({ resource }: { resource: Resource }) {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", resource.id],
    queryFn: async () => {
      let query = supabase.from(resource.table as never).select("*");
      if (resource.orderBy)
        query = query.order(resource.orderBy.column, { ascending: resource.orderBy.ascending });
      const { data, error } = await query.limit(500);
      if (error) throw error;
      return (data ?? []) as Record<string, unknown>[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(resource.table as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(ar ? "تم الحذف" : "Deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", resource.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (rows ?? []).filter((r) =>
    q
      ? resource.primary.some((k) => String(r[k] ?? "").toLowerCase().includes(q.toLowerCase()))
      : true,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-black">
          {ar ? resource.labelAr : resource.labelEn}
        </h2>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
          {(rows ?? []).length}
        </span>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ar ? "بحث..." : "Search..."}
          className="ms-auto max-w-56"
        />
        {resource.canCreate ? (
          <Button
            className="rounded-full font-bold"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {ar ? "إضافة" : "Add"}
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">{ar ? "جارٍ التحميل..." : "Loading..."}</p>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <Mascot which="dog" className="mx-auto w-32" animation="tilt" />
          <p className="mt-4 font-bold">{ar ? "لا توجد بيانات بعد." : "Nothing here yet."}</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-start">
              <tr>
                {resource.primary.map((k) => (
                  <th key={k} className="px-4 py-3 text-start font-bold">
                    {resource.fields.find((f) => f.key === k)
                      ? ar
                        ? resource.fields.find((f) => f.key === k)!.labelAr
                        : resource.fields.find((f) => f.key === k)!.labelEn
                      : k}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={String(r["id"])} className="border-t border-border/60">
                  {resource.primary.map((k) => (
                    <td key={k} className="px-4 py-3">
                      {typeof r[k] === "boolean"
                        ? r[k]
                          ? "✅"
                          : "—"
                        : k === "total" || k === "price"
                          ? formatPrice(Number(r[k] ?? 0), locale)
                          : String(r[k] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="edit"
                        onClick={() => {
                          setEditing(r);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="delete"
                        onClick={() => del.mutate(String(r["id"]))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <RecordDialog
          key={String(editing?.["id"] ?? "new")}
          resource={resource}
          record={editing}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </div>
  );
}

function Overview() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const { data } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [orders, products, appts, customers] = await Promise.all([
        supabase.from("orders").select("total, status, created_at"),
        supabase.from("products").select("id, stock, low_stock_threshold, name_ar"),
        supabase.from("appointments").select("id, status"),
        supabase.from("profiles").select("id"),
      ]);
      return {
        orders: orders.data ?? [],
        products: products.data ?? [],
        appts: appts.data ?? [],
        customers: customers.data ?? [],
      };
    },
  });

  const revenue = (data?.orders ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total), 0);
  const lowStock = (data?.products ?? []).filter((p) => p.stock <= p.low_stock_threshold);

  const stats = [
    { label: ar ? "الإيرادات" : "Revenue", value: formatPrice(revenue, locale), icon: BarChart3 },
    { label: ar ? "الطلبات" : "Orders", value: String((data?.orders ?? []).length), icon: ShoppingBag },
    { label: ar ? "المواعيد" : "Appointments", value: String((data?.appts ?? []).length), icon: CalendarCheck },
    { label: ar ? "العملاء" : "Customers", value: String((data?.customers ?? []).length), icon: Users },
  ];

  return (
    <div>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-display text-2xl font-black">{ar ? "نظرة عامة" : "Overview"}</h2>
          <p className="text-muted-foreground">
            {ar ? "عالم الحيوان — المنيا" : "Animal World — Minya"}
          </p>
        </div>
        <Mascot which="pair" className="ms-auto hidden w-40 sm:block" animation="bob" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
            <p className="font-display text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border/70 bg-card p-5">
        <h3 className="font-display text-lg font-bold">
          {ar ? "منتجات على وشك النفاد" : "Low stock products"}
        </h3>
        {lowStock.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {ar ? "كل المخزون في المستوى الآمن." : "All stock levels are healthy."}
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between gap-4">
                <span>{p.name_ar}</span>
                <span className="font-bold text-destructive">{p.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SettingsPanel() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const queryClient = useQueryClient();
  const { data: rows } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").order("key");
      return data ?? [];
    },
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: async (key: string) => {
      const parsed = JSON.parse(drafts[key] ?? "{}");
      const { error } = await supabase
        .from("site_settings")
        .update({ value: parsed, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(ar ? "تم الحفظ" : "Saved");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-black">
        {ar ? "إعدادات الموقع" : "Site settings"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {ar
          ? "العنوان والهاتف والواتساب ومواعيد العمل والشحن وطرق الدفع — كلها تُدار من هنا."
          : "Address, phone, WhatsApp, hours, shipping and payments are all managed here."}
      </p>
      <div className="mt-6 space-y-5">
        {(rows ?? []).map((r) => {
          const text = drafts[r.key] ?? JSON.stringify(r.value, null, 2);
          return (
            <div key={r.key} className="rounded-3xl border border-border/70 bg-card p-5">
              <h3 className="font-display font-bold">{r.key}</h3>
              <Textarea
                dir="ltr"
                rows={10}
                className="mt-3 font-mono text-xs"
                value={text}
                onChange={(e) => setDrafts({ ...drafts, [r.key]: e.target.value })}
              />
              <Button
                className="mt-3 rounded-full font-bold"
                onClick={() => save.mutate(r.key)}
              >
                {ar ? "حفظ" : "Save"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminPage() {
  const { locale } = useI18n();
  const ar = locale === "ar";
  const { isAdmin, loading } = useAuth();
  const search = Route.useSearch();
  const section = search.section ?? "overview";

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-5 py-20 text-center text-muted-foreground">
          {ar ? "جارٍ التحميل..." : "Loading..."}
        </div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-5 py-20 text-center">
          <Mascot which="cat" className="mx-auto w-40" animation="tilt" />
          <h1 className="mt-6 font-display text-2xl font-black">
            {ar ? "هذه الصفحة للإدارة فقط" : "Admins only"}
          </h1>
          <Button asChild className="mt-5 rounded-full font-bold">
            <Link to="/">{ar ? "العودة للرئيسية" : "Back home"}</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const nav = [
    { id: "overview", labelAr: "نظرة عامة", labelEn: "Overview", icon: BarChart3 },
    ...resources.map((r) => ({
      id: r.id,
      labelAr: r.labelAr,
      labelEn: r.labelEn,
      icon: r.icon,
    })),
    { id: "settings", labelAr: "الإعدادات", labelEn: "Settings", icon: SettingsIcon },
  ];

  const resource = resources.find((r) => r.id === section);

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2 px-2 pb-3">
            <PawPrint className="h-5 w-5 text-primary" />
            <span className="font-display font-black">
              {ar ? "لوحة التحكم" : "Dashboard"}
            </span>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {nav.map((n) => (
              <Link
                key={n.id}
                to="/admin"
                search={{ section: n.id }}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${
                  section === n.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {ar ? n.labelAr : n.labelEn}
              </Link>
            ))}
          </nav>
        </aside>

        <main>
          {section === "overview" ? (
            <Overview />
          ) : section === "settings" ? (
            <SettingsPanel />
          ) : resource ? (
            <ResourceTable key={resource.id} resource={resource} />
          ) : (
            <Overview />
          )}
        </main>
      </div>
    </SiteLayout>
  );
}
