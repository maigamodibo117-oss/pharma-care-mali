import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Pill, Users, ShoppingCart, Bot, Settings, LogOut, Menu, X, Cross
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/medicaments", label: "Médicaments", icon: Pill },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/ventes", label: "Ventes", icon: ShoppingCart },
  { to: "/assistant", label: "Assistant IA", icon: Bot },
  { to: "/parametres", label: "Paramètres", icon: Settings },
] as const;

export function AppLayout() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    nav({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Cross className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold">PharmaCare Mali</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-sidebar border-r border-sidebar-border
          flex flex-col transition-transform`}
      >
        <div className="h-16 px-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Cross className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-sidebar-foreground leading-tight">PharmaCare</div>
            <div className="text-xs text-muted-foreground">Mali</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((it) => {
            const active = loc.pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
