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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface AgentVersion {
    id: number;
    version: string;
    changelog: string | null;
    released_at: string | null;
    active: boolean;
    linux_amd64_checksum: string | null;
    linux_amd64_size: number | null;
    linux_arm64_checksum: string | null;
    linux_arm64_size: number | null;
    windows_amd64_checksum: string | null;
    windows_amd64_size: number | null;
    darwin_amd64_checksum: string | null;
    darwin_amd64_size: number | null;
    darwin_arm64_checksum: string | null;
    darwin_arm64_size: number | null;
}

interface Props {
    version: AgentVersion;
}

interface PlatformUpload {
    uploading: boolean;
    progress: number;
    error: string | null;
}

const platformNames: Record<string, string> = {
    linux_amd64: 'Linux (64-bit)',
    linux_arm64: 'Linux ARM (64-bit)',
    windows_amd64: 'Windows (64-bit)',
    darwin_amd64: 'macOS Intel',
    darwin_arm64: 'macOS Apple Silicon',
};

const breadcrumbs = (version: AgentVersion): BreadcrumbItem[] => [
    {
        title: 'Versões do Agente',
        href: '/versoes-agente',
    },
    {
        title: `v${version.version}`,
        href: `/versoes-agente/${version.id}/edit`,
    },
];

export default function Edit({ version: agentVersion }: Props) {

    const { data, setData, patch, processing, errors } = useForm({
        version: agentVersion.version,
        changelog: agentVersion.changelog || '',
        released_at: agentVersion.released_at ? agentVersion.released_at.split('T')[0] : '',
        active: agentVersion.active,
    });

    const [uploadStates, setUploadStates] = useState<
        Record<string, PlatformUpload>
    >({
        linux_amd64: { uploading: false, progress: 0, error: null },
        linux_arm64: { uploading: false, progress: 0, error: null },
        windows_amd64: { uploading: false, progress: 0, error: null },
        darwin_amd64: { uploading: false, progress: 0, error: null },
        darwin_arm64: { uploading: false, progress: 0, error: null },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/versoes-agente/${agentVersion.id}`);
    };

    const handleFileUpload = async (
        platform: string,
        file: File | null,
    ) => {
        if (!file) return;

        setUploadStates((prev) => ({
            ...prev,
            [platform]: { uploading: true, progress: 0, error: null },
        }));

        const formData = new FormData();
        formData.append('binary', file);
        // Converter underscore para hífen (linux_amd64 -> linux-amd64)
        formData.append('platform', platform.replace(/_/g, '-'));

        try {
            await axios.post(
                `/versoes-agente/${agentVersion.id}/upload-binary`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round(
                                  (progressEvent.loaded * 100) /
                                      progressEvent.total,
                              )
                            : 0;
                        setUploadStates((prev) => ({
                            ...prev,
                            [platform]: { ...prev[platform], progress },
                        }));
                    },
                },
            );

            setUploadStates((prev) => ({
                ...prev,
                [platform]: { uploading: false, progress: 100, error: null },
            }));

            // Recarrega a página para atualizar os checksums
            setTimeout(() => {
                router.reload({ only: ['version'] });
            }, 500);
        } catch (error: any) {
            console.error('Upload error:', error.response?.data);
            setUploadStates((prev) => ({
                ...prev,
                [platform]: {
                    uploading: false,
                    progress: 0,
                    error:
                        error.response?.data?.message ||
                        error.response?.data?.errors?.platform?.[0] ||
                        error.response?.data?.errors?.binary?.[0] ||
                        'Erro ao enviar arquivo',
                },
            }));
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const hasBinary = (platform: string): boolean => {
        return !!(agentVersion as any)[`${platform}_checksum`];
    };

    const getBinarySize = (platform: string): number | null => {
        return (agentVersion as any)[`${platform}_size`];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(agentVersion)}>
            <Head title={`Editar v${agentVersion.version}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Editar Versão {agentVersion.version}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Atualize as informações e gerencie os binários
                        </p>
                    </div>
                    <Link href="/versoes-agente">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>
                </div>

                {/* Informações Básicas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações da Versão</CardTitle>
                        <CardDescription>
                            Atualize os metadados da versão
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Versão (read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="version">
                                    Versão (Semver)
                                </Label>
                                <Input
                                    id="version"
                                    value={data.version}
                                    disabled
                                    className="bg-muted cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">
                                    O número da versão não pode ser alterado após a criação
                                </p>
                            </div>

                            {/* Data de Lançamento */}
                            <div className="space-y-2">
                                <Label htmlFor="released_at">
                                    Data de Lançamento
                                </Label>
                                <Input
                                    id="released_at"
                                    type="date"
                                    value={data.released_at}
                                    onChange={(e) =>
                                        setData('released_at', e.target.value)
                                    }
                                />
                                {errors.released_at && (
                                    <p className="text-sm text-destructive">
                                        {errors.released_at}
                                    </p>
                                )}
                            </div>

                            {/* Changelog */}
                            <div className="space-y-2">
                                <Label htmlFor="changelog">
                                    Notas de Lançamento (Changelog)
                                </Label>
                                <Textarea
                                    id="changelog"
                                    placeholder="- Nova funcionalidade X&#10;- Correção do bug Y&#10;- Melhoria de performance Z"
                                    value={data.changelog}
                                    onChange={(e) =>
                                        setData('changelog', e.target.value)
                                    }
                                    rows={8}
                                />
                                {errors.changelog && (
                                    <p className="text-sm text-destructive">
                                        {errors.changelog}
                                    </p>
                                )}
                            </div>

                            {/* Ativa */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="active"
                                    checked={data.active}
                                    onCheckedChange={(checked) =>
                                        setData('active', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="active"
                                    className="cursor-pointer"
                                >
                                    Marcar como versão ativa
                                </Label>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Upload de Binários */}
                <Card>
                    <CardHeader>
                        <CardTitle>Binários por Plataforma</CardTitle>
                        <CardDescription>
                            Envie os executáveis compilados para cada plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Object.keys(platformNames).map((platform) => {
                                const hasFile = hasBinary(platform);
                                const size = getBinarySize(platform);
                                const uploadState = uploadStates[platform];

                                return (
                                    <div
                                        key={platform}
                                        className={`border rounded-lg p-4 flex flex-col ${
                                            hasFile
                                                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <div className="mb-3">
                                            <div className="flex flex-col gap-2">
                                                <span className="font-semibold text-sm">
                                                    {platformNames[platform]}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {hasFile ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                        >
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Disponível
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Pendente
                                                        </Badge>
                                                    )}
                                                </div>
                                                {size && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatBytes(size)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload - sempre visível para poder substituir */}
                                        <div className="space-y-2 mt-auto">
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="file"
                                                    id={`file-${platform}`}
                                                    onChange={(e) =>
                                                        handleFileUpload(
                                                            platform,
                                                            e.target.files?.[0] ||
                                                                null,
                                                        )
                                                    }
                                                    disabled={uploadState.uploading}
                                                    className="hidden"
                                                    accept={platform.includes('windows') ? '.exe' : ''}
                                                />
                                                <label htmlFor={`file-${platform}`} className="w-full">
                                                    <Button
                                                        variant={hasFile ? "secondary" : "outline"}
                                                        className="w-full"
                                                        size="sm"
                                                        disabled={uploadState.uploading}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            document.getElementById(`file-${platform}`)?.click();
                                                        }}
                                                    >
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        {hasFile ? 'Substituir' : 'Enviar'}
                                                    </Button>
                                                </label>
                                                
                                                {hasFile && (
                                                    <a
                                                        href={`/versoes-agente/${agentVersion.id}/download-binary/${platform.replace(/_/g, '-')}`}
                                                        className="w-full"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full"
                                                        >
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Baixar
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>

                                            {/* Progresso */}
                                            {uploadState.uploading && (
                                                <div className="space-y-1">
                                                    <Progress
                                                        value={
                                                            uploadState.progress
                                                        }
                                                    />
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        {uploadState.progress}%
                                                    </p>
                                                </div>
                                            )}

                                            {/* Erro */}
                                            {uploadState.error && (
                                                <div className="flex items-center gap-2 text-xs text-destructive">
                                                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                                    <span className="line-clamp-2">{uploadState.error}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
