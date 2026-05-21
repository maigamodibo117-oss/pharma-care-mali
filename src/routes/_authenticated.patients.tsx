import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, Phone, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/patients")({ component: PatientsPage });

interface Patient { id: string; nom: string; prenom: string; telephone: string | null; age: number | null; sexe: string | null; notes: string | null; }
interface Ordo { id: string; patient_nom: string; medecin: string | null; medicaments_prescrits: string; date_ordonnance: string; notes: string | null; }

const empty = { nom: "", prenom: "", telephone: "", age: "", sexe: "M", notes: "" };

function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [ordos, setOrdos] = useState<Ordo[]>([]);
  const [search, setSearch] = useState("");
  const [openP, setOpenP] = useState(false);
  const [openO, setOpenO] = useState(false);
  const [form, setForm] = useState(empty);
  const [ordoForm, setOrdoForm] = useState({ patient_id: "", patient_nom: "", medecin: "", medicaments_prescrits: "", notes: "" });

  const load = async () => {
    const [p, o] = await Promise.all([
      supabase.from("patients").select("*").order("created_at", { ascending: false }),
      supabase.from("ordonnances").select("*").order("date_ordonnance", { ascending: false }).limit(10),
    ]);
    setPatients((p.data as Patient[]) ?? []);
    setOrdos((o.data as Ordo[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const savePatient = async () => {
    if (!form.nom || !form.prenom) return toast.error("Nom et prénom requis");
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { error } = await supabase.from("patients").insert({
      user_id: user.id, nom: form.nom, prenom: form.prenom,
      telephone: form.telephone || null, age: form.age ? +form.age : null,
      sexe: form.sexe, notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Patient ajouté"); setOpenP(false); setForm(empty); load();
  };

  const removePatient = async (id: string) => {
    if (!confirm("Supprimer ce patient ?")) return;
    await supabase.from("patients").delete().eq("id", id);
    toast.success("Supprimé"); load();
  };

  const saveOrdo = async () => {
    if (!ordoForm.patient_nom || !ordoForm.medicaments_prescrits) return toast.error("Champs requis");
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { error } = await supabase.from("ordonnances").insert({
      user_id: user.id,
      patient_id: ordoForm.patient_id || null,
      patient_nom: ordoForm.patient_nom,
      medecin: ordoForm.medecin || null,
      medicaments_prescrits: ordoForm.medicaments_prescrits,
      notes: ordoForm.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Ordonnance ajoutée"); setOpenO(false);
    setOrdoForm({ patient_id: "", patient_nom: "", medecin: "", medicaments_prescrits: "", notes: "" });
    load();
  };

  const filtered = patients.filter((p) =>
    (p.nom + " " + p.prenom).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1">{patients.length} patient(s) enregistré(s)</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={openO} onOpenChange={setOpenO}>
            <DialogTrigger asChild>
              <Button variant="outline"><FileText className="h-4 w-4 mr-2" />Nouvelle ordonnance</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle ordonnance</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={ordoForm.patient_id} onValueChange={(v) => {
                    const p = patients.find((x) => x.id === v);
                    setOrdoForm({ ...ordoForm, patient_id: v, patient_nom: p ? `${p.prenom} ${p.nom}` : "" });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Choisir un patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.prenom} {p.nom}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Médecin prescripteur</Label><Input value={ordoForm.medecin} onChange={(e) => setOrdoForm({ ...ordoForm, medecin: e.target.value })} /></div>
                <div className="space-y-2"><Label>Médicaments prescrits</Label><Textarea rows={4} value={ordoForm.medicaments_prescrits} onChange={(e) => setOrdoForm({ ...ordoForm, medicaments_prescrits: e.target.value })} placeholder="Ex: Paracétamol 500mg - 3x/jour pendant 5 jours" /></div>
                <div className="space-y-2"><Label>Notes</Label><Textarea value={ordoForm.notes} onChange={(e) => setOrdoForm({ ...ordoForm, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpenO(false)}>Annuler</Button><Button onClick={saveOrdo}>Enregistrer</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openP} onOpenChange={setOpenP}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Patient</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau patient</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Prénom</Label><Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Nom</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Téléphone</Label><Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Âge</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Sexe</Label>
                  <Select value={form.sexe} onValueChange={(v) => setForm({ ...form, sexe: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpenP(false)}>Annuler</Button><Button onClick={savePatient}>Ajouter</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher un patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <div className="grid gap-3">
        {filtered.length === 0 && <Card className="p-10 text-center"><p className="text-muted-foreground">Aucun patient.</p></Card>}
        {filtered.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {p.prenom[0]}{p.nom[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{p.prenom} {p.nom}</div>
                  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                    {p.telephone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.telephone}</span>}
                    {p.age && <span>{p.age} ans</span>}
                    {p.sexe && <span>{p.sexe === "M" ? "Masculin" : "Féminin"}</span>}
                  </div>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => removePatient(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Historique des ordonnances</h2>
        <div className="grid gap-3">
          {ordos.length === 0 && <Card className="p-6 text-center text-muted-foreground">Aucune ordonnance.</Card>}
          {ordos.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{o.patient_nom}</div>
                  {o.medecin && <div className="text-xs text-muted-foreground">Dr. {o.medecin}</div>}
                  <p className="mt-2 text-sm whitespace-pre-line">{o.medicaments_prescrits}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(o.date_ordonnance).toLocaleDateString("fr-FR")}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
