<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Painel extends Model
{
    use HasFactory;

    protected $table = 'paineis';

    protected $fillable = [
        'user_id',
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

    public function widgets(): HasMany
    {
        return $this->hasMany(Widget::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'painel_user')
            ->withTimestamps();
    }
}
