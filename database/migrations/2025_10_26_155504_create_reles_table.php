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
        Schema::create('reles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empreendimento_id')->constrained('empreendimentos')->onDelete('cascade');
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('driver')->default('sr201'); // sr201, sonoff, shelly, etc
            $table->json('configuracao'); // IP, porta, credenciais específicas do driver
            $table->integer('numero_portas')->default(8); // quantidade de canais/portas do dispositivo
            $table->enum('status', ['online', 'offline', 'erro'])->default('offline');
            $table->timestamp('ultima_comunicacao')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reles');
    }
};
