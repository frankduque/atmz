<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Cria usuário admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@atmz.com',
            'password' => Hash::make('password'),
            'role' => 'administrador',
        ]);

        // Cria usuário comum para testes
        User::create([
            'name' => 'Usuário Teste',
            'email' => 'user@atmz.com',
            'password' => Hash::make('password'),
            'role' => 'usuario',
        ]);
    }
}
