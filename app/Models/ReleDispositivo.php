<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReleDispositivo extends Model
{
    protected $fillable = [
        'rele_id',
        'porta',
        'nome',
        'tipo',
        'descricao',
        'acoes_disponiveis',
        'configuracao_acoes',
    ];

    protected $casts = [
        'acoes_disponiveis' => 'array',
        'configuracao_acoes' => 'array',
    ];

    public function rele(): BelongsTo
    {
        return $this->belongsTo(Rele::class);
    }

    public function logs()
    {
        return $this->hasMany(ReleLog::class);
    }

    public function executarAcao(string $acao, ?array $parametros = null): bool
    {
        // Se não passou parâmetros, usa os padrões configurados
        if ($parametros === null && isset($this->configuracao_acoes[$acao])) {
            $parametros = $this->configuracao_acoes[$acao];
        }

        return $this->rele->executarAcao($this->porta, $acao, $parametros ?? []);
    }

    public function podeExecutarAcao(string $acao): bool
    {
        return in_array($acao, $this->acoes_disponiveis);
    }
}
