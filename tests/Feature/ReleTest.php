<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Empreendimento;
use App\Models\Rele;
use App\Models\ReleDispositivo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ReleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $user;
    protected Empreendimento $empreendimento;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserSeeder::class);
        
        $this->admin = User::where('email', 'admin@atmz.com')->first();
        $this->user = User::where('email', 'user@atmz.com')->first();
        
        $this->empreendimento = Empreendimento::factory()->create();
    }

    #[Test]
    public function admin_pode_criar_rele()
    {
        $response = $this->actingAs($this->admin)->post("/empreendimentos/{$this->empreendimento->id}/reles", [
            'nome' => 'Relê Teste',
            'descricao' => 'Descrição do relê',
            'driver' => 'SR201',
            'configuracao' => [
                'ip' => '192.168.1.100',
                'porta' => 6722,
            ],
            'numero_portas' => 8,
        ]);

        $this->assertDatabaseHas('reles', [
            'nome' => 'Relê Teste',
            'driver' => 'SR201',
            'empreendimento_id' => $this->empreendimento->id,
        ]);
        
        $rele = Rele::where('nome', 'Relê Teste')->first();
        $response->assertRedirect("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}");
    }

    #[Test]
    public function usuario_comum_nao_pode_criar_rele()
    {
        $response = $this->actingAs($this->user)->post("/empreendimentos/{$this->empreendimento->id}/reles", [
            'nome' => 'Relê Teste',
            'descricao' => 'Descrição do relê',
            'driver' => 'SR201',
            'configuracao' => [
                'ip' => '192.168.1.100',
                'porta' => 6722,
            ],
            'numero_portas' => 8,
        ]);

        $response->assertStatus(403); // Forbidden
        $this->assertDatabaseMissing('reles', [
            'nome' => 'Relê Teste',
        ]);
    }

    #[Test]
    public function rele_requer_campos_obrigatorios()
    {
        $response = $this->actingAs($this->admin)->post("/empreendimentos/{$this->empreendimento->id}/reles", [
            // Faltando campos obrigatórios
        ]);

        $response->assertSessionHasErrors(['nome', 'driver', 'configuracao', 'numero_portas']);
    }

    #[Test]
    public function admin_pode_editar_rele()
    {
        $rele = Rele::factory()->create([
            'empreendimento_id' => $this->empreendimento->id,
            'nome' => 'Relê Original',
        ]);

        $response = $this->actingAs($this->admin)->patch("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}", [
            'nome' => 'Relê Editado',
            'descricao' => 'Nova descrição',
            'driver' => $rele->driver,
            'configuracao' => $rele->configuracao,
            'numero_portas' => $rele->numero_portas,
        ]);

        $this->assertDatabaseHas('reles', [
            'id' => $rele->id,
            'nome' => 'Relê Editado',
        ]);
        
        $response->assertRedirect("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}");
    }

    #[Test]
    public function admin_pode_deletar_rele()
    {
        $rele = Rele::factory()->create([
            'empreendimento_id' => $this->empreendimento->id,
        ]);

        $response = $this->actingAs($this->admin)->delete("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}");

        $this->assertSoftDeleted('reles', [
            'id' => $rele->id,
        ]);
        
        $response->assertRedirect("/empreendimentos/{$this->empreendimento->id}/reles");
    }

    #[Test]
    public function admin_pode_configurar_dispositivo_no_canal()
    {
        $rele = Rele::factory()->create([
            'empreendimento_id' => $this->empreendimento->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}/dispositivos", [
            'porta' => 1,
            'nome' => 'Portão Principal',
            'tipo' => 'portao',
            'descricao' => 'Portão de entrada',
            'acoes_disponiveis' => ['pulse'],
            'configuracao_acoes' => [
                'pulse' => ['duracao_segundos' => 3],
            ],
        ]);

        $this->assertDatabaseHas('rele_dispositivos', [
            'rele_id' => $rele->id,
            'porta' => 1,
            'nome' => 'Portão Principal',
            'tipo' => 'portao',
        ]);
    }

    #[Test]
    public function nao_pode_configurar_dois_dispositivos_no_mesmo_canal()
    {
        $rele = Rele::factory()->create([
            'empreendimento_id' => $this->empreendimento->id,
        ]);

        // Primeiro dispositivo
        ReleDispositivo::create([
            'rele_id' => $rele->id,
            'porta' => 1,
            'nome' => 'Dispositivo 1',
            'tipo' => 'teste',
            'acoes_disponiveis' => ['on'],
        ]);

        // Tentar criar segundo no mesmo canal
        $response = $this->actingAs($this->admin)->post("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}/dispositivos", [
            'porta' => 1,
            'nome' => 'Dispositivo 2',
            'tipo' => 'teste',
            'acoes_disponiveis' => ['on'],
        ]);

        $response->assertSessionHas('error');
    }

    #[Test]
    public function admin_pode_remover_dispositivo_do_canal()
    {
        $rele = Rele::factory()->create([
            'empreendimento_id' => $this->empreendimento->id,
        ]);

        $dispositivo = ReleDispositivo::create([
            'rele_id' => $rele->id,
            'porta' => 1,
            'nome' => 'Dispositivo Teste',
            'tipo' => 'teste',
            'acoes_disponiveis' => ['on'],
        ]);

        $response = $this->actingAs($this->admin)->delete("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}/dispositivos/{$dispositivo->id}");

        $this->assertDatabaseMissing('rele_dispositivos', [
            'id' => $dispositivo->id,
        ]);
    }

    #[Test]
    public function porta_deve_estar_entre_1_e_numero_de_portas()
    {
        $rele = Rele::factory()->create([
            'empreendimento_id' => $this->empreendimento->id,
            'numero_portas' => 8,
        ]);

        $response = $this->actingAs($this->admin)->post("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}/dispositivos", [
            'porta' => 99, // Porta inválida
            'nome' => 'Dispositivo Teste',
            'tipo' => 'teste',
            'acoes_disponiveis' => ['on'],
        ]);

        $response->assertSessionHasErrors('porta');
    }

    #[Test]
    public function acoes_disponiveis_devem_ser_validas()
    {
        $rele = Rele::factory()->create([
            'empreendimento_id' => $this->empreendimento->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/empreendimentos/{$this->empreendimento->id}/reles/{$rele->id}/dispositivos", [
            'porta' => 1,
            'nome' => 'Dispositivo Teste',
            'tipo' => 'teste',
            'acoes_disponiveis' => ['invalid_action'], // Ação inválida
        ]);

        $response->assertSessionHasErrors('acoes_disponiveis.0');
    }
}

