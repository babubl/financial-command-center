// ─── Income Editor ───
import React, { useState, useEffect } from 'react';
import Modal, { ModalFooter } from '@/components/shared/Modal';
import { useFinance, useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { formatINR } from '@/utils/formatters';

const monthlyFields = [
  { key: 'salary', label: 'Salary (post-tax take-home)' },
  { key: 'rental', label: 'Rental Income' },
  { key: 'interest', label: 'Interest Income' },
  { key: 'dividends', label: 'Dividends' },
  { key: 'freelance', label: 'Freelance / Side Income' },
];

const annualFields = [
  { key: 'bonus', label: 'Annual Bonus' },
  { key: 'otherIncome', label: 'Other Annual Income' },
];

export default function IncomeEditor({ isOpen, onClose }) {
  const data = useFinance();
  const dispatch = useFinanceDispatch();

  const [monthly, setMonthly] = useState({});
  const [annual, setAnnual] = useState({});

  useEffect(() => {
    setMonthly({ ...data.income?.monthly });
    setAnnual({ ...data.income?.annual });
  }, [data.income, isOpen]);

  const handleMonthlyChange = (key, value) => {
    setMonthly((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const handleAnnualChange = (key, value) => {
    setAnnual((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const handleSave = () => {
    dispatch({
      type: ACTIONS.UPDATE_INCOME,
      payload: { monthly, annual },
    });
    onClose();
  };

  const totalMonthly = Object.values(monthly).reduce((s, v) => s + (v || 0), 0);
  const totalAnnual = totalMonthly * 12 + Object.values(annual).reduce((s, v) => s + (v || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Income">
      <div className="space-y-5">
        {/* Monthly */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Monthly Income</p>
            <span className="text-xs font-mono text-cyan">{formatINR(totalMonthly)}/mo</span>
          </div>
          <div className="space-y-3">
            {monthlyFields.map((field) => (
              <div key={field.key}>
                <label className="input-label">{field.label}</label>
                <input
                  type="number"
                  value={monthly[field.key] || ''}
                  onChange={(e) => handleMonthlyChange(field.key, e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Annual */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Annual Extras</p>
          </div>
          <div className="space-y-3">
            {annualFields.map((field) => (
              <div key={field.key}>
                <label className="input-label">{field.label}</label>
                <input
                  type="number"
                  value={annual[field.key] || ''}
                  onChange={(e) => handleAnnualChange(field.key, e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="px-3 py-2.5 rounded-lg bg-navy-900/50 border border-navy-500/25">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted">Total Annual Income</span>
            <span className="text-sm font-mono font-bold text-cyan">{formatINR(totalAnnual)}</span>
          </div>
        </div>
      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} />
    </Modal>
  );
}
