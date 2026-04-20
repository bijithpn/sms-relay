"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Settings, LogOut } from "lucide-react";
import { NAV_ITEMS } from "../lib/constants";
import { useUIStore } from "../store/useUIStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen, isMobileNavOpen, closeMobileNav } = useUIStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 z-50 w-64 bg-mistral-black text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
    mounted &&
      (isMobileNavOpen ||
        (typeof window !== "undefined" &&
          window.innerWidth >= 1024 &&
          isSidebarOpen))
      ? "translate-x-0"
      : "-translate-x-full",
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-mistral-black/60 z-40 lg:hidden"
          onClick={closeMobileNav}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="text-xl font-black uppercase tracking-billboard text-mistral-orange">
              SMS RELAY
            </div>
            <button
              onClick={closeMobileNav}
              className="lg:hidden p-1 hover:bg-white/10 rounded-none"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeMobileNav()}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-none transition-colors text-sm font-normal",
                    isActive
                      ? "bg-mistral-orange text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-white/10">
            <Link
              href="/settings"
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 rounded-none transition-colors text-sm font-normal text-white/40 hover:bg-white/10 hover:text-white",
                pathname === "/settings" && "text-white bg-white/5"
              )}
            >
              <Settings size={18} />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
