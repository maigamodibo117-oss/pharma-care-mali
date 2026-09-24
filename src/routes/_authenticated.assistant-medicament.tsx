import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { expliquerFiche } from "@/lib/fiche-ia.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FicheImage } from "@/components/FicheImage";
import { AlertTriangle, Loader2, Search, Sparkles, BookOpen } from "lucide-react";

type Fiche = Database["public"]["Tables"]["fiches_medicaments"]["Row"];
type Mode = "explain" | "summary" | "effects" | "compare";

export const Route = createFileRoute("/_authenticated/assistant-medicament")({
  head: () => ({ meta: [{ title: "Assistant Médicament — PharmaCare Mali" }] }),
  component: Page,
});

const norm = (s: string | null) => (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const SECTIONS: [keyof Fiche, string][] = [
  ["indications", "Indications"], ["posologie", "Posologie de référence"],
  ["contre_indications", "Contre-indications"], ["precautions", "Précautions"],
  ["effets_indesirables", "Effets indésirables"], ["interactions", "Interactions"],
  ["conservation", "Conservation"],
];

const MODE_LABELS: Record<Mode, string> = {
  explain: "Expliquer simplement", summary: "Résumer",
  effects: "Effets indésirables & interactions", compare: "Comparer",
};

function Page() {
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Fiche | null>(null);

  useEffect(() => {
    supabase.from("fiches_medicaments").select("*").order("nom_commercial").then(({ data }) => setFiches(data ?? []));
  }, []);

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return fiches;
    return fiches.filter((f) => [f.nom_commercial, f.dci, f.laboratoire].some((v) => norm(v).includes(n)));
  }, [q, fiches]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="h-7 w-7 text-primary" /> Assistant Médicament</h1>
        <p className="text-muted-foreground mt-1">Fiches de référence vérifiées. Outil d'information, pas de prescription automatique.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Rechercher un médicament (nom, DCI, laboratoire)…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="p-2 max-h-[70vh] overflow-y-auto">
          {results.length === 0 && <p className="p-3 text-sm text-muted-foreground">Fiche non disponible.</p>}
          {results.map((f) => (
            <button key={f.id} onClick={() => setSel(f)}
              className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex gap-3 items-center ${sel?.id === f.id ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}>
              <FicheImage url={f.image_url} source={f.image_source} alt={f.nom_commercial} size="sm" />
              <div><div className="font-medium">{f.nom_commercial}</div>
              <div className="text-xs text-muted-foreground">{f.dci}{f.dosage ? ` · ${f.dosage}` : ""}</div></div>
            </button>
          ))}
        </Card>
        {sel ? <FicheView key={sel.id} fiche={sel} all={fiches} /> :
          <Card className="p-8 text-center text-muted-foreground">Sélectionnez un médicament pour afficher sa fiche.</Card>}
      </div>
    </div>
  );
}

function FicheView({ fiche, all }: { fiche: Fiche; all: Fiche[] }) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex gap-4">
          <FicheImage url={fiche.image_url} source={fiche.image_source} alt={fiche.nom_commercial} />
          <div>
            <h2 className="text-2xl font-bold">{fiche.nom_commercial}</h2>
            <p className="text-muted-foreground">{fiche.dci} {fiche.dosage && `· ${fiche.dosage}`} {fiche.forme && `· ${fiche.forme}`}</p>
            <p className="text-sm mt-1">{fiche.classe_therapeutique}{fiche.laboratoire && ` · ${fiche.laboratoire}`}</p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {SECTIONS.map(([k, l]) => (
            <div key={k}>
              <h3 className="font-semibold text-sm text-primary">{l}</h3>
              <p className="text-sm whitespace-pre-wrap">{(fiche[k] as string) || "Information non disponible dans la fiche"}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 text-xs text-muted-foreground border-t pt-3">
          Mise à jour : {new Date(fiche.date_maj).toLocaleDateString("fr-FR")} · Sources : {fiche.sources}
        </div>
      </Card>
      <AiPanel fiche={fiche} all={all} />
    </div>
  );
}

function AiPanel({ fiche, all }: { fiche: Fiche; all: Fiche[] }) {
  const explain = useServerFn(expliquerFiche);
  const [mode, setMode] = useState<Mode>("explain");
  const [compareId, setCompareId] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true); setError(""); setText("");
    try {
      const r = await explain({ data: { ficheId: fiche.id, mode, compareId: mode === "compare" ? compareId || null : null } });
      if (r.ok) setText(r.text); else setError(r.error);
    } catch {
      setError("Le service IA est momentanément indisponible.");
    } finally { setLoading(false); }
  };

  return (
    <Card className="p-5 space-y-3">
      <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Expliquer avec l'IA</h3>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
          <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>{MODE_LABELS[m]}</Button>
        ))}
      </div>
      {mode === "compare" && (
        <select className="w-full border rounded-md h-9 px-2 bg-background text-sm" value={compareId} onChange={(e) => setCompareId(e.target.value)}>
          <option value="">Choisir un médicament à comparer…</option>
          {all.filter((f) => f.id !== fiche.id).map((f) => <option key={f.id} value={f.id}>{f.nom_commercial} ({f.dci})</option>)}
        </select>
      )}
      <Button onClick={run} disabled={loading || (mode === "compare" && !compareId)}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyse de la fiche…</> : <><Sparkles className="h-4 w-4" /> Expliquer avec l'IA</>}
      </Button>
      <div className="flex gap-2 text-xs rounded-lg bg-warning/10 text-foreground p-3 border border-warning/30">
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
        <span>L'IA reformule uniquement la fiche ci-dessus, sans ajouter d'information. Elle ne prescrit pas : toute dose personnalisée doit être validée par un professionnel de santé.</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {text && <div className="text-sm whitespace-pre-wrap bg-muted rounded-lg p-4">{text}</div>}
    </Card>
  );
}
