<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgentVersion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'version',
        'changelog',
        'active',
        'released_at',
        'checksum_linux_amd64',
        'checksum_linux_arm64',
        'checksum_windows_amd64',
        'checksum_darwin_amd64',
        'checksum_darwin_arm64',
        'size_linux_amd64',
        'size_linux_arm64',
        'size_windows_amd64',
        'size_darwin_amd64',
        'size_darwin_arm64',
    ];

    protected $casts = [
        'active' => 'boolean',
        'released_at' => 'date',
    ];

    /**
     * Retorna a versão ativa mais recente
     */
    public static function latest()
    {
        return self::where('active', true)
            ->orderBy('released_at', 'desc')
            ->first();
    }

    /**
     * Caminho base para os binários
     */
    public function getBinaryPath(string $platform): string
    {
        return "agent-binaries/v{$this->version}/atmz-agent-{$platform}";
    }

    /**
     * Verifica se o binário existe
     */
    public function hasBinary(string $platform): bool
    {
        // Verificar se existe no checksum (indica que foi feito upload)
        $checksumField = "checksum_" . str_replace('-', '_', $platform);
        return !empty($this->$checksumField);
    }

    /**
     * Retorna o checksum para uma plataforma
     */
    public function getChecksum(string $platform): ?string
    {
        $field = "checksum_" . str_replace('-', '_', $platform);
        return $this->$field;
    }

    /**
     * Retorna o tamanho para uma plataforma
     */
    public function getSize(string $platform): ?int
    {
        $field = "size_" . str_replace('-', '_', $platform);
        return $this->$field;
    }

    /**
     * Plataformas suportadas
     */
    public static function platforms(): array
    {
        return [
            'linux-amd64' => ['name' => 'Linux (64-bit)', 'icon' => '🐧'],
            'linux-arm64' => ['name' => 'Linux ARM (64-bit)', 'icon' => '🔧'],
            'windows-amd64' => ['name' => 'Windows (64-bit)', 'icon' => '🪟'],
            'darwin-amd64' => ['name' => 'macOS (Intel)', 'icon' => '🍎'],
            'darwin-arm64' => ['name' => 'macOS (Apple Silicon)', 'icon' => '🍎'],
        ];
    }
}
