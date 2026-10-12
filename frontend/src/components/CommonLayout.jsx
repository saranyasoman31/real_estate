import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * CommonLayout
 * Reusable master layout containing the common application Header (Navbar)
 * and Footer, seamlessly wrapping all pages, forms, and views.
 */
const CommonLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      {/* 1. Common Application Header */}
      <Navbar />

      {/* 2. Main Page / Form Content */}
      <main className="flex-1 flex flex-col w-full">
        {children || <Outlet />}
      </main>

      {/* 3. Common Application Footer */}
      <Footer />
    </div>
  );
};

export default CommonLayout;
