<?php

namespace App\Http\Controllers;

use App\Models\Painel;
use App\Models\Widget;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Painel $painel)
    {
        $this->authorize('isAdmin');
        
        $validated = $request->validate([
            'tipo_widget' => 'required|string|in:rele_canal,texto,info,controle_rele,feed_camera,status_grid,grafico',
            'entidade_id' => 'nullable|integer',
            'largura' => 'integer|min:1|max:12',
            'configuracao' => 'nullable|array',
        ]);

        $widget = $painel->widgets()->create($validated);

        return back()->with('success', 'Widget adicionado com sucesso!');
    }

    public function update(Request $request, Widget $widget)
    {
        $this->authorize('isAdmin');
        
        $validated = $request->validate([
            'posicao_x' => 'integer|min:0',
            'posicao_y' => 'integer|min:0',
            'largura' => 'integer|min:1|max:12',
            'altura' => 'integer|min:1|max:12',
            'configuracao' => 'nullable|array',
        ]);

        $widget->update($validated);

        return back();
    }

    public function destroy(Widget $widget)
    {
        $this->authorize('isAdmin');
        
        $widget->delete();

        return back()->with('success', 'Widget removido com sucesso!');
    }
}
