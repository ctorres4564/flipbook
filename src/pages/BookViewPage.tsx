import React from 'react';
import { useParams } from 'react-router-dom';
import { getBookBySlug, getBookDocumentTitle, getDefaultBookSlugForHost } from '../services/bookService';
import { BookReader } from '../components/BookReader/BookReader';

export const BookViewPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const bookSlug = slug || getDefaultBookSlugForHost();
  const book = getBookBySlug(bookSlug);

  React.useEffect(() => {
    document.title = getBookDocumentTitle(book);
  }, [book]);

  if (!book) {
    return (
      <div className="cover-screen">
        <div className="cover-card">
          <h2 className="cover-title">Livro não encontrado</h2>
          <p className="cover-description">
            O livro solicitado &ldquo;{bookSlug}&rdquo; não está disponível no acervo.
          </p>
          <a href="/livros/nico" className="btn-start" style={{ textDecoration: 'none' }}>
            Ir para o Livro do Nico
          </a>
        </div>
      </div>
    );
  }

  return <BookReader book={book} />;
};
