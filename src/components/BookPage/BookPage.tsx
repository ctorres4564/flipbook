import React from 'react';
import { BookPage as BookPageType } from '../../types/book';

interface BookPageProps {
  page: BookPageType;
  totalPages: number;
}

export const BookPage: React.FC<BookPageProps> = ({ page, totalPages }) => {
  return (
    <div
      className="page-item"
      data-density="hard"
      role="region"
      aria-label={`Página ${page.pageNumber} de ${totalPages}`}
    >
      <img
        src={page.image}
        alt={page.alt || `Página ${page.pageNumber}`}
        className="page-image"
        loading={page.pageNumber <= 2 ? 'eager' : 'lazy'}
      />
    </div>
  );
};
