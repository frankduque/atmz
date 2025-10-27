import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nome: "",
        padrao: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/paineis");
    };

    const breadcrumbs = [
        { title: 'Painéis de Controle', href: '/paineis' },
        { title: 'Novo Painel', href: '/paineis/create' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criar Painel" />

            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do Painel</CardTitle>
                            <CardDescription>
                                Configure um novo painel customizado para monitorar seus dispositivos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Crie painéis personalizados com widgets de dispositivos de qualquer empreendimento.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome do Painel</Label>
                                    <Input
                                        id="nome"
                                        value={data.nome}
                                        onChange={(e) => setData("nome", e.target.value)}
                                        placeholder="Ex: Controle Principal"
                                        className={errors.nome ? "border-red-500" : ""}
                                    />
                                    {errors.nome && (
                                        <p className="text-sm text-red-500">{errors.nome}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="padrao"
                                        checked={data.padrao}
                                        onCheckedChange={(checked) => setData("padrao", checked as boolean)}
                                    />
                                    <Label
                                        htmlFor="padrao"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Definir como painel padrão
                                    </Label>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? "Criando..." : "Criar Painel"}
                                    </Button>
                                    <Link href="/paineis">
                                        <Button type="button" variant="outline">
                                            Cancelar
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

