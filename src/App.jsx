import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import LoginPage from './components/auth/LoginPage';
import DemoQuickBar from './components/common/DemoQuickBar';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Inspector Views
import InspectorDashboard from './components/inspector/InspectorDashboard';
import InspectionRunner from './components/inspector/InspectionRunner';
import ViolationsListView from './components/inspector/ViolationsListView';
import VerificationList from './components/inspector/VerificationList';
import CertificateVerifierModal from './components/inspector/CertificateVerifierModal';

// Officer Views
import OfficerDashboard from './components/officer/OfficerDashboard';
import WorkerRegistry from './components/officer/WorkerRegistry';
import CertificateManager from './components/officer/CertificateManager';
import CorrectiveActionManager from './components/officer/CorrectiveActionManager';

// Management Views
import ManagementDashboard from './components/management/ManagementDashboard';
import MineComparisonTable from './components/management/MineComparisonTable';
import RiskAnalyticsView from './components/management/RiskAnalyticsView';
import ExecutiveReportView from './components/management/ExecutiveReportView';
import MineDetailModal from './components/management/MineDetailModal';

// Authority Views
import RegulatoryDashboard from './components/authority/RegulatoryDashboard';
import HighRiskMinesView from './components/authority/HighRiskMinesView';
import DirectivesNoticesView from './components/authority/DirectivesNoticesView';
import AuditTrailView from './components/authority/AuditTrailView';

// SOS Emergency Alert Components
import InspectorSOSButton from './components/inspector/InspectorSOSButton';
import EmergencySOSOverlay from './components/officer/EmergencySOSOverlay';
import SOSHistoryView from './components/officer/SOSHistoryView';

function MainApp() {
  const { currentUser } = useAuth();
  const { mines } = useData();
  const { lastNotification, dismissNotification } = useOffline();
  const [currentTab, setCurrentTab] = useState(() => {
    try {
      return localStorage.getItem('mineguard_current_tab') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mineguard_current_tab', currentTab);
    } catch (e) {
      console.error('Error persisting current tab:', e);
    }
  }, [currentTab]);
  const [showQuickVerifier, setShowQuickVerifier] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAuditMine, setSelectedAuditMine] = useState(null);

  // Role Authorization Guard Map
  const roleAllowedTabs = {
    INSPECTOR: ['dashboard', 'inspections', 'verify-cert', 'violations', 'verifications'],
    OFFICER: ['dashboard', 'workers', 'certificates', 'actions', 'violations', 'sos-history', 'inspections-log'],
    MANAGEMENT: ['dashboard', 'mines-compare', 'risk-analytics', 'compliance-reports', 'sos-history', 'audit-log'],
    AUTHORITY: ['dashboard', 'high-risk', 'directives', 'sos-history', 'audit-log', 'compliance-reports']
  };

  // Reset tab when user role changes or when unauthorized tab is selected
  useEffect(() => {
    if (currentUser?.role && roleAllowedTabs[currentUser.role]) {
      if (!roleAllowedTabs[currentUser.role].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  }, [currentUser?.role, currentTab]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const role = currentUser.role;
  const isAuthorizedTab = roleAllowedTabs[role]?.includes(currentTab);

  // Render role-specific tab content
  const renderContent = () => {
    if (!isAuthorizedTab) {
      return (
        <div className="p-8 bg-mgRed-50 border border-red-200 rounded-lg text-center space-y-3">
          <h3 className="text-lg font-bold text-mgRed-600">Access Denied — Unauthorized Route</h3>
          <p className="text-sm text-enterprise-text-secondary">
            Your account ({currentUser.name} - {currentUser.role}) does not have permission to view this page.
          </p>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-4 py-2 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-bold text-sm rounded-lg shadow transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    if (role === 'INSPECTOR') {
      switch (currentTab) {
        case 'dashboard':
          return <InspectorDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
        case 'inspections':
          return <InspectionRunner onComplete={() => setCurrentTab('violations')} />;
        case 'verify-cert':
          return <CertificateVerifierModal isOpen={true} onClose={() => setCurrentTab('dashboard')} />;
        case 'violations':
          return <ViolationsListView />;
        case 'verifications':
          return <VerificationList />;
        default:
          return <InspectorDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      }
    }

    if (role === 'OFFICER') {
      switch (currentTab) {
        case 'dashboard':
          return <OfficerDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
        case 'sos-history':
          return <SOSHistoryView />;
        case 'workers':
          return <WorkerRegistry />;
        case 'certificates':
          return <CertificateManager />;
        case 'actions':
          return <CorrectiveActionManager />;
        case 'violations':
          return <ViolationsListView />;
        case 'inspections-log':
          return <AuditTrailView />;
        default:
          return <OfficerDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      }
    }

    if (role === 'MANAGEMENT') {
      switch (currentTab) {
        case 'dashboard':
          return <ManagementDashboard onNavigate={(tab) => setCurrentTab(tab)} onSelectMine={(m) => setSelectedAuditMine(m)} />;
        case 'sos-history':
          return <SOSHistoryView />;
        case 'mines-compare':
          return <MineComparisonTable mines={mines} onSelectMine={(m) => setSelectedAuditMine(m)} />;
        case 'risk-analytics':
          return <RiskAnalyticsView onNavigate={(tab) => setCurrentTab(tab)} onSelectMine={(m) => setSelectedAuditMine(m)} />;
        case 'compliance-reports':
          return <ExecutiveReportView />;
        case 'audit-log':
          return <AuditTrailView />;
        default:
          return <ManagementDashboard onNavigate={(tab) => setCurrentTab(tab)} onSelectMine={(m) => setSelectedAuditMine(m)} />;
      }
    }

    if (role === 'AUTHORITY') {
      switch (currentTab) {
        case 'dashboard':
          return <RegulatoryDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
        case 'sos-history':
          return <SOSHistoryView />;
        case 'high-risk':
          return <HighRiskMinesView onSelectMine={(m) => setSelectedAuditMine(m)} />;
        case 'directives':
          return <DirectivesNoticesView />;
        case 'audit-log':
          return <AuditTrailView />;
        case 'compliance-reports':
          return <ExecutiveReportView />;
        default:
          return <RegulatoryDashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      }
    }

    return <div className="p-8 text-center text-enterprise-text-muted">Select a valid menu item from the sidebar.</div>;
  };

  return (
    <div className="min-h-screen bg-enterprise-bg flex flex-col font-sans text-enterprise-text overflow-x-hidden">
      {/* 1. Quick Demo Bar */}
      <DemoQuickBar />

      {/* 1b. Offline Connectivity Notification Banner */}
      {lastNotification && (
        <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between transition-all border-b shadow-sm ${
          lastNotification.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : lastNotification.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-mgBlue-800'
            : 'bg-emerald-50 border-green-200 text-mgGreen-800'
        }`}>
          <div className="flex items-center gap-2">
            {lastNotification.type === 'warning' ? (
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            ) : lastNotification.type === 'info' ? (
              <RefreshCw className="w-4 h-4 text-mgBlue-600 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-mgGreen-600 shrink-0" />
            )}
            <span>{lastNotification.message}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="text-gray-400 hover:text-gray-700 font-bold px-2 py-0.5 text-xs rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Top Header / Navbar */}
      <Navbar 
        onNavigate={(tab) => setCurrentTab(tab)}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* 3. Main Body: Sidebar + Dynamic Dashboard Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={(tab) => { setCurrentTab(tab); setMobileMenuOpen(false); }}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-100px)] w-full max-w-full bg-enterprise-bg">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* 4. Real-Time Floating Inspector SOS Emergency Button (Inspector View Only) */}
      <InspectorSOSButton />

      {/* 5. Real-Time Full-Screen Emergency Alarm Popup Overlay (Officer / Management / Authority) */}
      <EmergencySOSOverlay />

      {/* Audit Mine Modal if triggered */}
      {selectedAuditMine && (
        <MineDetailModal
          isOpen={!!selectedAuditMine}
          onClose={() => setSelectedAuditMine(null)}
          mine={selectedAuditMine}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <OfflineProvider>
          <MainApp />
        </OfflineProvider>
      </DataProvider>
    </AuthProvider>
  );
}
