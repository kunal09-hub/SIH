import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Siren, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  Search, 
  Filter, 
  ShieldAlert, 
  Radio, 
  Download, 
  FileText,
  Activity
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';

export default function SOSHistoryView() {
  const { currentUser } = useAuth();
  const { sosAlerts, acknowledgeSOSAlert } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAlerts = (sosAlerts || []).filter(alert => {
    const matchesSearch = 
      (alert.inspectorName && alert.inspectorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.mineName && alert.mineName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.alertId && alert.alertId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.notes && alert.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = (sosAlerts || []).filter(a => a.status === 'ACTIVE').length;
  const acknowledgedCount = (sosAlerts || []).filter(a => a.status === 'ACKNOWLEDGED').length;

  const handleManualAcknowledge = (alertId) => {
    acknowledgeSOSAlert(
      alertId, 
      `${currentUser.name} (${currentUser.userId || currentUser.badge})`,
      currentUser.role
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 shadow-sm">
            <Siren className="w-6 h-6 text-red-600 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-enterprise-text flex items-center gap-2">
              <span>SOS Emergency Alert Log &amp; History</span>
              {activeCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold font-mono animate-pulse">
                  {activeCount} ACTIVE
                </span>
              )}
            </h1>
            <p className="text-xs text-enterprise-text-muted mt-0.5">
              Statutory Priority-1 distress signals, real-time dispatch telemetry, and verified response logs
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Emergency Log</span>
        </button>
      </div>

      {/* 2. Key Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total SOS Signals */}
        <div className="p-4 rounded-2xl bg-white border border-enterprise-border shadow-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-enterprise-text-muted font-semibold">Total Signals Logged</span>
            <p className="text-2xl font-black text-slate-800 font-mono mt-0.5">{sosAlerts.length}</p>
          </div>
        </div>

        {/* Active Emergency Status */}
        <div className={`p-4 rounded-2xl border shadow-card flex items-center gap-4 transition-all ${
          activeCount > 0 
            ? 'bg-red-50/90 border-red-300 ring-2 ring-red-500/20' 
            : 'bg-white border-enterprise-border'
        }`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            activeCount > 0 ? 'bg-red-600 text-white animate-bounce' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-xs font-semibold ${activeCount > 0 ? 'text-red-700' : 'text-enterprise-text-muted'}`}>
              Active Distress Alerts
            </span>
            <p className={`text-2xl font-black font-mono mt-0.5 ${activeCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {activeCount}
            </p>
          </div>
        </div>

        {/* Acknowledged Alerts */}
        <div className="p-4 rounded-2xl bg-white border border-enterprise-border shadow-card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-enterprise-text-muted font-semibold">Acknowledged &amp; Resolved</span>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{acknowledgedCount}</p>
          </div>
        </div>

      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-white border border-enterprise-border rounded-2xl shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inspector, mine, or alert ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['ALL', 'ACTIVE', 'ACKNOWLEDGED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 4. SOS History Records List / Table */}
      <div className="bg-white border border-enterprise-border rounded-2xl shadow-card overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No SOS Alerts Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No emergency signals match your active filter parameters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-enterprise-border">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.alertId}
                className={`p-5 sm:p-6 transition-colors ${
                  alert.status === 'ACTIVE' 
                    ? 'bg-red-50/50 hover:bg-red-50' 
                    : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Status Beacon & Core Incident Info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.status === 'ACTIVE'
                        ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/30'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <Siren className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {alert.alertId}
                        </span>
                        
                        {alert.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-extrabold uppercase animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            ACTIVE EMERGENCY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ACKNOWLEDGED
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-mono">
                          {alert.displayTime || formatDateTime(alert.timestamp)}
                        </span>
                      </div>

                      {/* Mine & Inspector Identity */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-0.5">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {alert.mineName} ({alert.zoneName || 'Underground Section'})
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Inspector: <strong>{alert.inspectorName}</strong> ({alert.inspectorId})
                        </span>
                      </div>

                      {/* Situation Notes */}
                      {alert.notes && (
                        <p className="text-xs text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/70 font-mono mt-2">
                          "{alert.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Response Details & Acknowledge Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:pl-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200">
                    {alert.status === 'ACKNOWLEDGED' ? (
                      <div className="text-left lg:text-right space-y-0.5 text-xs">
                        <span className="text-[11px] text-slate-400 block">Acknowledged By:</span>
                        <p className="font-bold text-slate-800">{alert.acknowledgedBy}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{alert.acknowledgedTime}</p>
                        {alert.responseTimeSec && (
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                            Response: {alert.responseTimeSec}s
                          </span>
                        )}
                      </div>
                    ) : (
                      (currentUser?.role === 'OFFICER' || currentUser?.role === 'MANAGEMENT' || currentUser?.role === 'AUTHORITY') && (
                        <button
                          onClick={() => handleManualAcknowledge(alert.alertId)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Acknowledge SOS</span>
                        </button>
                      )
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
