import React from 'react';
import { Card, CardContent } from './ui/Card';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export const DashboardCard = ({ 
  label, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = 'default'
}: DashboardCardProps) => {
  const variants = {
    default: 'text-slate-500 bg-slate-100',
    success: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    error: 'text-rose-600 bg-rose-50',
    info: 'text-blue-600 bg-blue-50',
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", variants[variant])}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}>
              {trend.isPositive ? '+' : '-'}{trend.value}
            </span>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {description && <p className="text-slate-400 text-xs mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
