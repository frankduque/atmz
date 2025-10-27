<?php

namespace App\Policies;

use App\Models\Painel;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PainelPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Painel $painel): bool
    {
        return $user->id === $painel->user_id;
    }

    public function update(User $user, Painel $painel): bool
    {
        return $user->id === $painel->user_id;
    }

    public function delete(User $user, Painel $painel): bool
    {
        return $user->id === $painel->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Painel $painel): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Painel $painel): bool
    {
        return false;
    }
}
