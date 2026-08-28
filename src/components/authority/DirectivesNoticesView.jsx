import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import IssueDirectiveModal from './IssueDirectiveModal';
import MineDetailModal from '../management/MineDetailModal';
import { 
  Scale, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Search, 
  Filter, 
  PlusCircle, 
  Building2, 
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateHelpers';

export default function DirectivesNoticesView() {
  const { alerts, mines, auditTrail } = useData();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedMine, setSelectedMine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMine, setFilterMine] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  // Directives from alerts (specifically type REGULATORY_DIRECTIVE or high-severity safety alerts)
  const directiveAlerts = alerts.filter(a => 
    a.type === 'REGULATORY_DIRECTIVE' || 
    (a.title && a.title.toLowerCase().includes('notice')) ||
    (a.title && a.title.toLowerCase().includes('directive'))
  );

  // Baseline directives so there's rich seed content immediately visible
  const defaultDirectives = [
    {
      id: 'DIR-2026-089',
      mineId: 'MINE-03',
      mineName: 'Demo Mine Gamma',
      title: 'Mandatory Overhaul of Underground Ventilation & CH4 Gas Sensors',
      description: 'DGMS Statutory Order under Coal Mines Regulations: Immediate recalibration of main exhaust fans and replacement of uncertified methane sensor units in Deep Seam IV within 48 hours.',
      severity: 'CRITICAL',
      status: 'ACTION REQUIRED',
      issuedBy: 'Anita Kulkarni (DGMS)',
      issuedDate: '2026-08-27 10:15:00',
      deadline: '2026-08-29 18:00:00',
      statutoryAct: 'CMR-2017 Section 138 (Ventilation)',
    },
    {
      id: 'DIR-2026-084',
      mineId: 'MINE-05',
      mineName: 'Demo Mine Epsilon',
      title: 'Slope Stability & Bench Angle Re-engineering Directive',
      description: 'Highwall safety notice: Radar geotechnical monitoring reports bench slope deviation exceeding 65 degrees. Cease heavy dumper movement on Bench 3 until geotechnical clearance.',
      severity: 'HIGH',
      status: 'IN REVIEW',
      issuedBy: 'DGMS Regional Directorate',
      issuedDate: '2026-08-24 14:30:00',
      deadline: '2026-08-31 17:00:00',
      statutoryAct: 'CMR-2017 Section 106 (Opencast Working)',
    },
    {
      id: 'DIR-2026-078',
      mineId: 'MINE-02',
      mineName: 'Demo Mine Beta',
      title: 'Heavy Machinery Audio-Visual Alarm Retrofit Notice',
      description: 'Audit finding verification: All haul trucks and dumpers must be retrofitted with proximity sensors and bi-directional backup warning horns.',
      severity: 'MEDIUM',
      status: 'COMPLIED',
      issuedBy: 'Inspectorate Board',
      issuedDate: '2026-08-20 09:00:00',
      deadline: '2026-08-28 23:59:00',
      statutoryAct: 'CMR-2017 Section 181 (Machinery Safety)',
    },
  ];

  // Combine dynamic alerts created during session with standard directives
  const dynamicDirectives = directiveAlerts.map(a => {
    const mineObj = mines.find(m => m.mineId === a.mineId || m.mineId === a.relatedEntity);
    return {
      id: a.alertId,
      mineId: a.mineId || a.relatedEntity || 'MINE-01',
      mineName: mineObj?.mineName || a.mineId || 'Coal Mine Unit',
      title: a.title.replace('Compliance Notice: ', ''),
      description: a.description || a.message,
      severity: a.severity || 'CRITICAL',
      status: a.isRead ? 'ACKNOWLEDGED' : 'ACTION REQUIRED',
      issuedBy: currentUser?.name || 'Regulatory Authority',
      issuedDate: a.timestamp || formatDateTime(a.createdDate),
      deadline: '48 Hours from issuance',
      statutoryAct: 'DGMS Smart Governance Directive',
    };
  });

  const allDirectives = [...dynamicDirectives, ...defaultDirectives];

  // Unique list by ID
  const uniqueDirectives = Array.from(new Map(allDirectives.map(d => [d.id, d])).values());

  // Filtered list
  const filtered = uniqueDirectives.filter(d => {
    if (filterMine !== 'ALL' && d.mineId !== filterMine) return false;
    if (filterSeverity !== 'ALL' && d.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.mineName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = uniqueDirectives.filter(d => d.severity === 'CRITICAL').length;
  const activeCount = uniqueDirectives.filter(d => d.status !== 'COMPLIED').length;
  const compliedCount = uniqueDirectives.filter(d => d.status === 'COMPLIED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <Scale className="w-5 h-5 text-mgRed-600" />
            <span>Regulatory Directives & Statutory Compliance Notices</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-mgRed-600 border border-red-200 font-mono font-bold">
              Enforcement Orders
            </span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Formal notices, statutory improvement directives, and safety shutdown notices issued under Coal Mines Regulations (CMR)
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-mgRed-600 hover:bg-mgRed-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue New Directive</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Directives Issued"
          value={uniqueDirectives.length}
          subtitle="All Monitored Coal Mines"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Critical / Urgent Notices"
          value={criticalCount}
          subtitle="Mandatory 48-Hour Remediation"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Active Enforcement"
          value={activeCount}
          subtitle="Pending Remediation Verification"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Verified Compliance"
          value={compliedCount}
          subtitle="Formally Closed Notices"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="mg-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted mb-1">
            Filter by Mine
          </label>
          <select
            value={filterMine}
            onChange={(e) => setFilterMine(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none"
          >
            <option value="ALL">All Monitored Mines</option>
            {mines.map(m => (
              <option key={m.mineId} value={m.mineId}>{m.mineName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted mb-1">
            Filter by Severity
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-enterprise-text-muted mb-1">
            Search Directives
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-enterprise-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notice ID, title, keyword..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-enterprise-border rounded-lg text-enterprise-text text-xs focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Directives List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="mg-card p-8 text-center text-enterprise-text-muted text-sm">
            No directives or notices found matching your search and filter criteria.
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              className={`mg-card border-l-4 p-5 shadow-card space-y-4 transition-all hover:shadow-card-hover ${
                d.severity === 'CRITICAL'
                  ? 'border-l-mgRed-500'
                  : d.severity === 'HIGH'
                  ? 'border-l-mgAmber-500'
                  : 'border-l-mgBlue-500'
              }`}
            >
              {/* Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-enterprise-border">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-enterprise-text">
                      {d.id}
                    </span>
                    <Badge size="sm">{d.severity}</Badge>
                    <Badge size="sm">{d.status}</Badge>
                    <span className="text-xs text-enterprise-text-muted font-mono">
                      {d.statutoryAct}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-enterprise-text">
                    {d.title}
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <button
                    onClick={() => {
                      const mineObj = mines.find(m => m.mineId === d.mineId);
                      if (mineObj) setSelectedMine(mineObj);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-mgBlue-600 hover:text-mgBlue-700 hover:underline"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{d.mineName} ({d.mineId})</span>
                  </button>
                  <p className="text-[10px] text-enterprise-text-muted font-mono mt-0.5">
                    Issued: {d.issuedDate}
                  </p>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-3.5 bg-gray-50/80 rounded-lg border border-enterprise-border text-xs text-enterprise-text-secondary leading-relaxed">
                <p className="font-semibold text-enterprise-text mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-mgRed-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Remediation Directive Mandate:</span>
                </p>
                {d.description}
              </div>

              {/* Bottom Footer Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-4 text-enterprise-text-muted text-[11px]">
                  <span>Issuing Officer: <strong className="text-enterprise-text">{d.issuedBy}</strong></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: <strong className="text-enterprise-text">{d.deadline}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const mineObj = mines.find(m => m.mineId === d.mineId);
                      if (mineObj) setSelectedMine(mineObj);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-enterprise-border text-enterprise-text text-xs font-bold rounded-lg transition-colors"
                  >
                    View Mine Profile
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-3 py-1.5 bg-mgRed-600 hover:bg-mgRed-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    Issue Follow-up Order
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <IssueDirectiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {selectedMine && (
        <MineDetailModal
          isOpen={!!selectedMine}
          onClose={() => setSelectedMine(null)}
          mine={selectedMine}
        />
      )}
    </div>
  );
}
