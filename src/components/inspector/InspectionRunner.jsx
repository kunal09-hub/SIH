import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ClipboardCheck, CheckCircle2, XCircle, MinusCircle, AlertTriangle, Send } from 'lucide-react';
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
      mineName: selectedMine?.mineName || 'Demo Mine Alpha',
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
      <div className="flex items-center justify-between pb-4 border-b border-enterprise-border">
        <div>
          <h2 className="text-xl font-bold text-enterprise-text flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-mgAmber-600" />
            <span>Digital Field Safety Inspection Runner</span>
          </h2>
          <p className="text-xs text-enterprise-text-muted mt-1">
            Standard Operating Procedure (SOP) safety & compliance evaluation checklist
          </p>
        </div>
      </div>

      {inspectionSuccessMsg && (
        <div className="p-4 bg-mgGreen-50 border border-green-200 rounded-lg flex items-center justify-between gap-3 text-xs text-mgGreen-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-mgGreen-600 shrink-0" />
            <span className="font-semibold">{inspectionSuccessMsg}</span>
          </div>
          <button
            onClick={() => {
              setInspectionSuccessMsg('');
              if (onComplete) onComplete();
            }}
            className="px-3 py-1.5 bg-mgGreen-600 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Inspection Header Selector */}
        <div className="mg-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-enterprise-text mb-1.5">Assigned Coal Mine</label>
            <select
              value={mineId}
              onChange={(e) => handleMineChange(e.target.value)}
              className="mg-select text-xs font-medium"
            >
              {mines.map(m => (
                <option key={m.mineId} value={m.mineId}>{m.mineName} ({m.mineId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-enterprise-text mb-1.5">Inspected Mine Zone / Operational Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mg-select text-xs font-medium"
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
            <label className="block text-xs font-semibold text-enterprise-text mb-1.5">Audit Type</label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value)}
              className="mg-select text-xs"
            >
              <option value="Electrical & Personnel Compliance Safety Inspection">Electrical & Personnel Compliance</option>
              <option value="Ventilation & Gas Testing Audit">Ventilation & Gas Testing Audit</option>
              <option value="Roof Support & Strata Control Inspection">Roof Support & Strata Control</option>
              <option value="HEMM Machinery & Transport Safety Audit">HEMM Machinery & Transport Safety</option>
            </select>
          </div>
        </div>

        {/* Checklist Table */}
        <div className="mg-card overflow-hidden">
          <div className="p-4 border-b border-enterprise-border bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-enterprise-text">
              Safety Evaluation Checklist ({checklist.length} Items)
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-mgGreen-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pass
              </span>
              <span className="flex items-center gap-1 text-mgRed-600 font-semibold">
                <XCircle className="w-3.5 h-3.5" /> Fail (Violation)
              </span>
              <span className="flex items-center gap-1 text-enterprise-text-muted">
                <MinusCircle className="w-3.5 h-3.5" /> N/A
              </span>
            </div>
          </div>

          <div className="divide-y divide-enterprise-border">
            {checklist.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-enterprise-text-secondary uppercase tracking-wider border border-gray-200">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-enterprise-text mt-1.5">{item.item}</p>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                    placeholder="Add inspector field observation notes..."
                    className="mt-2 w-full max-w-lg px-2.5 py-1.5 bg-white border border-enterprise-border rounded text-[11px] text-enterprise-text focus:outline-none focus:ring-2 focus:ring-mgBlue-500 font-mono"
                  />
                </div>

                {/* PASS / FAIL / NA Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'PASS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      item.status === 'PASS'
                        ? 'bg-mgGreen-600 text-white border-mgGreen-600 shadow-sm'
                        : 'bg-white text-enterprise-text-secondary hover:border-mgGreen-500 border-enterprise-border'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'FAIL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      item.status === 'FAIL'
                        ? 'bg-mgRed-600 text-white border-mgRed-600 shadow-sm'
                        : 'bg-white text-enterprise-text-secondary hover:border-mgRed-500 border-enterprise-border'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'N/A')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      item.status === 'N/A'
                        ? 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white text-enterprise-text-secondary hover:border-gray-400 border-enterprise-border'
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
        <div className="mg-card p-4 space-y-3">
          <label className="block text-xs font-semibold text-enterprise-text">Inspector Overall Concluding Remarks</label>
          <textarea
            rows="2"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="mg-input text-xs"
            placeholder="Summarize key inspection findings, immediate hazard warnings, or verbal instructions given..."
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-enterprise-border">
            <div className="flex items-center gap-2 text-xs">
              {hasFailures ? (
                <div className="flex items-center gap-1.5 text-mgRed-600 font-semibold bg-mgRed-50 px-3 py-1.5 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Compliance Failures Detected — Filing violation ticket will be required</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-mgGreen-600 font-semibold bg-mgGreen-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All evaluated safety parameters PASS</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-mgBlue-600 hover:bg-mgBlue-500 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
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
