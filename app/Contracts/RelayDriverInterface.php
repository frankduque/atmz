<?php

namespace App\Contracts;

interface RelayDriverInterface
{
    /**
     * Liga um canal específico
     */
    public function ligar(int $canal): bool;

    /**
     * Desliga um canal específico
     */
    public function desligar(int $canal): bool;

    /**
     * Pulsa um canal (liga e desliga rapidamente)
     */
    public function pulsar(int $canal, int $duracao = 500): bool;

    /**
     * Piscar um canal (ligar e desligar repetidamente)
     */
    public function piscar(int $canal, int $repeticoes = 5, int $intervalo = 500): bool;

    /**
     * Obtém o status de todos os canais
     */
    public function obterStatus(): array;

    /**
     * Testa a conexão com o dispositivo
     */
    public function testarConexao(): bool;

    /**
     * Obtém o número de canais suportados
     */
    public function getNumeroCanais(): int;
}
