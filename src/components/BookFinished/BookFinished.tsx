import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { BookManifest } from '../../types/book';

interface BookFinishedProps {
  book: BookManifest;
  onRestart: () => void;
}

export const BookFinished: React.FC<BookFinishedProps> = ({ book, onRestart }) => {
  return (
    <div className="finished-screen" role="dialog" aria-modal="true" aria-label="Fim da leitura">
      <div className="cover-card">
        <div style={{ color: '#fbbf24', display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Sparkles size={36} />
        </div>

        <h2 className="cover-title">Você chegou ao final!</h2>
        <p className="cover-description">
          Esperamos que você tenha adorado descobrir os sons e histórias com o {book.title}.
        </p>

        <button
          type="button"
          id="btn-restart-book"
          onClick={onRestart}
          className="btn-start"
          aria-label="Ler o livro novamente"
          autoFocus
        >
          <RotateCcw size={22} />
          <span>Ler Novamente</span>
        </button>
      </div>
    </div>
  );
};
