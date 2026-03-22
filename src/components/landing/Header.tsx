import { tenant } from "@/config/tenant";

export function Header() {
  return (
    <header className={`${tenant.colors.primary} text-white p-4 shadow-md`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <a 
          href={`https://wa.me/${tenant.whatsappNumber}`}
          target="_blank"
          className={`${tenant.colors.accent} px-4 py-2 rounded-md text-sm font-semibold`}
        >
          Faça seu agendamento pelo WhatsApp aqui!
        </a>
      </div>
    </header>
  );
}
