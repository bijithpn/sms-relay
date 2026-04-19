import React from "react";
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WarningVariant = "warning" | "error" | "info";

interface WarningBannerProps {
  title?: string;
  message: string;
  variant?: WarningVariant;
  onClose?: () => void;
  className?: string;
}

export const WarningBanner = ({
  title,
  message,
  variant = "warning",
  onClose,
  className,
}: WarningBannerProps) => {
  const variants = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
    },
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
      icon: AlertCircle,
      iconColor: "text-rose-500",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: Info,
      iconColor: "text-blue-500",
    },
  };

  const { bg, border, text, icon: Icon, iconColor } = variants[variant];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex items-start gap-3",
        bg,
        border,
        text,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 shrink-0", iconColor)} size={20} />
      <div className="flex-1">
        {title && <h4 className="font-bold text-sm mb-1">{title}</h4>}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-md transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
