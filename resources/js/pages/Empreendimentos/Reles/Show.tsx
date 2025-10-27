import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Wifi,
    WifiOff,
    AlertCircle,
    Power,
    PowerOff,
    Zap,
    Plus,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ReleDispositivo {
    id: number;
    porta: number;
    nome: string;
    tipo: string;
    descricao: string | null;
    acoes_disponiveis: string[];
    configuracao_acoes: Record<string, any>;
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
    dispositivos: ReleDispositivo[];
}

interface Empreendimento {
    id: number;
    nome: string;
}

interface Props {
    empreendimento: Empreendimento;
    rele: Rele;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export default function Show({ empreendimento, rele }: Props) {
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [selectedPorta, setSelectedPorta] = useState<number | null>(null);
    const [editingDispositivo, setEditingDispositivo] = useState<ReleDispositivo | null>(null);
    const [testingStatus, setTestingStatus] = useState(false);
    const [channelStatus, setChannelStatus] = useState<Record<number, boolean>>({});
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const { data, setData, post, put, processing, reset } = useForm({
        porta: 0,
        nome: '',
        tipo: '',
        descricao: '',
        acoes_disponiveis: [] as string[],
        configuracao_acoes: {} as Record<string, any>,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Empreendimentos',
            href: '/empreendimentos',
        },
        {
            title: empreendimento.nome,
            href: `/empreendimentos/${empreendimento.id}`,
        },
        {
            title: 'Relês',
            href: `/empreendimentos/${empreendimento.id}/reles`,
        },
        {
            title: rele.nome,
            href: `/empreendimentos/${empreendimento.id}/reles/${rele.id}`,
        },
    ];

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

    const handleDelete = () => {
        router.delete(
            `/empreendimentos/${empreendimento.id}/reles/${rele.id}`,
            {
                onSuccess: () => {
                    router.visit(
                        `/empreendimentos/${empreendimento.id}/reles`
                    );
                },
            }
        );
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const getActionLabel = (acao: string) => {
        const labels: Record<string, string> = {
            'on': 'ligado',
            'off': 'desligado',
            'flash': 'flash executado',
            'pulse': 'pulso executado',
            'blink': 'piscar executado',
        };
        return labels[acao] || acao;
    };

    const handleExecutarAcao = (porta: number, acao: string) => {
        router.post(
            `/empreendimentos/${empreendimento.id}/reles/${rele.id}/executar`,
            {
                acao,
                canal: porta,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(`Canal ${porta} ${getActionLabel(acao)} com sucesso! ✅`, 'success');
                    setTimeout(() => fetchChannelStatus(), 500);
                },
                onError: (errors) => {
                    showToast(`Erro ao executar ação no canal ${porta}`, 'error');
                },
            }
        );
    };

    const getDispositivoPorPorta = (porta: number) => {
        return rele.dispositivos?.find((d) => d.porta === porta);
    };

    const handleOpenConfig = (porta: number) => {
        const dispositivo = getDispositivoPorPorta(porta);
        
        if (dispositivo) {
            setEditingDispositivo(dispositivo);
            setData({
                porta: dispositivo.porta,
                nome: dispositivo.nome,
                tipo: dispositivo.tipo,
                descricao: dispositivo.descricao || '',
                acoes_disponiveis: dispositivo.acoes_disponiveis,
                configuracao_acoes: dispositivo.configuracao_acoes || {},
            });
        } else {
            setEditingDispositivo(null);
            setData({
                porta,
                nome: '',
                tipo: '',
                descricao: '',
                acoes_disponiveis: [],
                configuracao_acoes: {},
            });
        }
        
        setSelectedPorta(porta);
        setConfigDialogOpen(true);
    };

    const handleSaveDispositivo = () => {
        if (editingDispositivo) {
            put(`/empreendimentos/${empreendimento.id}/reles/${rele.id}/dispositivos/${editingDispositivo.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setConfigDialogOpen(false);
                    reset();
                },
            });
        } else {
            post(`/empreendimentos/${empreendimento.id}/reles/${rele.id}/dispositivos`, {
                preserveScroll: true,
                onSuccess: () => {
                    setConfigDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteDispositivo = (dispositivoId: number) => {
        router.delete(
            `/empreendimentos/${empreendimento.id}/reles/${rele.id}/dispositivos/${dispositivoId}`,
            {
                preserveScroll: true,
            }
        );
    };

    const handleAtualizarStatus = () => {
        setTestingStatus(true);
        router.reload({
            only: ['rele'],
            onFinish: () => {
                setTestingStatus(false);
                fetchChannelStatus();
            },
        });
    };

    const fetchChannelStatus = () => {
        setLoadingStatus(true);
        fetch(`/empreendimentos/${empreendimento.id}/reles/${rele.id}/status`)
            .then(response => response.json())
            .then(result => {
                if (result.success && result.status) {
                    setChannelStatus(result.status);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar status:', error);
            })
            .finally(() => {
                setLoadingStatus(false);
            });
    };

    // Busca status ao carregar
    useEffect(() => {
        fetchChannelStatus();
        // Atualiza a cada 5 segundos
        const interval = setInterval(fetchChannelStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const acoesDisponiveis = [
        { value: 'on', label: 'Ligar' },
        { value: 'off', label: 'Desligar' },
        { value: 'flash', label: 'Flash (pulso rápido)' },
        { value: 'pulse', label: 'Pulso temporizado' },
        { value: 'blink', label: 'Piscar' },
    ];

    const toggleAcao = (acao: string) => {
        const acoes = data.acoes_disponiveis.includes(acao)
            ? data.acoes_disponiveis.filter((a) => a !== acao)
            : [...data.acoes_disponiveis, acao];
        setData('acoes_disponiveis', acoes);
        
        // Inicializar configuração padrão da ação se ainda não existe
        if (acoes.includes(acao) && !data.configuracao_acoes[acao]) {
            const defaults: Record<string, any> = {
                flash: { duracao_ms: 500 },
                pulse: { duracao_segundos: 3 },
                blink: { repeticoes: 5, intervalo_ms: 300 },
            };
            
            if (defaults[acao]) {
                setData('configuracao_acoes', {
                    ...data.configuracao_acoes,
                    [acao]: defaults[acao],
                });
            }
        }
    };

    const updateAcaoConfig = (acao: string, campo: string, valor: any) => {
        setData('configuracao_acoes', {
            ...data.configuracao_acoes,
            [acao]: {
                ...data.configuracao_acoes[acao],
                [campo]: parseInt(valor) || 0,
            },
        });
    };

    const renderAcoesDispositivo = (dispositivo: ReleDispositivo) => {
        return (
            <div className="flex flex-wrap gap-2 mt-3">
                {dispositivo.acoes_disponiveis.map((acao) => {
                    const icons: Record<string, any> = {
                        on: Power,
                        off: PowerOff,
                        flash: Zap,
                        pulse: Zap,
                        blink: Zap,
                    };

                    const labels: Record<string, string> = {
                        on: 'Ligar',
                        off: 'Desligar',
                        flash: 'Flash',
                        pulse: 'Pulso',
                        blink: 'Piscar',
                    };

                    const Icon = icons[acao] || Zap;

                    return (
                        <Button
                            key={acao}
                            size="sm"
                            variant={acao === 'on' ? 'default' : 'outline'}
                            onClick={() =>
                                handleExecutarAcao(dispositivo.porta, acao)
                            }
                        >
                            <Icon className="mr-2 h-3 w-3" />
                            {labels[acao] || acao}
                        </Button>
                    );
                })}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${rele.nome} - ${empreendimento.nome}`} />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {rele.nome}
                            </h1>
                            {getStatusBadge(rele.status)}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleAtualizarStatus}
                                disabled={testingStatus}
                                title="Atualizar status"
                            >
                                {testingStatus ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {rele.descricao && (
                            <p className="text-muted-foreground">
                                {rele.descricao}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/empreendimentos/${empreendimento.id}/reles`}
                        >
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar
                            </Button>
                        </Link>
                        <Link
                            href={`/empreendimentos/${empreendimento.id}/reles/${rele.id}/edit`}
                        >
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Confirmar exclusão
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja excluir este relê?
                                        Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                        Excluir
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Informações do Relê */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Driver
                                </p>
                                <p className="font-medium">{rele.driver}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Endereço IP
                                </p>
                                <p className="font-medium font-mono">
                                    {rele.configuracao.ip}:{rele.configuracao.porta}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Número de Portas
                                </p>
                                <p className="font-medium">{rele.numero_portas}</p>
                            </div>
                            {rele.ultima_comunicacao && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Última Comunicação
                                    </p>
                                    <p className="font-medium">
                                        {new Date(
                                            rele.ultima_comunicacao
                                        ).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Canais/Portas */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Canais</h2>
                            <p className="text-sm text-muted-foreground">
                                Configure dispositivos nos canais do relê
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: rele.numero_portas }, (_, i) => {
                            const porta = i + 1;
                            const dispositivo = getDispositivoPorPorta(porta);

                            return (
                                <Card key={porta} className="relative">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base">
                                                        Canal {porta}
                                                    </CardTitle>
                                                    {/* Indicador de status */}
                                                    <div className="flex items-center gap-1.5">
                                                        {loadingStatus ? (
                                                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                                        ) : (
                                                            <>
                                                                <div className={`h-2 w-2 rounded-full ${
                                                                    channelStatus[porta] 
                                                                        ? 'bg-green-500 animate-pulse' 
                                                                        : 'bg-gray-300'
                                                                }`} />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {channelStatus[porta] ? 'Ligado' : 'Desligado'}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {dispositivo && (
                                                    <CardDescription className="mt-1">
                                                        {dispositivo.nome}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {porta}
                                                </Badge>
                                                {dispositivo && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleOpenConfig(porta)}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {dispositivo ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Tipo
                                                    </p>
                                                    <p className="font-medium capitalize">
                                                        {dispositivo.tipo}
                                                    </p>
                                                </div>
                                                {dispositivo.descricao && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Descrição
                                                        </p>
                                                        <p className="text-sm">
                                                            {dispositivo.descricao}
                                                        </p>
                                                    </div>
                                                )}
                                                {renderAcoesDispositivo(
                                                    dispositivo
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <p className="mb-3 text-sm text-muted-foreground">
                                                    Nenhum dispositivo configurado
                                                </p>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleOpenConfig(porta)}
                                                >
                                                    <Plus className="mr-2 h-3 w-3" />
                                                    Configurar
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Dialog de Configuração */}
                <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingDispositivo ? 'Editar' : 'Configurar'} Dispositivo - Canal {selectedPorta}
                            </DialogTitle>
                            <DialogDescription>
                                Configure o dispositivo conectado a este canal do relê
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Dispositivo *</Label>
                                <Input
                                    id="nome"
                                    placeholder="Ex: Portão Principal, Lâmpada Garagem"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo *</Label>
                                <Input
                                    id="tipo"
                                    placeholder="Ex: portao, lampada, sirene, fechadura"
                                    value={data.tipo}
                                    onChange={(e) => setData('tipo', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Textarea
                                    id="descricao"
                                    placeholder="Descrição opcional"
                                    value={data.descricao}
                                    onChange={(e) => setData('descricao', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Ações Disponíveis *</Label>
                                <p className="text-sm text-muted-foreground">
                                    Selecione quais ações este dispositivo suporta
                                </p>
                                <div className="space-y-2">
                                    {acoesDisponiveis.map((acao) => (
                                        <div key={acao.value} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={acao.value}
                                                    checked={data.acoes_disponiveis.includes(acao.value)}
                                                    onCheckedChange={() => toggleAcao(acao.value)}
                                                />
                                                <label
                                                    htmlFor={acao.value}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {acao.label}
                                                </label>
                                            </div>
                                            
                                            {/* Campos de configuração da ação */}
                                            {data.acoes_disponiveis.includes(acao.value) && acao.value === 'flash' && (
                                                <div className="ml-6 space-y-2 p-3 bg-muted rounded-md">
                                                    <Label htmlFor={`${acao.value}_duracao`} className="text-xs">
                                                        Duração do flash (milissegundos)
                                                    </Label>
                                                    <Input
                                                        id={`${acao.value}_duracao`}
                                                        type="number"
                                                        min="100"
                                                        max="5000"
                                                        placeholder="500"
                                                        value={data.configuracao_acoes?.flash?.duracao_ms || 500}
                                                        onChange={(e) => updateAcaoConfig('flash', 'duracao_ms', e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Tempo que ficará ligado antes de desligar automaticamente
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {data.acoes_disponiveis.includes(acao.value) && acao.value === 'pulse' && (
                                                <div className="ml-6 space-y-2 p-3 bg-muted rounded-md">
                                                    <Label htmlFor={`${acao.value}_duracao`} className="text-xs">
                                                        Duração do pulso (segundos)
                                                    </Label>
                                                    <Input
                                                        id={`${acao.value}_duracao`}
                                                        type="number"
                                                        min="1"
                                                        max="60"
                                                        placeholder="3"
                                                        value={data.configuracao_acoes?.pulse?.duracao_segundos || 3}
                                                        onChange={(e) => updateAcaoConfig('pulse', 'duracao_segundos', e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Ideal para portões (3s), fechaduras (5s), campainhas (2s)
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {data.acoes_disponiveis.includes(acao.value) && acao.value === 'blink' && (
                                                <div className="ml-6 space-y-3 p-3 bg-muted rounded-md">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`${acao.value}_repeticoes`} className="text-xs">
                                                            Número de piscadas
                                                        </Label>
                                                        <Input
                                                            id={`${acao.value}_repeticoes`}
                                                            type="number"
                                                            min="1"
                                                            max="20"
                                                            placeholder="5"
                                                            value={data.configuracao_acoes?.blink?.repeticoes || 5}
                                                            onChange={(e) => updateAcaoConfig('blink', 'repeticoes', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`${acao.value}_intervalo`} className="text-xs">
                                                            Intervalo entre piscadas (milissegundos)
                                                        </Label>
                                                        <Input
                                                            id={`${acao.value}_intervalo`}
                                                            type="number"
                                                            min="100"
                                                            max="2000"
                                                            placeholder="300"
                                                            value={data.configuracao_acoes?.blink?.intervalo_ms || 300}
                                                            onChange={(e) => updateAcaoConfig('blink', 'intervalo_ms', e.target.value)}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Quantas vezes vai piscar e o tempo entre cada piscada
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            {editingDispositivo && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        handleDeleteDispositivo(editingDispositivo.id);
                                        setConfigDialogOpen(false);
                                    }}
                                >
                                    Remover
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setConfigDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveDispositivo}
                                disabled={processing || !data.nome || !data.tipo || data.acoes_disponiveis.length === 0}
                            >
                                {editingDispositivo ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Toast Notifications */}
                <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`
                                min-w-[300px] rounded-lg border p-4 shadow-lg animate-in slide-in-from-bottom-5
                                ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' : ''}
                                ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : ''}
                                ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-900' : ''}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {toast.type === 'success' && (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                )}
                                {toast.type === 'error' && (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                {toast.type === 'info' && (
                                    <AlertCircle className="h-5 w-5 text-blue-600" />
                                )}
                                <p className="text-sm font-medium">{toast.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
