import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, AlertTriangle, Calendar } from "lucide-react";
import { CATEGORIES, MEDICAMENTS_MALI, formatFCFA } from "@/lib/medicaments-mali";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/medicaments")({ component: MedsPage });

interface Med {
  id: string; nom: string; categorie: string; prix_fcfa: number; stock: number;
  seuil_alerte: number; date_peremption: string | null; description: string | null;
}

const empty: Omit<Med, "id"> = { nom: "", categorie: "Général", prix_fcfa: 0, stock: 0, seuil_alerte: 10, date_peremption: null, description: null };

function MedsPage() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Med | null>(null);
  const [form, setForm] = useState<Omit<Med, "id">>(empty);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("medicaments").select("*").order("nom");
    setMeds((data as Med[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (m: Med) => {
    setEditing(m);
    setForm({ nom: m.nom, categorie: m.categorie, prix_fcfa: m.prix_fcfa, stock: m.stock, seuil_alerte: m.seuil_alerte, date_peremption: m.date_peremption, description: m.description });
    setOpen(true);
  };

  const save = async () => {
    if (!form.nom.trim()) return toast.error("Nom requis");
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const payload = { ...form, user_id: user.id, date_peremption: form.date_peremption || null };
    const { error } = editing
      ? await supabase.from("medicaments").update(payload).eq("id", editing.id)
      : await supabase.from("medicaments").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Médicament mis à jour" : "Médicament ajouté");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce médicament ?")) return;
    const { error } = await supabase.from("medicaments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé"); load();
  };

  const seedDemo = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const rows = MEDICAMENTS_MALI.map((m) => ({
      ...m, user_id: user.id, stock: Math.floor(Math.random() * 100) + 5, seuil_alerte: 10,
    }));
    const { error } = await supabase.from("medicaments").insert(rows);
    if (error) return toast.error(error.message);
    toast.success("Médicaments courants ajoutés"); load();
  };

  const filtered = meds.filter((m) =>
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    m.categorie.toLowerCase().includes(search.toLowerCase())
  );

  const isExpiringSoon = (d: string | null) => {
    if (!d) return false;
    const diff = (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Médicaments</h1>
          <p className="text-muted-foreground mt-1">{meds.length} médicament(s) en stock</p>
        </div>
        <div className="flex gap-2">
          {meds.length === 0 && !loading && (
            <Button variant="outline" onClick={seedDemo}>Ajouter médicaments courants</Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier" : "Nouveau"} médicament</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={form.categorie} onValueChange={(v) => setForm({ ...form, categorie: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix (FCFA)</Label>
                    <Input type="number" value={form.prix_fcfa} onChange={(e) => setForm({ ...form, prix_fcfa: +e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil d'alerte</Label>
                    <Input type="number" value={form.seuil_alerte} onChange={(e) => setForm({ ...form, seuil_alerte: +e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date de péremption</Label>
                  <Input type="date" value={form.date_peremption ?? ""} onChange={(e) => setForm({ ...form, date_peremption: e.target.value || null })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={save}>{editing ? "Mettre à jour" : "Ajouter"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher un médicament..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <div className="grid gap-3">
        {loading && <p className="text-center text-muted-foreground py-8">Chargement...</p>}
        {!loading && filtered.length === 0 && (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground">Aucun médicament trouvé.</p>
          </Card>
        )}
        {filtered.map((m) => {
          const low = m.stock <= m.seuil_alerte;
          const expSoon = isExpiringSoon(m.date_peremption);
          return (
            <Card key={m.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{m.nom}</h3>
                    <Badge variant="secondary">{m.categorie}</Badge>
                    {low && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Stock faible</Badge>}
                    {expSoon && <Badge className="bg-warning text-warning-foreground gap-1"><Calendar className="h-3 w-3" />Expire bientôt</Badge>}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-4">
                    <span>Stock : <strong className={low ? "text-destructive" : "text-foreground"}>{m.stock}</strong></span>
                    <span>Prix : <strong className="text-foreground">{formatFCFA(m.prix_fcfa)}</strong></span>
                    {m.date_peremption && <span>Exp : {new Date(m.date_peremption).toLocaleDateString("fr-FR")}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
