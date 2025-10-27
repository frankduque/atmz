import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, Zap, ZapOff } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface Relay {
    id: number;
    canal: number;
    nome: string;
    status: 'on' | 'off';
}

interface RelayBoard {
    id: number;
    ip: string;
    porta: number;
    quantidade_canais: number;
    relays: Relay[];
}

interface Device {
    id: number;
    nome: string;
    deviceable: RelayBoard;
}

interface Widget {
    id: number;
    configuracao: any;
}

interface Props {
    device?: Device;
    widget: Widget;
}

export function WidgetRelay({ device, widget }: Props) {
    const [loading, setLoading] = useState<number | null>(null);

    if (!device) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Dispositivo não encontrado</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    const handleCommand = (relayId: number, command: string) => {
        setLoading(relayId);
        router.post(
            `/reles/${relayId}/comando`,
            { comando: command },
            {
                onFinish: () => setLoading(null),
                preserveScroll: true,
            }
        );
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Power className="h-5 w-5" />
                    {device.nome}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                {device.deviceable.relays?.map((relay) => (
                    <div
                        key={relay.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            {relay.status === 'on' ? (
                                <Zap className="h-4 w-4 text-green-500" />
                            ) : (
                                <ZapOff className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="font-medium text-sm">
                                {relay.nome || `Canal ${relay.canal}`}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={relay.status === 'on' ? "default" : "outline"}
                                onClick={() => handleCommand(relay.id, "ligar")}
                                disabled={loading === relay.id}
                            >
                                ON
                            </Button>
                            <Button
                                size="sm"
                                variant={relay.status === 'off' ? "default" : "outline"}
                                onClick={() => handleCommand(relay.id, "desligar")}
                                disabled={loading === relay.id}
                            >
                                OFF
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleCommand(relay.id, "pulso")}
                                disabled={loading === relay.id}
                            >
                                Pulso
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
