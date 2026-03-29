
type ClientProps = {
  client: {
    name: string;
    procedure: string;
    time: string;
    status: string;
  };
};

export default function ClientCard({ client }: ClientProps) {
  if (!client) return null;

  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-stitch space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-extrabold text-slate-950 tracking-tight">
          Próximo Cliente
        </h3>
        <button className="text-brand-600 font-semibold text-sm">
          Ver todos
        </button>
      </div>

      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">

        <div className="flex-1">
          <h4 className="font-bold text-slate-900 leading-tight">{client.name}</h4>
          <p className="text-xs text-slate-400 font-semibold">
            {client.procedure}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-black text-slate-950 leading-none">
            {client.time}
          </p>
          <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">
            Hoje
          </p>
        </div>
      </div>

      {/* Linha de Progresso e Status */}
      <div className="flex items-center gap-3 px-4 pb-2">
        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 w-2/3 rounded-full" />
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
          Status:
          <span className="text-amber-600 font-bold bg-slate-100 px-2 py-1 rounded ml-1">
            {client.status}
          </span>
        </p>
      </div>
    </section>
  );
}