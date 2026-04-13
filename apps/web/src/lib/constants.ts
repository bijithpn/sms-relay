import {
  LayoutDashboard,
  Smartphone,
  Send,
  Wallet,
  Settings,
  LogOut
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', role: 'ALL' },
  { label: 'Devices', icon: Smartphone, href: '/dashboard/devices', role: 'ADMIN' },
  { label: 'SMS Jobs', icon: Send, href: '/dashboard/jobs', role: 'ALL' },
  { label: 'Wallet', icon: Wallet, href: '/dashboard/wallet', role: 'ALL' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings', role: 'ALL' },
];
