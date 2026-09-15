import { Link, createFileRoute } from "@tanstack/react-router";

import { Mascot } from "@/components/Mascot";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useArticles } from "@/lib/store";

export const Route = createFileRoute("/blog/$slug")({
  component: ArticlePage,
  head: () => ({
    meta: [
      { title: "مقال | عالم الحيوان — نصائح رعاية الحيوانات" },
      {
        name: "description",
        content: "مقال من فريق عالم الحيوان البيطري في المنيا عن رعاية وتغذية حيوانك الأليف.",
      },
      { property: "og:title", content: "مقال | عالم الحيوان" },
      { property: "og:description", content: "نصائح بيطرية من عالم الحيوان في المنيا." },
    ],
  }),
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { t, locale, L } = useI18n();
  const { data: articles, isLoading } = useArticles();
  const article = (articles ?? []).find((a) => a.slug === slug);

  if (!article) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          {!isLoading ? (
            <>
              <Mascot which="cat" className="mx-auto w-40" animation="tilt" />
              <h1 className="mt-6 font-display text-2xl font-black">
                {locale === "ar" ? "المقال غير موجود" : "Article not found"}
              </h1>
              <Button asChild className="mt-5 rounded-full font-bold">
                <Link to="/blog">{t("nav.blog")}</Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          )}
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-3xl font-black leading-snug">{L(article, "title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {article.author} • {new Date(article.published_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB")}
        </p>
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt={L(article, "title")}
            className="mt-6 w-full rounded-3xl object-cover"
          />
        ) : null}
        <div className="mt-6 whitespace-pre-line text-base leading-9 text-muted-foreground">
          {L(article, "body") || L(article, "excerpt")}
        </div>
      </article>
    </SiteLayout>
  );
}
