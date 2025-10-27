<?php

use App\Http\Controllers\AgentVersionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnterpriseController;
use App\Http\Controllers\PainelController;
use App\Http\Controllers\ReleController;
use App\Http\Controllers\WidgetController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('painel');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard principal
    Route::get('painel', [DashboardController::class, 'home'])->name('painel');

    // Gerenciamento de Empreendimentos (apenas administradores)
    Route::middleware(['admin'])->group(function () {
        Route::resource('empreendimentos', EnterpriseController::class)->parameters([
            'empreendimentos' => 'empreendimento'
        ])->names([
            'index' => 'empreendimentos.index',
            'create' => 'empreendimentos.create',
            'store' => 'empreendimentos.store',
            'show' => 'empreendimentos.show',
            'edit' => 'empreendimentos.edit',
            'update' => 'empreendimentos.update',
            'destroy' => 'empreendimentos.destroy',
        ]);

        // Abas do empreendimento
        Route::prefix('empreendimentos/{empreendimento}')->group(function () {
            Route::get('reles', [ReleController::class, 'index'])->name('empreendimentos.reles.index');
        });
    });

    // Dashboards customizáveis (Painéis)
    Route::resource('paineis', \App\Http\Controllers\PainelController::class)->parameters([
        'paineis' => 'painel'
    ])->names([
        'index' => 'paineis.index',
        'create' => 'paineis.create',
        'store' => 'paineis.store',
        'show' => 'paineis.show',
        'edit' => 'paineis.edit',
        'update' => 'paineis.update',
        'destroy' => 'paineis.destroy',
    ]);

    // Widgets dos painéis
    Route::post('paineis/{painel}/widgets', [WidgetController::class, 'store'])
        ->name('widgets.store');
    Route::patch('widgets/{widget}', [WidgetController::class, 'update'])
        ->name('widgets.update');
    Route::delete('widgets/{widget}', [WidgetController::class, 'destroy'])
        ->name('widgets.destroy');

    // Gerenciamento de usuários dos painéis (apenas admin)
    Route::middleware(['admin'])->group(function () {
        Route::post('paineis/{painel}/usuarios', [PainelController::class, 'addUser'])
            ->name('paineis.usuarios.add');
        Route::delete('paineis/{painel}/usuarios/{user}', [PainelController::class, 'removeUser'])
            ->name('paineis.usuarios.remove');
    });

    // Executar comandos via painel (usuários com acesso ao painel)
    Route::post('paineis/{painel}/executar', [PainelController::class, 'executarComando'])
        ->name('paineis.executar');

    // Gerenciamento de Relés (contexto do empreendimento - apenas administradores)
    Route::middleware(['admin'])->prefix('empreendimentos/{empreendimento}')->group(function () {
        Route::get('reles/create', [ReleController::class, 'create'])->name('empreendimentos.reles.create');
        Route::post('reles/testar-conexao', [ReleController::class, 'testarConexao'])->name('empreendimentos.reles.testar-conexao');
        Route::post('reles', [ReleController::class, 'store'])->name('empreendimentos.reles.store');
        Route::get('reles/{rele}', [ReleController::class, 'show'])->name('empreendimentos.reles.show');
        Route::get('reles/{rele}/edit', [ReleController::class, 'edit'])->name('empreendimentos.reles.edit');
        Route::patch('reles/{rele}', [ReleController::class, 'update'])->name('empreendimentos.reles.update');
        Route::delete('reles/{rele}', [ReleController::class, 'destroy'])->name('empreendimentos.reles.destroy');
        Route::post('reles/{rele}/executar', [ReleController::class, 'executarComando'])->name('empreendimentos.reles.executar');
        
        // Dispositivos dos canais do relê
        Route::post('reles/{rele}/dispositivos', [ReleController::class, 'storeDispositivo'])->name('empreendimentos.reles.dispositivos.store');
        Route::put('reles/{rele}/dispositivos/{dispositivo}', [ReleController::class, 'updateDispositivo'])->name('empreendimentos.reles.dispositivos.update');
        Route::delete('reles/{rele}/dispositivos/{dispositivo}', [ReleController::class, 'destroyDispositivo'])->name('empreendimentos.reles.dispositivos.destroy');
        
        // Obter status dos canais
        Route::get('reles/{rele}/status', [ReleController::class, 'obterStatus'])->name('empreendimentos.reles.status');
    });

    // Gerenciamento de Usuários (apenas para administradores)
    Route::middleware(['admin'])->group(function () {
        Route::resource('usuarios', \App\Http\Controllers\UserController::class)->parameters([
            'usuarios' => 'user'
        ])->names([
            'index' => 'users.index',
            'create' => 'users.create',
            'store' => 'users.store',
            'edit' => 'users.edit',
            'update' => 'users.update',
            'destroy' => 'users.destroy',
        ]);
    });
});

require __DIR__.'/settings.php';
