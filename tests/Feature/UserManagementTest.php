<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    #[Test]
    public function admin_pode_acessar_listagem_de_usuarios()
    {
        $admin = User::where('email', 'admin@atmz.com')->first();

        $response = $this->actingAs($admin)->get('/usuarios');

        $response->assertStatus(200);
    }

    #[Test]
    public function usuario_comum_nao_pode_acessar_listagem_de_usuarios()
    {
        $user = User::where('email', 'user@atmz.com')->first();

        $response = $this->actingAs($user)->get('/usuarios');

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_pode_criar_usuario()
    {
        $admin = User::where('email', 'admin@atmz.com')->first();

        $response = $this->actingAs($admin)->post('/usuarios', [
            'name' => 'Novo Usuário',
            'email' => 'novo@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'usuario',
        ]);

        $response->assertRedirect('/usuarios');
        $this->assertDatabaseHas('users', [
            'name' => 'Novo Usuário',
            'email' => 'novo@example.com',
            'role' => 'usuario',
        ]);
    }

    #[Test]
    public function usuario_comum_nao_pode_criar_usuario()
    {
        $user = User::where('email', 'user@atmz.com')->first();

        $response = $this->actingAs($user)->post('/usuarios', [
            'name' => 'Novo Usuário',
            'email' => 'novo@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'usuario',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('users', [
            'email' => 'novo@example.com',
        ]);
    }

    #[Test]
    public function email_deve_ser_unico()
    {
        $admin = User::where('email', 'admin@atmz.com')->first();

        $response = $this->actingAs($admin)->post('/usuarios', [
            'name' => 'Outro Admin',
            'email' => 'admin@atmz.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'usuario',
        ]);

        $response->assertSessionHasErrors('email');
    }
}
