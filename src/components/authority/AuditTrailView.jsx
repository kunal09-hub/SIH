import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { History, Search, Filter, ShieldCheck, User } from 'lucide-react';
import Badge from '../common/Badge';

export default function AuditTrailView() {
  const { auditTrail, mines } = useData();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterMine, setFilterMine] = useState(currentUser?.role === 'OFFICER' ? (currentUser.mineId || 'MINE-01') : 'ALL');

  const filteredLogs = auditTrail.filter(item => {
    if (currentUser?.role === 'OFFICER' && item.mineId && item.mineId !== (currentUser.mineId || 'MINE-01')) return false;
    if (filterMine !== 'ALL' && item.mineId && item.mineId !== filterMine) return false;
    if (filterRole !== 'ALL' && item.role.toUpperCase() !== filterRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.details.toLowerCase().includes(q) ||
             item.actor.toLowerCase().includes(q) ||
             item.action.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600" />
              <span>Governance Audit Trail</span>
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Immutable chronological record of inspections, violations, alerts, and corrective action handoffs
          </p>
        </div>
        <Badge size="md">{auditTrail.length} Logged Events</Badge>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-sm">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Filter by Actor Role</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Roles</option>
            <option value="INSPECTOR">Inspector</option>
            <option value="OFFICER">Mine Officer</option>
            <option value="MANAGEMENT">Management</option>
            <option value="AUTHORITY">Regulatory Authority</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Search Audit Logs</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, ticket ID..."
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-[#172033] text-xs focus:outline-none focus:border-blue-600 font-mono"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-[#E2E8F0]">
          {filteredLogs.map((entry) => (
            <div key={entry.auditId} className="p-4 sm:p-5 hover:bg-[#F8FAFC] transition-colors flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-mono text-blue-600 shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172033] text-xs">{entry.actor}</span>
                    <Badge size="sm">{entry.role}</Badge>
                    <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      [{entry.action}]
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#64748B]">{entry.timestamp}</span>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed font-sans">{entry.details}</p>
                <p className="text-[10px] text-[#94A3B8] font-mono">Entity ID: {entry.auditId} • Target Mine: {entry.mineId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
