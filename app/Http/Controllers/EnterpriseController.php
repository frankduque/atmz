<?php

namespace App\Http\Controllers;

use App\Models\Empreendimento;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnterpriseController extends Controller
{
    public function index(Request $request)
    {
        $query = Empreendimento::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('descricao', 'like', "%{$search}%")
                  ->orWhere('cidade', 'like', "%{$search}%")
                  ->orWhere('estado', 'like', "%{$search}%");
            });
        }

        $empreendimentos = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Empreendimentos/Index', [
            'empreendimentos' => $empreendimentos,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Empreendimentos/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'endereco' => 'required|string',
            'cidade' => 'required|string',
            'estado' => 'required|string|max:2',
            'cep' => 'required|string',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        Empreendimento::create($validated);

        return redirect()->route('empreendimentos.index')
            ->with('success', 'Empreendimento criado com sucesso!');
    }

    public function show(Empreendimento $empreendimento)
    {
        $empreendimento->loadCount(['reles']);

        return Inertia::render('Empreendimentos/Show', [
            'empreendimento' => $empreendimento,
        ]);
    }



    public function edit(Empreendimento $empreendimento)
    {
        return Inertia::render('Empreendimentos/Edit', [
            'empreendimento' => $empreendimento,
        ]);
    }

    public function update(Request $request, Empreendimento $empreendimento)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'endereco' => 'required|string',
            'cidade' => 'required|string',
            'estado' => 'required|string|max:2',
            'cep' => 'required|string',
            'descricao' => 'nullable|string',
            'ativo' => 'boolean',
        ]);

        $empreendimento->update($validated);

        return redirect()->route('empreendimentos.index')
            ->with('success', 'Empreendimento atualizado com sucesso!');
    }

    public function destroy(Empreendimento $empreendimento)
    {
        $empreendimento->delete();

        return redirect()->route('empreendimentos.index')
            ->with('success', 'Empreendimento excluído com sucesso!');
    }
}
