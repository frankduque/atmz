<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rele extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'empreendimento_id',
        'nome',
        'descricao',
        'driver',
        'configuracao',
        'numero_portas',
        'status',
        'ultima_comunicacao',
    ];

    protected $casts = [
        'configuracao' => 'array',
        'ultima_comunicacao' => 'datetime',
    ];

    public function empreendimento(): BelongsTo
    {
        return $this->belongsTo(Empreendimento::class);
    }

    public function dispositivos(): HasMany
    {
        return $this->hasMany(ReleDispositivo::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ReleLog::class);
    }

    public function getDriver()
    {
        return \App\Services\Relay\RelayDriverFactory::create($this);
    }

    public function executarAcao(int $porta, string $acao, array $parametros = []): bool
    {
        try {
            $driver = $this->getDriver();
            
            $resultado = match($acao) {
                'on' => $driver->turnOn($porta),
                'off' => $driver->turnOff($porta),
                'flash' => $driver->flash($porta, $parametros['duracao_ms'] ?? 500),
                'pulse' => $driver->pulse($porta, $parametros['duracao_segundos'] ?? 3),
                'blink' => $driver->blink($porta, $parametros['repeticoes'] ?? 5, $parametros['intervalo_ms'] ?? 300),
                default => $driver->executeAction($porta, $acao, $parametros),
            };

            if ($resultado) {
                $this->update(['ultima_comunicacao' => now(), 'status' => 'online']);
            }

            return $resultado;
        } catch (\Exception $e) {
            \Log::error('Erro ao executar ação no relé: ' . $e->getMessage());
            $this->update(['status' => 'erro']);
            return false;
        }
    }

    public function testarConexao(): bool
    {
        try {
            $resultado = $this->getDriver()->testConnection();
            $this->update(['status' => $resultado ? 'online' : 'offline']);
            return $resultado;
        } catch (\Exception $e) {
            $this->update(['status' => 'erro']);
            return false;
        }
    }

    public function obterStatus(): array
    {
        try {
            return $this->getDriver()->getAllStatus();
        } catch (\Exception $e) {
            return [];
        }
    }
}

