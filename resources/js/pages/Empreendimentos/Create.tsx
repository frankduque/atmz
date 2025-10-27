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
import { ArrowLeft } from 'lucide-react';
import empreendimentos from '@/routes/empreendimentos';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Empreendimentos',
        href: empreendimentos.index.url(),
    },
    {
        title: 'Criar',
        href: '/empreendimentos/create',
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nome: '',
        descricao: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        ativo: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(empreendimentos.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Empreendimento" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Criar Empreendimento
                        </h2>
                        <p className="text-muted-foreground">
                            Preencha os dados do novo empreendimento
                        </p>
                    </div>
                    <Link href={empreendimentos.index.url()}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                            <CardDescription>
                                Dados principais do empreendimento
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome *</Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) =>
                                        setData('nome', e.target.value)
                                    }
                                    placeholder="Ex: Edifício São Paulo"
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
                                    placeholder="Descrição do empreendimento"
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

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Endereço</CardTitle>
                            <CardDescription>
                                Localização do empreendimento
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="endereco">Endereço *</Label>
                                <Input
                                    id="endereco"
                                    value={data.endereco}
                                    onChange={(e) =>
                                        setData('endereco', e.target.value)
                                    }
                                    placeholder="Ex: Rua das Flores, 123"
                                    required
                                />
                                {errors.endereco && (
                                    <p className="text-sm text-destructive">
                                        {errors.endereco}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade *</Label>
                                    <Input
                                        id="cidade"
                                        value={data.cidade}
                                        onChange={(e) =>
                                            setData('cidade', e.target.value)
                                        }
                                        placeholder="Ex: São Paulo"
                                        required
                                    />
                                    {errors.cidade && (
                                        <p className="text-sm text-destructive">
                                            {errors.cidade}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado *</Label>
                                    <Input
                                        id="estado"
                                        value={data.estado}
                                        onChange={(e) =>
                                            setData('estado', e.target.value.toUpperCase())
                                        }
                                        placeholder="Ex: SP"
                                        maxLength={2}
                                        required
                                    />
                                    {errors.estado && (
                                        <p className="text-sm text-destructive">
                                            {errors.estado}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cep">CEP *</Label>
                                    <Input
                                        id="cep"
                                        value={data.cep}
                                        onChange={(e) =>
                                            setData('cep', e.target.value)
                                        }
                                        placeholder="Ex: 01234-567"
                                        required
                                    />
                                    {errors.cep && (
                                        <p className="text-sm text-destructive">
                                            {errors.cep}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end gap-4">
                        <Link href={empreendimentos.index.url()}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Criando...' : 'Criar Empreendimento'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
