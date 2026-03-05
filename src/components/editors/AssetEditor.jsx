// ─── Asset Editor ───
import React, { useState, useEffect } from 'react';
import Modal, { ModalFooter } from '@/components/shared/Modal';
import { useFinanceDispatch, ACTIONS } from '@/store/FinanceContext';
import { assetTypes } from '@/config/theme';
import { generateId } from '@/utils/formatters';

const defaultAsset = {
  type: 'equity',
  name: '',
  value: '',
  investedValue: '',
  sipAmount: '',
  maturityDate: '',
};

export default function AssetEditor({ isOpen, onClose, editAsset = null }) {
  const dispatch = useFinanceDispatch();
  const [form, setForm] = useState(defaultAsset);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editAsset) {
      setForm({
        type: editAsset.type || 'equity',
        name: editAsset.name || '',
        value: editAsset.value || '',
        investedValue: editAsset.investedValue || '',
        sipAmount: editAsset.sipAmount || '',
        maturityDate: editAsset.maturityDate || '',
      });
    } else {
      setForm(defaultAsset);
    }
    setErrors({});
  }, [editAsset, isOpen]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.value || Number(form.value) <= 0) e.value = 'Current value required';
    if (!form.investedValue || Number(form.investedValue) < 0) e.investedValue = 'Invested value required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      id: editAsset?.id || generateId(),
      type: form.type,
      name: form.name.trim(),
      value: Number(form.value),
      investedValue: Number(form.investedValue),
      sipAmount: form.sipAmount ? Number(form.sipAmount) : undefined,
      maturityDate: form.maturityDate || undefined,
    };

    if (editAsset) {
      dispatch({ type: ACTIONS.UPDATE_ASSET, payload });
    } else {
      dispatch({ type: ACTIONS.ADD_ASSET, payload });
    }
    onClose();
  };

  const handleDelete = () => {
    if (editAsset && window.confirm(`Delete "${editAsset.name}"?`)) {
      dispatch({ type: ACTIONS.DELETE_ASSET, payload: editAsset.id });
      onClose();
    }
  };

  const showSIP = ['mutualFund', 'nps'].includes(form.type);
  const showMaturity = ['fd'].includes(form.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editAsset ? 'Edit Asset' : 'Add Asset'}>
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="input-label">Asset Type</label>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.entries(assetTypes).map(([key, config]) => (
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
          <label className="input-label">Name / Description</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Nifty 50 Index Fund"
            className="input-field"
          />
          {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Current Value (₹)</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder="500000"
              className="input-field"
            />
            {errors.value && <p className="text-[10px] text-red-400 mt-1">{errors.value}</p>}
          </div>
          <div>
            <label className="input-label">Amount Invested (₹)</label>
            <input
              type="number"
              value={form.investedValue}
              onChange={(e) => handleChange('investedValue', e.target.value)}
              placeholder="400000"
              className="input-field"
            />
            {errors.investedValue && <p className="text-[10px] text-red-400 mt-1">{errors.investedValue}</p>}
          </div>
        </div>

        {/* SIP (for MF / NPS) */}
        {showSIP && (
          <div>
            <label className="input-label">Monthly SIP (₹, optional)</label>
            <input
              type="number"
              value={form.sipAmount}
              onChange={(e) => handleChange('sipAmount', e.target.value)}
              placeholder="10000"
              className="input-field"
            />
          </div>
        )}

        {/* Maturity (for FD) */}
        {showMaturity && (
          <div>
            <label className="input-label">Maturity Date (optional)</label>
            <input
              type="date"
              value={form.maturityDate}
              onChange={(e) => handleChange('maturityDate', e.target.value)}
              className="input-field"
            />
          </div>
        )}
      </div>

      <ModalFooter
        onCancel={onClose}
        onSave={handleSave}
        saveLabel={editAsset ? 'Update' : 'Add Asset'}
        onDelete={editAsset ? handleDelete : undefined}
      />
    </Modal>
  );
}
