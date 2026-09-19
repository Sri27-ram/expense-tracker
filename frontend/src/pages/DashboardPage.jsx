import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as txApi from '../api/transactions';
import TransactionRow from '../components/TransactionRow';
import TransactionForm from '../components/TransactionForm';
import CategoryChart from '../components/CategoryChart';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function DashboardPage() {
  const { username, logout } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, expenseByCategory: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTx, setEditingTx] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [txPage, summaryData] = await Promise.all([
        txApi.getTransactions({ month }),
        txApi.getSummary(month),
      ]);
      setTransactions(txPage.content);
      setSummary(summaryData);
    } catch {
      setError('Could not load data. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(tx) {
    await txApi.createTransaction(tx);
    setShowForm(false);
    load();
  }

  async function handleUpdate(tx) {
    await txApi.updateTransaction(editingTx.id, tx);
    setEditingTx(null);
    load();
  }

  async function handleDelete(tx) {
    if (!window.confirm(`Delete this ${tx.category} transaction?`)) return;
    await txApi.deleteTransaction(tx.id);
    load();
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Expense Tracker</h1>
        <div className="dashboard-header-right">
          <span>Hi, {username}</span>
          <button className="btn-secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="toolbar">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <button onClick={() => setShowForm(true)}>+ Add Transaction</button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="summary-row">
        <div className="summary-card income">
          <span className="summary-label">Income</span>
          <span className="summary-value">${summary.totalIncome.toFixed(2)}</span>
        </div>
        <div className="summary-card expense">
          <span className="summary-label">Expenses</span>
          <span className="summary-value">${summary.totalExpense.toFixed(2)}</span>
        </div>
        <div className="summary-card balance">
          <span className="summary-label">Balance</span>
          <span className="summary-value">${summary.balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <h3>Spending by Category</h3>
          <CategoryChart expenseByCategory={summary.expenseByCategory} />
        </div>

        <div className="panel">
          <h3>Transactions</h3>
          {loading ? (
            <p className="empty-state">Loading…</p>
          ) : transactions.length === 0 ? (
            <p className="empty-state">No transactions this month.</p>
          ) : (
            <div className="transaction-list">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} onEdit={setEditingTx} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && <TransactionForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
      {editingTx && (
        <TransactionForm initialTransaction={editingTx} onSubmit={handleUpdate} onCancel={() => setEditingTx(null)} />
      )}
    </div>
  );
}
