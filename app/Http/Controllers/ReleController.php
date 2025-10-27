<?php

namespace App\Http\Controllers;

use App\Models\Empreendimento;
use App\Models\Rele;
use App\Models\ReleDispositivo;
use App\Services\Relay\RelayFactory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReleController extends Controller
{
    public function index(Request $request, Empreendimento $empreendimento)
    {
        $empreendimento->load(['reles' => function ($query) use ($request) {
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('nome', 'like', "%{$search}%");
            }
        }]);

        // Testa conexão de cada relê para atualizar status
        foreach ($empreendimento->reles as $rele) {
            try {
                $rele->testarConexao();
                $rele->refresh(); // Recarrega para pegar status atualizado
            } catch (\Exception $e) {
                // Se falhar, continua sem quebrar a página
            }
        }

        return Inertia::render('Empreendimentos/Reles/Index', [
            'empreendimento' => $empreendimento,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(Empreendimento $empreendimento)
    {
        return Inertia::render('Empreendimentos/Reles/Create', [
            'empreendimento' => $empreendimento,
            'tipos' => RelayFactory::getTiposDisponiveis(),
        ]);
    }

    public function store(Request $request, Empreendimento $empreendimento)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'driver' => 'required|string',
            'configuracao' => 'required|array',
            'configuracao.ip' => 'required|ip',
            'configuracao.porta' => 'required|integer|min:1|max:65535',
            'numero_portas' => 'required|integer|min:1|max:16',
        ]);

        $validated['empreendimento_id'] = $empreendimento->id;

        $rele = Rele::create($validated);

        // Redireciona para a página do relê criado ao invés do index
        return redirect()->route('empreendimentos.reles.show', [$empreendimento, $rele])
            ->with('success', 'Relé criado com sucesso!');
    }

    public function edit(Empreendimento $empreendimento, Rele $rele)
    {
        return Inertia::render('Empreendimentos/Reles/Edit', [
            'empreendimento' => $empreendimento,
            'rele' => $rele,
            'tipos' => RelayFactory::getTiposDisponiveis(),
        ]);
    }

    public function show(Empreendimento $empreendimento, Rele $rele)
    {
        // Atualizar status ao carregar a página
        try {
            $rele->testarConexao();
        } catch (\Exception $e) {
            // Se falhar, não quebra a página
        }

        $rele = $rele->fresh(['dispositivos']); // Recarrega com dispositivos

        return Inertia::render('Empreendimentos/Reles/Show', [
            'empreendimento' => $empreendimento,
            'rele' => $rele,
        ]);
    }

    public function update(Request $request, Empreendimento $empreendimento, Rele $rele)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'driver' => 'required|string',
            'configuracao' => 'required|array',
            'configuracao.ip' => 'required|ip',
            'configuracao.porta' => 'required|integer|min:1|max:65535',
            'numero_portas' => 'required|integer|min:1|max:16',
        ]);

        $rele->update($validated);

        return redirect()->route('empreendimentos.reles.show', [$empreendimento, $rele])
            ->with('success', 'Relé atualizado com sucesso!');
    }

    public function destroy(Empreendimento $empreendimento, Rele $rele)
    {
        $rele->delete();

        return redirect()->route('empreendimentos.reles.index', $empreendimento)
            ->with('success', 'Relé excluído com sucesso!');
    }

    public function executarComando(Request $request, Empreendimento $empreendimento, Rele $rele)
    {
        $validated = $request->validate([
            'acao' => 'required|in:on,off,flash,pulse,blink',
            'canal' => 'required|integer|min:1',
            'parametros' => 'nullable|array',
        ]);

        $resultado = $rele->executarAcao(
            $validated['canal'],
            $validated['acao'],
            $validated['parametros'] ?? []
        );

        if ($resultado) {
            return back()->with('success', 'Comando executado com sucesso!');
        }

        return back()->with('error', 'Falha ao executar comando!');
    }

    public function testarConexao(Request $request, Empreendimento $empreendimento)
    {
        $validated = $request->validate([
            'driver' => 'required|string',
            'ip' => 'required|ip',
            'porta' => 'required|integer|min:1|max:65535',
        ]);

        try {
            $driver = \App\Services\Relay\RelayDriverFactory::createFromConfig($validated['driver'], [
                'ip' => $validated['ip'],
                'porta' => $validated['porta'],
            ]);

            $resultado = $driver->testConnection();

            return response()->json([
                'success' => $resultado,
                'message' => $resultado ? 'Conexão estabelecida!' : 'Falha ao conectar no relê!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro: ' . $e->getMessage()
            ], 500);
        }
    }

    public function storeDispositivo(Request $request, Empreendimento $empreendimento, Rele $rele)
    {
        $validated = $request->validate([
            'porta' => 'required|integer|min:1|max:' . $rele->numero_portas,
            'nome' => 'required|string|max:255',
            'tipo' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'acoes_disponiveis' => 'required|array|min:1',
            'acoes_disponiveis.*' => 'string|in:on,off,flash,pulse,blink',
            'configuracao_acoes' => 'nullable|array',
        ]);

        // Verificar se já existe dispositivo nesta porta
        $existente = $rele->dispositivos()->where('porta', $validated['porta'])->first();
        if ($existente) {
            return back()->with('error', 'Já existe um dispositivo configurado neste canal!');
        }

        $rele->dispositivos()->create($validated);

        return back()->with('success', 'Dispositivo configurado com sucesso!');
    }

    public function updateDispositivo(Request $request, Empreendimento $empreendimento, Rele $rele, ReleDispositivo $dispositivo)
    {
        $validated = $request->validate([
            'porta' => 'required|integer|min:1|max:' . $rele->numero_portas,
            'nome' => 'required|string|max:255',
            'tipo' => 'required|string|max:100',
            'descricao' => 'nullable|string',
            'acoes_disponiveis' => 'required|array|min:1',
            'acoes_disponiveis.*' => 'string|in:on,off,flash,pulse,blink',
            'configuracao_acoes' => 'nullable|array',
        ]);

        $dispositivo->update($validated);

        return back()->with('success', 'Dispositivo atualizado com sucesso!');
    }

    public function destroyDispositivo(Empreendimento $empreendimento, Rele $rele, ReleDispositivo $dispositivo)
    {
        $dispositivo->delete();

        return back()->with('success', 'Dispositivo removido com sucesso!');
    }

    public function obterStatus(Empreendimento $empreendimento, Rele $rele)
    {
        try {
            $status = $rele->obterStatus();
            
            return response()->json([
                'success' => true,
                'status' => $status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

