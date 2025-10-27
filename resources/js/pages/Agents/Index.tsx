import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Wifi, WifiOff, AlertTriangle, RefreshCw, Activity, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';

// Declaração global para o timeout
declare global {
    interface Window {
        searchTimeout?: NodeJS.Timeout;
    }
}

interface Agente {
    id: number;
    nome: string;
    endereco_ip?: string;
    porta?: number;
    protocolo?: string;
    status: 'online' | 'offline' | 'error';
    ultimo_heartbeat: string | null;
    versao?: string;
    metadata?: {
        latency_ms?: number;
    };
    empreendimento?: {
        id: number;
        nome: string;
    };
    created_at: string;
}

interface Empreendimento {
    id: number;
    nome: string;
}

interface Props {
    agentes: Agente[];
    empreendimento: Empreendimento;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Agentes Locais',
        href: '/agentes',
    },
];

const statusConfig = {
    online: {
        label: 'Online',
        icon: Wifi,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    offline: {
        label: 'Offline',
        icon: WifiOff,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    error: {
        label: 'Erro',
        icon: AlertTriangle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
};

export default function Index({ agentes, empreendimento }: Props) {
    const [search, setSearch] = useState('');
    const [checkingStatus, setCheckingStatus] = useState<Record<number, boolean>>({});
    const [agentesData, setAgentesData] = useState(agentes);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);

    // Filtrar agentes localmente
    const agentesFiltrados = agentesData.filter((agente) =>
        agente.nome.toLowerCase().includes(search.toLowerCase())
    );

    // Verificar versão disponível
    useEffect(() => {
        const checkVersion = async () => {
            try {
                const response = await axios.get('/api/agent/latest-version');
                setLatestVersion(response.data.version);
            } catch (error) {
                console.error('Erro ao verificar versão:', error);
            }
        };

        checkVersion();
    }, []);

    // Comparar versões semver simplificado
    const hasUpdate = (currentVersion?: string): boolean => {
        if (!currentVersion || !latestVersion) return false;
        
        const parts1 = latestVersion.split('.').map(Number);
        const parts2 = currentVersion.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if ((parts1[i] || 0) > (parts2[i] || 0)) return true;
            if ((parts1[i] || 0) < (parts2[i] || 0)) return false;
        }
        return false;
    };

    const handleCheckStatus = async (agenteId: number) => {
        setCheckingStatus(prev => ({ ...prev, [agenteId]: true }));
        
        try {
            const response = await axios.get(
                `/empreendimentos/${empreendimento.id}/agentes/${agenteId}/ping`
            );
            const data = response.data;
            
            // Atualizar o agente na lista com o status real
            setAgentesData(prev => prev.map(a => 
                a.id === agenteId 
                    ? {
                        ...a,
                        status: data.online ? 'online' : 'offline',
                        latency_ms: data.latency_ms,
                        ultimo_heartbeat: data.response?.ultimo_heartbeat || a.ultimo_heartbeat,
                        versao: data.response?.version || a.versao,
                      }
                    : a
            ));
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            // Marcar como offline em caso de erro
            setAgentesData(prev => prev.map(a => 
                a.id === agenteId ? { ...a, status: 'offline' } : a
            ));
        } finally {
            setCheckingStatus(prev => ({ ...prev, [agenteId]: false }));
        }
    };

    // Auto-refresh de todos os agentes a cada 60 segundos
    useEffect(() => {
        const checkAllAgents = async () => {
            for (const agente of agentesData) {
                await handleCheckStatus(agente.id);
                // Pequeno delay entre requisições para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        };

        // Verificar todos ao carregar
        checkAllAgents();

        // Configurar intervalo
        const interval = setInterval(() => {
            checkAllAgents();
        }, 60000); // 60 segundos

        // Limpar intervalo ao desmontar
        return () => clearInterval(interval);
    }, []); // Array vazio para executar apenas uma vez

    return (
        <AppLayout breadcrumbs={[
            {
                title: 'Empreendimentos',
                href: '/empreendimentos',
            },
            {
                title: empreendimento.nome,
                href: `/empreendimentos/${empreendimento.id}`,
            },
            {
                title: 'Agentes Locais',
                href: `/empreendimentos/${empreendimento.id}/agentes`,
            },
        ]}>
            <Head title={`Agentes - ${empreendimento.nome}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Agentes Locais
                        </h2>
                        <p className="text-muted-foreground">
                            Gerencie os agentes de comunicação local do empreendimento {empreendimento.nome}
                        </p>
                    </div>
                    <Link href={`/empreendimentos/${empreendimento.id}/agentes/create`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Agente
                        </Button>
                    </Link>
                </div>

                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-background"
                    />
                </div>

                {agentesFiltrados.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex min-h-[400px] flex-col items-center justify-center">
                            <Wifi className="mb-4 h-16 w-16 text-muted-foreground" />
                            <h3 className="mb-2 text-xl font-semibold">
                                Nenhum agente encontrado
                            </h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                {filters.search || filters.empreendimento_id
                                    ? 'Tente uma pesquisa diferente'
                                    : 'Comece criando seu primeiro agente local'}
                            </p>
                            {!filters.search && !filters.empreendimento_id && (
                                <Link href="/agentes/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Criar Agente
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {agentesFiltrados.map((agente) => {
                            const config = statusConfig[agente.status];
                            const StatusIcon = config.icon;

                            return (
                                <Link key={agente.id} href={`/empreendimentos/${empreendimento.id}/agentes/${agente.id}/edit`}>
                                    <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:border-primary/50 h-full">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CardHeader className="relative">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="rounded-lg bg-primary/10 p-2.5">
                                                        <Wifi className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <CardTitle className="line-clamp-1 text-lg">
                                                            {agente.nome}
                                                        </CardTitle>
                                                        {hasUpdate(agente.versao) && (
                                                            <Badge variant="outline" className="mt-1 border-amber-500 text-amber-700 dark:text-amber-400 text-xs">
                                                                <Download className="h-3 w-3 mr-1" />
                                                                Atualização disponível
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs shrink-0 ${config.bgColor} ${config.color}`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    {config.label}
                                                </div>
                                            </div>
                                            <CardDescription className="line-clamp-1 mt-2">
                                                {agente.endereco_ip}:{agente.porta} ({agente.protocolo})
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="relative">
                                            <div className="space-y-3">
                                                {agente.ultimo_heartbeat && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                        <span className="line-clamp-1">
                                                            Último contato:{' '}
                                                            {new Date(
                                                                agente.ultimo_heartbeat,
                                                            ).toLocaleString(
                                                                'pt-BR',
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {agente.versao && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                        <span className="line-clamp-1">
                                                            Versão: {agente.versao}
                                                        </span>
                                                    </div>
                                                )}
                                                {agente.metadata?.latency_ms && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Activity className="h-3 w-3" />
                                                        <span className="line-clamp-1">
                                                            Latência: {agente.metadata.latency_ms}ms
                                                        </span>
                                                    </div>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-2"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleCheckStatus(agente.id);
                                                    }}
                                                    disabled={checkingStatus[agente.id]}
                                                >
                                                    <RefreshCw className={`h-3 w-3 mr-2 ${checkingStatus[agente.id] ? 'animate-spin' : ''}`} />
                                                    {checkingStatus[agente.id] ? 'Verificando...' : 'Verificar Status'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
