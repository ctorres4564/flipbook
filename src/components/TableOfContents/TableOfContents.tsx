import React, { useEffect, useRef } from 'react';
import { X, BookOpen, List, Grid } from 'lucide-react';
import { BookManifest } from '../../types/book';

interface TableOfContentsProps {
  book: BookManifest;
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageNumber: number) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  book,
  currentPage,
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const [viewTab, setViewTab] = React.useState<'topics' | 'thumbnails'>('topics');
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Fecha no ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const topics = book.topics || book.pages.map((p) => ({
    title: p.title || `Página ${p.pageNumber}`,
    pageNumber: p.pageNumber,
    section: p.section,
  }));

  // Agrupa tópicos por seção
  const groupedSections: { section: string; items: typeof topics }[] = [];
  topics.forEach((topic) => {
    const sectionName = topic.section || 'Geral';
    let group = groupedSections.find((g) => g.section === sectionName);
    if (!group) {
      group = { section: sectionName, items: [] };
      groupedSections.push(group);
    }
    group.items.push(topic);
  });

  return (
    <div
      className="toc-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sumário e Navegação de Páginas"
    >
      <div
        className="toc-drawer"
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="toc-header">
          <div className="toc-title-box">
            <BookOpen size={20} className="toc-icon" />
            <h2 className="toc-title">Sumário da Cartilha</h2>
          </div>
          <button
            type="button"
            className="toc-close-btn"
            onClick={onClose}
            aria-label="Fechar sumário"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alternador de visualização: Tópicos / Miniaturas */}
        <div className="toc-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={viewTab === 'topics'}
            className={`toc-tab-btn ${viewTab === 'topics' ? 'active' : ''}`}
            onClick={() => setViewTab('topics')}
          >
            <List size={16} />
            <span>Tópicos</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewTab === 'thumbnails'}
            className={`toc-tab-btn ${viewTab === 'thumbnails' ? 'active' : ''}`}
            onClick={() => setViewTab('thumbnails')}
          >
            <Grid size={16} />
            <span>Miniaturas ({book.totalPages})</span>
          </button>
        </div>

        <div className="toc-content">
          {viewTab === 'topics' ? (
            <div className="toc-topics-list">
              {groupedSections.map((group) => (
                <div key={group.section} className="toc-section-group">
                  <h3 className="toc-section-title">{group.section}</h3>
                  <ul className="toc-items-list">
                    {group.items.map((item) => {
                      const isCurrent = item.pageNumber === currentPage;
                      return (
                        <li key={item.pageNumber}>
                          <button
                            type="button"
                            className={`toc-item-btn ${isCurrent ? 'current' : ''}`}
                            onClick={() => {
                              onSelectPage(item.pageNumber);
                              onClose();
                            }}
                          >
                            <span className="toc-item-page-badge">
                              {String(item.pageNumber).padStart(2, '0')}
                            </span>
                            <span className="toc-item-label">{item.title}</span>
                            {isCurrent && <span className="toc-item-current-dot" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="toc-thumbnails-grid">
              {book.pages.map((p) => {
                const isCurrent = p.pageNumber === currentPage;
                return (
                  <button
                    key={p.pageNumber}
                    type="button"
                    className={`toc-thumb-card ${isCurrent ? 'current' : ''}`}
                    onClick={() => {
                      onSelectPage(p.pageNumber);
                      onClose();
                    }}
                  >
                    <div className="toc-thumb-image-wrap">
                      <img
                        src={p.image}
                        alt={`Miniatura página ${p.pageNumber}`}
                        loading="lazy"
                      />
                    </div>
                    <div className="toc-thumb-footer">
                      <span className="toc-thumb-num">Pág. {p.pageNumber}</span>
                      {p.title && (
                        <span className="toc-thumb-title-text">{p.title}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
