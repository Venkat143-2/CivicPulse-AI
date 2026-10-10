import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PortalPage } from './pages/PortalPage';
import { CitizenLoginPage } from './pages/CitizenLoginPage';
import { CitizenRegisterPage } from './pages/CitizenRegisterPage';
import { CitizenVerifyMobilePage } from './pages/CitizenVerifyMobilePage';
import { CitizenForgotPasswordPage } from './pages/CitizenForgotPasswordPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { NewComplaintPage } from './pages/NewComplaintPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminComplaintsListPage } from './pages/AdminComplaintsListPage';
import { AdminComplaintReviewPage } from './pages/AdminComplaintReviewPage';
import { AdminMapPage } from './pages/AdminMapPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { HelpPage } from './pages/HelpPage';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<{ id?: string }>({});

  // Sync with window.location hash for clean URL state support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const [route, id] = hash.split('/');
      if (route) {
        setCurrentPage(route);
        if (id) {
          setPageParams({ id });
        }
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: string, params?: { id?: string }) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.location.hash = params?.id ? `${page}/${params.id}` : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'portal':
        return <PortalPage onNavigate={handleNavigate} />;
      case 'citizen_login':
        return <CitizenLoginPage onNavigate={handleNavigate} />;
      case 'citizen_register':
        return <CitizenRegisterPage onNavigate={handleNavigate} />;
      case 'citizen_verify_mobile':
        return <CitizenVerifyMobilePage onNavigate={handleNavigate} />;
      case 'citizen_forgot_password':
        return <CitizenForgotPasswordPage onNavigate={handleNavigate} />;
      case 'citizen_dashboard':
        return <CitizenDashboardPage onNavigate={handleNavigate} />;
      case 'new_complaint':
        return <NewComplaintPage onNavigate={handleNavigate} />;
      case 'citizen_complaint_detail':
        return <ComplaintDetailPage complaintId={pageParams.id} onNavigate={handleNavigate} />;
      case 'track':
        return <TrackComplaintPage onNavigate={handleNavigate} />;
      case 'admin_login':
        return <AdminLoginPage onNavigate={handleNavigate} />;
      case 'admin_dashboard':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case 'admin_complaints':
        return <AdminComplaintsListPage onNavigate={handleNavigate} />;
      case 'admin_complaint_review':
        return <AdminComplaintReviewPage complaintId={pageParams.id} onNavigate={handleNavigate} />;
      case 'admin_map':
        return <AdminMapPage onNavigate={handleNavigate} />;
      case 'admin_analytics':
        return <AdminAnalyticsPage onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPage onNavigate={handleNavigate} />;
      case 'help':
        return <HelpPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans selection:bg-teal-500 selection:text-white">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
