'use client';

import { Home, User, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Início', icon: Home, href: '/' },
    { label: 'Clientes', icon: User, href: '/consulta' },
    { label: 'Agendar', icon: Calendar, href: '/agendar' },
    { label: 'Configurações', icon: Settings, href: '/configuracoes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-100 pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
                key={item.label} 
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full relative"
            >
                <div className={`
                flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-300
                ${isActive ? 'bg-amber-50 text-amber-700' : 'text-slate-400'}
            `}>
                <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className="transition-transform group-active:scale-90" 
                />
                <span className="text-[9px] font-black uppercase tracking-tighter mt-1">
                {item.label}
                </span>
            </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}