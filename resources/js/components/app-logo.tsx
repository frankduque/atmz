export default function AppLogo() {
    return (
        <div className="flex flex-col items-center gap-2 py-1">
            <img 
                src="/images/atmz-logo.png" 
                alt="ATMZ Logo" 
                className="h-14 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] dark:drop-shadow-none"
            />
            <span className="text-xs text-muted-foreground text-center leading-tight">
                Sistema de Automação
            </span>
        </div>
    );
}
