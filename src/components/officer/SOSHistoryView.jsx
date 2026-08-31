import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Search, Filter, User, MapPin, Radio } from 'lucide-react';
import Badge from '../common/Badge';

export default function SOSHistoryView() {
  const { currentUser } = useAuth();
  const { sosAlerts, acknowledgeSOSAlert } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isOfficerOrAdmin = currentUser && ['OFFICER', 'MANAGEMENT', 'AUTHORITY'].includes(currentUser.role);

  const filteredAlerts = (sosAlerts || []).filter(item => {
    const matchesSearch = 
      item.inspectorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alertId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inspectorId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = (sosAlerts || []).filter(a => a.status === 'ACTIVE').length;
  const acknowledgedCount = (sosAlerts || []).filter(a => a.status === 'ACKNOWLEDGED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-600 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              SOS Emergency Alerts History
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Immutable real-time emergency dispatch log & officer response audit record
            </p>
          </div>
        </div>

        {/* Counter Stats */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Active SOS</p>
            <p className="text-xl font-black text-red-600 font-mono">{activeCount}</p>
          </div>
          <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Acknowledged</p>
            <p className="text-xl font-black text-emerald-600 font-mono">{acknowledgedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Inspector, Mine, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-red-500 transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#64748B] hidden sm:inline-block" />
          <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
            {['ALL', 'ACTIVE', 'ACKNOWLEDGED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? st === 'ACTIVE'
                      ? 'bg-red-600 text-white shadow-sm'
                      : st === 'ACKNOWLEDGED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#F8FAFC] text-[#475569] hover:text-[#172033] border border-[#CBD5E1]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#334155]">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-mono text-[10px] tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3.5 px-4">Alert ID</th>
                <th className="py-3.5 px-4">Inspector Details</th>
                <th className="py-3.5 px-4">Mine Location</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Response Details</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-sans">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#94A3B8]">
                    No SOS emergency alerts match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((item) => (
                  <tr key={item.alertId} className="hover:bg-[#F8FAFC] transition-colors">
                    
                    {/* Alert ID */}
                    <td className="py-4 px-4 font-mono font-bold text-[#172033]">
                      <div className="flex items-center gap-1.5">
                        <Radio className={`w-3.5 h-3.5 ${item.status === 'ACTIVE' ? 'text-red-600 animate-pulse' : 'text-[#64748B]'}`} />
                        <span>{item.alertId}</span>
                      </div>
                    </td>

                    {/* Inspector Details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#172033]">{item.inspectorName}</p>
                          <p className="text-[10px] text-blue-600 font-mono font-semibold">ID: {item.inspectorId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Mine Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span className="font-semibold text-[#172033]">{item.mineName}</span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-4 font-mono text-[#64748B]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{item.timestamp}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <Badge size="sm" variant={item.status === 'ACTIVE' ? 'red' : 'green'}>
                        {item.status}
                      </Badge>
                    </td>

                    {/* Response Details */}
                    <td className="py-4 px-4 text-xs">
                      {item.status === 'ACKNOWLEDGED' ? (
                        <div className="space-y-0.5">
                          <p className="text-emerald-700 font-semibold">{item.acknowledgedBy || 'Mine Officer'}</p>
                          <p className="text-[10px] text-[#64748B] font-mono">{item.acknowledgedAt || item.acknowledgedTime}</p>
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] italic">Pending Response...</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-4 text-right">
                      {item.status === 'ACTIVE' && isOfficerOrAdmin ? (
                        <button
                          onClick={() => acknowledgeSOSAlert(item.alertId, `${currentUser.name} (${currentUser.role})`)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[#94A3B8] text-[11px]">—</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
