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
        Schema::create('rele_dispositivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rele_id')->constrained('reles')->onDelete('cascade');
            $table->integer('porta'); // canal/porta do relê (1-8)
            $table->string('nome'); // ex: "Sirene Principal", "Portão Garagem"
            $table->string('tipo'); // ex: "sirene", "portao", "lampada", "fechadura"
            $table->text('descricao')->nullable();
            $table->json('acoes_disponiveis'); // array de códigos de ações habilitadas
            $table->json('configuracao_acoes')->nullable(); // configurações específicas das ações
            $table->timestamps();
            
            // Garante que não teremos 2 dispositivos na mesma porta do mesmo relê
            $table->unique(['rele_id', 'porta']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rele_dispositivos');
    }
};
