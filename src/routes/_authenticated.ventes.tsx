import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart, TrendingUp } from "lucide-react";
import { formatFCFA } from "@/lib/medicaments-mali";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ventes")({ component: VentesPage });

interface Vente { id: string; medicament_nom: string; quantite: number; prix_unitaire: number; total_fcfa: number; patient_nom: string | null; created_at: string; }
interface Med { id: string; nom: string; prix_fcfa: number; stock: number; }

function VentesPage() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [meds, setMeds] = useState<Med[]>([]);
  const [patients, setPatients] = useState<{ id: string; nom: string; prenom: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [medId, setMedId] = useState("");
  const [qte, setQte] = useState(1);
  const [patientId, setPatientId] = useState("");

  const load = async () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [v, m, p] = await Promise.all([
      supabase.from("ventes").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("medicaments").select("id,nom,prix_fcfa,stock").order("nom"),
      supabase.from("patients").select("id,nom,prenom"),
    ]);
    setVentes((v.data as Vente[]) ?? []);
    setMeds((m.data as Med[]) ?? []);
    setPatients(p.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const med = meds.find((m) => m.id === medId);
  const total = med ? med.prix_fcfa * qte : 0;

  const save = async () => {
    if (!med) return toast.error("Sélectionnez un médicament");
    if (qte < 1) return toast.error("Quantité invalide");
    if (qte > med.stock) return toast.error("Stock insuffisant");
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const patient = patients.find((p) => p.id === patientId);
    const { error } = await supabase.from("ventes").insert({
      user_id: user.id,
      medicament_id: med.id,
      medicament_nom: med.nom,
      quantite: qte,
      prix_unitaire: med.prix_fcfa,
      total_fcfa: total,
      patient_id: patient?.id ?? null,
      patient_nom: patient ? `${patient.prenom} ${patient.nom}` : null,
    });
    if (error) return toast.error(error.message);
    // décrément stock
    await supabase.from("medicaments").update({ stock: med.stock - qte }).eq("id", med.id);
    toast.success("Vente enregistrée");
    setOpen(false); setMedId(""); setQte(1); setPatientId(""); load();
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ventesAuj = ventes.filter((v) => new Date(v.created_at) >= today);
  const caAuj = ventesAuj.reduce((s, v) => s + v.total_fcfa, 0);
  const caTotal = ventes.reduce((s, v) => s + v.total_fcfa, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Ventes</h1>
          <p className="text-muted-foreground mt-1">Suivi quotidien des ventes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle vente</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Enregistrer une vente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Médicament</Label>
                <Select value={medId} onValueChange={setMedId}>
                  <SelectTrigger><SelectValue placeholder="Choisir un médicament" /></SelectTrigger>
                  <SelectContent>
                    {meds.map((m) => (
                      <SelectItem key={m.id} value={m.id} disabled={m.stock === 0}>
                        {m.nom} — {formatFCFA(m.prix_fcfa)} (stock: {m.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input type="number" min={1} value={qte} onChange={(e) => setQte(+e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Patient (optionnel)</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger><SelectValue placeholder="Anonyme" /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.prenom} {p.nom}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 rounded-lg bg-primary-soft border">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold text-primary">{formatFCFA(total)}</div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={save}>Enregistrer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5"><div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><ShoppingCart className="h-5 w-5" /></div><div className="mt-4 text-2xl font-bold">{ventesAuj.length}</div><div className="text-xs text-muted-foreground">Ventes aujourd'hui</div></Card>
        <Card className="p-5"><div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div><div className="mt-4 text-2xl font-bold">{formatFCFA(caAuj)}</div><div className="text-xs text-muted-foreground">CA aujourd'hui</div></Card>
        <Card className="p-5 col-span-2 lg:col-span-1"><div className="h-10 w-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div><div className="mt-4 text-2xl font-bold">{formatFCFA(caTotal)}</div><div className="text-xs text-muted-foreground">CA total (50 dernières)</div></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Médicament</th>
                <th className="p-3 font-medium">Qté</th>
                <th className="p-3 font-medium">Patient</th>
                <th className="p-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventes.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune vente.</td></tr>
              )}
              {ventes.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(v.created_at).toLocaleString("fr-FR")}</td>
                  <td className="p-3 font-medium">{v.medicament_nom}</td>
                  <td className="p-3">{v.quantite}</td>
                  <td className="p-3 text-muted-foreground">{v.patient_nom ?? "—"}</td>
                  <td className="p-3 text-right font-semibold">{formatFCFA(v.total_fcfa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
