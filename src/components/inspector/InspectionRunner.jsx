import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ClipboardCheck, CheckCircle2, XCircle, MinusCircle, AlertTriangle, Send, Sparkles, UserCheck } from 'lucide-react';
import ReportViolationModal from './ReportViolationModal';

export default function InspectionRunner({ onComplete }) {
  const { mines, workers, certificates, createInspection } = useData();
  const { currentUser } = useAuth();

  const [mineId, setMineId] = useState('MINE-01');
  const selectedMine = mines.find(m => m.mineId === mineId) || mines[0];
  const [area, setArea] = useState(selectedMine?.zones?.[0]?.zoneName || 'North Shaft');
  const [inspectionType, setInspectionType] = useState('Electrical & Personnel Compliance Safety Inspection');
  const [generalNotes, setGeneralNotes] = useState('');
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [submittedInspection, setSubmittedInspection] = useState(null);
  const [inspectionSuccessMsg, setInspectionSuccessMsg] = useState('');

  // Update area when mineId changes
  const handleMineChange = (newMineId) => {
    setMineId(newMineId);
    const m = mines.find(x => x.mineId === newMineId);
    if (m && m.zones && m.zones.length > 0) {
      setArea(m.zones[0].zoneName);
    }
  };

  // Find workers and candidate cert for the selected mine and zone
  const mineWorkers = workers.filter(w => w.mineId === mineId);
  const zoneWorkers = mineWorkers.filter(w => w.zoneName === area || w.area === area);
  const activeWorkersPool = zoneWorkers.length > 0 ? zoneWorkers : mineWorkers;

  const candidateWorker = activeWorkersPool.find(w => {
    return certificates.some(c => c.workerId === w.workerId && new Date(c.expiryDate) < new Date());
  }) || activeWorkersPool[0];

  // Pre-configured checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, category: 'Safety & Signage', item: 'Danger High Voltage signage & isolation barriers in place', status: 'PASS', notes: 'Visible and illuminated' },
    { id: 2, category: 'Safety & Signage', item: 'Emergency fire extinguishers inspected and charged (CO2/Dry Powder)', status: 'PASS', notes: 'Pressure gauges nominal' },
    { id: 3, category: 'Equipment Safety', item: 'Transformer grounding & earth leakage circuit breakers tested', status: 'PASS', notes: 'Ground resistance nominal' },
    { id: 4, category: 'Equipment Safety', item: 'Insulated rubber floor matting in front of power panels', status: 'PASS', notes: 'Tested and stamp verified' },
    { id: 5, category: 'Worker Compliance', item: 'On-duty personnel possess valid mandatory competency certificate', status: 'FAIL', notes: 'Assigned personnel competency certificate expired' },
    { id: 6, category: 'Worker Compliance', item: 'Mandatory PPE (Arc-flash shield / helmet / safety boots) worn', status: 'PASS', notes: 'PPE in proper use' },
  ]);

  const updateItemStatus = (id, newStatus) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const updateItemNotes = (id, notes) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const hasFailures = checklist.some(item => item.status === 'FAIL');

  const handleSubmit = (e) => {
    e.preventDefault();
    const overallResult = hasFailures ? 'FAILED' : 'PASSED';
    const newInsp = createInspection({
      mineId,
      mineName: selectedMine?.mineName || 'Mine Alpha',
      area,
      inspectionType,
      checklistResults: checklist,
      overallResult,
      notes: generalNotes || (hasFailures ? 'Inspection logged compliance failures requiring immediate rectification.' : 'All statutory safety parameters verified in nominal condition.'),
      evidence: 'evidence_field_inspection_01.jpg',
      inspectorId: currentUser?.userId || 'inspector01',
      inspectorName: currentUser?.name || 'Rajesh Kumar',
    }, currentUser?.name);

    setSubmittedInspection(newInsp);
    if (hasFailures) {
      setShowViolationModal(true);
    } else {
      setInspectionSuccessMsg(`Inspection ${newInsp.inspectionId} submitted successfully with 100% PASS score.`);
    }
  };

  const candidateCert = candidateWorker ? certificates.find(c => c.workerId === candidateWorker.workerId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              <span>Field Safety Inspection Runner</span>
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Standard Operating Procedure (SOP) safety & compliance evaluation checklist
          </p>
        </div>
      </div>

      {inspectionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{inspectionSuccessMsg}</span>
          </div>
          <button
            onClick={() => {
              setInspectionSuccessMsg('');
              if (onComplete) onComplete();
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Inspection Header Selector */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">Assigned Coal Mine</label>
            <select
              value={mineId}
              onChange={(e) => handleMineChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600 font-medium"
            >
              {mines.map(m => (
                <option key={m.mineId} value={m.mineId}>{m.mineName} ({m.mineId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">Inspected Mine Zone / Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600 font-medium"
            >
              {selectedMine?.zones ? (
                selectedMine.zones.map(z => (
                  <option key={z.zoneId} value={z.zoneName}>{z.zoneId}: {z.zoneName}</option>
                ))
              ) : (
                <>
                  <option value="North Shaft">North Shaft</option>
                  <option value="South Shaft">South Shaft</option>
                  <option value="Processing Plant">Processing Plant</option>
                  <option value="Substation">Substation</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5">Audit Type</label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
            >
              <option value="Electrical & Personnel Compliance Safety Inspection">Electrical & Personnel Compliance</option>
              <option value="Ventilation & Gas Testing Audit">Ventilation & Gas Testing Audit</option>
              <option value="Roof Support & Strata Control Inspection">Roof Support & Strata Control</option>
              <option value="HEMM Machinery & Transport Safety Audit">HEMM Machinery & Transport Safety</option>
            </select>
          </div>
        </div>

        {/* Checklist Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Safety Evaluation Checklist ({checklist.length} Items)
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pass
              </span>
              <span className="flex items-center gap-1 text-red-700 font-semibold">
                <XCircle className="w-3.5 h-3.5 text-red-600" /> Fail
              </span>
              <span className="flex items-center gap-1 text-[#64748B]">
                <MinusCircle className="w-3.5 h-3.5" /> N/A
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {checklist.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 hover:bg-[#F8FAFC] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-wider border border-blue-200">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#172033] mt-1.5">{item.item}</p>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    placeholder="Add inspector field observation notes..."
                    className="mt-2 w-full max-w-lg px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                {/* PASS / FAIL / NA Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'PASS')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      item.status === 'PASS'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-[#64748B] hover:text-emerald-600 border border-[#CBD5E1]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'FAIL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      item.status === 'FAIL'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white text-[#64748B] hover:text-red-600 border border-[#CBD5E1]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'N/A')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      item.status === 'N/A'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white text-[#64748B] hover:text-[#172033] border border-[#CBD5E1]'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>N/A</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Notes & Submit */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl space-y-3 shadow-sm">
          <label className="block text-xs font-semibold text-[#334155]">Inspector Overall Concluding Remarks</label>
          <textarea
            rows="2"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-blue-600"
            placeholder="Summarize key inspection findings, immediate hazard warnings, or verbal instructions given..."
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-xs">
              {hasFailures ? (
                <div className="flex items-center gap-1.5 text-red-700 font-semibold bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Compliance Failures Detected — Violation logging modal will open next</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All evaluated safety parameters PASS</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Field Inspection Report</span>
            </button>
          </div>
        </div>
      </form>

      {/* Auto Report Violation Modal upon failure */}
      <ReportViolationModal
        isOpen={showViolationModal}
        onClose={() => {
          setShowViolationModal(false);
          if (onComplete) onComplete();
        }}
        initialData={{
          mineId,
          area,
          category: 'Statutory Certification Breach',
          severity: 'HIGH',
          workerId: candidateWorker?.workerId || '',
          certificateId: candidateCert?.certificateId || '',
          description: candidateWorker 
            ? `${candidateWorker.role} ${candidateWorker.name} (${candidateWorker.workerId}) observed on duty in ${area} with expired safety competency certification.`
            : `Safety non-compliance detected in ${area} requiring immediate remediation.`,
          inspectionId: submittedInspection?.inspectionId
        }}
      />
    </div>
  );
}
