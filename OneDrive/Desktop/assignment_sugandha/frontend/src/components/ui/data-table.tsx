import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface Column<T> {
  header: strin
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
}

export function DataTable<T>({ data, columns, searchPlaceholder = "Search..." }: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Very basic search & sort for the mock UI
  const filteredData = React.useMemo(() => {
    let result = data;
    if (search) {
      result = result.filter(item => 
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortConfig) {
      result = [...result].sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, search, sortConfig]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
              <tr>
                {columns.map((col, i) => (
                  <th 
                    key={i} 
                    className={cn(
                      "px-4 py-3 font-medium",
                      col.sortable && "cursor-pointer hover:bg-muted/80 select-none transition-colors"
                    )}
                    onClick={() => col.sortable && handleSort(col.accessorKey as string)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortConfig?.key === col.accessorKey && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors group">
                    {columns.map((col, j) => (
                      <td key={j} className="px-4 py-3 align-middle">
                        {col.cell ? col.cell(item) : (item as any)[col.accessorKey]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
        <div>Showing {filteredData.length} of {data.length} results</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}
