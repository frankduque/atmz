<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Widget extends Model
{
    use HasFactory;

    protected $table = 'widgets';

    protected $fillable = [
        'painel_id',
        'tipo_widget',
        'entidade_id',
        'posicao_x',
        'posicao_y',
        'largura',
        'altura',
        'configuracao',
    ];

    protected $casts = [
        'configuracao' => 'array',
    ];

    public function dashboard(): BelongsTo
    {
        return $this->belongsTo(Dashboard::class, 'painel_id');
    }

    public function rele(): BelongsTo
    {
        return $this->belongsTo(Rele::class, 'entidade_id');
    }
}
