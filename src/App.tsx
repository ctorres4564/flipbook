import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookViewPage } from './pages/BookViewPage';
import { getDefaultBookSlugForHost } from './services/bookService';

export const App: React.FC = () => {
  const defaultSlug = getDefaultBookSlugForHost();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/livros/:slug" element={<BookViewPage />} />
        <Route path="/" element={<Navigate to={`/livros/${defaultSlug}`} replace />} />
        <Route path="*" element={<Navigate to={`/livros/${defaultSlug}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
