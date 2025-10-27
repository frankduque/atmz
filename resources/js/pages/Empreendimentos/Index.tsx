import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

// Declaração global para o timeout
declare global {
    interface Window {
        searchTimeout?: NodeJS.Timeout;
    }
}

interface Empreendimento {
    id: number;
    nome: string;
    descricao: string | null;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    created_at: string;
}

interface Props {
    empreendimentos: {
        data: Empreendimento[];
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Empreendimentos',
        href: '/empreendimentos',
    },
];

export default function Index({ empreendimentos, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounce da pesquisa
    const handleSearchChange = (value: string) => {
        setSearch(value);
        
        // Cancela timeout anterior se existir
        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }

        // Aguarda 500ms após parar de digitar
        window.searchTimeout = setTimeout(() => {
            const params = new URLSearchParams();
            if (value) params.append('search', value);
            const query = params.toString();
            const url = query ? `/empreendimentos?${query}` : '/empreendimentos';
            
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }, 500);
    };

    const handleClearFilters = () => {
        setSearch('');
        router.get('/empreendimentos', {}, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
        }
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        const query = params.toString();
        const url = query ? `/empreendimentos?${query}` : '/empreendimentos';
        
        router.get(url, {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Empreendimentos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Empreendimentos
                        </h2>
                        <p className="text-muted-foreground">
                            Gerencie seus empreendimentos e dispositivos
                        </p>
                    </div>
                    <Link href="/empreendimentos/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Empreendimento
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Pesquisar por nome, descrição, cidade ou estado..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 bg-background"
                        />
                    </div>
                    {search && (
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

                {empreendimentos.data.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex min-h-[400px] flex-col items-center justify-center">
                            <Building2 className="mb-4 h-16 w-16 text-muted-foreground" />
                            <h3 className="mb-2 text-xl font-semibold">
                                Nenhum empreendimento encontrado
                            </h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                {filters.search
                                    ? 'Tente uma pesquisa diferente'
                                    : 'Comece criando seu primeiro empreendimento'}
                            </p>
                            {!filters.search && (
                                <Link href="/empreendimentos/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Criar Empreendimento
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {empreendimentos.data.map((empreendimento) => (
                            <Link
                                key={empreendimento.id}
                                href={`/empreendimentos/${empreendimento.id}`}
                            >
                                <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:border-primary/50 h-full">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardHeader className="relative">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-primary/10 p-2.5">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                </div>
                                                <CardTitle className="line-clamp-1 text-lg">
                                                    {empreendimento.nome}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        {empreendimento.descricao && (
                                            <CardDescription className="line-clamp-2 mt-2">
                                                {empreendimento.descricao}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                <span className="line-clamp-1">
                                                    {empreendimento.cidade}, {empreendimento.estado}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
