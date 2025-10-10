import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pb-16">
        {children}
      </main>
      {user && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-orange-300 to-orange-400 text-white px-4 py-2 rounded-full text-sm shadow-lg">
          Logged in as: {user.name} ({user.role})
        </div>
      )}
    </div>
  );
};