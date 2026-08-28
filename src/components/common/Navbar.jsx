import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Bell, LogOut, Shield, AlertTriangle, CheckCircle, Menu, X } from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';

export default function Navbar({ onNavigate, onToggleMobileMenu, isMobileMenuOpen }) {
  const { currentUser, logout } = useAuth();
  const { alerts, markAlertRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter alerts relevant to current role
  const roleKey = currentUser?.role?.toLowerCase();
  const userAlerts = alerts.filter(a => !a.targetRoles || a.targetRoles.includes(roleKey));
  const unreadCount = userAlerts.filter(a => a.status === 'UNREAD').length;

  return (
    <header className="bg-navy-800 px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 sticky top-0 shadow-nav">
      {/* Brand & Logo + Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          {/* MineGuard AI Shield Logo */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center shadow shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-navy-800" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
              MineGuard <span className="text-mgBlue-400">AI</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-white/50 tracking-wide hidden md:block">
              AI-Based Smart Governance & Compliance Monitoring System for Coal Mines
            </p>
          </div>
        </div>
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] rounded-full bg-mgRed-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-enterprise-border shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-enterprise-border flex items-center justify-between">
                <span className="text-sm font-bold text-enterprise-text">Notifications</span>
                <span className="text-xs text-enterprise-text-secondary">{unreadCount} Unread</span>
              </div>
              <div className="divide-y divide-enterprise-border">
                {userAlerts.length === 0 ? (
                  <p className="text-sm text-enterprise-text-muted py-6 text-center">No active notifications.</p>
                ) : (
                  userAlerts.slice(0, 8).map(alert => (
                    <div 
                      key={alert.alertId}
                      onClick={() => markAlertRead(alert.alertId)}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${alert.status === 'UNREAD' ? 'bg-mgBlue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? (
                          <AlertTriangle className="w-4 h-4 text-mgRed-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-mgBlue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-enterprise-text">{alert.title}</p>
                          <p className="text-xs text-enterprise-text-secondary mt-0.5 leading-relaxed">{alert.description}</p>
                          <p className="text-xs text-enterprise-text-muted mt-1 font-mono">{formatDateTime(alert.createdDate)}</p>
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
          <div className="flex items-center gap-3 pl-3 border-l border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm text-white font-semibold">
              {currentUser.name?.charAt(0) || '?'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-white/50">{currentUser.designation?.split('(')[0]}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
