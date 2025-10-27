<?php

namespace App\Http\Controllers;

use App\Models\Dashboard;
use App\Models\Device;
use App\Models\Enterprise;
use App\Models\Empreendimento;
use App\Models\Rele;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function home()
    {
        $user = auth()->user();
        $isAdmin = $user->role === 'administrador';

        $data = [
            'isAdmin' => $isAdmin,
        ];

        // Dados apenas para admin
        if ($isAdmin) {
            $data['stats'] = [
                'total_empreendimentos' => Empreendimento::count(),
                'total_reles' => Rele::count(),
                'reles_online' => Rele::where('status', 'online')->count(),
            ];

            $data['empreendimentos_recentes'] = Empreendimento::with('reles')
                ->latest()
                ->take(5)
                ->get();
        } else {
            // Para usuários comuns, mostrar painéis que têm acesso
            $data['paineis'] = $user->paineis()
                ->with(['widgets', 'users'])
                ->latest()
                ->get()
                ->map(function ($painel) {
                    $painel->widgets = $painel->widgets->map(function ($widget) {
                        if ($widget->tipo_widget === 'rele' && $widget->entidade_id) {
                            $widget->load('rele.empreendimento');
                        }
                        return $widget;
                    });
                    return $painel;
                });
        }

        return Inertia::render('Painel', $data);
    }

    public function index()
    {
        $dashboards = Dashboard::where('user_id', auth()->id())
            ->with(['enterprise', 'widgets'])
            ->withCount('widgets')
            ->latest()
            ->get();

        return Inertia::render('Paineis/Index', [
            'dashboards' => $dashboards,
        ]);
    }

    public function create()
    {
        $enterprises = Enterprise::where('ativo', true)->get();

        return Inertia::render('Paineis/Create', [
            'enterprises' => $enterprises,
        ]);
    }

    public function show(Dashboard $painel)
    {
        $painel->load([
            'enterprise',
            'widgets',
        ]);

        return Inertia::render('Paineis/Show', [
            'dashboard' => $painel,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'empreendimento_id' => 'required|exists:empreendimentos,id',
            'nome' => 'required|string|max:255',
            'padrao' => 'boolean',
        ]);

        $dashboard = Dashboard::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('paineis.show', $dashboard)
            ->with('success', 'Painel criado com sucesso!');
    }

    public function destroy(Dashboard $dashboard)
    {
        $this->authorize('delete', $dashboard);
        
        $dashboard->delete();

        return redirect()->route('paineis.index')
            ->with('success', 'Painel excluído com sucesso!');
    }
}
