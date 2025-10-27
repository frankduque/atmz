import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowLeft,
    Building2,
    Copy,
    RefreshCw,
    Server,
    Wifi,
    WifiOff,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface Agent {
    id: number;
    nome: string;
    token: string;
    status: 'online' | 'offline' | 'error';
    ultimo_heartbeat: string | null;
    metadata: {
        versao?: string;
        so?: string;
        ip?: string;
    } | null;
    enterprise: {
        id: number;
        nome: string;
    };
    devices?: Array<{
        id: number;
        nome: string;
        tipo_dispositivo: string;
        status: string;
    }>;
    created_at: string;
}

interface Props {
    agent: Agent;
}

const breadcrumbs = (agent: Props['agent']): BreadcrumbItem[] => [
    {
        title: 'Agentes Locais',
        href: '/agentes',
    },
    {
        title: agent.nome,
        href: `/agentes/${agent.id}`,
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

export default function Show({ agent }: Props) {
    const [copied, setCopied] = useState(false);
    const config = statusConfig[agent.status];
    const StatusIcon = config.icon;

    const copyToken = () => {
        navigator.clipboard.writeText(agent.token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const regenerateToken = () => {
        if (
            confirm(
                'Tem certeza? O token anterior será invalidado e você precisará reconfigurar o agente.',
            )
        ) {
            router.post(`/agentes/${agent.id}/regenerar-token`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(agent)}>
            <Head title={agent.nome} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/agentes">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2.5">
                                <Wifi className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">
                                    {agent.nome}
                                </h2>
                                <p className="text-muted-foreground">
                                    {agent.enterprise.nome}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/agentes/${agent.id}/edit`}>
                            <Button variant="outline">Editar</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Status da Conexão
                            </CardTitle>
                            <StatusIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${config.bgColor} ${config.color}`}
                            >
                                <StatusIcon className="h-4 w-4" />
                                {config.label}
                            </div>
                            {agent.ultimo_heartbeat && (
                                <p className="mt-3 text-xs text-muted-foreground">
                                    Último contato:{' '}
                                    {new Date(
                                        agent.ultimo_heartbeat,
                                    ).toLocaleString('pt-BR')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Dispositivos
                            </CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {agent.devices?.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Gerenciados por este agente
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Token de Autenticação</CardTitle>
                        <CardDescription>
                            Use este token para configurar o agente local
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <code className="flex-1 rounded-lg bg-muted px-4 py-3 font-mono text-sm break-all">
                                {agent.token}
                            </code>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={copyToken}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        {copied && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                ✓ Token copiado para a área de transferência
                            </p>
                        )}
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={regenerateToken}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerar Token
                            </Button>
                        </div>
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-900">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                ⚠️ Ao regenerar o token, o anterior será
                                invalidado imediatamente. Você precisará
                                reconfigurar o agente local com o novo token.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {agent.metadata && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Sistema</CardTitle>
                            <CardDescription>
                                Dados coletados do agente local
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {agent.metadata.versao && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Versão
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {agent.metadata.versao}
                                        </p>
                                    </div>
                                )}
                                {agent.metadata.so && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Sistema Operacional
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {agent.metadata.so}
                                        </p>
                                    </div>
                                )}
                                {agent.metadata.ip && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Endereço IP
                                        </p>
                                        <p className="text-lg font-semibold font-mono">
                                            {agent.metadata.ip}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Dispositivos Gerenciados</CardTitle>
                                <CardDescription>
                                    Dispositivos conectados a este agente
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!agent.devices || agent.devices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Server className="mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Nenhum dispositivo gerenciado
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {agent.devices.map((device) => (
                                    <div
                                        key={device.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {device.nome}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {device.tipo_dispositivo}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                device.status === 'online'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        >
                                            {device.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Empreendimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href={`/empreendimentos/${agent.enterprise.id}`}
                            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                        >
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {agent.enterprise.nome}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Ver detalhes do empreendimento
                                </p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
