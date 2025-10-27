import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Play, Square, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface CameraDevice {
    id: number;
    ip: string;
    porta: number;
    usuario: string;
    modelo: string;
    suporta_ptz: boolean;
}

interface Device {
    id: number;
    nome: string;
    deviceable: CameraDevice;
}

interface Widget {
    id: number;
    configuracao: any;
}

interface Props {
    device?: Device;
    widget: Widget;
}

export function WidgetCamera({ device, widget }: Props) {
    const [recording, setRecording] = useState(false);

    if (!device) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Dispositivo não encontrado</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    const handleSnapshot = () => {
        // Implementar captura de foto
        console.log("Capturando foto...");
    };

    const handleRecording = () => {
        setRecording(!recording);
        // Implementar iniciar/parar gravação
        console.log(recording ? "Parando gravação..." : "Iniciando gravação...");
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Camera className="h-5 w-5" />
                    {device.nome}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-secondary/50 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-center text-muted-foreground">
                        <Camera className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Feed da câmera</p>
                        <p className="text-xs">{device.deviceable.ip}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleSnapshot}>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Foto
                    </Button>
                    <Button
                        size="sm"
                        variant={recording ? "destructive" : "default"}
                        onClick={handleRecording}
                    >
                        {recording ? (
                            <>
                                <Square className="mr-2 h-4 w-4" />
                                Parar
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Gravar
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
