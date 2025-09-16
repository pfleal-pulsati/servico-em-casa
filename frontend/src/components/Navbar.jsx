import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items based on user type
  const getNavigationItems = () => {
    if (!user) {
      return [
        { name: 'Início', path: '/', icon: HomeIcon },
        { name: 'Login', path: '/login', icon: UserIcon },
        { name: 'Cadastrar', path: '/register', icon: UserGroupIcon }
      ];
    }

    if (user.userType === 'client') {
      return [
        { name: 'Dashboard', path: '/client/dashboard', icon: HomeIcon },
        { name: 'Meus Serviços', path: '/client/service-requests', icon: ClipboardDocumentListIcon },
        { name: 'Novo Serviço', path: '/client/service-requests/new', icon: DocumentTextIcon },
        { name: 'Perfil', path: '/client/profile', icon: UserIcon }
      ];
    }

    if (user.userType === 'provider') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Oportunidades', path: '/opportunities', icon: BriefcaseIcon },
        { name: 'Trabalhos', path: '/my-services', icon: ClipboardDocumentListIcon },
        { name: 'Perfil', path: '/profile', icon: UserIcon }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        {/* Mobile menu button */}
        <div className="dropdown lg:hidden">
          <button 
            className="btn btn-ghost btn-circle"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
          
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.path}>
                    <Link 
                      to={item.path}
                      className={`flex items-center gap-2 ${
                        isActive(item.path) ? 'active' : ''
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <IconComponent className="w-4 h-4" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              
              {user && (
                <>
                  <li><hr className="my-2" /></li>
                  <li>
                    <Link 
                      to="/notifications"
                      className={`flex items-center gap-2 ${
                        isActive('/notifications') ? 'active' : ''
                      }`}
                      onClick={closeMobileMenu}
                    >
                      <BellIcon className="w-4 h-4" />
                      Notificações
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>

        {/* Logo */}
        <Link to={user ? (user.userType === 'client' ? '/client/dashboard' : '/dashboard') : '/'} className="btn btn-ghost text-xl font-montserrat font-bold hover:bg-transparent">
          <HomeIcon className="w-7 h-7 text-primary mr-2" />
          <span className="text-primary font-montserrat font-bold text-xl">Serviço em Casa</span>
        </Link>
      </div>

      {/* Desktop navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`flex items-center gap-2 ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="navbar-end">
        {user ? (
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link 
              to="/notifications" 
              className={`btn btn-ghost btn-circle hidden lg:flex ${
                isActive('/notifications') ? 'btn-active' : ''
              }`}
            >
              <div className="indicator">
                <BellIcon className="w-5 h-5" />
                {/* Notification badge - you can add logic to show unread count */}
                {/* <span className="badge badge-xs badge-primary indicator-item"></span> */}
              </div>
            </Link>

            {/* User menu */}
            <div className="dropdown dropdown-end">
              <button 
                className="btn btn-ghost btn-circle avatar"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="w-8 rounded-full">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-content text-sm font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </button>
              
              {isProfileMenuOpen && (
                <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                  <li className="menu-title">
                    <span className="text-xs">
                      {user.name}
                      <br />
                      <span className="text-base-content/60">
                        {user.userType === 'client' ? 'Cliente' : 'Prestador'}
                      </span>
                    </span>
                  </li>
                  <li><hr className="my-2" /></li>
                  <li>
                    <Link 
                      to="/profile"
                      className="flex items-center gap-2"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      Meu Perfil
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/notifications"
                      className="flex items-center gap-2 lg:hidden"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <BellIcon className="w-4 h-4" />
                      Notificações
                    </Link>
                  </li>
                  <li><hr className="my-2" /></li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-error"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sair
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost font-montserrat font-medium hover:text-primary">
              Entrar
            </Link>
            <Link to="/register" className="btn-primary">
              Cadastrar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;