import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
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
import { ArrowLeft } from 'lucide-react';

interface Props {
    empreendimento: {
        id: number;
        nome: string;
    };
}

const breadcrumbs = (empreendimento: Props['empreendimento']): BreadcrumbItem[] => [
    {
        title: 'Empreendimentos',
        href: '/empreendimentos',
    },
    {
        title: empreendimento.nome,
        href: `/empreendimentos/${empreendimento.id}`,
    },
    {
        title: 'Adicionar Agente',
        href: `/empreendimentos/${empreendimento.id}/agentes/create`,
    },
];

export default function Create({ empreendimento }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        endereco_ip: '',
        porta: '3000',
        protocolo: 'http',
        sistema_operacional: 'windows',
        arquitetura: 'amd64',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/empreendimentos/${empreendimento.id}/agentes`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(empreendimento)}>
            <Head title="Adicionar Agente Local" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Link href={`/empreendimentos/${empreendimento.id}`}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Adicionar Agente Local
                        </h2>
                        <p className="text-muted-foreground">
                            {empreendimento.nome}
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Informações do Agente</CardTitle>
                        <CardDescription>
                            O agente faz a ponte entre a aplicação web e os dispositivos na rede local
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
                                    onChange={(e) => setData('protocolo', e.target.value as 'http' | 'https')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    {processing ? 'Salvando...' : 'Salvar Agente'}
                                </Button>
                                <Link href={`/empreendimentos/${empreendimento.id}`}>
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="max-w-2xl border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/50">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            Como funciona?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                        <p>
                            <strong>1.</strong> Instale o software do agente em um computador/servidor na rede local.
                        </p>
                        <p>
                            <strong>2.</strong> O agente criará uma API REST local na porta configurada.
                        </p>
                        <p>
                            <strong>3.</strong> Configure o IP local do computador onde o agente está rodando.
                        </p>
                        <p>
                            <strong>4.</strong> Após salvar, copie o token gerado para configurar o agente.
                        </p>
                        <p>
                            <strong>5.</strong> O Laravel enviará comandos HTTP para o agente, que controlará os dispositivos.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
