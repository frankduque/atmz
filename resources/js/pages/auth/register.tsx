import { login } from '@/routes';
import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Registro Desabilitado"
            description="Entre em contato com um administrador para criar sua conta"
        >
            <Head title="Register" />
            <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    O registro público está desabilitado. Apenas administradores podem criar novas contas.
                </p>
                <div className="text-sm">
                    Já tem uma conta?{' '}
                    <TextLink href={login()}>
                        Fazer login
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
