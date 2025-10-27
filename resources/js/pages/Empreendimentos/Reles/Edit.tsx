import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';

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
}

interface Empreendimento {
    id: number;
    nome: string;
}

interface Props {
    empreendimento: Empreendimento;
    rele: Rele;
}

export default function Edit({ empreendimento, rele }: Props) {
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<{success: boolean; message: string} | null>(null);

    const { data, setData, patch, processing, errors } = useForm({
        nome: rele.nome,
        descricao: rele.descricao || '',
        driver: rele.driver,
        configuracao: {
            ip: rele.configuracao.ip,
            porta: rele.configuracao.porta,
        },
        numero_portas: rele.numero_portas,
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
        {
            title: 'Editar',
            href: `/empreendimentos/${empreendimento.id}/reles/${rele.id}/edit`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/empreendimentos/${empreendimento.id}/reles/${rele.id}`);
    };

    const handleTestConnection = () => {
        if (!data.configuracao.ip) {
            setConnectionStatus({ success: false, message: 'Por favor, informe o IP do relê' });
            return;
        }

        setTestingConnection(true);
        setConnectionStatus(null);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (!csrfToken) {
            setConnectionStatus({ success: false, message: 'Token CSRF não encontrado. Recarregue a página.' });
            setTestingConnection(false);
            return;
        }

        fetch(`/empreendimentos/${empreendimento.id}/reles/testar-conexao`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                driver: data.driver,
                ip: data.configuracao.ip,
                porta: data.configuracao.porta,
            }),
        })
            .then(response => response.json())
            .then(result => {
                setTestingConnection(false);
                setConnectionStatus(result);
            })
            .catch(error => {
                setTestingConnection(false);
                setConnectionStatus({ success: false, message: `Erro: ${error.message}` });
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${rele.nome} - ${empreendimento.nome}`} />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Editar Relê
                        </h2>
                        <p className="text-muted-foreground">
                            Atualize as informações do relê
                        </p>
                    </div>
                    <Link
                        href={`/empreendimentos/${empreendimento.id}/reles/${rele.id}`}
                    >
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Informações Básicas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Básicas</CardTitle>
                                <CardDescription>
                                    Dados principais do relê
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome *</Label>
                                    <Input
                                        id="nome"
                                        value={data.nome}
                                        onChange={(e) =>
                                            setData('nome', e.target.value)
                                        }
                                        placeholder="Ex: Relê Principal"
                                        required
                                    />
                                    {errors.nome && (
                                        <p className="text-sm text-destructive">
                                            {errors.nome}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Textarea
                                        id="descricao"
                                        value={data.descricao}
                                        onChange={(e) =>
                                            setData('descricao', e.target.value)
                                        }
                                        placeholder="Descrição do relê"
                                        rows={3}
                                    />
                                    {errors.descricao && (
                                        <p className="text-sm text-destructive">
                                            {errors.descricao}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Configuração do Driver */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração do Driver</CardTitle>
                                <CardDescription>
                                    Tipo e configurações de conexão
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="driver">Driver *</Label>
                                    <Select
                                        value={data.driver}
                                        onValueChange={(value) =>
                                            setData('driver', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sr201">
                                                SR201 (Ethernet)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.driver && (
                                        <p className="text-sm text-destructive">
                                            {errors.driver}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="ip">Endereço IP *</Label>
                                        <Input
                                            id="ip"
                                            value={data.configuracao.ip}
                                            onChange={(e) =>
                                                setData('configuracao', {
                                                    ...data.configuracao,
                                                    ip: e.target.value,
                                                })
                                            }
                                            placeholder="192.168.1.100"
                                            required
                                        />
                                        {errors['configuracao.ip'] && (
                                            <p className="text-sm text-destructive">
                                                {errors['configuracao.ip']}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="porta">Porta *</Label>
                                        <Input
                                            id="porta"
                                            type="number"
                                            value={data.configuracao.porta}
                                            onChange={(e) =>
                                                setData('configuracao', {
                                                    ...data.configuracao,
                                                    porta: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            placeholder="6722"
                                            required
                                        />
                                        {errors['configuracao.porta'] && (
                                            <p className="text-sm text-destructive">
                                                {errors['configuracao.porta']}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="numero_portas">
                                        Número de Portas *
                                    </Label>
                                    <Input
                                        id="numero_portas"
                                        type="number"
                                        value={data.numero_portas}
                                        onChange={(e) =>
                                            setData(
                                                'numero_portas',
                                                parseInt(e.target.value)
                                            )
                                        }
                                        min="1"
                                        max="16"
                                        required
                                    />
                                    {errors.numero_portas && (
                                        <p className="text-sm text-destructive">
                                            {errors.numero_portas}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-2 items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleTestConnection}
                                            disabled={testingConnection}
                                        >
                                            {testingConnection && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Testar Conexão
                                        </Button>
                                        
                                        {connectionStatus && (
                                            <Badge 
                                                variant={connectionStatus.success ? "default" : "destructive"}
                                                className="flex items-center gap-1"
                                            >
                                                {connectionStatus.success ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <XCircle className="h-3 w-3" />
                                                )}
                                                {connectionStatus.message}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Botões de Ação */}
                        <div className="flex justify-end gap-2">
                            <Link
                                href={`/empreendimentos/${empreendimento.id}/reles/${rele.id}`}
                            >
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Salvar Alterações
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
