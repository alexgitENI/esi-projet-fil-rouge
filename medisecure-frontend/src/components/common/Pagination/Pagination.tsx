// src/components/common/Pagination/Pagination.tsx
import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  // Ne pas afficher la pagination s'il n'y a qu'une seule page
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers: (number | string)[] = [];

  // Logique pour déterminer quels numéros de page afficher
  if (totalPages <= 7) {
    // Afficher toutes les pages si leur nombre est inférieur ou égal à 7
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Afficher les premières pages, des points de suspension et les dernières pages
    if (currentPage <= 3) {
      // Près du début
      for (let i = 1; i <= 5; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Près de la fin
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Au milieu
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
  }

  return (
    <nav
      className={`flex items-center justify-between border-t border-neutral-200 px-4 py-3 sm:px-6 ${className}`}
    >
      <div className="hidden sm:block">
        <p className="text-sm text-neutral-700">
          Page <span className="font-medium">{currentPage}</span> sur{" "}
          <span className="font-medium">{totalPages}</span>
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-neutral-50"
          } mr-3`}
        >
          Précédent
        </button>
        <div className="hidden md:flex">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    currentPage === page
                      ? "bg-primary-50 text-primary-600 border border-primary-500"
                      : "text-neutral-700 hover:bg-neutral-50"
                  } mx-1 rounded-md`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-neutral-50"
          } ml-3`}
        >
          Suivant
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
