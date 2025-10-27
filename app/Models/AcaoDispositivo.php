<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcaoDispositivo extends Model
{
    protected $table = 'acoes_dispositivo';

    protected $fillable = [
        'codigo',
        'nome',
        'descricao',
        'requer_configuracao',
        'parametros',
    ];

    protected $casts = [
        'requer_configuracao' => 'boolean',
        'parametros' => 'array',
    ];
}
