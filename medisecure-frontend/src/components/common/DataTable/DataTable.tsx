// src/components/common/DataTable/DataTable.tsx
import React, { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => ReactNode);
  cell?: (data: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "Aucune donnée disponible",
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const renderCellContent = (item: T, column: Column<T>) => {
    // Si une fonction cell personnalisée est fournie, l'utiliser
    if (column.cell) {
      return column.cell(item);
    }

    // Sinon, utiliser l'accesseur
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }

    // Accéder à la propriété
    const value = item[column.accessor as keyof T];
    return value as ReactNode;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <svg
          className="animate-spin h-8 w-8 text-primary-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-3 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${
                  column.className || ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={`${
                onRowClick ? "cursor-pointer hover:bg-neutral-50" : ""
              }`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`px-3 py-4 whitespace-nowrap text-sm text-neutral-900 ${
                    column.className || ""
                  }`}
                >
                  {renderCellContent(item, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
