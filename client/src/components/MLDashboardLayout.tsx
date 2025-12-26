import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Activity, BarChart3, Brain, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface MLDashboardLayoutProps {
  children: React.ReactNode;
}

export default function MLDashboardLayout({ children }: MLDashboardLayoutProps) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <Activity className="w-16 h-16 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Memuat dashboard...</p>
          <p className="text-xs text-muted-foreground">Tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
              <Brain className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Liver AI Agent</h1>
            <p className="text-lg text-muted-foreground">Dashboard Evaluasi Model Pembelajaran Mesin</p>
            <p className="text-sm text-muted-foreground mt-2">Akses eksklusif untuk profesional kesehatan</p>
          </div>
        </div>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-primary-foreground font-semibold px-8 py-6 text-lg"
        >
          Masuk dengan Manus
        </Button>
        <p className="text-xs text-muted-foreground mt-8 text-center max-w-sm">
          Hanya pengguna yang terdaftar dapat mengakses dashboard evaluasi model
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-sm text-foreground">Liver AI</h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Ringkasan"
            href="/dashboard"
            sidebarOpen={sidebarOpen}
          />
          <NavItem
            icon={<Activity className="w-5 h-5" />}
            label="Beranda"
            href="/"
            sidebarOpen={sidebarOpen}
          />
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-border space-y-3">
          {sidebarOpen && (
            <div className="text-xs space-y-1 bg-muted/50 p-3 rounded-lg">
              <p className="text-muted-foreground font-medium">Masuk sebagai</p>
              <p className="font-semibold text-foreground truncate">{user?.name || user?.email}</p>
            </div>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 font-medium"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Keluar"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card/95 border-b border-border px-6 py-4 flex items-center justify-between shadow-sm backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            >
              <svg
                className="w-5 h-5 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Liver AI Agent</h1>
              <p className="text-xs text-muted-foreground">Dashboard Evaluasi Model</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  sidebarOpen: boolean;
}

function NavItem({ icon, label, href, sidebarOpen }: NavItemProps) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
        isActive
          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {sidebarOpen && <span>{label}</span>}
    </a>
  );
}
