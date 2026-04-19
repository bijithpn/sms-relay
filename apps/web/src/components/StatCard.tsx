import React from "react";
import { cn } from "@sms-relay/ui";

interface CardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  description,
  icon,
  className,
}: CardProps) => (
  <div className={cn("p-6 bg-white rounded-xl border shadow-sm", className)}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <p className="text-xs text-gray-400">{description}</p>
  </div>
);
