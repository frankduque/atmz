<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Versão Mais Recente do Agente
    |--------------------------------------------------------------------------
    |
    | Versão mais recente do agente local disponível para download.
    | Formato: Semantic Versioning (MAJOR.MINOR.PATCH)
    |
    */

    'latest_version' => env('AGENT_LATEST_VERSION', '1.0.0'),

    /*
    |--------------------------------------------------------------------------
    | URL de Download do Agente
    |--------------------------------------------------------------------------
    |
    | URL base para download dos binários do agente por plataforma.
    |
    */

    'download_url' => env('AGENT_DOWNLOAD_URL', 'https://github.com/seu-repo/atmz-agent/releases/download'),

    /*
    |--------------------------------------------------------------------------
    | Changelog / Release Notes
    |--------------------------------------------------------------------------
    |
    | URL para o changelog ou notas de versão.
    |
    */

    'changelog_url' => env('AGENT_CHANGELOG_URL', 'https://github.com/seu-repo/atmz-agent/releases'),

    /*
    |--------------------------------------------------------------------------
    | Plataformas Suportadas
    |--------------------------------------------------------------------------
    |
    | Lista de plataformas para as quais o agente está disponível.
    |
    */

    'platforms' => [
        'linux-amd64' => [
            'name' => 'Linux (64-bit)',
            'filename' => 'atmz-agent-linux-amd64',
            'icon' => '🐧',
        ],
        'linux-arm64' => [
            'name' => 'Linux ARM (64-bit)',
            'filename' => 'atmz-agent-linux-arm64',
            'icon' => '🔧',
        ],
        'windows-amd64' => [
            'name' => 'Windows (64-bit)',
            'filename' => 'atmz-agent-windows-amd64.exe',
            'icon' => '🪟',
        ],
        'darwin-amd64' => [
            'name' => 'macOS (Intel)',
            'filename' => 'atmz-agent-darwin-amd64',
            'icon' => '🍎',
        ],
        'darwin-arm64' => [
            'name' => 'macOS (Apple Silicon)',
            'filename' => 'atmz-agent-darwin-arm64',
            'icon' => '🍎',
        ],
    ],

];
