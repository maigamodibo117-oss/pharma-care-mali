import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cross, LogOut, User as UserIcon, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/parametres")({ component: ParamsPage });

function ParamsPage() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) { setNom(data.nom ?? ""); setPrenom(data.prenom ?? ""); }
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ nom, prenom }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profil mis à jour");
  };

  const logout = async () => { await signOut(); nav({ to: "/login" }); };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez votre compte et votre pharmacie.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            {(prenom[0] ?? "P")}{(nom[0] ?? "")}
          </div>
          <div>
            <div className="font-semibold">{prenom} {nom}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{user?.email}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Prénom</Label><Input value={prenom} onChange={(e) => setPrenom(e.target.value)} /></div>
            <div className="space-y-2"><Label>Nom</Label><Input value={nom} onChange={(e) => setNom(e.target.value)} /></div>
          </div>
          <Button onClick={save} disabled={saving}><UserIcon className="h-4 w-4 mr-2" />Enregistrer</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><Cross className="h-5 w-5 text-primary" />À propos</h2>
        <p className="text-sm text-muted-foreground">
          <strong>PharmaCare Mali</strong> — Application moderne de gestion de pharmacie.
          Conçue pour les pharmaciens au Mali avec prix en FCFA et médicaments courants.
        </p>
      </Card>

      <Card className="p-6 border-destructive/30">
        <h2 className="font-semibold mb-2">Session</h2>
        <p className="text-sm text-muted-foreground mb-4">Se déconnecter de l'application.</p>
        <Button variant="destructive" onClick={logout}><LogOut className="h-4 w-4 mr-2" />Déconnexion</Button>
      </Card>
    </div>
  );
}
