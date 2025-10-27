<?php

namespace App\Services\Relay\Drivers;

use App\Contracts\RelayDriverInterface;
use Exception;

class SR201Driver implements RelayDriverInterface
{
    protected string $ip;
    protected int $porta;
    protected int $timeout = 3;

    public function __construct(string $ip, int $porta = 6722)
    {
        $this->ip = $ip;
        $this->porta = $porta;
    }

    public function ligar(int $canal): bool
    {
        return $this->enviarComando($this->getComandoLigar($canal));
    }

    public function desligar(int $canal): bool
    {
        return $this->enviarComando($this->getComandoDesligar($canal));
    }

    public function pulsar(int $canal, int $duracao = 500): bool
    {
        if ($this->ligar($canal)) {
            usleep($duracao * 1000);
            return $this->desligar($canal);
        }
        return false;
    }

    public function piscar(int $canal, int $repeticoes = 5, int $intervalo = 500): bool
    {
        for ($i = 0; $i < $repeticoes; $i++) {
            if (!$this->pulsar($canal, $intervalo / 2)) {
                return false;
            }
            if ($i < $repeticoes - 1) {
                usleep($intervalo * 500);
            }
        }
        return true;
    }

    public function obterStatus(): array
    {
        $resultado = $this->enviarComando('00');
        
        if (!$resultado) {
            return [];
        }

        return $this->parseStatus($resultado);
    }

    public function testarConexao(): bool
    {
        try {
            $socket = @socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
            
            if ($socket === false) {
                return false;
            }

            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => $this->timeout, 'usec' => 0]);
            socket_set_option($socket, SOL_SOCKET, SO_SNDTIMEO, ['sec' => $this->timeout, 'usec' => 0]);

            $resultado = @socket_connect($socket, $this->ip, $this->porta);
            socket_close($socket);

            return $resultado !== false;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getNumeroCanais(): int
    {
        return 2;
    }

    protected function enviarComando(string $comando): bool|string
    {
        try {
            $socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
            
            if ($socket === false) {
                throw new Exception('Falha ao criar socket');
            }

            socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => $this->timeout, 'usec' => 0]);
            socket_set_option($socket, SOL_SOCKET, SO_SNDTIMEO, ['sec' => $this->timeout, 'usec' => 0]);

            if (!@socket_connect($socket, $this->ip, $this->porta)) {
                socket_close($socket);
                throw new Exception('Falha ao conectar ao dispositivo');
            }

            socket_write($socket, $comando, strlen($comando));
            $resposta = socket_read($socket, 2048);
            
            socket_close($socket);

            return $resposta !== false ? $resposta : false;
        } catch (Exception $e) {
            \Log::error('Erro ao enviar comando para SR201: ' . $e->getMessage());
            return false;
        }
    }

    protected function getComandoLigar(int $canal): string
    {
        // Comandos SR201: 11 (liga canal 1), 12 (liga canal 2)
        return '1' . $canal;
    }

    protected function getComandoDesligar(int $canal): string
    {
        // Comandos SR201: 21 (desliga canal 1), 22 (desliga canal 2)
        return '2' . $canal;
    }

    protected function parseStatus(string $resposta): array
    {
        // SR201 retorna status no formato: 11:on,12:off ou similar
        $canais = [];
        
        for ($i = 1; $i <= $this->getNumeroCanais(); $i++) {
            $canais[$i] = [
                'numero' => $i,
                'estado' => 'desconhecido',
            ];
        }

        return $canais;
    }
}
