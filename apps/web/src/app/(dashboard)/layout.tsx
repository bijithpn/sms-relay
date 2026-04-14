'use client';

import { Sidebar } from '../../components/Sidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { SystemStatusBanner } from '../../components/SystemStatusBanner';
import { useUIStore } from '../../store/useUIStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { toggleMobileNav } = useUIStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <SystemStatusBanner />
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
          {children}
        </div>
      </main>

      <MobileBottomNav onMenuClick={toggleMobileNav} />
    </div>
  );
}
