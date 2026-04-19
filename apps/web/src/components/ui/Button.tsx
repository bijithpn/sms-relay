import React from "react";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  iconOnly,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary:
      "bg-mistral-black text-white hover:bg-black border-transparent disabled:bg-slate-300",
    secondary:
      "bg-cream text-mistral-black hover:bg-block-gold border-transparent disabled:bg-slate-200",
    outline:
      "bg-transparent text-mistral-black border-slate-200 hover:bg-warm-ivory disabled:text-slate-400",
    ghost:
      "bg-transparent text-mistral-black border-transparent hover:bg-warm-ivory/50 disabled:text-slate-300",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 border-transparent disabled:bg-rose-300",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent disabled:bg-emerald-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-none",
    md: "px-4 py-2 text-sm rounded-none",
    lg: "px-6 py-3 text-base rounded-none",
    icon: "p-2 rounded-none",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-normal transition-colors border focus:outline-none focus:ring-2 focus:ring-mistral-orange focus:ring-offset-2 disabled:cursor-not-allowed shrink-0",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={18} />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
