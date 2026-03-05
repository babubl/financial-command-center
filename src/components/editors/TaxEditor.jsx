// ─── Tax Deductions Editor ───
import React, { useState, useEffect } from 'react';
import Modal, { ModalFooter } from '@/components/shared/Modal';
import { useFinance, useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { section80C, deductionLimits } from '@/constants/financialRules';
import { formatINR } from '@/utils/formatters';

export default function TaxEditor({ isOpen, onClose }) {
  const data = useFinance();
  const dispatch = useFinanceDispatch();

  const [form80C, setForm80C] = useState({});
  const [form80D, setForm80D] = useState({});
  const [nps, setNps] = useState('');
  const [hlInterest, setHlInterest] = useState('');
  const [regime, setRegime] = useState('new');

  useEffect(() => {
    const ded = data.taxDeductions || {};
    setForm80C({ ...(ded.section80C || {}) });
    setForm80D({ ...(ded.section80D || {}) });
    setNps(ded.section80CCD1B || '');
    setHlInterest(ded.section24b || '');
    setRegime(data.profile?.taxRegime || 'new');
  }, [data.taxDeductions, data.profile, isOpen]);

  const handleSave = () => {
    dispatch({
      type: ACTIONS.UPDATE_TAX_DEDUCTIONS,
      payload: {
        section80C: Object.fromEntries(
          Object.entries(form80C).map(([k, v]) => [k, Number(v) || 0])
        ),
        section80D: Object.fromEntries(
          Object.entries(form80D).map(([k, v]) => [k, Number(v) || 0])
        ),
        section80CCD1B: Number(nps) || 0,
        section24b: Number(hlInterest) || 0,
      },
    });
    dispatch({
      type: ACTIONS.UPDATE_PROFILE,
      payload: { taxRegime: regime },
    });
    onClose();
  };

  const total80C = Object.values(form80C).reduce((s, v) => s + (Number(v) || 0), 0);
  const remaining80C = Math.max(0, section80C.limit - total80C);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Tax Deductions" width="max-w-xl">
      <div className="space-y-5">
        {/* Regime Selection */}
        <div>
          <p className="section-label mb-2">Tax Regime</p>
          <div className="grid grid-cols-2 gap-2">
            {['new', 'old'].map((r) => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium text-center border transition-all ${
                  regime === r
                    ? 'border-cyan/40 bg-cyan/10 text-cyan'
                    : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-navy-500/50'
                }`}
              >
                {r === 'new' ? 'New Regime (Default)' : 'Old Regime'}
              </button>
            ))}
          </div>
        </div>

        {/* Section 80C */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Section 80C (Limit: ₹1,50,000)</p>
            <span className={`text-[10px] font-mono ${remaining80C > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {remaining80C > 0 ? `₹${remaining80C.toLocaleString('en-IN')} unused` : 'Fully utilized'}
            </span>
          </div>
          <div className="space-y-2">
            {section80C.components.map((comp) => (
              <div key={comp.id} className="flex items-center gap-3">
                <label className="text-[11px] text-muted w-40 flex-shrink-0">{comp.label}</label>
                <input
                  type="number"
                  value={form80C[comp.id] || ''}
                  onChange={(e) => setForm80C((prev) => ({ ...prev, [comp.id]: e.target.value }))}
                  placeholder="0"
                  className="input-field text-xs py-1.5 flex-1"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 px-3 py-1.5 rounded bg-navy-900/50 flex items-center justify-between">
            <span className="text-[10px] text-dim">Total 80C</span>
            <span className="text-xs font-mono font-medium text-slate-200">
              {formatINR(Math.min(total80C, section80C.limit))} / {formatINR(section80C.limit)}
            </span>
          </div>
        </div>

        {/* Section 80D */}
        <div>
          <p className="section-label mb-2">Section 80D (Health Insurance)</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="text-[11px] text-muted w-40 flex-shrink-0">
                Self & Family (max ₹{deductionLimits.section80D.self.toLocaleString()})
              </label>
              <input
                type="number"
                value={form80D.selfFamily || ''}
                onChange={(e) => setForm80D((prev) => ({ ...prev, selfFamily: e.target.value }))}
                className="input-field text-xs py-1.5 flex-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-[11px] text-muted w-40 flex-shrink-0">
                Parents (max ₹{deductionLimits.section80D.parents.toLocaleString()})
              </label>
              <input
                type="number"
                value={form80D.parents || ''}
                onChange={(e) => setForm80D((prev) => ({ ...prev, parents: e.target.value }))}
                className="input-field text-xs py-1.5 flex-1"
              />
            </div>
          </div>
        </div>

        {/* NPS & Home Loan */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">NPS 80CCD(1B) (max ₹50,000)</label>
            <input
              type="number"
              value={nps}
              onChange={(e) => setNps(e.target.value)}
              className="input-field text-xs"
            />
          </div>
          <div>
            <label className="input-label">Home Loan Interest 24(b) (max ₹2,00,000)</label>
            <input
              type="number"
              value={hlInterest}
              onChange={(e) => setHlInterest(e.target.value)}
              className="input-field text-xs"
            />
          </div>
        </div>
      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} />
    </Modal>
  );
}
