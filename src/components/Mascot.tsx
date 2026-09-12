import mascotCat from "@/assets/mascot-cat.png";
import mascotDog from "@/assets/mascot-dog.png";
import mascotsPair from "@/assets/mascots-pair.png";
import { cn } from "@/lib/utils";

type Which = "dog" | "cat" | "pair";

const sources: Record<Which, string> = {
  dog: mascotDog,
  cat: mascotCat,
  pair: mascotsPair,
};

const alts: Record<Which, string> = {
  dog: "كلب عالم الحيوان — Animal World dog mascot",
  cat: "قطة عالم الحيوان بمعطف الطبيب البيطري — Animal World cat mascot",
  pair: "كلب وقطة عالم الحيوان معًا — Animal World dog and cat mascots",
};

export function Mascot({
  which,
  className,
  animation = "bob",
  loading = "lazy",
}: {
  which: Which;
  className?: string;
  animation?: "bob" | "wag" | "tilt" | "walk" | "none";
  loading?: "lazy" | "eager";
}) {
  return (
    <img
      src={sources[which]}
      alt={alts[which]}
      loading={loading}
      className={cn(
        animation === "bob" && "mascot-bob",
        animation === "wag" && "mascot-wag",
        animation === "tilt" && "mascot-tilt",
        animation === "walk" && "mascot-walk",
        "select-none drop-shadow-xl",
        className,
      )}
    />
  );
}

export function EmptyState({
  which = "dog",
  title,
  description,
  action,
}: {
  which?: Which;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card px-6 py-12 text-center">
      <Mascot which={which} className="w-32" animation="tilt" />
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}
