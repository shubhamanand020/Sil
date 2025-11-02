import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './component/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  // Simple client-side routing based on URL hash
  const getPageFromHash = () => {
    const hash = window.location.hash.slice(1) || '/';
    return hash;
  };

  const [currentPage, setCurrentPage] = React.useState(getPageFromHash());

  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update all links to use hash routing
  React.useEffect(() => {
    const updateLinks = () => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          link.setAttribute('href', `#${href}`);
        }
      });
    };

    updateLinks();
    
    // Update links when page content changes
    const observer = new MutationObserver(updateLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case '/':
        return <HomePage />;
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      case '/dashboard':
        return <StudentDashboard />;
      case '/admin':
        return <AdminPanel />;
      case '/scholarships':
        return <ScholarshipsPage />;
      case '/profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <Layout>
        {renderPage()}
      </Layout>
    </AuthProvider>
  );
}

export default App;