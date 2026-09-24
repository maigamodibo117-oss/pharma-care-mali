import { useState } from "react";
import { ImageOff, ShieldCheck } from "lucide-react";

/** Affiche uniquement une image issue d'une source vérifiée (URL https + source citée). Sinon, visuel générique. */
export function FicheImage({ url, source, alt, size = "lg" }: { url: string | null; source: string | null; alt: string; size?: "sm" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const verified = !!url && !!source && /^https:\/\//i.test(url) && !failed;
  const box = size === "lg" ? "h-28 w-28" : "h-10 w-10";

  if (!verified) {
    return (
      <div className={`${box} rounded-xl bg-muted border border-dashed flex flex-col items-center justify-center text-muted-foreground shrink-0`}
        role="img" aria-label="Image non disponible">
        <ImageOff className={size === "lg" ? "h-7 w-7" : "h-4 w-4"} />
        {size === "lg" && <span className="text-[10px] mt-1 text-center leading-tight px-1">Image non disponible</span>}
      </div>
    );
  }
  return (
    <figure className="shrink-0">
      <img src={url!} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)}
        className={`${box} rounded-xl object-contain bg-card border`} />
      {size === "lg" && (
        <figcaption className="mt-1 max-w-28 text-[10px] text-muted-foreground flex items-start gap-1">
          <ShieldCheck className="h-3 w-3 shrink-0 text-primary" /> <span className="break-words">Source : {source}</span>
        </figcaption>
      )}
    </figure>
  );
}
