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
        Schema::create('rele_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rele_id')->constrained('reles')->onDelete('cascade');
            $table->foreignId('rele_dispositivo_id')->nullable()->constrained('rele_dispositivos')->onDelete('set null');
            $table->string('acao'); // 'on', 'off', 'flash', 'pulse', 'blink', etc
            $table->integer('porta');
            $table->foreignId('usuario_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('resultado', ['success', 'error'])->default('success');
            $table->text('mensagem')->nullable();
            $table->json('parametros')->nullable(); // parâmetros da ação executada
            $table->timestamp('created_at');
            
            // Índices para queries de auditoria
            $table->index(['rele_id', 'created_at']);
            $table->index(['usuario_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rele_logs');
    }
};
