import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/Mascot";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { useArticles } from "@/lib/store";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "مقالات العناية بالحيوانات | عالم الحيوان المنيا" },
      {
        name: "description",
        content: "نصائح بيطرية ومقالات عن تغذية وتدريب ورعاية القطط والكلاب من فريق عالم الحيوان.",
      },
      { property: "og:title", content: "مقالات العناية بالحيوانات | عالم الحيوان" },
      { property: "og:description", content: "نصائح ومقالات من أطباء عالم الحيوان في المنيا." },
    ],
  }),
});

function BlogPage() {
  const { t, L } = useI18n();
  const { data: articles } = useArticles();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="font-display text-3xl font-black">{t("home.articles")}</h1>
        {(articles ?? []).length === 0 ? (
          <div className="mt-8">
            <EmptyState which="cat" title={t("shop.empty")} />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {(articles ?? []).map((a) => (
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
                  <h2 className="font-display font-bold">{L(a, "title")}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {L(a, "excerpt")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
