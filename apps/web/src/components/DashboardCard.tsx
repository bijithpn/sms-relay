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
    default: 'text-mistral-black/60 bg-block-gold',
    success: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    error: 'text-rose-600 bg-rose-50',
    info: 'text-mistral-orange bg-orange-50',
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-none", variants[variant])}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-normal px-2 py-1 rounded-none",
              trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}>
              {trend.isPositive ? '+' : '-'}{trend.value}
            </span>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-mistral-black/60 text-sm font-normal">{label}</h3>
          <p className="text-subheading font-normal text-mistral-black mt-1">{value}</p>
          {description && <p className="text-mistral-black/40 text-xs mt-1 font-normal">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
