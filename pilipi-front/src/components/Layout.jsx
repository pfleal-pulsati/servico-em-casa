import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Pages that should not show navbar/footer (like login, register)
  const hideNavbarFooter = [
    '/login',
    '/register'
  ].includes(location.pathname);
  
  // Pages that should only hide footer
  const hideFooter = [
    '/login',
    '/register',
    '/404'
  ].includes(location.pathname) || location.pathname.includes('/dashboard');

  if (hideNavbarFooter) {
    return (
      <div className="min-h-screen bg-base-200">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;