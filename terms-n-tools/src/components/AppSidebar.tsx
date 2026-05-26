import {
  LayoutDashboard, Monitor, FileText, FolderOpen, Settings, Shield, Building2, BarChart3, Users, History, BookOpen,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useTenant } from '@/contexts/TenantContext';
import { CreditsFooter } from '@/components/CreditsFooter';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

const baseItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Inventário', url: '/inventario', icon: Monitor },
  { title: 'Novo Termo', url: '/termos/novo', icon: FileText },
  { title: 'Controle de Termos', url: '/termos', icon: FolderOpen },
  { title: 'Playbook', url: '/playbook', icon: BookOpen },
  { title: 'Analistas', url: '/analistas', icon: Users },
  { title: 'Histórico', url: '/historico', icon: History },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

const adminItems = [
  { title: 'Dashboard Global', url: '/admin', icon: BarChart3 },
  { title: 'Clientes', url: '/admin/clientes', icon: Building2 },
  { title: 'Histórico', url: '/historico', icon: History },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { isAdmin, impersonatedClient } = useTenant();
  const items = isAdmin && !impersonatedClient ? adminItems : baseItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col">
        {/* Brand */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary/20 flex-shrink-0">
              <Shield className="h-4.5 w-4.5 text-sidebar-primary" style={{ width: '18px', height: '18px' }} />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-sidebar-foreground leading-tight tracking-tight">Auksys IT Tools</span>
                <span className="text-[10px] text-sidebar-foreground/35 font-medium leading-tight tracking-widest uppercase mt-0.5">Gestão de Ativos</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          {!collapsed && (
            <div className="px-4 mb-2">
              <span className="text-[9px] font-bold text-sidebar-foreground/25 uppercase tracking-[0.2em]">Navegação</span>
            </div>
          )}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5 px-2">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/70 transition-all duration-150"
                        activeClassName="!bg-sidebar-primary/15 !text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="text-[13px]">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border">
          <CreditsFooter collapsed={collapsed} />
          {!collapsed && (
            <p className="text-[9px] text-sidebar-foreground/20 text-center font-medium pb-2 tracking-widest uppercase">
              v1.0 · Uso interno TI
            </p>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
