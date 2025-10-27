<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('acoes_dispositivo', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique(); // 'on', 'off', 'flash', 'pulse', 'blink', 'timed', 'alternate'
            $table->string('nome'); // "Ligar", "Desligar", "Flash", etc
            $table->text('descricao')->nullable();
            $table->boolean('requer_configuracao')->default(false); // se precisa de parâmetros
            $table->json('parametros')->nullable(); // schema dos parâmetros necessários
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acoes_dispositivo');
    }
};
