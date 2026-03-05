// ─── Goal Editor ───
import React, { useState, useEffect } from 'react';
import Modal, { ModalFooter } from '@/components/shared/Modal';
import { useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { generateId } from '@/utils/formatters';

const priorities = [
  { value: 'critical', label: 'Critical', color: '#EF4444' },
  { value: 'high', label: 'High', color: '#F59E0B' },
  { value: 'medium', label: 'Medium', color: '#22D3EE' },
  { value: 'low', label: 'Low', color: '#94A3B8' },
];

const defaultGoal = {
  name: '',
  targetAmount: '',
  currentAmount: '',
  monthlySIP: '',
  targetYear: '',
  expectedReturn: '12',
  priority: 'medium',
};

export default function GoalEditor({ isOpen, onClose, editGoal = null }) {
  const dispatch = useFinanceDispatch();
  const [form, setForm] = useState(defaultGoal);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editGoal) {
      setForm({
        name: editGoal.name || '',
        targetAmount: editGoal.targetAmount || '',
        currentAmount: editGoal.currentAmount || '',
        monthlySIP: editGoal.monthlySIP || '',
        targetYear: editGoal.targetYear || '',
        expectedReturn: editGoal.expectedReturn ? (editGoal.expectedReturn * 100).toString() : '12',
        priority: editGoal.priority || 'medium',
      });
    } else {
      setForm(defaultGoal);
    }
    setErrors({});
  }, [editGoal, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Goal name is required';
    if (!form.targetAmount || Number(form.targetAmount) <= 0) e.targetAmount = 'Target amount required';
    if (!form.targetYear || Number(form.targetYear) <= new Date().getFullYear()) e.targetYear = 'Future year required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      id: editGoal?.id || generateId(),
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      monthlySIP: Number(form.monthlySIP) || 0,
      targetYear: Number(form.targetYear),
      expectedReturn: Number(form.expectedReturn) / 100,
      priority: form.priority,
    };

    if (editGoal) {
      dispatch({ type: ACTIONS.UPDATE_GOAL, payload });
    } else {
      dispatch({ type: ACTIONS.ADD_GOAL, payload });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editGoal && window.confirm(`Delete "${editGoal.name}"?`)) {
      dispatch({ type: ACTIONS.DELETE_GOAL, payload: editGoal.id });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editGoal ? 'Edit Goal' : 'Add Goal'}>
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="input-label">Goal Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Retirement Corpus"
            className="input-field"
          />
          {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="input-label">Priority</label>
          <div className="grid grid-cols-4 gap-1.5">
            {priorities.map((p) => (
              <button
                key={p.value}
                onClick={() => handleChange('priority', p.value)}
                className={`px-2 py-2 rounded-lg text-[10px] font-medium text-center border transition-all ${
                  form.priority === p.value
                    ? 'bg-opacity-15 border-opacity-40'
                    : 'border-navy-500/30 bg-navy-900/40 text-muted hover:border-navy-500/50'
                }`}
                style={
                  form.priority === p.value
                    ? { borderColor: `${p.color}60`, backgroundColor: `${p.color}15`, color: p.color }
                    : undefined
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Target Amount (₹)</label>
            <input
              type="number"
              value={form.targetAmount}
              onChange={(e) => handleChange('targetAmount', e.target.value)}
              placeholder="5000000"
              className="input-field"
            />
            {errors.targetAmount && <p className="text-[10px] text-red-400 mt-1">{errors.targetAmount}</p>}
          </div>
          <div>
            <label className="input-label">Amount Saved (₹)</label>
            <input
              type="number"
              value={form.currentAmount}
              onChange={(e) => handleChange('currentAmount', e.target.value)}
              placeholder="500000"
              className="input-field"
            />
          </div>
        </div>

        {/* SIP & Timeline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Monthly SIP (₹)</label>
            <input
              type="number"
              value={form.monthlySIP}
              onChange={(e) => handleChange('monthlySIP', e.target.value)}
              placeholder="15000"
              className="input-field"
            />
          </div>
          <div>
            <label className="input-label">Target Year</label>
            <input
              type="number"
              value={form.targetYear}
              onChange={(e) => handleChange('targetYear', e.target.value)}
              placeholder="2040"
              className="input-field"
            />
            {errors.targetYear && <p className="text-[10px] text-red-400 mt-1">{errors.targetYear}</p>}
          </div>
        </div>

        {/* Expected Return */}
        <div>
          <label className="input-label">Expected Annual Return (%)</label>
          <input
            type="number"
            step="0.5"
            value={form.expectedReturn}
            onChange={(e) => handleChange('expectedReturn', e.target.value)}
            placeholder="12"
            className="input-field"
          />
          <p className="text-[9px] text-dim mt-1">
            Typical: Equity 12%, Balanced 10%, Debt 7%, Conservative 6%
          </p>
        </div>
      </div>

      <ModalFooter
        onCancel={onClose}
        onSave={handleSave}
        saveLabel={editGoal ? 'Update' : 'Add Goal'}
        onDelete={editGoal ? handleDelete : undefined}
      />
    </Modal>
  );
}
