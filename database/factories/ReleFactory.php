<?php

namespace Database\Factories;

use App\Models\Empreendimento;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'empreendimento_id' => Empreendimento::factory(),
            'nome' => fake()->words(3, true),
            'descricao' => fake()->sentence(),
            'driver' => 'SR201',
            'configuracao' => [
                'ip' => fake()->localIpv4(),
                'porta' => 6722,
            ],
            'numero_portas' => 8,
            'status' => 'offline',
        ];
    }
}
