import React from 'react';
import { LayoutDashboard, Smartphone, Send, Wallet, Settings } from 'lucide-react';
import { NAV_ITEMS } from '../lib/constants';

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white p-4 flex flex-col">
      <div className="text-xl font-bold mb-8 px-2">SMS Relay</div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            <item.icon size={18} />
            {item.label}
          </a>
        ))}
      </nav>
      <div className="pt-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-red-900/20 hover:text-red-400 transition-colors text-sm">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
};
