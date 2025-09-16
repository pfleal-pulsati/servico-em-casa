import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary opacity-20 mb-4">
            404
          </div>
          <div className="relative">
            <svg 
              className="w-64 h-64 mx-auto text-base-content/20" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={0.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.5-2.709M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">😵</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Página não encontrada
          </h1>
          
          <p className="text-lg text-base-content/70 mb-8">
            Oops! A página que você está procurando não existe ou foi movida.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="btn btn-primary"
            >
              <HomeIcon className="w-5 h-5" />
              Voltar ao início
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="btn btn-outline"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Página anterior
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 max-w-lg mx-auto">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <h3 className="card-title justify-center mb-4">
                Precisa de ajuda?
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link 
                  to="/login" 
                  className="btn btn-ghost btn-sm"
                >
                  Fazer login
                </Link>
                
                <Link 
                  to="/register" 
                  className="btn btn-ghost btn-sm"
                >
                  Criar conta
                </Link>
              </div>
              
              <div className="divider">ou</div>
              
              <p className="text-sm text-base-content/70">
                Se você acredita que isso é um erro, entre em contato conosco.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-base-content/50">
          <p>
            © 2024 Serviço em Casa. Conectando pessoas e serviços.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;