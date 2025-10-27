<?php

use App\Models\Painel;
use App\Models\User;
use App\Models\Widget;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'administrador']);
    $this->user = User::factory()->create(['role' => 'usuario']);
    $this->otherUser = User::factory()->create(['role' => 'usuario']);
});

describe('Painéis - Permissões de Admin', function () {
    test('admin pode criar painéis', function () {
        $this->actingAs($this->admin)
            ->post(route('paineis.store'), [
                'nome' => 'Painel Admin',
                'padrao' => false,
            ])
            ->assertRedirect(route('paineis.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('paineis', ['nome' => 'Painel Admin']);
    });

    test('admin pode deletar painéis', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);

        $this->actingAs($this->admin)
            ->delete(route('paineis.destroy', $painel))
            ->assertRedirect(route('paineis.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('paineis', ['id' => $painel->id]);
    });

    test('admin pode acessar todos os painéis', function () {
        $painel1 = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel2 = Painel::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('paineis.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Paineis/Index')
            ->has('paineis', 2)
        );
    });

    test('admin pode adicionar usuários aos painéis', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);

        $this->actingAs($this->admin)
            ->post(route('paineis.usuarios.add', $painel), [
                'user_id' => $this->user->id,
            ])
            ->assertSessionHas('success');

        $this->assertTrue($painel->fresh()->users->contains($this->user->id));
    });

    test('admin pode remover usuários dos painéis', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel->users()->attach($this->user->id);

        $this->actingAs($this->admin)
            ->delete(route('paineis.usuarios.remove', [$painel, $this->user->id]))
            ->assertSessionHas('success');

        $this->assertFalse($painel->fresh()->users->contains($this->user->id));
    });

    test('admin pode criar widgets em qualquer painel', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);

        $this->actingAs($this->admin)
            ->post(route('widgets.store', $painel), [
                'tipo_widget' => 'texto',
                'largura' => 6,
                'configuracao' => ['texto' => 'Teste'],
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('widgets', [
            'painel_id' => $painel->id,
            'tipo_widget' => 'texto',
        ]);
    });

    test('admin pode deletar widgets', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $widget = Widget::factory()->create(['painel_id' => $painel->id]);

        $this->actingAs($this->admin)
            ->delete(route('widgets.destroy', $widget))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('widgets', ['id' => $widget->id]);
    });
});

describe('Painéis - Permissões de Usuário Comum', function () {
    test('usuário comum não pode criar painéis', function () {
        $this->actingAs($this->user)
            ->post(route('paineis.store'), [
                'nome' => 'Painel Usuário',
                'padrao' => false,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('paineis', ['nome' => 'Painel Usuário']);
    });

    test('usuário comum não pode deletar painéis', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel->users()->attach($this->user->id);

        $this->actingAs($this->user)
            ->delete(route('paineis.destroy', $painel))
            ->assertForbidden();

        $this->assertDatabaseHas('paineis', ['id' => $painel->id]);
    });

    test('usuário comum só vê painéis aos quais foi adicionado', function () {
        $painelComAcesso = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painelComAcesso->users()->attach($this->user->id);

        $painelSemAcesso = Painel::factory()->create(['user_id' => $this->admin->id]);

        $response = $this->actingAs($this->user)
            ->get(route('paineis.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Paineis/Index')
            ->has('paineis', 1)
            ->where('paineis.0.id', $painelComAcesso->id)
        );
    });

    test('usuário comum não pode acessar painel ao qual não foi adicionado', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);

        $this->actingAs($this->user)
            ->get(route('paineis.show', $painel))
            ->assertForbidden();
    });

    test('usuário comum pode acessar painel ao qual foi adicionado', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel->users()->attach($this->user->id);

        $this->actingAs($this->user)
            ->get(route('paineis.show', $painel))
            ->assertOk();
    });

    test('usuário comum não pode criar widgets', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel->users()->attach($this->user->id);

        $this->actingAs($this->user)
            ->post(route('widgets.store', $painel), [
                'tipo_widget' => 'texto',
                'largura' => 6,
                'configuracao' => ['texto' => 'Teste'],
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('widgets', [
            'painel_id' => $painel->id,
            'tipo_widget' => 'texto',
        ]);
    });

    test('usuário comum não pode deletar widgets', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel->users()->attach($this->user->id);
        $widget = Widget::factory()->create(['painel_id' => $painel->id]);

        $this->actingAs($this->user)
            ->delete(route('widgets.destroy', $widget))
            ->assertForbidden();

        $this->assertDatabaseHas('widgets', ['id' => $widget->id]);
    });

    test('usuário comum não pode atualizar widgets', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel->users()->attach($this->user->id);
        $widget = Widget::factory()->create([
            'painel_id' => $painel->id,
            'posicao_x' => 0,
        ]);

        $this->actingAs($this->user)
            ->patch(route('widgets.update', $widget), [
                'posicao_x' => 5,
            ])
            ->assertForbidden();

        $this->assertEquals(0, $widget->fresh()->posicao_x);
    });

    test('usuário comum pode executar comandos em painéis aos quais tem acesso', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painel->users()->attach($this->user->id);

        $empreendimento = \App\Models\Empreendimento::factory()->create();
        $rele = \App\Models\Rele::factory()->create([
            'empreendimento_id' => $empreendimento->id,
            'driver' => 'sr201',
            'numero_portas' => 8,
        ]);
        
        $response = $this->actingAs($this->user)
            ->post(route('paineis.executar', $painel), [
                'rele_id' => $rele->id,
                'porta' => 1,
                'acao' => 'ligar',
                'parametros' => [],
            ]);
        
        // Pode retornar 422 ou 500 se não conseguir conectar ao relé (ok para teste)
        // O importante é não retornar 403 (forbidden)
        $this->assertNotEquals(403, $response->status());
    });

    test('usuário comum não pode executar comandos em painéis aos quais não tem acesso', function () {
        $painel = Painel::factory()->create(['user_id' => $this->admin->id]);
        
        $empreendimento = \App\Models\Empreendimento::factory()->create();
        $rele = \App\Models\Rele::factory()->create([
            'empreendimento_id' => $empreendimento->id,
            'driver' => 'sr201',
            'numero_portas' => 8,
        ]);

        $this->actingAs($this->user)
            ->post(route('paineis.executar', $painel), [
                'rele_id' => $rele->id,
                'porta' => 1,
                'acao' => 'ligar',
                'parametros' => [],
            ])
            ->assertForbidden();
    });
});

describe('Painéis - Isolamento entre Usuários', function () {
    test('usuário não pode acessar painéis de outros usuários', function () {
        $painelOutroUsuario = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painelOutroUsuario->users()->attach($this->otherUser->id);

        $this->actingAs($this->user)
            ->get(route('paineis.show', $painelOutroUsuario))
            ->assertForbidden();
    });

    test('usuário não vê painéis de outros usuários na listagem', function () {
        $meuPainel = Painel::factory()->create(['user_id' => $this->admin->id]);
        $meuPainel->users()->attach($this->user->id);

        $painelOutroUsuario = Painel::factory()->create(['user_id' => $this->admin->id]);
        $painelOutroUsuario->users()->attach($this->otherUser->id);

        $response = $this->actingAs($this->user)
            ->get(route('paineis.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Paineis/Index')
            ->has('paineis', 1)
            ->where('paineis.0.id', $meuPainel->id)
        );
    });
});
