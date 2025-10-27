import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ShowLayout from '@/pages/Empreendimentos/ShowLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Power, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';

declare global {
    interface Window {
        searchTimeout?: NodeJS.Timeout;
    }
}

interface Rele {
    id: number;
    nome: string;
    descricao: string | null;
    driver: string;
    configuracao: {
        ip: string;
        porta: number;
    };
    numero_portas: number;
    status: 'online' | 'offline' | 'erro';
    ultima_comunicacao: string | null;
}

interface Empreendimento {
    id: number;
    nome: string;
    descricao: string | null;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    reles: Rele[];
}

interface Props {
    empreendimento: Empreendimento;
    filters: {
        search?: string;
    };
}

export default function Index({ empreendimento, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearch(value);

        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }

        window.searchTimeout = setTimeout(() => {
            router.get(
                `/empreendimentos/${empreendimento.id}/reles`,
                { search: value },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }, 300);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online':
                return <Wifi className="h-4 w-4" />;
            case 'offline':
                return <WifiOff className="h-4 w-4" />;
            case 'erro':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <WifiOff className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            online: 'default',
            offline: 'secondary',
            erro: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'secondary'}>
                {getStatusIcon(status)}
                <span className="ml-1">{status}</span>
            </Badge>
        );
    };

    return (
        <ShowLayout empreendimento={empreendimento} currentTab="reles">
            <Head title={`Relês - ${empreendimento.nome}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Relês</h2>
                        <p className="text-muted-foreground">
                            Gerencie os relês do empreendimento
                        </p>
                    </div>
                    <Link
                        href={`/empreendimentos/${empreendimento.id}/reles/create`}
                    >
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Relê
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar relês..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Lista de Relês */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {empreendimento.reles.length === 0 ? (
                        <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Power className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    Nenhum relê cadastrado
                                </h3>
                                <p className="mb-4 text-center text-sm text-muted-foreground">
                                    Comece adicionando seu primeiro relê ao
                                    empreendimento
                                </p>
                                <Link
                                    href={`/empreendimentos/${empreendimento.id}/reles/create`}
                                >
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Adicionar Relê
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        empreendimento.reles.map((rele) => (
                            <Link
                                key={rele.id}
                                href={`/empreendimentos/${empreendimento.id}/reles/${rele.id}`}
                            >
                                <Card className="transition-colors hover:bg-accent">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="line-clamp-1">
                                                    {rele.nome}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-1">
                                                    {rele.descricao || 'Sem descrição'}
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(rele.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Driver:
                                                </span>
                                                <span className="font-medium">
                                                    {rele.driver}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    IP:
                                                </span>
                                                <span className="font-medium font-mono text-xs">
                                                    {rele.configuracao.ip}:
                                                    {rele.configuracao.porta}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Canais:
                                                </span>
                                                <span className="font-medium">
                                                    {rele.numero_portas}
                                                </span>
                                            </div>
                                            {rele.ultima_comunicacao && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Última comunicação:
                                                    </span>
                                                    <span className="text-xs">
                                                        {new Date(
                                                            rele.ultima_comunicacao
                                                        ).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </ShowLayout>
    );
}
