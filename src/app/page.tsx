import { Header } from "@/components/landing/Header";
import { Services } from "@/components/landing/Services";
import { BookingCalendar } from "@/components/booking/BookingCalendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <Services />
      <BookingCalendar />
      
      {/* Footer Simples */}
      <footer className="py-6 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} {require('@/config/tenant').tenant.name}. Todos os direitos reservados.
      </footer>
    </main>
  );
}