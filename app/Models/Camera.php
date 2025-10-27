<?php

namespace App\Models;

use App\Contracts\CameraDriver;
use App\Contracts\DeviceBehavior;
use App\Services\Camera\Drivers\HikvisionDriver;
use App\Services\Camera\Drivers\OnvifDriver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Camera extends Model implements DeviceBehavior
{
    protected $table = 'cameras';

    protected $fillable = [
        'tipo', // onvif, hikvision, dahua, intelbras
        'url',
        'url_stream',
        'credenciais',
        'resolucao',
        'fps',
        'ptz_suportado',
        'gravacao_habilitada',
    ];

    protected $casts = [
        'ptz_suportado' => 'boolean',
        'gravacao_habilitada' => 'boolean',
    ];

    public function dispositivo(): MorphOne
    {
        return $this->morphOne(Device::class, 'dispositivo');
    }

    /**
     * Factory Method - retorna driver correto baseado no tipo
     */
    public function getDriver(): CameraDriver
    {
        $credentials = json_decode($this->credenciais, true);
        
        return match($this->tipo) {
            'onvif' => new OnvifDriver(
                $this->url,
                $credentials['username'] ?? '',
                $credentials['password'] ?? ''
            ),
            'hikvision' => new HikvisionDriver(
                $this->url,
                $credentials['username'] ?? '',
                $credentials['password'] ?? ''
            ),
            // 'dahua' => new DahuaDriver(...),
            // 'intelbras' => new IntelbrasDriver(...),
            default => throw new \Exception("Driver não suportado: {$this->tipo}"),
        };
    }

    // Implementação DeviceBehavior
    public function connect(): bool
    {
        return $this->getDriver()->isStreaming();
    }

    public function disconnect(): bool
    {
        return true;
    }

    public function getDeviceStatus(): string
    {
        return $this->getDriver()->isStreaming() ? 'online' : 'offline';
    }

    public function isControllable(): bool
    {
        return true;
    }

    public function getSupportedCommands(): array
    {
        $commands = ['snapshot', 'start_recording', 'stop_recording'];
        
        if ($this->ptz_suportado) {
            $commands[] = 'ptz_move';
            $commands[] = 'ptz_home';
        }
        
        return $commands;
    }
}
