<?php

namespace Database\Factories;

use App\Models\Painel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PainelFactory extends Factory
{
    protected $model = Painel::class;

    public function definition(): array
    {
        return [
            'nome' => fake()->words(3, true),
            'user_id' => User::factory(),
            'padrao' => false,
        ];
    }

    public function padrao(): static
    {
        return $this->state(fn (array $attributes) => [
            'padrao' => true,
        ]);
    }
}
