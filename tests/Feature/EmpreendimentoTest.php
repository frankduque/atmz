<?php

use App\Models\User;
use App\Models\Empreendimento;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\UserSeeder::class);
    $this->admin = User::where('email', 'admin@atmz.com')->first();
    $this->user = User::where('email', 'user@atmz.com')->first();
});

test('usuario comum nao pode acessar empreendimentos', function () {
    $response = $this->actingAs($this->user)
        ->get(route('empreendimentos.index'));

    $response->assertStatus(403);
});

test('admin pode acessar empreendimentos index', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.index'));

    $response->assertStatus(200);
});

test('empreendimentos create screen can be rendered', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.create'));

    $response->assertStatus(200);
});

test('empreendimentos show screen can be rendered', function () {
    $empreendimento = Empreendimento::factory()->create();

    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.show', $empreendimento));

    $response->assertStatus(200);
});

test('empreendimentos edit screen can be rendered', function () {
    $empreendimento = Empreendimento::factory()->create();

    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.edit', $empreendimento));

    $response->assertStatus(200);
});

test('admin pode visualizar lista de empreendimentos', function () {
    $empreendimentos = Empreendimento::factory()->count(3)->create();

    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.index'));

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Empreendimentos/Index')
            ->has('empreendimentos.data', 3)
        );
});

test('usuário não autenticado não pode visualizar empreendimentos', function () {
    $response = $this->get(route('empreendimentos.index'));

    $response->assertRedirect(route('login'));
});

test('admin pode visualizar formulário de criação', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.create'));

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Empreendimentos/Create')
        );
});

test('admin pode criar empreendimento', function () {
    $dados = [
        'nome' => 'Edifício Teste',
        'endereco' => 'Rua Teste, 123',
        'cidade' => 'São Paulo',
        'estado' => 'SP',
        'cep' => '01234-567',
        'descricao' => 'Descrição do empreendimento teste',
        'ativo' => true,
    ];

    $response = $this->actingAs($this->admin)
        ->post(route('empreendimentos.store'), $dados);

    $response->assertRedirect(route('empreendimentos.index'));

    $this->assertDatabaseHas('empreendimentos', [
        'nome' => 'Edifício Teste',
        'cidade' => 'São Paulo',
        'estado' => 'SP',
    ]);
});

test('validação falha ao criar empreendimento sem dados obrigatórios', function () {
    $response = $this->actingAs($this->admin)
        ->post(route('empreendimentos.store'), []);

    $response->assertSessionHasErrors(['nome', 'endereco', 'cidade', 'estado', 'cep']);
});

test('admin pode visualizar detalhes de empreendimento', function () {
    $empreendimento = Empreendimento::factory()->create();

    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.show', $empreendimento));

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Empreendimentos/Show')
            ->has('empreendimento')
            ->where('empreendimento.id', $empreendimento->id)
        );
});

test('admin pode visualizar formulário de edição', function () {
    $empreendimento = Empreendimento::factory()->create();

    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.edit', $empreendimento));

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Empreendimentos/Edit')
            ->has('empreendimento')
            ->where('empreendimento.id', $empreendimento->id)
        );
});

test('admin pode atualizar empreendimento', function () {
    $empreendimento = Empreendimento::factory()->create();

    $dadosAtualizados = [
        'nome' => 'Edifício Atualizado',
        'endereco' => $empreendimento->endereco,
        'cidade' => $empreendimento->cidade,
        'estado' => $empreendimento->estado,
        'cep' => $empreendimento->cep,
        'ativo' => true,
    ];

    $response = $this->actingAs($this->admin)
        ->put(route('empreendimentos.update', $empreendimento), $dadosAtualizados);

    $response->assertRedirect(route('empreendimentos.index'));

    $this->assertDatabaseHas('empreendimentos', [
        'id' => $empreendimento->id,
        'nome' => 'Edifício Atualizado',
    ]);
});

test('admin pode excluir empreendimento', function () {
    $empreendimento = Empreendimento::factory()->create();

    $response = $this->actingAs($this->admin)
        ->delete(route('empreendimentos.destroy', $empreendimento));

    $response->assertRedirect(route('empreendimentos.index'));

    $this->assertSoftDeleted('empreendimentos', [
        'id' => $empreendimento->id,
    ]);
});

test('busca filtra empreendimentos por nome', function () {
    Empreendimento::factory()->create(['nome' => 'Edifício Alpha']);
    Empreendimento::factory()->create(['nome' => 'Edifício Beta']);
    Empreendimento::factory()->create(['nome' => 'Residencial Gamma']);

    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.index', ['search' => 'Edifício']));

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Empreendimentos/Index')
            ->has('empreendimentos.data', 2)
        );
});

test('busca filtra empreendimentos por cidade', function () {
    Empreendimento::factory()->create(['cidade' => 'São Paulo']);
    Empreendimento::factory()->create(['cidade' => 'Rio de Janeiro']);

    $response = $this->actingAs($this->admin)
        ->get(route('empreendimentos.index', ['search' => 'São Paulo']));

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Empreendimentos/Index')
            ->has('empreendimentos.data', 1)
        );
});

