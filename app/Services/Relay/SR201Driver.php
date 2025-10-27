<?php

namespace App\Services\Relay;

class SR201Driver implements RelayDriverInterface
{
    private string $ip;
    private int $porta;
    private int $timeout;

    public function __construct(array $config)
    {
        $this->ip = $config['ip'];
        $this->porta = $config['porta'];
        $this->timeout = $config['timeout'] ?? 3;
    }

    public function testConnection(): bool
    {
        $connection = @fsockopen($this->ip, $this->porta, $errno, $errstr, $this->timeout);
        
        if ($connection === false) {
            return false;
        }
        
        fclose($connection);
        return true;
    }

    public function turnOn(int $port): bool
    {
        return $this->enviarComando("1{$port}");
    }

    public function turnOff(int $port): bool
    {
        return $this->enviarComando("2{$port}");
    }

    public function getStatus(int $port): ?bool
    {
        $allStatus = $this->getAllStatus();
        return $allStatus[$port] ?? null;
    }

    public function getAllStatus(): array
    {
        // Comando de consulta de status: "00"
        $connection = @fsockopen($this->ip, $this->porta, $errno, $errstr, $this->timeout);
        
        if ($connection === false) {
            return [];
        }
        
        stream_set_timeout($connection, $this->timeout);
        
        // Envia comando "00" para consultar status
        fwrite($connection, "00");
        
        // Lê a resposta (8 dígitos: 0 ou 1 para cada canal)
        $resposta = fread($connection, 8);
        fclose($connection);
        
        // Parse da resposta
        // Exemplo: "01000000" = Canal 2 ON, outros OFF
        $status = [];
        if (strlen($resposta) === 8) {
            for ($i = 0; $i < 8; $i++) {
                $canal = $i + 1;
                $status[$canal] = $resposta[$i] === '1';
            }
        }
        
        return $status;
    }

    public function flash(int $port, int $durationMs = 500): bool
    {
        // Flash manual (não usa comando nativo)
        if ($this->turnOn($port)) {
            usleep($durationMs * 1000);
            return $this->turnOff($port);
        }
        return false;
    }

    public function pulse(int $port, int $durationSeconds = 3): bool
    {
        // Usa comando nativo de temporização: "11:3" (liga por 3 segundos)
        return $this->enviarComando("1{$port}:{$durationSeconds}");
    }

    public function blink(int $port, int $repeats = 5, int $intervalMs = 300): bool
    {
        for ($i = 0; $i < $repeats; $i++) {
            if (!$this->flash($port, $intervalMs / 2)) {
                return false;
            }
            if ($i < $repeats - 1) {
                usleep($intervalMs * 1000);
            }
        }
        return true;
    }

    public function executeAction(int $port, string $action, array $params = []): bool
    {
        return match($action) {
            'on' => $this->turnOn($port),
            'off' => $this->turnOff($port),
            'flash' => $this->flash($port, $params['duracao_ms'] ?? 500),
            'pulse' => $this->pulse($port, $params['duracao_segundos'] ?? 3),
            'blink' => $this->blink($port, $params['repeticoes'] ?? 5, $params['intervalo_ms'] ?? 300),
            default => false
        };
    }

    private function enviarComando(string $comando): bool
    {
        $connection = @fsockopen($this->ip, $this->porta, $errno, $errstr, $this->timeout);
        
        if ($connection === false) {
            \Log::error("SR201: Falha ao conectar", ['ip' => $this->ip, 'porta' => $this->porta, 'erro' => $errstr]);
            return false;
        }
        
        stream_set_timeout($connection, $this->timeout);
        
        // Envia comando ASCII direto (ex: "11", "21", "11:5")
        $resultado = fwrite($connection, $comando);
        
        if ($resultado === false) {
            fclose($connection);
            \Log::error("SR201: Falha ao enviar comando", ['comando' => $comando]);
            return false;
        }
        
        // SR201 retorna o status após cada comando (8 dígitos: 0 ou 1)
        $resposta = fread($connection, 8);
        
        // Log para debug
        if (strlen($resposta) === 8) {
            \Log::debug('SR201: Status recebido', [
                'comando' => $comando,
                'resposta' => $resposta,
                'canais' => [
                    '1' => $resposta[0] === '1' ? 'ON' : 'OFF',
                    '2' => $resposta[1] === '1' ? 'ON' : 'OFF',
                    '3' => $resposta[2] === '1' ? 'ON' : 'OFF',
                    '4' => $resposta[3] === '1' ? 'ON' : 'OFF',
                    '5' => $resposta[4] === '1' ? 'ON' : 'OFF',
                    '6' => $resposta[5] === '1' ? 'ON' : 'OFF',
                    '7' => $resposta[6] === '1' ? 'ON' : 'OFF',
                    '8' => $resposta[7] === '1' ? 'ON' : 'OFF',
                ]
            ]);
        } else {
            \Log::warning('SR201: Resposta inválida', [
                'comando' => $comando,
                'resposta' => $resposta,
                'tamanho' => strlen($resposta)
            ]);
        }
        
        fclose($connection);
        
        return true;
    }
}
