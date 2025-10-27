<?php

namespace App\Services\Relay;

interface RelayDriverInterface
{
    public function testConnection(): bool;
    
    public function turnOn(int $port): bool;
    
    public function turnOff(int $port): bool;
    
    public function getStatus(int $port): ?bool;
    
    public function getAllStatus(): array;
    
    public function flash(int $port, int $durationMs = 500): bool;
    
    public function pulse(int $port, int $durationSeconds = 3): bool;
    
    public function blink(int $port, int $repeats = 5, int $intervalMs = 300): bool;
    
    public function executeAction(int $port, string $action, array $params = []): bool;
}
