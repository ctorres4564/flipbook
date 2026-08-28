import React from 'react';
import { BookManifest } from '../../types/book';
import { BookOpen, Volume2, Download, ShieldCheck, HeartHandshake } from 'lucide-react';

interface BookCoverProps {
  book: BookManifest;
  onStart: () => void;
}

export const BookCover: React.FC<BookCoverProps> = ({ book, onStart }) => {
  const isCartilha = book.slug.includes('cartilha') || book.slug.includes('engasgo');
  const startButtonText = isCartilha ? 'Abrir Cartilha Digital' : 'Começar a Ler e Ouvir';

  return (
    <div className="cover-screen" role="region" aria-label="Apresentação da Capa">
      <div className="cover-card">
        {/* Banner de Identificação da Série se houver */}
        {(book.subtitle || isCartilha) && (
          <div className="cover-badge-row">
            <span className="badge badge-series">
              <HeartHandshake size={14} style={{ marginRight: 4 }} />
              {book.subtitle || 'Série Para Quem Cuida'}
            </span>
            <span className="badge badge-pages">{book.totalPages} Páginas</span>
          </div>
        )}

        <div className="cover-thumbnail-wrapper">
          <img
            src={book.coverImage}
            alt={book.pages[0]?.alt || `Capa do livro ${book.title}`}
            className="cover-thumbnail"
          />
        </div>

        <div className="cover-info">
          <h1 className="cover-title">{book.title}</h1>
          {book.author && (
            <div className="cover-author-box">
              <ShieldCheck size={16} className="author-icon" />
              <span className="cover-author-name">{book.author}</span>
              {book.credentials && (
                <span className="cover-author-cred">({book.credentials})</span>
              )}
            </div>
          )}
          {book.description && (
            <p className="cover-description">{book.description}</p>
          )}
        </div>

        <div className="cover-actions-row">
          <button
            type="button"
            onClick={onStart}
            className="btn-start"
            aria-label={startButtonText}
            autoFocus
          >
            <BookOpen size={22} />
            <span>{startButtonText}</span>
            <Volume2 size={20} />
          </button>

          {book.pdfUrl && (
            <a
              href={book.pdfUrl}
              download="Cartilha-Engasgo-Idosos-Sonia-Torres.pdf"
              className="btn-download-cover"
              title="Baixar cartilha completa em PDF"
            >
              <Download size={18} />
              <span>Baixar PDF</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
