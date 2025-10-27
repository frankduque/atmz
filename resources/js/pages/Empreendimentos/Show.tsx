import ShowLayout from './ShowLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Zap, LayoutDashboard } from 'lucide-react';

interface Props {
    empreendimento: {
        id: number;
        nome: string;
        descricao: string | null;
        endereco: string;
        cidade: string;
        estado: string;
        cep: string;
        reles_count?: number;
        paineis_count?: number;
    };
}

export default function Show({ empreendimento }: Props) {
    return (
        <ShowLayout empreendimento={empreendimento} currentTab="visao-geral">
            <div className="space-y-6">
                {/* Estatísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de Relês
                            </CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {empreendimento.reles_count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Dispositivos de relê cadastrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Painéis
                            </CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {empreendimento.paineis_count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Dashboards configurados
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Informações do Empreendimento */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Endereço
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1 text-sm">
                            <p>{empreendimento.endereco}</p>
                            <p>
                                {empreendimento.cidade}, {empreendimento.estado}
                            </p>
                            <p className="text-muted-foreground">
                                CEP: {empreendimento.cep}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ShowLayout>
    );
}
