import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Server, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Início',
        href: '/painel',
    },
];

interface Empreendimento {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
    reles_count?: number;
}

interface Widget {
    id: number;
    tipo_widget: string;
    rele?: {
        id: number;
        nome: string;
        empreendimento: {
            id: number;
            nome: string;
        };
    };
}

interface PainelData {
    id: number;
    nome: string;
    widgets?: Widget[];
}

interface PainelProps {
    isAdmin: boolean;
    stats?: {
        total_empreendimentos: number;
        total_reles: number;
        reles_online: number;
    };
    empreendimentos_recentes?: Empreendimento[];
    paineis?: PainelData[];
}

export default function Painel({ isAdmin, stats, empreendimentos_recentes, paineis }: PainelProps) {
    const userName = (window as any).Laravel?.user?.name || 'Usuário';
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Início" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Cabeçalho de boas-vindas */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Olá, {userName}! 👋
                    </h2>
                    <p className="text-muted-foreground">
                        Bem-vindo ao sistema de automação
                    </p>
                </div>

                {/* Cards de estatísticas - Apenas Admin */}
                {isAdmin && stats && (
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Empreendimentos
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_empreendimentos}</div>
                                <p className="text-xs text-muted-foreground">Total cadastrados</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Relês
                                </CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_reles}</div>
                                <p className="text-xs text-muted-foreground">Total cadastrados</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Online
                                </CardTitle>
                                <Activity className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.reles_online}</div>
                                <p className="text-xs text-muted-foreground">Relês ativos</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Card principal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Acesso Rápido</CardTitle>
                            <CardDescription>
                                Acesse as principais funcionalidades do sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isAdmin && (
                                <Link href="/empreendimentos">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Gerenciar Empreendimentos
                                    </Button>
                                </Link>
                            )}
                            
                            {isAdmin && (
                                <Link href="/usuarios">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Server className="mr-2 h-4 w-4" />
                                        Gerenciar Usuários
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ações Rápidas - Apenas Admin */}
                    {isAdmin && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Ações Rápidas</CardTitle>
                                <CardDescription>
                                    Cadastre novos itens rapidamente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/empreendimentos/create">
                                    <Button className="w-full justify-start">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Novo Empreendimento
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Lista de empreendimentos recentes - Apenas Admin */}
                {isAdmin && empreendimentos_recentes && empreendimentos_recentes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Empreendimentos Recentes</CardTitle>
                            <CardDescription>
                                Últimos empreendimentos cadastrados
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {empreendimentos_recentes.map((emp) => (
                                    <Link
                                        key={emp.id}
                                        href={`/empreendimentos/${emp.id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{emp.nome}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {emp.cidade}, {emp.estado}
                                                </p>
                                            </div>
                                        </div>
                                        {emp.reles_count !== undefined && (
                                            <div className="text-sm text-muted-foreground">
                                                {emp.reles_count} relê{emp.reles_count !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Painéis de Controle - Usuários Comuns */}
                {!isAdmin && paineis && paineis.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Seus Painéis de Controle</CardTitle>
                            <CardDescription>
                                Painéis que você tem acesso
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {paineis.map((painel) => {
                                    // Extrai empreendimentos únicos dos widgets
                                    const empreendimentos = Array.from(
                                        new Set(
                                            painel.widgets
                                                ?.filter(w => w.rele?.empreendimento)
                                                .map(w => w.rele.empreendimento.nome)
                                        )
                                    );

                                    return (
                                        <Link
                                            key={painel.id}
                                            href={`/paineis/${painel.id}`}
                                            className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-accent"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-5 w-5 text-primary" />
                                                    <h3 className="font-semibold">{painel.nome}</h3>
                                                </div>
                                            </div>
                                            {empreendimentos.length > 0 && (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {empreendimentos.join(', ')}
                                                </p>
                                            )}
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {painel.widgets?.length || 0} widget{painel.widgets?.length !== 1 ? 's' : ''}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
