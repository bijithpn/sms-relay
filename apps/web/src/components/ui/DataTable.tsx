import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export const DataTable = <T extends { id: string | number }>({ 
  columns, 
  data, 
  emptyMessage = 'No data found',
  onRowClick
}: DataTableProps<T>) => {
  return (
    <div className="w-full overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((column, i) => (
                <th 
                  key={i} 
                  className={cn("px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.length > 0 ? (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onRowClick?.(item)}
                  className={cn("hover:bg-slate-50/50 transition-colors", onRowClick && "cursor-pointer")}
                >
                  {columns.map((column, i) => (
                    <td 
                      key={i} 
                      className={cn("px-6 py-4 text-sm text-slate-600 whitespace-nowrap", column.className)}
                    >
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item) 
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {data.length > 0 ? (
          data.map((item) => (
            <div 
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn("bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3", onRowClick && "active:bg-slate-50")}
            >
              {columns.map((column, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {column.header}
                  </span>
                  <span className="text-sm text-slate-600 text-right">
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as React.ReactNode)}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 italic">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};
