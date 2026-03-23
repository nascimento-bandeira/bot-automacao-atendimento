import { tenant } from "@/config/tenant";

export function Header() {
  return (
    <header className={`${tenant.colors.primary} text-white shadow-md w-full`}>
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-5 text-center sm:text-left">
        
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {tenant.name}
        </h1>

        <a 
          href={`https://wa.me/${tenant.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${tenant.colors.accent} w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl sm:rounded-lg text-sm font-semibold shadow-md active:scale-95 transition-all text-center`}
        >
          Agendar pelo WhatsApp
        </a>
      </div>
    </header>
  );
}