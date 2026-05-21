import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/lib/medicaments-mali";
import { seedDemoData } from "@/lib/seed-demo";
import { Pill, Users, ShoppingCart, AlertTriangle, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

interface Stats {
  totalMeds: number;
  totalPatients: number;
  ventesAujourdhui: number;
  caAujourdhui: number;
  stockFaible: { id: string; nom: string; stock: number }[];
  expirationProche: { id: string; nom: string; date_peremption: string }[];
  ventes14j: { date: string; total: number; nb: number }[];
  topMeds: { nom: string; ca: number }[];
  parCategorie: { name: string; value: number }[];
}

const CHART_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const since14 = new Date(); since14.setDate(since14.getDate() - 13); since14.setHours(0, 0, 0, 0);
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    const in30Str = in30.toISOString().slice(0, 10);

    const [meds, patients, ventesToday, ventes14, allMeds, exp] = await Promise.all([
      supabase.from("medicaments").select("id", { count: "exact", head: true }),
      supabase.from("patients").select("id", { count: "exact", head: true }),
      supabase.from("ventes").select("total_fcfa").gte("created_at", startOfDay),
      supabase.from("ventes").select("created_at,total_fcfa,medicament_nom").gte("created_at", since14.toISOString()),
      supabase.from("medicaments").select("id,nom,stock,seuil_alerte,categorie").order("stock", { ascending: true }),
      supabase.from("medicaments").select("id,nom,date_peremption").not("date_peremption", "is", null).lte("date_peremption", in30Str),
    ]);

    const todayList = ventesToday.data ?? [];
    const lowData = (allMeds.data ?? []).filter((m: any) => m.stock <= m.seuil_alerte).slice(0, 5);

    // Build 14-day series
    const byDay: Record<string, { total: number; nb: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      byDay[d.toISOString().slice(0, 10)] = { total: 0, nb: 0 };
    }
    const topMap: Record<string, number> = {};
    (ventes14.data ?? []).forEach((v: any) => {
      const k = v.created_at.slice(0, 10);
      if (byDay[k]) { byDay[k].total += v.total_fcfa; byDay[k].nb += 1; }
      topMap[v.medicament_nom] = (topMap[v.medicament_nom] || 0) + v.total_fcfa;
    });
    const ventes14j = Object.entries(byDay).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      total: v.total, nb: v.nb,
    }));
    const topMeds = Object.entries(topMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([nom, ca]) => ({ nom: nom.length > 18 ? nom.slice(0, 16) + "…" : nom, ca }));

    const catMap: Record<string, number> = {};
    (allMeds.data ?? []).forEach((m: any) => { catMap[m.categorie] = (catMap[m.categorie] || 0) + 1; });
    const parCategorie = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    setStats({
      totalMeds: meds.count ?? 0,
      totalPatients: patients.count ?? 0,
      ventesAujourdhui: todayList.length,
      caAujourdhui: todayList.reduce((s, v: any) => s + (v.total_fcfa || 0), 0),
      stockFaible: lowData,
      expirationProche: (exp.data ?? []).slice(0, 5) as any,
      ventes14j, topMeds, parCategorie,
    });
  };

  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    if (!confirm("Cela va remplacer toutes vos données par des données de démonstration. Continuer ?")) return;
    setSeeding(true);
    try {
      const r = await seedDemoData();
      toast.success(`Démo créée : ${r.meds} médicaments, ${r.patients} patients, ${r.ventes} ventes`);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setSeeding(false);
    }
  };

  const cards = [
    { label: "Médicaments", value: stats?.totalMeds ?? "—", icon: Pill, color: "bg-primary/10 text-primary" },
    { label: "Patients", value: stats?.totalPatients ?? "—", icon: Users, color: "bg-accent text-accent-foreground" },
    { label: "Ventes aujourd'hui", value: stats?.ventesAujourdhui ?? "—", icon: ShoppingCart, color: "bg-success/10 text-success" },
    { label: "CA du jour", value: stats ? formatFCFA(stats.caAujourdhui) : "—", icon: TrendingUp, color: "bg-warning/15 text-warning-foreground" },
  ];

  const isEmpty = stats && stats.totalMeds === 0 && stats.totalPatients === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de votre pharmacie.</p>
        </div>
        <Button onClick={handleSeed} disabled={seeding} variant={isEmpty ? "default" : "outline"}>
          <Sparkles className="h-4 w-4 mr-2" />
          {seeding ? "Création..." : "Charger données démo"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Chiffre d'affaires (14 jours)</h2>
              <p className="text-xs text-muted-foreground">Évolution des ventes en FCFA</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.ventes14j ?? []}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip
                  formatter={(v: number) => formatFCFA(v)}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-1">Par catégorie</h2>
          <p className="text-xs text-muted-foreground mb-3">Répartition du stock</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.parCategorie ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {(stats?.parCategorie ?? []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-1">Top médicaments (14 jours)</h2>
        <p className="text-xs text-muted-foreground mb-3">Meilleurs vendeurs par chiffre d'affaires</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.topMeds ?? []} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" fontSize={11} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <YAxis type="category" dataKey="nom" fontSize={11} width={130} />
              <Tooltip
                formatter={(v: number) => formatFCFA(v)}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              />
              <Bar dataKey="ca" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
