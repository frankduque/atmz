import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Search, Trash2, Users as UsersIcon, X } from 'lucide-react';
import { useState } from 'react';
import usuarios from '@/routes/users';

declare global {
    interface Window {
        searchTimeout?: NodeJS.Timeout;
    }
}

interface Props {
    users: {
        data: User[];
    };
    filters: {
        search?: string;
        role?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuários',
        href: '/usuarios',
    },
];

export default function Index({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');

    const buildUrl = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (role && role !== 'all') params.append('role', role);
        const query = params.toString();
        return query ? `/usuarios?${query}` : '/usuarios';
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        
        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }

        window.searchTimeout = setTimeout(() => {
            const params = new URLSearchParams();
            if (value) params.append('search', value);
            if (role && role !== 'all') params.append('role', role);
            const query = params.toString();
            const url = query ? `/usuarios?${query}` : '/usuarios';
            
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }, 500);
    };

    const handleRoleChange = (value: string) => {
        setRole(value);
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (value && value !== 'all') params.append('role', value);
        const query = params.toString();
        const url = query ? `/usuarios?${query}` : '/usuarios';
        
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setRole('all');
        router.get('/usuarios', {}, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (role && role !== 'all') params.append('role', role);
        const query = params.toString();
        const url = query ? `/usuarios?${query}` : '/usuarios';
        
        router.get(url, {}, { preserveState: true });
    };

    const handleDelete = (user: User) => {
        if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
            router.delete(usuarios.destroy.url(user.id));
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === 'administrador') {
            return <Badge variant="default">Administrador</Badge>;
        }
        return <Badge variant="secondary">Usuário</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuários" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Usuários
                        </h2>
                        <p className="text-muted-foreground">
                            Gerencie os usuários do sistema
                        </p>
                    </div>
                    <Link href={usuarios.create.url()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Usuário
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Pesquisar por nome ou email..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 bg-background"
                            />
                        </div>
                        <Select value={role} onValueChange={handleRoleChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por perfil" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="administrador">Administrador</SelectItem>
                                <SelectItem value="usuario">Usuário</SelectItem>
                            </SelectContent>
                        </Select>
                        {(search || role !== 'all') && (
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={handleClearFilters}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Limpar
                            </Button>
                        )}
                        <Button type="submit">
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>
                    </form>
                </div>

                {users.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex min-h-[400px] flex-col items-center justify-center">
                            <UsersIcon className="mb-4 h-16 w-16 text-muted-foreground" />
                            <h3 className="mb-2 text-xl font-semibold">
                                Nenhum usuário encontrado
                            </h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                {filters.search
                                    ? 'Tente uma pesquisa diferente'
                                    : 'Comece criando seu primeiro usuário'}
                            </p>
                            {!filters.search && (
                                <Link href={usuarios.create.url()}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Criar Usuário
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Usuários</CardTitle>
                            <CardDescription>
                                Total de {users.data.length} usuário(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Perfil</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {getRoleBadge(user.role)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={usuarios.edit.url(user.id)}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(user)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
