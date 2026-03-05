// ─── Budget Editor ───
import React, { useState, useEffect } from 'react';
import Modal, { ModalFooter } from '@/components/shared/Modal';
import { useFinance, useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { expenseCategories } from '@/config/theme';
import { formatINR } from '@/utils/formatters';

export default function BudgetEditor({ isOpen, onClose }) {
  const data = useFinance();
  const dispatch = useFinanceDispatch();

  const [expenses, setExpenses] = useState([]);
  const [newCategory, setNewCategory] = useState('other');
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    setExpenses(data.budget?.expenses?.map((e) => ({ ...e })) || []);
  }, [data.budget, isOpen]);

  const handleAmountChange = (index, value) => {
    setExpenses((prev) =>
      prev.map((e, i) => (i === index ? { ...e, amount: Number(value) || 0 } : e))
    );
  };

  const handleLabelChange = (index, value) => {
    setExpenses((prev) =>
      prev.map((e, i) => (i === index ? { ...e, label: value } : e))
    );
  };

  const handleDelete = (index) => {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (!newAmount || Number(newAmount) <= 0) return;
    setExpenses((prev) => [
      ...prev,
      {
        category: newCategory,
        amount: Number(newAmount),
        label: newLabel.trim() || expenseCategories[newCategory]?.label || newCategory,
      },
    ]);
    setNewCategory('other');
    setNewLabel('');
    setNewAmount('');
  };

  const handleSave = () => {
    // Update all budget items at once by replacing the full expenses array
    // We'll dispatch individual updates
    const { _ui, ...stateData } = data;
    // Direct approach: update the full budget
    expenses.forEach((exp, i) => {
      if (i < data.budget.expenses.length) {
        dispatch({
          type: ACTIONS.UPDATE_BUDGET_ITEM,
          payload: { index: i, data: exp },
        });
      }
    });

    // Handle additions
    expenses.slice(data.budget.expenses.length).forEach((exp) => {
      dispatch({ type: ACTIONS.ADD_BUDGET_ITEM, payload: exp });
    });

    // Handle deletions (if fewer items now)
    for (let i = data.budget.expenses.length - 1; i >= expenses.length; i--) {
      dispatch({ type: ACTIONS.DELETE_BUDGET_ITEM, payload: i });
    }

    onClose();
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Monthly Budget" width="max-w-xl">
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-navy-900/50 border border-navy-500/25">
          <span className="text-[11px] text-muted">Total Monthly Expenses</span>
          <span className="text-sm font-mono font-bold text-amber-400">{formatINR(totalExpenses)}</span>
        </div>

        {/* Expense List */}
        <div className="space-y-2">
          {expenses.map((expense, i) => {
            const catConfig = expenseCategories[expense.category];
            return (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: catConfig?.color || '#94A3B8' }}
                />
                <span className="text-[10px] text-dim w-16 flex-shrink-0 truncate">
                  {catConfig?.label || expense.category}
                </span>
                <input
                  type="text"
                  value={expense.label}
                  onChange={(e) => handleLabelChange(i, e.target.value)}
                  className="input-field flex-1 text-xs py-1.5"
                  placeholder="Description"
                />
                <div className="relative w-28 flex-shrink-0">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-dim">₹</span>
                  <input
                    type="number"
                    value={expense.amount || ''}
                    onChange={(e) => handleAmountChange(i, e.target.value)}
                    className="input-field text-xs py-1.5 pl-5 text-right"
                  />
                </div>
                <button
                  onClick={() => handleDelete(i)}
                  className="w-6 h-6 rounded flex items-center justify-center text-dim hover:text-red-400 hover:bg-red-500/10 flex-shrink-0 transition-colors text-xs"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Add New */}
        <div className="border-t border-navy-500/30 pt-3">
          <p className="text-[10px] text-dim uppercase tracking-wider mb-2">Add Expense</p>
          <div className="flex items-end gap-2">
            <div className="w-28">
              <label className="input-label">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input-field text-xs py-1.5"
              >
                {Object.entries(expenseCategories).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="input-label">Label</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Description"
                className="input-field text-xs py-1.5"
              />
            </div>
            <div className="w-24">
              <label className="input-label">Amount (₹)</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="5000"
                className="input-field text-xs py-1.5"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newAmount}
              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <ModalFooter onCancel={onClose} onSave={handleSave} />
    </Modal>
  );
}
