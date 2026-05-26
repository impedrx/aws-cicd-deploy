import { ReactNode, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, PanelLeft, Presentation } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HelpDialog } from '@/components/HelpDialog';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { useClientTheme } from '@/hooks/useClientTheme';
import { KioskMode } from '@/components/kiosk/KioskMode';

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const [kioskOpen, setKioskOpen] = useState(false);
  useClientTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {/* Glassmorphism gradient background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950/60 dark:to-indigo-950" />
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-400/20 dark:bg-blue-500/25 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-400/15 dark:bg-purple-500/20 rounded-full blur-3xl translate-y-1/4" />
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/4" />
        </div>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Professional header */}
          <header className="glass-header h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
              <div className="hidden sm:block h-5 w-px bg-border" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/50">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-medium max-w-[200px] truncate">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setKioskOpen(true)}
                title="Modo apresentação"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Presentation className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <HelpDialog />
              <Button variant="ghost" size="icon" onClick={signOut} title="Sair" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <ImpersonationBanner />
          <KioskMode open={kioskOpen} onClose={() => setKioskOpen(false)} />

          {/* Main content with subtle background pattern */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
