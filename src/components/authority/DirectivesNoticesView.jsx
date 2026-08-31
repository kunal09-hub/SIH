import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import {
  Scale,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Plus,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import IssueDirectiveModal from './IssueDirectiveModal';
import MineDetailModal from '../management/MineDetailModal';

export default function DirectivesNoticesView({ onNavigate, onSelectMine }) {
  const { mines, alerts, violations } = useData();
  const { currentUser } = useAuth();

  const [showDirectiveModal, setShowDirectiveModal] = useState(false);
  const [selectedDetailMine, setSelectedDetailMine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [mineFilter, setMineFilter] = useState('ALL');

  // Collect directives from alerts of type 'REGULATORY_DIRECTIVE'
  const directiveAlerts = alerts.filter(a => a.type === 'REGULATORY_DIRECTIVE');

  // Baseline standard statutory directives for rich demonstration
  const baseDirectives = [
    {
      id: 'DIR-2026-003',
      mineId: 'MINE-03',
      mineName: 'Mine Gamma',
      title: 'Mandatory Ventilation Recalibration & Blasting Protocol Audit',
      description: 'DGMS Notice: Methane sensor calibration overdue by 45 days in Deep Seam IV. Immediate inspection and sensor recalibration required within 48 hours to avert ignition risk.',
      severity: 'CRITICAL',
      status: 'ACTIVE ENFORCEMENT',
      issuedDate: '2026-08-25 10:30:00',
      issuedBy: 'Directorate General of Mines Safety (DGMS)',
      complianceDeadline: '48 Hours',
      regulatoryClause: 'Coal Mines Regulations (CMR) 2017 - Regulation 153'
    },
    {
      id: 'DIR-2026-002',
      mineId: 'MINE-02',
      mineName: 'Mine Beta',
      title: 'Heavy Earthmoving Equipment Audio-Visual Alarm Retrofit',
      description: 'Statutory directive to ensure all haulage dumpers (including Dumper D-08) have functioning reverse sirens and proximity sensors operational prior to next shift.',
      severity: 'HIGH',
      status: 'UNDER REMEDIATION',
      issuedDate: '2026-08-22 14:15:00',
      issuedBy: 'Regional Safety Inspectorate',
      complianceDeadline: '7 Days',
      regulatoryClause: 'DGMS Technical Circular No. 04 of 2020'
    },
    {
      id: 'DIR-2026-001',
      mineId: 'MINE-01',
      mineName: 'Mine Alpha',
      title: 'Substation Mandatory Electrical Competency Certification Validation',
      description: 'Audit notice requiring re-verification of all electrical supervisors in high voltage substation zones. Verified competency documentation must be filed on MineGuard portal.',
      severity: 'MEDIUM',
      status: 'COMPLIANCE PENDING',
      issuedDate: '2026-08-20 09:00:00',
      issuedBy: 'State Mining Directorate',
      complianceDeadline: '14 Days',
      regulatoryClause: 'Central Electricity Authority (Safety & Electric Supply) Reg 2010'
    }
  ];

  // Dynamic directives created by user through IssueDirectiveModal
  const userDirectives = directiveAlerts.map(a => {
    const targetMine = mines.find(m => m.mineId === a.mineId || m.mineId === a.relatedEntity);
    return {
      id: a.alertId,
      mineId: a.mineId || a.relatedEntity || 'MINE-01',
      mineName: targetMine?.mineName || a.mineId || 'Mine Gamma',
      title: a.title.replace(/^Compliance Notice:\s*/, ''),
      description: a.description,
      severity: a.severity || 'CRITICAL',
      status: 'ACTIVE ENFORCEMENT',
      issuedDate: a.createdDate ? new Date(a.createdDate).toISOString().replace('T', ' ').slice(0, 19) : '2026-08-31 10:00:00',
      issuedBy: `${currentUser?.name || 'Director General'} (DGMS Regulatory Desk)`,
      complianceDeadline: a.severity === 'CRITICAL' ? '48 Hours' : '7 Days',
      regulatoryClause: 'Statutory Safety Directive — Emergency Power under CMR 2017'
    };
  });

  const allDirectives = [...userDirectives, ...baseDirectives];

  const filteredDirectives = allDirectives.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || d.severity === severityFilter;
    const matchesMine = mineFilter === 'ALL' || d.mineId === mineFilter;

    return matchesSearch && matchesSeverity && matchesMine;
  });

  const criticalCount = allDirectives.filter(d => d.severity === 'CRITICAL').length;
  const uniqueMinesTargeted = new Set(allDirectives.map(d => d.mineId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Directives & Regulatory Notices
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-mono font-bold">
              Statutory Enforcements
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Statutory notices, regulatory directives, and mandatory remediation orders issued to mining units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDirectiveModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Compliance Notice</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Notices Issued"
          value={allDirectives.length}
          subtitle="Enforcement Orders on Record"
          icon={Scale}
          color="blue"
        />
        <StatCard
          title="Critical Interventions"
          value={criticalCount}
          subtitle="Immediate 48h Remediation"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Targeted Mine Sites"
          value={uniqueMinesTargeted}
          subtitle="Mines Under Active Order"
          icon={Building2}
          color="amber"
        />
        <StatCard
          title="Regulatory Response Rate"
          value="84%"
          subtitle="Mine Corrective Action Compliance"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search directives, keywords, mine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-blue-600 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>

          <select
            value={mineFilter}
            onChange={(e) => setMineFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Mines</option>
            {mines.map(m => (
              <option key={m.mineId} value={m.mineId}>{m.mineName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directives List */}
      <div className="space-y-4">
        {filteredDirectives.length === 0 ? (
          <div className="p-12 bg-white border border-[#E2E8F0] rounded-2xl text-center text-[#64748B] shadow-sm">
            <FileText className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
            <p className="text-sm font-semibold text-[#172033]">No regulatory directives match your criteria.</p>
            <p className="text-xs text-[#64748B] mt-1">Try adjusting the filter options or issue a new compliance notice.</p>
          </div>
        ) : (
          filteredDirectives.map((d) => {
            const targetMine = mines.find(m => m.mineId === d.mineId);
            return (
              <div
                key={d.id}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm transition-all space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#172033] font-mono text-xs font-bold border border-[#CBD5E1]">
                      {d.id}
                    </span>
                    <Badge size="sm">{d.severity}</Badge>
                    <Badge size="sm" variant={d.status.includes('ACTIVE') ? 'red' : 'amber'}>
                      {d.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#64748B] font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Deadline: <strong className="text-[#172033]">{d.complianceDeadline}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {d.issuedDate}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <h3 className="text-sm font-bold text-[#172033]">
                      Target: {d.mineName} ({d.mineId})
                    </h3>
                    {targetMine && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${targetMine.complianceScore < 75 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        Score: {targetMine.complianceScore}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-blue-700 mt-1">
                    {d.title}
                  </h4>
                  <p className="text-xs text-[#334155] mt-2 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                    {d.description}
                  </p>
                </div>

                {/* Bottom Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[#E2E8F0]">
                  <div className="text-[11px] text-[#64748B] space-y-0.5">
                    <p>Issuing Authority: <span className="text-[#172033] font-medium">{d.issuedBy}</span></p>
                    <p className="font-mono text-[#64748B] text-[10px]">Mandate: {d.regulatoryClause}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {targetMine && (
                      <button
                        onClick={() => setSelectedDetailMine(targetMine)}
                        className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#172033] text-xs font-bold rounded-xl flex items-center gap-1 border border-[#CBD5E1] transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Inspect Mine Status</span>
                      </button>
                    )}
                    <button
                      onClick={() => onNavigate && onNavigate('high-risk')}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <span>View Watchlist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Issue Directive Modal */}
      <IssueDirectiveModal
        isOpen={showDirectiveModal}
        onClose={() => setShowDirectiveModal(false)}
      />

      {/* Mine Detail Modal */}
      {selectedDetailMine && (
        <MineDetailModal
          isOpen={!!selectedDetailMine}
          onClose={() => setSelectedDetailMine(null)}
          mine={selectedDetailMine}
        />
      )}
    </div>
  );
}
