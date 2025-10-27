<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dashboard extends Model
{
    protected $table = 'paineis';

    protected $fillable = [
        'user_id',
        'empreendimento_id',
        'nome',
        'padrao',
    ];

    protected $casts = [
        'padrao' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function empreendimento(): BelongsTo
    {
        return $this->belongsTo(Empreendimento::class, 'empreendimento_id');
    }

    public function widgets(): HasMany
    {
        return $this->hasMany(Widget::class, 'painel_id');
    }
}
