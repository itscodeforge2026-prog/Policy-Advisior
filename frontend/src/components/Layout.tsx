import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingTriggers } from './FloatingTriggers';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <FloatingTriggers />
    </div>
  );
};
export default Layout;
