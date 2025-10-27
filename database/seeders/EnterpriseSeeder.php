<?php

namespace Database\Seeders;

use App\Models\Empreendimento;
use App\Models\Rele;
use Illuminate\Database\Seeder;

class EnterpriseSeeder extends Seeder
{
    public function run(): void
    {
        // Criar empreendimento de exemplo
        $enterprise = Empreendimento::create([
            'nome' => 'Edifício Exemplo',
            'descricao' => 'Prédio residencial com automação completa',
            'endereco' => 'Rua das Flores, 123',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'cep' => '01234-567',
        ]);

        // Criar relé SR201 de exemplo
        Rele::create([
            'empreendimento_id' => $enterprise->id,
            'nome' => 'Relé Portaria',
            'descricao' => 'Controle de sirene e portão da portaria',
            'driver' => 'sr201',
            'configuracao' => [
                'ip' => '192.168.1.100',
                'porta' => 6722,
            ],
            'numero_portas' => 8,
            'status' => 'offline',
        ]);

        Rele::create([
            'empreendimento_id' => $enterprise->id,
            'nome' => 'Relé Garagem',
            'descricao' => 'Controle de portão e iluminação da garagem',
            'driver' => 'sr201',
            'configuracao' => [
                'ip' => '192.168.1.101',
                'porta' => 6722,
            ],
            'numero_portas' => 8,
            'status' => 'offline',
        ]);
    }
}

