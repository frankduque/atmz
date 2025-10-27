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
        Schema::create('widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('painel_id')->constrained('paineis')->cascadeOnDelete();
            $table->string('tipo_widget'); // controle_rele, feed_camera, grid_status, grafico
            $table->unsignedBigInteger('entidade_id')->nullable(); // rele_id ou camera_id
            $table->integer('posicao_x')->default(0);
            $table->integer('posicao_y')->default(0);
            $table->integer('largura')->default(1);
            $table->integer('altura')->default(1);
            $table->json('configuracao')->nullable(); // cores, título, etc
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widgets');
    }
};
