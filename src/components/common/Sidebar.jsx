import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  FileCheck,
  Users,
  ShieldAlert,
  ShieldCheck,
  Layers,
  FileText,
  Activity,
  History,
  Scale,
  QrCode
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, isOpen, onClose }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'INSPECTOR';

  // Define original navigation tabs per role
  const getNavItems = () => {
    switch (role) {
      case 'INSPECTOR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'inspections', label: 'Field Inspections', icon: ClipboardCheck },
          { id: 'verify-cert', label: 'Verify Certificate', icon: QrCode },
          { id: 'violations', label: 'Violations Log', icon: AlertTriangle },
          { id: 'verifications', label: 'Verification Desk', icon: ShieldCheck },
        ];
      case 'OFFICER':
        return [
          { id: 'dashboard', label: 'Mine Dashboard', icon: LayoutDashboard },
          { id: 'workers', label: 'Worker Registry', icon: Users },
          { id: 'certificates', label: 'Certificates', icon: FileCheck },
          { id: 'actions', label: 'Corrective Actions', icon: ShieldAlert },
          { id: 'violations', label: 'Violations', icon: AlertTriangle },
          { id: 'inspections-log', label: 'Audit Log', icon: History },
        ];
      case 'MANAGEMENT':
        return [
          { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
          { id: 'mines-compare', label: 'Mine Comparison', icon: Layers },
          { id: 'risk-analytics', label: 'Risk Analytics', icon: Activity },
          { id: 'compliance-reports', label: 'Reports & Compliance', icon: FileText },
          { id: 'audit-log', label: 'Audit Trail', icon: History },
        ];
      case 'AUTHORITY':
        return [
          { id: 'dashboard', label: 'National Overview', icon: LayoutDashboard },
          { id: 'high-risk', label: 'High-Risk Units', icon: AlertTriangle },
          { id: 'directives', label: 'Directives & Notices', icon: Scale },
          { id: 'audit-log', label: 'System Audit Trail', icon: History },
          { id: 'compliance-reports', label: 'Safety Reports', icon: FileText },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Navigation Items */}
      <nav className="py-3 space-y-1 px-2.5">
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-mgBlue-600 text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/60'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/50 space-y-1">
        <div className="flex justify-between items-center text-[11px]">
          <span>System Status:</span>
          <span className="text-mgGreen-500 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-mgGreen-500"></span>
            Operational
          </span>
        </div>
        <p className="text-center text-white/30 text-[10px]">
          MineGuard AI • Made By Team PRAYOJANA
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-56 bg-navy-800 flex-col shrink-0 min-h-[calc(100vh-52px)] border-r border-navy-700">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="relative w-64 max-w-[80vw] bg-navy-800 flex flex-col z-50 h-full overflow-y-auto shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
