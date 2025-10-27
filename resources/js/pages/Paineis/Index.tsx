import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";

interface Painel {
    id: number;
    nome: string;
    padrao: boolean;
    widgets_count?: number;
}

interface Props {
    paineis: Painel[];
    isAdmin: boolean;
}

export default function Index({ paineis, isAdmin }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Tem certeza que deseja excluir este painel?')) {
            router.delete(`/paineis/${id}`);
        }
    };

    const breadcrumbs = [
        { title: 'Painéis de Controle', href: '/paineis' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Painéis de Controle" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Painéis de Controle</h2>
                        <p className="text-muted-foreground">
                            Gerencie seus painéis personalizados
                        </p>
                    </div>
                    {isAdmin && (
                        <Link href="/paineis/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Painel
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paineis.map((painel) => (
                        <Card key={painel.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LayoutDashboard className="h-5 w-5" />
                                    {painel.nome}
                                </CardTitle>
                                <CardDescription>
                                    Painel personalizado multi-empreendimento
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {painel.widgets_count || 0} widgets configurados
                                </p>
                                {painel.padrao && (
                                    <span className="inline-flex items-center px-2 py-1 mt-2 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                        Padrão
                                    </span>
                                )}
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Link href={`/paineis/${painel.id}`} className="flex-1">
                                    <Button variant="default" className="w-full">
                                        Abrir
                                    </Button>
                                </Link>
                                {isAdmin && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(painel.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}

                    {paineis.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <LayoutDashboard className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Nenhum painel criado</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Crie seu primeiro painel para começar a controlar seus relês
                            </p>
                            <Link href="/paineis/create">
                                <Button className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Painel
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
