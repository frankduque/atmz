import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Download, Trash2, Edit, CheckCircle, Clock, Calendar } from 'lucide-react';

interface AgentVersion {
    id: number;
    version: string;
    changelog: string | null;
    released_at: string | null;
    active: boolean;
    platforms: {
        platform: string;
        has_binary: boolean;
        size?: number;
        checksum?: string;
    }[];
    created_at: string;
}

interface Props {
    versions: AgentVersion[];
}

const breadcrumbs = (): BreadcrumbItem[] => [
    {
        title: 'Versões do Agente',
        href: '/versoes-agente',
    },
];

export default function Index({ versions }: Props) {

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'agora mesmo';
        if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        const diffMonths = Math.floor(diffDays / 30);
        return `há ${diffMonths} ${diffMonths > 1 ? 'meses' : 'mês'}`;
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta versão?')) {
            router.delete(`/versoes-agente/${id}`);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const platformNames: Record<string, string> = {
        'linux-amd64': 'Linux (64-bit)',
        'linux-arm64': 'Linux ARM (64-bit)',
        'windows-amd64': 'Windows (64-bit)',
        'darwin-amd64': 'macOS Intel',
        'darwin-arm64': 'macOS Apple Silicon',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs()}>
            <Head title="Versões do Agente" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Versões do Agente</h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie as versões disponíveis do agente local
                        </p>
                    </div>
                    <Link href="/versoes-agente/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Versão
                        </Button>
                    </Link>
                </div>

                {/* Lista de Versões */}
                {versions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Download className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Nenhuma versão cadastrada
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Cadastre a primeira versão do agente local
                            </p>
                            <Link href="/versoes-agente/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Cadastrar Primeira Versão
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {versions.map((version) => (
                            <Card key={version.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-2xl">
                                                    v{version.version}
                                                </CardTitle>
                                                {version.active && (
                                                    <Badge className="bg-green-500">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Ativa
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="flex items-center gap-4 text-sm">
                                                {version.released_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            version.released_at,
                                                        ).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimeAgo(version.created_at)}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/versoes-agente/${version.id}/edit`}
                                            >
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(version.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Changelog */}
                                    {version.changelog && (
                                        <div>
                                            <h4 className="font-semibold mb-2">
                                                Mudanças:
                                            </h4>
                                            <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-3 rounded-md">
                                                {version.changelog}
                                            </div>
                                        </div>
                                    )}

                                    {/* Plataformas */}
                                    <div>
                                        <h4 className="font-semibold mb-3">
                                            Binários Disponíveis:
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {version.platforms.map((platform) => (
                                                <div
                                                    key={platform.platform}
                                                    className={`border rounded-lg p-3 ${
                                                        platform.has_binary
                                                            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                                            : 'bg-muted border-muted'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-sm">
                                                            {platformNames[
                                                                platform.platform
                                                            ] || platform.platform}
                                                        </span>
                                                        {platform.has_binary ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                            >
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Disponível
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                Pendente
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {platform.size && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatBytes(platform.size)}
                                                        </p>
                                                    )}
                                                    {platform.has_binary && (
                                                        <a
                                                            href={`/api/agent/download/${version.version}/${platform.platform}`}
                                                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
