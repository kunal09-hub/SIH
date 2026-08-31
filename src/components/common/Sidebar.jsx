import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileCheck,
  Users,
  ShieldAlert,
  BarChart3,
  Layers,
  FileText,
  Activity,
  History,
  Scale,
  Radio,
  X,
  User,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, isOpen, onClose }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'INSPECTOR';

  // Define navigation tabs per role
  const getNavItems = () => {
    switch (role) {
      case 'INSPECTOR':
        return [
          { id: 'dashboard', label: 'Inspector Dashboard', icon: LayoutDashboard },
          { id: 'inspections', label: 'Conduct Inspection', icon: ClipboardCheck },
          { id: 'verify-cert', label: 'Verify Certificate', icon: FileCheck },
          { id: 'violations', label: 'Violations & Reports', icon: AlertTriangle },
          { id: 'verifications', label: 'Verification Sign-Off', icon: ShieldAlert },
          { id: 'sos-history', label: 'SOS Alerts Log', icon: Radio },
        ];
      case 'OFFICER':
        return [
          { id: 'dashboard', label: 'Mine Overview', icon: LayoutDashboard },
          { id: 'workers', label: 'Worker Registry', icon: Users },
          { id: 'certificates', label: 'Certificate Manager', icon: FileCheck },
          { id: 'actions', label: 'Corrective Actions', icon: ShieldAlert },
          { id: 'violations', label: 'Violations Inbox', icon: AlertTriangle },
          { id: 'inspections-log', label: 'Inspection History', icon: History },
          { id: 'sos-history', label: 'SOS Alerts Log', icon: Radio },
        ];
      case 'MANAGEMENT':
        return [
          { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
          { id: 'mines-compare', label: 'Mines Benchmark', icon: Layers },
          { id: 'risk-analytics', label: 'Risk Analytics', icon: Activity },
          { id: 'compliance-reports', label: 'Compliance Reports', icon: BarChart3 },
          { id: 'audit-log', label: 'Governance Audit Trail', icon: History },
          { id: 'sos-history', label: 'SOS Alerts Log', icon: Radio },
        ];
      case 'AUTHORITY':
        return [
          { id: 'dashboard', label: 'National Overview', icon: LayoutDashboard },
          { id: 'high-risk', label: 'High-Risk Mines', icon: AlertTriangle },
          { id: 'directives', label: 'Directives & Notices', icon: Scale },
          { id: 'audit-log', label: 'Compliance Audit Trail', icon: History },
          { id: 'compliance-reports', label: 'Safety Reports', icon: BarChart3 },
          { id: 'sos-history', label: 'SOS Alerts Log', icon: Radio },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const getRoleBadgeLabel = () => {
    switch (role) {
      case 'INSPECTOR':
        return 'FIELD INSPECTOR';
      case 'OFFICER':
        return 'MINE SAFETY OFFICER';
      case 'MANAGEMENT':
        return 'EXECUTIVE MANAGEMENT';
      case 'AUTHORITY':
        return 'REGULATORY AUTHORITY';
      default:
        return 'AUTHORIZED USER';
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 bg-white select-none">
      <div className="space-y-5">
        
        {/* Mobile Header with Close Button */}
        {isOpen && (
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-black text-base text-[#172033]">MineGuard</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Clean Compact Profile Section */}
        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 font-bold text-sm shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#172033] truncate">
                {currentUser?.name || 'Authorized User'}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">
                {currentUser?.designation || 'Statutory Mine Safety'}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="pt-1 flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold tracking-wide">
              {getRoleBadgeLabel()}
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8] font-semibold">
              {currentUser?.badge || 'ID-001'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] px-3 pb-2">
            MAIN NAVIGATION
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-bold shadow-sm border-l-4 border-[#2563EB]'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E40AF]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Redesigned Sidebar Footer */}
      <div className="pt-4 border-t border-[#E2E8F0] text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B] font-medium">System Status:</span>
          <span className="text-[#16A34A] font-bold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            Operational
          </span>
        </div>
        <div className="text-center pt-1 text-[#94A3B8]">
          <p className="text-[11px] font-bold text-[#475569]">MineGuard</p>
          <p className="text-[10px] text-[#94A3B8]">Safety & Governance Platform</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-white border-r border-[#E2E8F0] flex-col shrink-0 min-h-[calc(100vh-68px)] shadow-[0_1px_3px_rgba(15,23,42,0.06)] z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="relative w-72 max-w-[82vw] bg-white border-r border-[#E2E8F0] flex flex-col z-50 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
