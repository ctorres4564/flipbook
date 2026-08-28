import React from 'react';
import { RotateCcw, Heart, Download, ShieldCheck, Share2 } from 'lucide-react';
import { BookManifest } from '../../types/book';

interface BookFinishedProps {
  book: BookManifest;
  onRestart: () => void;
}

export const BookFinished: React.FC<BookFinishedProps> = ({ book, onRestart }) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Cartilha Educativa: ${book.title} — ${book.author}`,
          url: window.location.href,
        });
      } catch {
        // usuário cancelou
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="finished-screen" role="dialog" aria-modal="true" aria-label="Fim da leitura da cartilha">
      <div className="cover-card finished-card">
        <div className="finished-icon-badge">
          <Heart size={36} color="#38bdf8" />
        </div>

        <h2 className="cover-title">Você concluiu a leitura!</h2>
        
        <p className="cover-description">
          Cuidar de quem amamos exige atenção, carinho e conhecimento. Esperamos que estas orientações tragam mais segurança e tranquilidade para a rotina alimentar em sua casa.
        </p>

        {book.author && (
          <div className="cover-author-box finished-author-box">
            <ShieldCheck size={16} className="author-icon" />
            <span>Elaborado por: <strong>{book.author}</strong></span>
            {book.credentials && (
              <span className="cover-author-cred">({book.credentials})</span>
            )}
          </div>
        )}

        <div className="finished-actions-grid">
          <button
            type="button"
            id="btn-restart-book"
            onClick={onRestart}
            className="btn-start"
            aria-label="Reler a cartilha desde o início"
            autoFocus
          >
            <RotateCcw size={20} />
            <span>Reler Cartilha</span>
          </button>

          {book.pdfUrl && (
            <a
              href={book.pdfUrl}
              download="Cartilha-Engasgo-Idosos-Sonia-Torres.pdf"
              className="btn-download-cover"
              title="Baixar versão em PDF"
            >
              <Download size={18} />
              <span>Baixar em PDF</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="btn-share"
            title="Compartilhar com outros cuidadores"
          >
            <Share2 size={18} />
            <span>{copied ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
