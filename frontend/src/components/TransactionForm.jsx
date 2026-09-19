import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

export default function TransactionForm({ initialTransaction, onSubmit, onCancel }) {
  const [type, setType] = useState(initialTransaction?.type || 'EXPENSE');
  const [amount, setAmount] = useState(initialTransaction?.amount ?? '');
  const [category, setCategory] = useState(initialTransaction?.category || EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState(initialTransaction?.description || '');
  const [date, setDate] = useState(
    initialTransaction?.date ? initialTransaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);

  const categories = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(newType) {
    setType(newType);
    const list = newType === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!list.includes(category)) setCategory(list[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ type, amount: Number(amount), category, description, date });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{initialTransaction ? 'Edit Transaction' : 'New Transaction'}</h2>

        <div className="type-toggle">
          <button
            type="button"
            className={type === 'EXPENSE' ? 'active expense' : ''}
            onClick={() => handleTypeChange('EXPENSE')}
          >
            Expense
          </button>
          <button
            type="button"
            className={type === 'INCOME' ? 'active income' : ''}
            onClick={() => handleTypeChange('INCOME')}
          >
            Income
          </button>
        </div>

        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />

        <div className="form-row">
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        <label htmlFor="description">Description (optional)</label>
        <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
