import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-warm-ivory rounded-none border-none shadow-golden-hour overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn("px-6 py-4 border-b border-block-gold/30", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className, ...props }: CardProps) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "px-6 py-4 bg-cream border-t border-block-gold/30",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
