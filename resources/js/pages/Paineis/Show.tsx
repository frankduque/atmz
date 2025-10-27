import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileText, Server, Info } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Widget {
    id: number;
    tipo_widget: string;
    entidade_id: number | null;
    largura: number;
    altura: number;
    configuracao: any;
}

interface Rele {
    id: number;
    nome: string;
    numero_canais: number;
    empreendimento: {
        id: number;
        nome: string;
    };
    dispositivos: {
        id: number;
        rele_id: number;
        porta: number;
        nome: string;
        acoes_disponiveis: string[];
    }[];
    status_canais: Record<number, boolean>; // { 1: true, 2: false, ... }
    status_conexao: string; // online, offline, erro
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Painel {
    id: number;
    nome: string;
    widgets: Widget[];
    users: User[];
}

interface Props {
    painel: Painel;
    reles: Rele[];
    usuarios: User[];
    isAdmin: boolean;
}

export default function Show({ painel, reles, usuarios, isAdmin }: Props) {
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectedRele, setSelectedRele] = useState<string>("");
    const [selectedCanal, setSelectedCanal] = useState<string>("");
    const [widgetSize, setWidgetSize] = useState<string>("medium");
    const [textContent, setTextContent] = useState<string>("");
    const [textTitle, setTextTitle] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [executingAction, setExecutingAction] = useState<string | null>(null);

    const breadcrumbs = [
        { title: 'Painéis de Controle', href: '/paineis' },
        { title: painel.nome, href: `/paineis/${painel.id}` }
    ];

    const handleAddWidget = () => {
        let data: any = {
            tipo_widget: selectedType,
            largura: parseInt(widgetSize),
        };

        if (selectedType === 'rele_canal') {
            if (!selectedRele || !selectedCanal) return;
            data.entidade_id = parseInt(selectedRele);
            data.configuracao = { canal: parseInt(selectedCanal) };
        } else if (selectedType === 'texto') {
            if (!textTitle) return;
            data.configuracao = { titulo: textTitle, conteudo: textContent };
        }

        router.post(
            `/paineis/${painel.id}/widgets`,
            data,
            {
                onSuccess: () => {
                    setOpen(false);
                    setSelectedType("");
                    setSelectedRele("");
                    setSelectedCanal("");
                    setTextTitle("");
                    setTextContent("");
                    setWidgetSize("medium");
                },
            }
        );
    };

    const handleDeleteWidget = (widgetId: number) => {
        if (confirm("Tem certeza que deseja remover este widget?")) {
            router.delete(`/widgets/${widgetId}`);
        }
    };

    const handleExecutarAcao = async (releId: number, porta: number, acao: string, parametros: any = {}) => {
        const actionKey = `${releId}-${porta}-${acao}`;
        setExecutingAction(actionKey);
        
        try {
            const response = await fetch(`/paineis/${painel.id}/executar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    rele_id: releId,
                    porta: porta,
                    acao: acao,
                    parametros: parametros,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Recarregar a página para atualizar os status
                router.reload({ only: ['painel', 'reles'] });
            } else {
                alert(data.message || 'Erro ao executar comando');
            }
        } catch (error) {
            console.error('Erro ao executar ação:', error);
            alert('Erro ao executar comando');
        } finally {
            setExecutingAction(null);
        }
    };

    const handleAddUser = () => {
        if (!selectedUser) return;

        router.post(`/paineis/${painel.id}/usuarios`, {
            user_id: selectedUser,
        }, {
            onSuccess: () => {
                setSelectedUser("");
                setOpenUserDialog(false);
            },
        });
    };

    const handleRemoveUser = (userId: number) => {
        if (confirm("Tem certeza que deseja remover este usuário do painel?")) {
            router.delete(`/paineis/${painel.id}/usuarios/${userId}`);
        }
    };

    const getWidgetColSpan = (largura: number) => {
        const sizeMap: Record<number, string> = {
            2: 'col-span-2',
            3: 'col-span-3',
            4: 'col-span-4',
            6: 'col-span-6',
            12: 'col-span-12',
        };
        return sizeMap[largura] || 'col-span-3';
    };

    const renderWidget = (widget: Widget) => {
        const rele = reles.find(r => r.id === widget.entidade_id);
        const dispositivo = rele?.dispositivos.find(d => d.porta === widget.configuracao?.canal);
        const canalStatus = rele?.status_canais?.[widget.configuracao?.canal] ?? false;
        
        switch (widget.tipo_widget) {
            case "rele_canal":
                const acoes = dispositivo?.acoes_disponiveis || [];
                const temOn = acoes.includes('on');
                const temOff = acoes.includes('off');
                const temFlash = acoes.includes('flash');
                const temPulse = acoes.includes('pulse');
                const temBlink = acoes.includes('blink');
                
                return (
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        {dispositivo?.nome || `Canal ${widget.configuracao?.canal}`}
                                    </CardTitle>
                                    <Badge variant={canalStatus ? "default" : "secondary"} className="text-xs">
                                        {canalStatus ? "Ligado" : "Desligado"}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <CardDescription className="text-xs">
                                        {rele?.empreendimento.nome}
                                    </CardDescription>
                                    <CardDescription className="text-xs">
                                        {rele?.nome} - Canal {widget.configuracao?.canal}
                                    </CardDescription>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className={`h-2 w-2 rounded-full ${
                                            rele?.status_conexao === 'online' ? 'bg-green-500' :
                                            rele?.status_conexao === 'erro' ? 'bg-red-500' :
                                            'bg-gray-400'
                                        }`} />
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {rele?.status_conexao === 'online' ? 'Online' :
                                             rele?.status_conexao === 'erro' ? 'Erro' :
                                             'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {(temOn || temOff) && (
                                <div className="grid grid-cols-2 gap-2">
                                    {temOn && (
                                        <Button 
                                            size="sm" 
                                            className="w-full"
                                            variant={canalStatus ? "default" : "outline"}
                                            onClick={() => handleExecutarAcao(rele!.id, widget.configuracao?.canal, 'on')}
                                            disabled={executingAction === `${rele!.id}-${widget.configuracao?.canal}-on`}
                                        >
                                            {executingAction === `${rele!.id}-${widget.configuracao?.canal}-on` ? 'Executando...' : 'Ligar'}
                                        </Button>
                                    )}
                                    {temOff && (
                                        <Button 
                                            size="sm" 
                                            variant={!canalStatus ? "default" : "outline"}
                                            className="w-full"
                                            onClick={() => handleExecutarAcao(rele!.id, widget.configuracao?.canal, 'off')}
                                            disabled={executingAction === `${rele!.id}-${widget.configuracao?.canal}-off`}
                                        >
                                            {executingAction === `${rele!.id}-${widget.configuracao?.canal}-off` ? 'Executando...' : 'Desligar'}
                                        </Button>
                                    )}
                                </div>
                            )}
                            {temFlash && (
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="w-full"
                                    onClick={() => handleExecutarAcao(rele!.id, widget.configuracao?.canal, 'flash')}
                                    disabled={executingAction === `${rele!.id}-${widget.configuracao?.canal}-flash`}
                                >
                                    {executingAction === `${rele!.id}-${widget.configuracao?.canal}-flash` ? 'Executando...' : 'Flash'}
                                </Button>
                            )}
                            {temPulse && (
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="w-full"
                                    onClick={() => handleExecutarAcao(rele!.id, widget.configuracao?.canal, 'pulse')}
                                    disabled={executingAction === `${rele!.id}-${widget.configuracao?.canal}-pulse`}
                                >
                                    {executingAction === `${rele!.id}-${widget.configuracao?.canal}-pulse` ? 'Executando...' : 'Pulso Temporizado'}
                                </Button>
                            )}
                            {temBlink && (
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="w-full"
                                    onClick={() => handleExecutarAcao(rele!.id, widget.configuracao?.canal, 'blink')}
                                    disabled={executingAction === `${rele!.id}-${widget.configuracao?.canal}-blink`}
                                >
                                    {executingAction === `${rele!.id}-${widget.configuracao?.canal}-blink` ? 'Executando...' : 'Piscar'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );
            
            case "texto":
                return (
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-start gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <CardTitle className="text-base">{widget.configuracao?.titulo}</CardTitle>
                                    <CardDescription className="mt-2 whitespace-pre-wrap">
                                        {widget.configuracao?.conteudo}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                );
            
            case "info":
                return (
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-base">Informações do Sistema</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total de Relês:</span>
                                    <span className="font-medium">{reles.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Widgets:</span>
                                    <span className="font-medium">{painel.widgets.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return (
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Widget desconhecido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Tipo: {widget.tipo_widget}</p>
                        </CardContent>
                    </Card>
                );
        }
    };

    const getReleCanais = () => {
        if (!selectedRele) return [];
        const rele = reles.find(r => r.id.toString() === selectedRele);
        if (!rele) return [];
        return Array.from({ length: rele.numero_canais }, (_, i) => i + 1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={painel.nome} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{painel.nome}</h2>
                        <p className="text-muted-foreground">
                            Painel personalizado de controle
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <>
                                <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar Usuário
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Adicionar Usuário ao Painel</DialogTitle>
                                            <DialogDescription>
                                                Selecione um usuário para dar acesso a este painel
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Usuário</Label>
                                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um usuário" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {usuarios.filter(u => !painel.users.find(pu => pu.id === u.id)).map((usuario) => (
                                                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                                                                {usuario.name} ({usuario.email})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button onClick={handleAddUser} disabled={!selectedUser} className="w-full">
                                                Adicionar
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar Widget
                                        </Button>
                                    </DialogTrigger>
                            <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Adicionar Widget</DialogTitle>
                                <DialogDescription>
                                    Escolha o tipo de widget e configure-o
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Tipo de Widget</Label>
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rele_canal">
                                                <div className="flex items-center gap-2">
                                                    <Server className="h-4 w-4" />
                                                    <span>Canal de Relê</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="texto">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    <span>Texto/Informação</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="info">
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4" />
                                                    <span>Informações do Sistema</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedType === 'rele_canal' && (
                                    <>
                                        <div>
                                            <Label>Relê</Label>
                                            <Select value={selectedRele} onValueChange={setSelectedRele}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o relê" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {reles.map((rele) => (
                                                        <SelectItem key={rele.id} value={rele.id.toString()}>
                                                            {rele.nome} - {rele.empreendimento.nome}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedRele && (
                                            <div>
                                                <Label>Canal</Label>
                                                <Select value={selectedCanal} onValueChange={setSelectedCanal}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o canal" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {getReleCanais().map((canal) => {
                                                            const rele = reles.find(r => r.id.toString() === selectedRele);
                                                            const dispositivo = rele?.dispositivos.find(d => d.porta === canal);
                                                            return (
                                                                <SelectItem key={canal} value={canal.toString()}>
                                                                    Canal {canal}
                                                                    {dispositivo && ` - ${dispositivo.nome}`}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </>
                                )}

                                {selectedType === 'texto' && (
                                    <>
                                        <div>
                                            <Label>Título</Label>
                                            <Input
                                                value={textTitle}
                                                onChange={(e) => setTextTitle(e.target.value)}
                                                placeholder="Ex: Instruções importantes"
                                            />
                                        </div>
                                        <div>
                                            <Label>Conteúdo</Label>
                                            <Textarea
                                                value={textContent}
                                                onChange={(e) => setTextContent(e.target.value)}
                                                placeholder="Digite o texto informativo..."
                                                rows={4}
                                            />
                                        </div>
                                    </>
                                )}

                                {selectedType && (
                                    <div>
                                        <Label>Tamanho do Widget</Label>
                                        <Select value={widgetSize} onValueChange={setWidgetSize}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2">Pequeno (2 colunas)</SelectItem>
                                                <SelectItem value="3">Médio (3 colunas)</SelectItem>
                                                <SelectItem value="4">Grande (4 colunas)</SelectItem>
                                                <SelectItem value="6">Extra Grande (6 colunas)</SelectItem>
                                                <SelectItem value="12">Largura Total</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <Button onClick={handleAddWidget} className="w-full">
                                    Adicionar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                            </>
                        )}
                    </div>
                </div>

                {painel.widgets.length === 0 ? (
                    <div className="text-center py-12">
                        <Plus className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Nenhum widget adicionado</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Clique em "Adicionar Widget" para começar a montar seu painel
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-4 auto-rows-fr">
                        {painel.widgets.map((widget) => (
                            <div key={widget.id} className={`${getWidgetColSpan(widget.largura)} relative group`}>
                                {isAdmin && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDeleteWidget(widget.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                {renderWidget(widget)}
                            </div>
                        ))}
                    </div>
                )}

                {isAdmin && painel.users.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Usuários com Acesso</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {painel.users.map((user) => (
                                <Card key={user.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveUser(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
