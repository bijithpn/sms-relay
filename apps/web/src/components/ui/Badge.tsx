import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline"
  | "risk-low"
  | "risk-medium"
  | "risk-high";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({
  children,
  className,
  variant = "default",
  ...props
}: BadgeProps) => {
  const variantClasses = {
    default: "bg-block-gold text-mistral-black border-block-gold",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-orange-50 text-mistral-orange border-orange-200",
    outline: "bg-transparent text-mistral-black border-block-gold",
    "risk-low":
      "bg-emerald-100 text-emerald-800 border-emerald-200 font-normal",
    "risk-medium": "bg-amber-100 text-amber-800 border-amber-200 font-normal",
    "risk-high": "bg-rose-100 text-rose-800 border-rose-200 font-normal",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-normal border",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
