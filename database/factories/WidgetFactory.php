<?php

namespace Database\Factories;

use App\Models\Painel;
use App\Models\Widget;
use Illuminate\Database\Eloquent\Factories\Factory;

class WidgetFactory extends Factory
{
    protected $model = Widget::class;

    public function definition(): array
    {
        return [
            'painel_id' => Painel::factory(),
            'tipo_widget' => fake()->randomElement(['texto', 'info', 'rele_canal', 'controle_rele']),
            'entidade_id' => null,
            'posicao_x' => fake()->numberBetween(0, 11),
            'posicao_y' => fake()->numberBetween(0, 11),
            'largura' => fake()->numberBetween(1, 12),
            'altura' => fake()->numberBetween(1, 6),
            'configuracao' => [],
        ];
    }
}
