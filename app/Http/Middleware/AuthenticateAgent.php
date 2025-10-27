<?php

namespace App\Http\Middleware;

use App\Models\LocalAgent;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAgent
{
    /**
     * Autenticar agente via Bearer Token
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'error' => 'Token não fornecido',
                'message' => 'Authorization Bearer token is required'
            ], 401);
        }

        // Buscar agente pelo token (considerando que está criptografado)
        $agente = LocalAgent::all()->first(function ($agent) use ($token) {
            return $agent->token === $token;
        });

        if (!$agente) {
            return response()->json([
                'error' => 'Token inválido',
                'message' => 'Invalid or expired token'
            ], 401);
        }

        // Adicionar agente autenticado na request
        $request->merge(['authenticated_agent' => $agente]);

        return $next($request);
    }
}
