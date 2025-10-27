import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Início',
        href: '/painel',
    },
];

type Painel = {
    id: number;
    nome: string;
    empreendimento: {
        id: number;
        nome: string;
    };
    usuarios: Array<{ id: number; name: string }>;
};

type Props = {
    isAdmin: boolean;
    paineis?: Painel[];
    stats?: {
        total_empreendimentos: number;
        total_reles: number;
        reles_online: number;
    };
};

export default function Dashboard({ isAdmin, paineis = [], stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Início" />
            
            {isAdmin ? (
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                    <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
            ) : (
                <div className="container mx-auto p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">Bem-vindo</h1>
                        <p className="text-muted-foreground mt-2">
                            Acesso rápido aos seus painéis de controle
                        </p>
                    </div>

                    {paineis.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground text-center mb-4">
                                    Você ainda não tem acesso a nenhum painel de controle.
                                    <br />
                                    Entre em contato com o administrador.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {paineis.map((painel) => (
                                <Card key={painel.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <LayoutDashboard className="h-5 w-5" />
                                            {painel.nome}
                                        </CardTitle>
                                        <CardDescription>
                                            {painel.empreendimento.nome}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                            <Users className="h-4 w-4" />
                                            {painel.usuarios.length} usuário(s) com acesso
                                        </div>
                                        <Button asChild className="w-full">
                                            <Link href={`/paineis/${painel.id}`}>
                                                Acessar Painel
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="mt-8">
                        <Button asChild variant="outline">
                            <Link href="/paineis">
                                Ver todos os painéis
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
