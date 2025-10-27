import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Info, Zap } from 'lucide-react';
import empreendimentos from '@/routes/empreendimentos';
import { PropsWithChildren } from 'react';

interface Empreendimento {
    id: number;
    nome: string;
    descricao: string | null;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
}

interface Props extends PropsWithChildren {
    empreendimento: Empreendimento;
    currentTab: 'visao-geral' | 'reles';
}

const breadcrumbs = (empreendimento: Empreendimento): BreadcrumbItem[] => [
    {
        title: 'Empreendimentos',
        href: '/empreendimentos',
    },
    {
        title: empreendimento.nome,
        href: `/empreendimentos/${empreendimento.id}`,
    },
];

export default function ShowLayout({ empreendimento, currentTab, children }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(empreendimento)}>
            <Head title={empreendimento.nome} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={empreendimentos.index.url()}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                {empreendimento.nome}
                            </h2>
                            {empreendimento.descricao && (
                                <p className="text-muted-foreground">
                                    {empreendimento.descricao}
                                </p>
                            )}
                        </div>
                    </div>
                    <Link href={empreendimentos.edit.url(empreendimento.id)}>
                        <Button variant="outline">Editar Empreendimento</Button>
                    </Link>
                </div>

                {/* Navigation Tabs */}
                <Tabs value={currentTab} className="w-full">
                    <TabsList>
                        <Link href={empreendimentos.show.url(empreendimento.id)}>
                            <TabsTrigger value="visao-geral">
                                <Info className="mr-2 h-4 w-4" />
                                Visão Geral
                            </TabsTrigger>
                        </Link>
                        <Link href={empreendimentos.reles.index.url(empreendimento.id)}>
                            <TabsTrigger value="reles">
                                <Zap className="mr-2 h-4 w-4" />
                                Relés
                            </TabsTrigger>
                        </Link>
                    </TabsList>

                    {/* Content */}
                    <div className="mt-6">
                        {children}
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
