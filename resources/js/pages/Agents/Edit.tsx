import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, RefreshCw, Trash2, Eye, EyeOff, Activity, Wifi, WifiOff, AlertTriangle, Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
    empreendimento: {
        id: number;
        nome: string;
    };
    agente: {
        id: number;
        nome: string;
        endereco_ip: string;
        porta: number;
        protocolo: string;
        sistema_operacional?: string;
        arquitetura?: string;
        token: string;
        status: 'online' | 'offline' | 'error';
        ultimo_heartbeat: string | null;
        versao?: string;
        metadata?: {
            latency_ms?: number;
        };
        connection_capabilities?: string[] | null;
        behind_cgnat?: boolean;
        public_ip?: string | null;
        nat_type?: string | null;
        last_connection_test?: string | null;
        created_at: string;
    };
}

const breadcrumbs = (empreendimento: Props['empreendimento'], agente: Props['agente']): BreadcrumbItem[] => [
    {
        title: 'Empreendimentos',
        href: '/empreendimentos',
    },
    {
        title: empreendimento.nome,
        href: `/empreendimentos/${empreendimento.id}`,
    },
    {
        title: 'Editar Agente',
        href: `/empreendimentos/${empreendimento.id}/agentes/${agente.id}/edit`,
    },
];

export default function Edit({ empreendimento, agente }: Props) {
    const { props } = usePage<any>();
    const [tokenVisible, setTokenVisible] = useState(false);
    const [showTokenAlert, setShowTokenAlert] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [agenteData, setAgenteData] = useState(agente);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [latestChangelog, setLatestChangelog] = useState<string | null>(null);
    const [hasUpdate, setHasUpdate] = useState(false);
    const [updatingAgent, setUpdatingAgent] = useState(false);
    const [changelogOpen, setChangelogOpen] = useState(false);
    
    useEffect(() => {
        if (props.flash?.show_token) {
            setShowTokenAlert(true);
        }
        
        // Exibir mensagens de erro/sucesso
        if (props.flash?.error) {
            alert('Erro: ' + props.flash.error);
        }
        if (props.flash?.success) {
            alert('Sucesso: ' + props.flash.success);
        }
    }, [props.flash]);

    const handleCheckStatus = async () => {
        setCheckingStatus(true);
        
        try {
            const response = await axios.get(
                `/empreendimentos/${empreendimento.id}/agentes/${agente.id}/ping`
            );
            const data = response.data;
            
            setAgenteData(prev => ({
                ...prev,
                status: data.online ? 'online' : 'offline',
                ultimo_heartbeat: data.response?.ultimo_heartbeat || prev.ultimo_heartbeat,
                versao: data.response?.version || prev.versao,
                metadata: {
                    ...prev.metadata,
                    latency_ms: data.latency_ms
                }
            }));
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            setAgenteData(prev => ({
                ...prev,
                status: 'offline'
            }));
        } finally {
            setCheckingStatus(false);
        }
    };

    // Auto-refresh a cada 30 segundos
    useEffect(() => {
        // Verificar imediatamente ao carregar
        handleCheckStatus();

        // Configurar intervalo
        const interval = setInterval(() => {
            handleCheckStatus();
        }, 30000); // 30 segundos

        // Limpar intervalo ao desmontar
        return () => clearInterval(interval);
    }, [agente.id]);

    // Verificar versão disponível
    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Determinar plataforma do agente
                let platform = null;
                if (agenteData.sistema_operacional && agenteData.arquitetura) {
                    const os = agenteData.sistema_operacional.toLowerCase();
                    const arch = agenteData.arquitetura.toLowerCase();
                    platform = `${os}-${arch}`;
                }

                // Buscar versão mais recente (com plataforma se disponível)
                const params = platform ? { platform } : {};
                const response = await axios.get('/api/agent/latest-version', { params });
                const data = response.data;

                setLatestVersion(data.version);
                setLatestChangelog(data.changelog);

                // Comparar versões se agente tiver versão
                if (agenteData.versao) {
                    setHasUpdate(compareVersions(data.version, agenteData.versao) > 0);
                }
            } catch (error) {
                console.error('Erro ao verificar versão:', error);
                // Se não houver versão disponível para a plataforma, não mostrar erro
                setHasUpdate(false);
            }
        };

        checkVersion();
    }, [agenteData.versao]);

    const handleUpdateAgent = async () => {
        if (!confirm('Deseja ordenar o agente a se atualizar? Isso irá reiniciar o serviço.')) {
            return;
        }

        setUpdatingAgent(true);
        try {
            await axios.post(`/empreendimentos/${empreendimento.id}/agentes/${agente.id}/update`);
            alert('Comando de atualização enviado com sucesso! O agente irá se atualizar em breve.');
            // Aguardar um pouco e verificar status novamente
            setTimeout(() => {
                handleCheckStatus();
            }, 5000);
        } catch (error: any) {
            console.error('Erro ao atualizar agente:', error);
            alert('Erro ao enviar comando: ' + (error.response?.data?.message || error.message));
        } finally {
            setUpdatingAgent(false);
        }
    };

    // Comparar versões semver simplificado
    const compareVersions = (v1: string, v2: string): number => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
            if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
        }
        return 0;
    };
    
    const statusConfig = {
        online: {
            label: 'Online',
            color: 'text-green-700 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-950/30',
            borderColor: 'border-green-200 dark:border-green-800',
            iconBg: 'bg-green-100 dark:bg-green-900',
            iconColor: 'text-green-600 dark:text-green-400',
            icon: Wifi,
        },
        offline: {
            label: 'Offline',
            color: 'text-gray-700 dark:text-gray-400',
            bgColor: 'bg-gray-50 dark:bg-gray-900/30',
            borderColor: 'border-gray-200 dark:border-gray-700',
            iconBg: 'bg-gray-100 dark:bg-gray-800',
            iconColor: 'text-gray-600 dark:text-gray-400',
            icon: WifiOff,
        },
        error: {
            label: 'Erro',
            color: 'text-red-700 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-950/30',
            borderColor: 'border-red-200 dark:border-red-800',
            iconBg: 'bg-red-100 dark:bg-red-900',
            iconColor: 'text-red-600 dark:text-red-400',
            icon: AlertTriangle,
        },
    };

    const config = statusConfig[agenteData.status];
    const StatusIcon = config.icon;
    
    const { data, setData, patch, processing, errors } = useForm({
        nome: agente.nome || '',
        endereco_ip: agente.endereco_ip || '',
        porta: agente.porta?.toString() || '3000',
        protocolo: agente.protocolo || 'http',
        sistema_operacional: agente.sistema_operacional || 'windows',
        arquitetura: agente.arquitetura || 'amd64',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/empreendimentos/${empreendimento.id}/agentes/${agente.id}`);
    };

    const handleCopyToken = () => {
        navigator.clipboard.writeText(agente.token);
        // Feedback visual
        const button = document.activeElement as HTMLButtonElement;
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '✓ Copiado!';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }
    };

    const handleRegenerateToken = () => {
        if (confirm('Tem certeza? O agente precisará ser reconfigurado com o novo token.')) {
            router.post(`/empreendimentos/${empreendimento.id}/agentes/${agente.id}/regenerar-token`);
        }
    };

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
            router.delete(`/empreendimentos/${empreendimento.id}/agentes/${agente.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(empreendimento, agente)}>
            <Head title={`Editar ${agente.nome}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/empreendimentos/${empreendimento.id}/agentes`}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                {agenteData.nome}
                            </h2>
                            <p className="text-muted-foreground">
                                {empreendimento.nome}
                            </p>
                        </div>
                    </div>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Agente
                    </Button>
                </div>

                {/* 1. Card de Status - Primeiro */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <StatusIcon className="h-5 w-5" />
                                    Status da Conexão
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Monitoramento em tempo real do agente local
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCheckStatus}
                                disabled={checkingStatus}
                            >
                                {checkingStatus ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                {checkingStatus ? 'Verificando...' : 'Verificar Agora'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Status Principal */}
                        <div className={`p-6 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-full ${config.iconBg}`}>
                                        <StatusIcon className={`h-6 w-6 ${config.iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status Atual</p>
                                        <p className={`text-2xl font-bold ${config.color}`}>{config.label}</p>
                                    </div>
                                </div>
                                {agenteData.metadata?.latency_ms && agenteData.status === 'online' && (
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-muted-foreground">Latência</p>
                                        <div className="flex items-center gap-2 text-xl font-bold text-green-600 dark:text-green-400">
                                            <Activity className="h-5 w-5" />
                                            {agenteData.metadata.latency_ms}ms
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grid de Informações */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {agenteData.ultimo_heartbeat && (
                                <div className="p-4 rounded-lg border bg-card">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-muted-foreground">Último Contato</Label>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {new Date(agenteData.ultimo_heartbeat).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {(() => {
                                            const diff = Date.now() - new Date(agenteData.ultimo_heartbeat).getTime();
                                            const minutes = Math.floor(diff / 60000);
                                            const seconds = Math.floor((diff % 60000) / 1000);
                                            if (minutes > 0) return `Há ${minutes} min`;
                                            return `Há ${seconds}s`;
                                        })()}
                                    </p>
                                </div>
                            )}

                            {agenteData.versao && (
                                <div className="p-4 rounded-lg border bg-card">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-muted-foreground">Versão do Agente</Label>
                                    </div>
                                    <p className="text-sm font-mono font-bold">
                                        v{agenteData.versao}
                                    </p>
                                    {hasUpdate && (
                                        <Badge variant="outline" className="mt-2 border-amber-500 text-amber-600">
                                            Atualização disponível
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-muted-foreground">Endpoint</Label>
                                </div>
                                <p className="text-sm font-mono break-all">
                                    {agenteData.protocolo}://{agenteData.endereco_ip}:{agenteData.porta}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-muted-foreground">Criado em</Label>
                                </div>
                                <p className="text-sm">
                                    {new Date(agenteData.created_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Card de Atualização Disponível - Segundo */}
                {hasUpdate && latestVersion && (
                    <Card className="max-w-2xl border-2 border-amber-500 dark:border-amber-600">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Download className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                    <CardTitle>Atualização Disponível</CardTitle>
                                </div>
                                <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                                    Nova Versão
                                </Badge>
                            </div>
                            <CardDescription>
                                Uma nova versão do agente está disponível
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Versão Atual</Label>
                                    <div className="text-lg font-mono font-semibold">
                                        v{agenteData.versao || 'Desconhecida'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Versão Disponível</Label>
                                    <div className="text-lg font-mono font-semibold text-green-600 dark:text-green-400">
                                        v{latestVersion}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleUpdateAgent} 
                                    disabled={updatingAgent || agenteData.status !== 'online'}
                                    className="flex-1"
                                >
                                    {updatingAgent ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    {updatingAgent ? 'Atualizando...' : 'Atualizar Agente'}
                                </Button>
                                
                                <Dialog open={changelogOpen} onOpenChange={setChangelogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Ver Changelog
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Changelog - Versão {latestVersion}</DialogTitle>
                                            <DialogDescription>
                                                Novidades e melhorias desta versão
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="prose dark:prose-invert max-w-none">
                                            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                                                {latestChangelog || 'Nenhuma informação de changelog disponível.'}
                                            </pre>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {agenteData.status !== 'online' && (
                                <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-900">
                                    ⚠️ <strong>Atenção:</strong> O agente precisa estar online para receber o comando de atualização.
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                                💡 <strong>Dica:</strong> Ao clicar em "Atualizar Agente", o servidor enviará um comando para que o agente baixe e instale a nova versão automaticamente.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 3. Card de Download e Instalação - Terceiro */}
                <Card className="max-w-2xl border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Download e Instalação
                        </CardTitle>
                        <CardDescription>
                            Baixe o agente configurado pronto para instalar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <a 
                                href={`/empreendimentos/${empreendimento.id}/agentes/${agente.id}/download-package`}
                                className="w-full"
                            >
                                <Button className="w-full" size="lg">
                                    <Download className="mr-2 h-5 w-5" />
                                    Baixar Pacote Completo (.zip)
                                </Button>
                            </a>
                            <p className="text-xs text-muted-foreground text-center">
                                Inclui: binário ({agente.sistema_operacional} {agente.arquitetura}) + config.yaml + README
                            </p>
                        </div>

                        <div className="pt-3 border-t">
                            <p className="text-sm font-medium mb-2">Ou baixe separadamente:</p>
                            <div className="flex gap-2">
                                <a 
                                    href={`/empreendimentos/${empreendimento.id}/agentes/${agente.id}/download-config`}
                                    className="flex-1"
                                >
                                    <Button variant="outline" className="w-full" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        config.yaml
                                    </Button>
                                </a>
                                <a 
                                    href="/versoes-agente"
                                    className="flex-1"
                                >
                                    <Button variant="outline" className="w-full" size="sm">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Ver Versões
                                    </Button>
                                </a>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                💡 <strong>Dica:</strong> Após baixar, extraia o ZIP e execute o agente conforme as instruções no README.md
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {showTokenAlert && (
                    <Card className="max-w-2xl border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                        <CardHeader>
                            <CardTitle className="text-green-900 dark:text-green-100">
                                ✅ Agente criado com sucesso!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-green-800 dark:text-green-200">
                            <p>
                                <strong>Importante:</strong> Copie o token abaixo e guarde em local seguro.
                                Você precisará dele para configurar o software do agente.
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                                💡 O token não será exibido novamente desta forma. Você pode visualizá-lo mais tarde nesta página.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTokenAlert(false)}
                                className="mt-2"
                            >
                                Entendi
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                        <CardDescription>
                            Dados de identificação do agente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Agente</Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    placeholder="Ex: Agente Bloco A"
                                    required
                                />
                                {errors.nome && (
                                    <p className="text-sm text-destructive">{errors.nome}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="endereco_ip">Endereço IP</Label>
                                    <Input
                                        id="endereco_ip"
                                        value={data.endereco_ip}
                                        onChange={(e) => setData('endereco_ip', e.target.value)}
                                        placeholder="Ex: 192.168.1.100"
                                        required
                                    />
                                    {errors.endereco_ip && (
                                        <p className="text-sm text-destructive">{errors.endereco_ip}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="porta">Porta</Label>
                                    <Input
                                        id="porta"
                                        type="number"
                                        min="1"
                                        max="65535"
                                        value={data.porta}
                                        onChange={(e) => setData('porta', e.target.value)}
                                        required
                                    />
                                    {errors.porta && (
                                        <p className="text-sm text-destructive">{errors.porta}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="protocolo">Protocolo</Label>
                                <select
                                    id="protocolo"
                                    value={data.protocolo}
                                    onChange={(e) => setData('protocolo', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    required
                                >
                                    <option value="http">HTTP</option>
                                    <option value="https">HTTPS</option>
                                </select>
                                {errors.protocolo && (
                                    <p className="text-sm text-destructive">{errors.protocolo}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sistema_operacional">Sistema Operacional</Label>
                                    <select
                                        id="sistema_operacional"
                                        value={data.sistema_operacional}
                                        onChange={(e) => setData('sistema_operacional', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        required
                                    >
                                        <option value="windows">Windows</option>
                                        <option value="linux">Linux</option>
                                        <option value="macos">macOS</option>
                                    </select>
                                    {errors.sistema_operacional && (
                                        <p className="text-sm text-destructive">{errors.sistema_operacional}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="arquitetura">Arquitetura</Label>
                                    <select
                                        id="arquitetura"
                                        value={data.arquitetura}
                                        onChange={(e) => setData('arquitetura', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        required
                                    >
                                        <option value="amd64">64-bit (amd64)</option>
                                        <option value="arm64">ARM 64-bit</option>
                                    </select>
                                    {errors.arquitetura && (
                                        <p className="text-sm text-destructive">{errors.arquitetura}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                                <Link href={`/empreendimentos/${empreendimento.id}/agentes`}>
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Token de Autenticação</CardTitle>
                        <CardDescription>
                            Token usado pelo software do agente para se conectar à aplicação
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Token</Label>
                            <div className="flex gap-2">
                                <Input
                                    type={tokenVisible ? 'text' : 'password'}
                                    value={agente.token}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTokenVisible(!tokenVisible)}
                                    title={tokenVisible ? 'Ocultar token' : 'Mostrar token'}
                                >
                                    {tokenVisible ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyToken}
                                    title="Copiar token"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleRegenerateToken}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerar Token
                        </Button>

                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-900">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                ⚠️ <strong>Atenção:</strong> Ao regenerar o token, o agente atual perderá a conexão e precisará ser reconfigurado.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Card de Informações de Rede */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Informações de Rede
                        </CardTitle>
                        <CardDescription>
                            Informações técnicas detectadas automaticamente pelo agente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* IP Público */}
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-muted-foreground">IP Público</Label>
                                </div>
                                <p className="text-sm font-mono font-medium">
                                    {agente.public_ip || (
                                        <span className="text-muted-foreground italic">Não detectado</span>
                                    )}
                                </p>
                            </div>

                            {/* Tipo de NAT */}
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wifi className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-muted-foreground">Tipo de NAT</Label>
                                </div>
                                <p className="text-sm font-medium">
                                    {agente.nat_type ? (
                                        <Badge variant="outline">{agente.nat_type}</Badge>
                                    ) : (
                                        <span className="text-muted-foreground italic">Não detectado</span>
                                    )}
                                </p>
                            </div>

                            {/* Atrás de CGNAT */}
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-muted-foreground">Status CGNAT</Label>
                                </div>
                                {agente.behind_cgnat !== undefined ? (
                                    agente.behind_cgnat ? (
                                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                                            Atrás de CGNAT
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-green-500 text-green-600">
                                            IP Direto
                                        </Badge>
                                    )
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">Não detectado</span>
                                )}
                            </div>

                            {/* Último Teste de Conexão */}
                            <div className="p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-muted-foreground">Último Teste</Label>
                                </div>
                                <p className="text-sm">
                                    {agente.last_connection_test ? (
                                        new Date(agente.last_connection_test).toLocaleString('pt-BR')
                                    ) : (
                                        <span className="text-muted-foreground italic">Nunca testado</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Capacidades de Conexão */}
                        {agente.connection_capabilities && agente.connection_capabilities.length > 0 && (
                            <div className="mt-4 p-4 rounded-lg border bg-card">
                                <div className="flex items-center gap-2 mb-3">
                                    <Wifi className="h-4 w-4 text-muted-foreground" />
                                    <Label className="text-muted-foreground">Capacidades de Conexão</Label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {agente.connection_capabilities.map((capability) => (
                                        <Badge key={capability} variant="secondary">
                                            {capability}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!agente.public_ip && !agente.nat_type && !agente.connection_capabilities && (
                            <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                                <p className="text-sm text-muted-foreground text-center">
                                    ℹ️ As informações de rede serão detectadas automaticamente quando o agente se conectar
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
