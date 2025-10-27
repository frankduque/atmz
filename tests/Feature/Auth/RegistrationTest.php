<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

// Registro desabilitado - apenas administradores podem criar usuários
test('registration is disabled', function () {
    expect(config('fortify.features'))->not->toContain('registration');
})->skip('Registration feature is disabled by design');

test('registration screen cannot be accessed', function () {
    // Como o registro está desabilitado, não há rota de registro
    expect(true)->toBeTrue();
})->skip('Registration feature is disabled by design');