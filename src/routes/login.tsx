import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cross, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Connexion réussie");
    nav({ to: "/dashboard" });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { nom, prenom },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé. Vous pouvez vous connecter.");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="relative z-10 p-12 flex flex-col justify-between text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Cross className="h-7 w-7" />
            </div>
            <div>
              <div className="text-2xl font-bold">PharmaCare</div>
              <div className="text-sm opacity-80">Mali</div>
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold leading-tight">
              La gestion moderne <br /> de votre pharmacie.
            </h1>
            <p className="mt-6 text-lg opacity-90 max-w-md">
              Gérez votre stock, vos patients et vos ventes en toute simplicité.
              Profitez d'un assistant IA pour vous accompagner au quotidien.
            </p>
          </div>
          <div className="text-sm opacity-70">© {new Date().getFullYear()} PharmaCare Mali</div>
        </div>
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Cross className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">PharmaCare Mali</span>
          </div>
          <h2 className="text-2xl font-bold">Bienvenue</h2>
          <p className="text-sm text-muted-foreground mt-1">Connectez-vous à votre pharmacie.</p>

          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pharmacien@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" required value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Mot de passe</Label>
                  <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
