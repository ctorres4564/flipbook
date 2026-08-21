import React from 'react';
import { BookManifest } from '../../types/book';
import { BookOpen, Volume2 } from 'lucide-react';

interface BookCoverProps {
  book: BookManifest;
  onStart: () => void;
}

export const BookCover: React.FC<BookCoverProps> = ({ book, onStart }) => {
  return (
    <div className="cover-screen" role="region" aria-label="Apresentação da Capa">
      <div className="cover-card">
        <div className="cover-thumbnail-wrapper">
          <img
            src={book.coverImage}
            alt={book.pages[0]?.alt || `Capa do livro ${book.title}`}
            className="cover-thumbnail"
          />
        </div>

        <div className="cover-info">
          <h1 className="cover-title">{book.title}</h1>
          {book.description && (
            <p className="cover-description">{book.description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="btn-start"
          aria-label="Começar a ler e ouvir o livro"
          autoFocus
        >
          <BookOpen size={22} />
          <span>Começar a Ler e Ouvir</span>
          <Volume2 size={20} />
        </button>
      </div>
    </div>
  );
};
