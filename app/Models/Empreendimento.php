<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empreendimento extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empreendimentos';

    protected $fillable = [
        'nome',
        'endereco',
        'cidade',
        'estado',
        'cep',
        'descricao',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function reles()
    {
        return $this->hasMany(Rele::class, 'empreendimento_id');
    }
}
