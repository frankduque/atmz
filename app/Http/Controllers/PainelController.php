<?php

namespace App\Http\Controllers;

use App\Models\Painel;
use App\Models\Rele;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PainelController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $user = auth()->user();
        
        if ($user->isAdmin()) {
            // Admin vê todos os painéis
            $paineis = Painel::withCount('widgets')->latest()->get();
        } else {
            // Usuário comum vê apenas painéis onde foi adicionado
            $paineis = $user->paineis()->withCount('widgets')->latest()->get();
        }

        return Inertia::render('Paineis/Index', [
            'paineis' => $paineis,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function create()
    {
        $this->authorize('isAdmin');
        
        return Inertia::render('Paineis/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('isAdmin');
        
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'padrao' => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();

        if ($validated['padrao'] ?? false) {
            Painel::where('user_id', auth()->id())->update(['padrao' => false]);
        }

        Painel::create($validated);

        return redirect()->route('paineis.index')
            ->with('success', 'Painel criado com sucesso!');
    }

    public function show(Painel $painel)
    {
        // Verificar permissão
        $user = auth()->user();
        if (!$user->isAdmin() && !$painel->users->contains($user->id)) {
            abort(403, 'Você não tem permissão para acessar este painel.');
        }
        
        $painel->load(['widgets', 'users:id,name,email']);
        
        // Buscar todos os relês disponíveis com seus empreendimentos e dispositivos
        // Apenas relês configurados (com driver definido)
        $reles = Rele::with([
            'empreendimento:id,nome',
            'dispositivos:id,rele_id,porta,nome,acoes_disponiveis'
        ])
            ->whereNotNull('driver')
            ->select('id', 'nome', 'driver', 'numero_portas', 'empreendimento_id', 'configuracao', 'status')
            ->get()
            ->map(function ($rele) {
                // Obter status de todos os canais
                $status = $rele->obterStatus();
                
                return [
                    'id' => $rele->id,
                    'nome' => $rele->nome,
                    'numero_canais' => $rele->numero_portas,
                    'empreendimento' => $rele->empreendimento,
                    'dispositivos' => $rele->dispositivos,
                    'status_canais' => $status, // Array com status de cada canal
                    'status_conexao' => $rele->status, // online, offline, erro
                ];
            });

        // Buscar todos os usuários para o select (apenas para admin)
        $usuarios = $user->isAdmin() 
            ? \App\Models\User::select('id', 'name', 'email')->where('role', '!=', 'administrador')->get()
            : [];

        return Inertia::render('Paineis/Show', [
            'painel' => $painel,
            'reles' => $reles,
            'usuarios' => $usuarios,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function destroy(Painel $painel)
    {
        $this->authorize('isAdmin');
        
        $painel->delete();

        return redirect()->route('paineis.index')
            ->with('success', 'Painel excluído com sucesso!');
    }

    public function addUser(Request $request, Painel $painel)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        if (!$painel->users->contains($validated['user_id'])) {
            $painel->users()->attach($validated['user_id']);
        }

        return back()->with('success', 'Usuário adicionado ao painel com sucesso!');
    }

    public function removeUser(Painel $painel, $userId)
    {
        $painel->users()->detach($userId);

        return back()->with('success', 'Usuário removido do painel com sucesso!');
    }

    public function executarComando(Request $request, Painel $painel)
    {
        // Verificar permissão
        $user = auth()->user();
        if (!$user->isAdmin() && !$painel->users->contains($user->id)) {
            abort(403, 'Você não tem permissão para executar comandos neste painel.');
        }

        $validated = $request->validate([
            'rele_id' => 'required|exists:reles,id',
            'porta' => 'required|integer|min:1',
            'acao' => 'required|string',
            'parametros' => 'nullable|array',
        ]);

        $rele = Rele::findOrFail($validated['rele_id']);
        
        try {
            $resultado = $rele->executarAcao(
                $validated['porta'],
                $validated['acao'],
                $validated['parametros'] ?? []
            );

            if ($resultado) {
                return response()->json([
                    'success' => true,
                    'message' => 'Comando executado com sucesso!',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Falha ao executar comando.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro: ' . $e->getMessage(),
            ], 500);
        }
    }
}
