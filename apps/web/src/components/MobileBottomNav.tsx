"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, Bell, Menu } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MobileBottomNav = ({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) => {
  const pathname = usePathname();

  const primaryItems = [
    { label: "Dash", href: "/", icon: LayoutDashboard },
    { label: "Send", href: "/campaigns", icon: Send },
    { label: "Alerts", href: "/alerts", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-4 md:hidden z-50">
      {primaryItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px]",
              isActive
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
      <button
        onClick={onMenuClick}
        className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-slate-500 hover:text-slate-900"
      >
        <Menu size={20} />
        <span className="text-[10px] font-medium leading-none">More</span>
      </button>
    </nav>
  );
};
