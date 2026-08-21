import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookViewPage } from './pages/BookViewPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/livros/:slug" element={<BookViewPage />} />
        <Route path="/" element={<Navigate to="/livros/nico" replace />} />
        <Route path="*" element={<Navigate to="/livros/nico" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
