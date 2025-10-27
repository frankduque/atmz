import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2, LayoutDashboard, LayoutGrid, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.role === 'administrador';

    const mainNavItems: NavItem[] = [
        {
            title: 'Início',
            href: '/painel',
            icon: LayoutGrid,
        },
        {
            title: 'Painéis de Controle',
            href: '/paineis',
            icon: LayoutDashboard,
        },
        ...(isAdmin ? [{
            title: 'Empreendimentos',
            href: '/empreendimentos',
            icon: Building2,
        }] : []),
        ...(isAdmin ? [{
            title: 'Usuários',
            href: '/usuarios',
            icon: Users,
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-24">
                            <Link href="/painel" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
