import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ChangePassword from './pages/Auth/ChangePassword';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import Providers from './pages/Providers';

// Client Pages
import ClientDashboard from './pages/Client/Dashboard';
import ClientServiceRequests from './pages/Client/ServiceRequests';
import NewServiceRequest from './pages/Client/NewServiceRequest';
import EditServiceRequest from './pages/Client/EditServiceRequest';
import ServiceRequestDetail from './pages/Client/ServiceRequestDetail';
import ClientProfile from './pages/Client/Profile';

// Provider Pages
import ProviderDashboard from './pages/Provider/Dashboard';
import Opportunities from './pages/Provider/Opportunities';
import OpportunityDetail from './pages/Provider/OpportunityDetail';
import CreateProposal from './pages/Provider/CreateProposal';
import Proposals from './pages/Provider/Proposals';
import Jobs from './pages/Provider/Jobs';
import ProviderProfile from './pages/Provider/Profile';

// Master Pages
import MasterPanel from './pages/Master/MasterPanel';

function AppContent() {
  const { loading, isAuthenticated, isClient, isProvider, isMaster } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/providers" element={<Providers />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />

        {/* Rotas protegidas com layout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                {isClient ? <ClientDashboard /> : <ProviderDashboard />}
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Rotas do cliente */}
        <Route 
          path="/requests/new" 
          element={
            <ProtectedRoute requireClient>
              <Layout>
                <NewServiceRequest />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests" 
          element={
            <ProtectedRoute requireClient>
              <Layout>
                <ClientServiceRequests />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests/:id" 
          element={
            <ProtectedRoute requireClient>
              <Layout>
                <ServiceRequestDetail />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/requests/:id/edit" 
          element={
            <ProtectedRoute requireClient>
              <Layout>
                <EditServiceRequest />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Rotas do prestador */}
        <Route 
          path="/opportunities" 
          element={
            <ProtectedRoute requireProvider>
              <Layout>
                <Opportunities />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/opportunities/:id" 
          element={
            <ProtectedRoute requireProvider>
              <Layout>
                <OpportunityDetail />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/opportunities/:id/proposal" 
          element={
            <ProtectedRoute requireProvider>
              <Layout>
                <CreateProposal />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-services" 
          element={
            <ProtectedRoute requireProvider>
              <Layout>
                <Jobs />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider-profile" 
          element={
            <ProtectedRoute requireProvider>
              <Layout>
                <ProviderProfile />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Rotas compartilhadas */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                {isClient ? <ClientProfile /> : <ProviderProfile />}
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Rota do painel master */}
        <Route 
          path="/master-panel" 
          element={
            <ProtectedRoute requireMaster>
              <Layout>
                <MasterPanel />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Redirecionamentos */}
        <Route 
          path="/app" 
          element={
            isAuthenticated ? (
              isMaster ? (
                <Navigate to="/master-panel" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </AuthProvider>
  )
}

export default App