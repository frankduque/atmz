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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Info, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

type VersionType = 'major' | 'minor' | 'patch';

interface Props {}

const breadcrumbs = (): BreadcrumbItem[] => [
    {
        title: 'Versões do Agente',
        href: '/versoes-agente',
    },
    {
        title: 'Nova Versão',
        href: '/versoes-agente/create',
    },
];

export default function Create({}: Props) {

    const [versionType, setVersionType] = useState<VersionType>('patch');
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [calculatedVersion, setCalculatedVersion] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        version: '',
        changelog: '',
        released_at: new Date().toISOString().split('T')[0],
        active: true,
    });

    // Buscar última versão ao carregar
    useEffect(() => {
        const fetchLatestVersion = async () => {
            try {
                const response = await axios.get('/api/agent/latest-version');
                setLatestVersion(response.data.version);
            } catch (error) {
                // Se não houver versão, começa com 1.0.0
                setLatestVersion(null);
            }
        };

        fetchLatestVersion();
    }, []);

    // Calcular nova versão quando tipo ou versão base mudar
    useEffect(() => {
        // Se não há versão anterior, calcula baseado no tipo escolhido
        if (!latestVersion) {
            let newVersion = '1.0.0';
            
            switch (versionType) {
                case 'major':
                    newVersion = '1.0.0';
                    break;
                case 'minor':
                    newVersion = '0.1.0';
                    break;
                case 'patch':
                    newVersion = '0.0.1';
                    break;
            }
            
            setCalculatedVersion(newVersion);
            setData('version', newVersion);
            return;
        }

        // Se há versão anterior, incrementa baseado no tipo
        const parts = latestVersion.split('.').map(Number);
        let [major, minor, patch] = parts;

        switch (versionType) {
            case 'major':
                major += 1;
                minor = 0;
                patch = 0;
                break;
            case 'minor':
                minor += 1;
                patch = 0;
                break;
            case 'patch':
                patch += 1;
                break;
        }

        const newVersion = `${major}.${minor}.${patch}`;
        setCalculatedVersion(newVersion);
        setData('version', newVersion);
    }, [versionType, latestVersion]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Garantir que active seja boolean
        const submitData = {
            ...data,
            active: data.active ? 1 : 0,
        };
        
        post('/versoes-agente', {
            data: submitData,
            onError: (errors) => {
                console.log('Erros de validação:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs()}>
            <Head title="Nova Versão do Agente" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Nova Versão</h1>
                        <p className="text-muted-foreground mt-1">
                            Registre uma nova versão do agente local
                        </p>
                    </div>
                    <Link href="/versoes-agente">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>
                </div>

                {/* Formulário */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações da Versão</CardTitle>
                        <CardDescription>
                            Preencha os dados da nova versão. Os binários podem
                            ser enviados posteriormente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Erro Geral */}
                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Erro ao criar versão:</strong>
                                        <ul className="mt-2 list-disc list-inside">
                                            {Object.entries(errors).map(([field, message]) => (
                                                <li key={field}>{message}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Tipo de Versão */}
                            <div className="space-y-4">
                                <Label>Tipo de Versão *</Label>
                                {latestVersion && (
                                    <p className="text-sm text-muted-foreground">
                                        Versão atual: <span className="font-mono font-semibold">{latestVersion}</span>
                                    </p>
                                )}
                                <RadioGroup
                                    value={versionType}
                                    onValueChange={(value) => setVersionType(value as VersionType)}
                                    className="space-y-3"
                                >
                                    <div className="flex items-start space-x-3 space-y-0">
                                        <RadioGroupItem value="patch" id="patch" />
                                        <div className="space-y-1 leading-none">
                                            <Label htmlFor="patch" className="cursor-pointer font-medium">
                                                Patch (correção de bugs)
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Incrementa o terceiro número (ex: 1.0.0 → 1.0.1)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 space-y-0">
                                        <RadioGroupItem value="minor" id="minor" />
                                        <div className="space-y-1 leading-none">
                                            <Label htmlFor="minor" className="cursor-pointer font-medium">
                                                Minor (novas funcionalidades)
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Incrementa o segundo número (ex: 1.0.0 → 1.1.0)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3 space-y-0">
                                        <RadioGroupItem value="major" id="major" />
                                        <div className="space-y-1 leading-none">
                                            <Label htmlFor="major" className="cursor-pointer font-medium">
                                                Major (breaking changes)
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Incrementa o primeiro número (ex: 1.0.0 → 2.0.0)
                                            </p>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                             {/* Versão Calculada */}
                            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
                                <Label className="text-lg font-semibold">
                                    Nova Versão
                                </Label>
                                <div className="font-mono text-3xl font-bold text-primary">
                                    {calculatedVersion || '1.0.0'}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Versão calculada automaticamente com base no tipo selecionado
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
                                <p className="text-xs text-muted-foreground">
                                    Descreva as mudanças, melhorias e correções
                                    desta versão
                                </p>
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
                            <p className="text-xs text-muted-foreground ml-6">
                                A versão ativa é a que será disponibilizada para download e atualização dos agentes.
                            </p>

                            {/* Nota sobre binários */}
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Após criar a versão, você será redirecionado para a página de edição onde poderá fazer upload dos binários para cada plataforma.
                                </AlertDescription>
                            </Alert>

                            {/* Botões */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Criar Versão
                                </Button>
                                <Link href="/versoes-agente">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                    >
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
