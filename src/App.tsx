import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookViewPage } from './pages/BookViewPage';
import { DEFAULT_BOOK_SLUG } from './books/registry';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/livros/:slug" element={<BookViewPage />} />
        <Route path="/" element={<Navigate to={`/livros/${DEFAULT_BOOK_SLUG}`} replace />} />
        <Route path="*" element={<Navigate to={`/livros/${DEFAULT_BOOK_SLUG}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
