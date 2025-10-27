<?php

namespace App\Services\Relay;

use App\Models\Rele;

class RelayDriverFactory
{
    public static function createFromConfig(string $driver, array $config): RelayDriverInterface
    {
        return match ($driver) {
            'sr201' => new SR201Driver($config),
            default => throw new \InvalidArgumentException("Driver não suportado: {$driver}"),
        };
    }

    public static function create(Rele $rele): RelayDriverInterface
    {
        return self::createFromConfig($rele->driver, $rele->configuracao);
    }
}
