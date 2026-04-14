'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  const { toggleMobileNav } = useUIStore();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 -ml-2 text-mistral-black/60 hover:text-mistral-black transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-display-hero font-normal text-mistral-black tracking-billboard">{title}</h1>
          {description && <p className="text-mistral-black/70 text-subheading mt-2 font-normal">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};
