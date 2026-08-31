import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Bell, LogOut, Shield, User, Clock, AlertTriangle, CheckCircle, Menu, X, Search } from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';

export default function Navbar({ onNavigate, onToggleMobileMenu, isMobileMenuOpen }) {
  const { currentUser, logout } = useAuth();
  const { alerts, markAlertRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter alerts relevant to current role
  const roleKey = currentUser?.role?.toLowerCase();
  const userAlerts = alerts.filter(a => !a.targetRoles || a.targetRoles.includes(roleKey));
  const unreadCount = userAlerts.filter(a => a.status === 'UNREAD').length;

  return (
    <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 h-[68px] flex items-center justify-between z-30 sticky top-0 shadow-[0_1px_3px_rgba(15,23,42,0.04)] select-none">
      {/* Left Brand & Mobile Menu Toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-[#F8FAFC] text-[#475569] hover:text-[#172033] border border-[#E2E8F0] hover:bg-[#F1F5F9] focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-extrabold text-base sm:text-lg shrink-0 border border-blue-400/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#172033] flex items-center gap-1">
                MineGuard
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-200 hidden sm:inline-block">
                Governance
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] tracking-normal hidden md:block font-medium">
              Smart Mine Governance & Safety Management System
            </p>
          </div>
        </div>
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] transition-colors border border-[#E2E8F0]"
            title="Notifications & Alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xl z-50 p-3 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">System Alerts & Notices</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} Unread</span>
              </div>
              <div className="divide-y divide-[#E2E8F0] mt-2">
                {userAlerts.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] py-5 text-center">No active notifications.</p>
                ) : (
                  userAlerts.slice(0, 8).map(alert => (
                    <div 
                      key={alert.alertId}
                      onClick={() => markAlertRead(alert.alertId)}
                      className={`py-3 px-2.5 hover:bg-[#F8FAFC] rounded-xl cursor-pointer transition-colors ${alert.status === 'UNREAD' ? 'bg-blue-50/40' : 'opacity-80'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? (
                          <div className="p-1 rounded-lg bg-red-50 text-[#DC2626] shrink-0 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-lg bg-blue-50 text-[#2563EB] shrink-0 mt-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#172033] truncate">{alert.title}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{alert.description}</p>
                          <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">{formatDateTime(alert.createdDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#E2E8F0]">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-[#64748B] font-medium truncate max-w-[140px]">
                {currentUser.designation || currentUser.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 rounded-xl transition-colors ml-0.5"
              title="Logout session"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
