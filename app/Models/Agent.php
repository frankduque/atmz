<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agent extends Model
{
    use HasFactory;

    protected $table = 'agentes_locais';

    protected $fillable = [
        'empreendimento_id',
        'nome',
        'token',
        'status',
        'ultimo_heartbeat',
        'metadata',
    ];

    protected $casts = [
        'ultimo_heartbeat' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Empreendimento que o agente pertence
     */
    public function empreendimento(): BelongsTo
    {
        return $this->belongsTo(Empreendimento::class, 'empreendimento_id');
    }

    /**
     * Dispositivos gerenciados por este agente
     */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'agente_id');
    }

    /**
     * Gerar token único para o agente
     */
    public static function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Verificar se o agente está online (heartbeat nos últimos 5 minutos)
     */
    public function isOnline(): bool
    {
        if (!$this->ultimo_heartbeat) {
            return false;
        }

        return $this->ultimo_heartbeat->diffInMinutes(now()) <= 5;
    }

    /**
     * Atualizar heartbeat do agente
     */
    public function updateHeartbeat(): void
    {
        $this->update([
            'ultimo_heartbeat' => now(),
            'status' => 'online',
        ]);
    }
}
