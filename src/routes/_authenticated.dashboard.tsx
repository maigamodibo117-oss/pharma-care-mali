import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatFCFA } from "@/lib/medicaments-mali";
import { Pill, Users, ShoppingCart, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

interface Stats {
  totalMeds: number;
  totalPatients: number;
  ventesAujourdhui: number;
  caAujourdhui: number;
  stockFaible: { id: string; nom: string; stock: number }[];
  expirationProche: { id: string; nom: string; date_peremption: string }[];
}

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const in30 = new Date(); in30.setDate(in30.getDate() + 30);
      const in30Str = in30.toISOString().slice(0, 10);

      const [meds, patients, ventes, low, exp] = await Promise.all([
        supabase.from("medicaments").select("id", { count: "exact", head: true }),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("ventes").select("total_fcfa").gte("created_at", startOfDay),
        supabase.from("medicaments").select("id,nom,stock,seuil_alerte").order("stock", { ascending: true }),
        supabase.from("medicaments").select("id,nom,date_peremption").not("date_peremption", "is", null).lte("date_peremption", in30Str),
      ]);

      const ventesData = ventes.data ?? [];
      const lowData = (low.data ?? []).filter((m: any) => m.stock <= m.seuil_alerte).slice(0, 5);

      setStats({
        totalMeds: meds.count ?? 0,
        totalPatients: patients.count ?? 0,
        ventesAujourdhui: ventesData.length,
        caAujourdhui: ventesData.reduce((s, v: any) => s + (v.total_fcfa || 0), 0),
        stockFaible: lowData,
        expirationProche: (exp.data ?? []).slice(0, 5) as any,
      });
    })();
  }, []);

  const cards = [
    { label: "Médicaments", value: stats?.totalMeds ?? "—", icon: Pill, color: "bg-primary/10 text-primary" },
    { label: "Patients", value: stats?.totalPatients ?? "—", icon: Users, color: "bg-accent text-accent-foreground" },
    { label: "Ventes aujourd'hui", value: stats?.ventesAujourdhui ?? "—", icon: ShoppingCart, color: "bg-success/10 text-success" },
    { label: "CA du jour", value: stats ? formatFCFA(stats.caAujourdhui) : "—", icon: TrendingUp, color: "bg-warning/15 text-warning-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre pharmacie.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Stock faible</h2>
            </div>
            <Link to="/medicaments" className="text-xs text-primary font-medium">Voir tout →</Link>
          </div>
          {stats?.stockFaible.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune alerte 🎉</p>
          ) : (
            <ul className="space-y-2">
              {stats?.stockFaible.map((m) => (
                <li key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <span className="font-medium text-sm">{m.nom}</span>
                  <span className="text-xs font-semibold text-destructive">{m.stock} restants</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-warning/15 text-warning-foreground flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Expiration proche (30j)</h2>
            </div>
          </div>
          {stats?.expirationProche.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune expiration proche</p>
          ) : (
            <ul className="space-y-2">
              {stats?.expirationProche.map((m) => (
                <li key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <span className="font-medium text-sm">{m.nom}</span>
                  <span className="text-xs font-semibold">{new Date(m.date_peremption).toLocaleDateString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
