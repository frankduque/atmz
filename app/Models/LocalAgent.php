<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class LocalAgent extends Model
{
    protected $table = 'agentes_locais';

    protected $fillable = [
        'empreendimento_id',
        'nome',
        'endereco_ip',
        'porta',
        'protocolo',
        'sistema_operacional',
        'arquitetura',
        'token',
        'status',
        'ultimo_heartbeat',
        'versao',
        'metadata',
        'connection_capabilities',
        'behind_cgnat',
        'public_ip',
        'nat_type',
        'last_connection_test',
    ];

    protected $casts = [
        'ultimo_heartbeat' => 'datetime',
        'last_connection_test' => 'datetime',
        'metadata' => 'array',
        'connection_capabilities' => 'array',
        'porta' => 'integer',
        'behind_cgnat' => 'boolean',
        'token' => 'encrypted', // Criptografa token no banco
    ];

    protected $appends = [
        'status_atual', // Adiciona accessor ao JSON
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($agent) {
            if (empty($agent->token)) {
                $agent->token = Str::random(64);
            }
        });
    }

    /**
     * Retorna a URL base do agente
     */
    public function getBaseUrlAttribute(): string
    {
        return "{$this->protocolo}://{$this->endereco_ip}:{$this->porta}";
    }

    /**
     * Verifica se o agente está online
     */
    public function isOnline(): bool
    {
        return $this->status === 'online' && 
               $this->ultimo_heartbeat && 
               $this->ultimo_heartbeat->diffInMinutes(now()) < 5;
    }

    /**
     * Retorna o status atual do agente (calculado em tempo real)
     */
    public function getStatusAtualAttribute(): string
    {
        if (!$this->ultimo_heartbeat) {
            return 'offline';
        }

        // Se último heartbeat foi há mais de 5 minutos, está offline
        if ($this->ultimo_heartbeat->diffInMinutes(now()) >= 5) {
            return 'offline';
        }

        return $this->status;
    }

    /**
     * Empreendimento que o agente local pertence
     */
    public function empreendimento(): BelongsTo
    {
        return $this->belongsTo(Empreendimento::class, 'empreendimento_id');
    }

    public function devices(): HasMany
    {
        return $this->hasMany(Device::class, 'agente_id');
    }
}
