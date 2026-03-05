// ─── Liability Editor ───
import React, { useState, useEffect } from 'react';
import Modal, { ModalFooter } from '@/components/shared/Modal';
import { useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { loanTypes } from '@/config/theme';
import { generateId } from '@/utils/formatters';

const defaultLoan = {
  type: 'home',
  name: '',
  principal: '',
  outstanding: '',
  emi: '',
  rate: '',
  tenureMonths: '',
  remainingMonths: '',
  startDate: '',
};

export default function LiabilityEditor({ isOpen, onClose, editLoan = null }) {
  const dispatch = useFinanceDispatch();
  const [form, setForm] = useState(defaultLoan);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editLoan) {
      setForm({
        type: editLoan.type || 'home',
        name: editLoan.name || '',
        principal: editLoan.principal || '',
        outstanding: editLoan.outstanding || '',
        emi: editLoan.emi || '',
        rate: editLoan.rate || '',
        tenureMonths: editLoan.tenureMonths || '',
        remainingMonths: editLoan.remainingMonths || '',
        startDate: editLoan.startDate || '',
      });
    } else {
      setForm(defaultLoan);
    }
    setErrors({});
  }, [editLoan, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.outstanding || Number(form.outstanding) <= 0) e.outstanding = 'Outstanding amount required';
    if (!form.rate || Number(form.rate) <= 0) e.rate = 'Interest rate required';
    if (form.type !== 'credit') {
      if (!form.emi || Number(form.emi) <= 0) e.emi = 'EMI amount required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      id: editLoan?.id || generateId(),
      type: form.type,
      name: form.name.trim(),
      principal: Number(form.principal) || Number(form.outstanding),
      outstanding: Number(form.outstanding),
      emi: Number(form.emi) || 0,
      rate: Number(form.rate),
      tenureMonths: Number(form.tenureMonths) || 0,
      remainingMonths: Number(form.remainingMonths) || 0,
      startDate: form.startDate || undefined,
    };

    if (editLoan) {
      dispatch({ type: ACTIONS.UPDATE_LIABILITY, payload });
    } else {
      dispatch({ type: ACTIONS.ADD_LIABILITY, payload });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editLoan && window.confirm(`Delete "${editLoan.name}"?`)) {
      dispatch({ type: ACTIONS.DELETE_LIABILITY, payload: editLoan.id });
      onClose();
    }
  };

  const isCredit = form.type === 'credit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editLoan ? 'Edit Loan' : 'Add Loan'}>
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="input-label">Loan Type</label>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(loanTypes).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleChange('type', key)}
                className={`px-2 py-2 rounded-lg text-[10px] font-medium text-center border transition-all ${
                  form.type === key
                    ? 'border-cyan/40 bg-cyan/10 text-cyan'
                    : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-navy-500/50'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="input-label">Loan Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Home Loan (SBI)"
            className="input-field"
          />
          {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
        </div>

        {/* Key figures */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Outstanding (₹)</label>
            <input
              type="number"
              value={form.outstanding}
              onChange={(e) => handleChange('outstanding', e.target.value)}
              placeholder="3650000"
              className="input-field"
            />
            {errors.outstanding && <p className="text-[10px] text-red-400 mt-1">{errors.outstanding}</p>}
          </div>
          <div>
            <label className="input-label">Interest Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.rate}
              onChange={(e) => handleChange('rate', e.target.value)}
              placeholder="8.5"
              className="input-field"
            />
            {errors.rate && <p className="text-[10px] text-red-400 mt-1">{errors.rate}</p>}
          </div>
        </div>

        {!isCredit && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Monthly EMI (₹)</label>
                <input
                  type="number"
                  value={form.emi}
                  onChange={(e) => handleChange('emi', e.target.value)}
                  placeholder="38500"
                  className="input-field"
                />
                {errors.emi && <p className="text-[10px] text-red-400 mt-1">{errors.emi}</p>}
              </div>
              <div>
                <label className="input-label">Original Principal (₹)</label>
                <input
                  type="number"
                  value={form.principal}
                  onChange={(e) => handleChange('principal', e.target.value)}
                  placeholder="4200000"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Total Tenure (months)</label>
                <input
                  type="number"
                  value={form.tenureMonths}
                  onChange={(e) => handleChange('tenureMonths', e.target.value)}
                  placeholder="240"
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">Remaining (months)</label>
                <input
                  type="number"
                  value={form.remainingMonths}
                  onChange={(e) => handleChange('remainingMonths', e.target.value)}
                  placeholder="168"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Start Date (optional)</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="input-field"
              />
            </div>
          </>
        )}
      </div>

      <ModalFooter
        onCancel={onClose}
        onSave={handleSave}
        saveLabel={editLoan ? 'Update' : 'Add Loan'}
        onDelete={editLoan ? handleDelete : undefined}
      />
    </Modal>
  );
}
