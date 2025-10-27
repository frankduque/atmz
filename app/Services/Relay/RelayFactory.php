<?php

namespace App\Services\Relay;

use App\Contracts\RelayDriverInterface;
use App\Models\Rele;
use App\Services\Relay\Drivers\SR201Driver;
use InvalidArgumentException;

class RelayFactory
{
    protected static array $drivers = [
        'SR201' => SR201Driver::class,
    ];

    public static function criar(Rele $rele): RelayDriverInterface
    {
        if (!isset(self::$drivers[$rele->tipo])) {
            throw new InvalidArgumentException("Driver não encontrado para o tipo: {$rele->tipo}");
        }

        $driverClass = self::$drivers[$rele->tipo];

        return new $driverClass($rele->ip, $rele->porta);
    }

    public static function getTiposDisponiveis(): array
    {
        return [
            'SR201' => [
                'nome' => 'SR201 2 Canais Ethernet',
                'canais' => 2,
                'descricao' => 'Módulo Relé SR201 com 2 canais e conexão Ethernet',
                'modos' => ['normal', 'pulso', 'piscar'],
            ],
        ];
    }

    public static function registrarDriver(string $tipo, string $driverClass): void
    {
        self::$drivers[$tipo] = $driverClass;
    }
}
