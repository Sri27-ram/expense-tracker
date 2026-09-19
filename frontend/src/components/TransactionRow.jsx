export default function TransactionRow({ transaction, onEdit, onDelete }) {
  const isExpense = transaction.type === 'EXPENSE';
  return (
    <div className="transaction-row">
      <div className="transaction-main">
        <span className={`type-dot ${isExpense ? 'expense' : 'income'}`} />
        <div>
          <div className="transaction-category">{transaction.category}</div>
          {transaction.description && <div className="transaction-desc">{transaction.description}</div>}
        </div>
      </div>
      <div className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</div>
      <div className={`transaction-amount ${isExpense ? 'expense' : 'income'}`}>
        {isExpense ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
      </div>
      <div className="transaction-actions">
        <button className="btn-link" onClick={() => onEdit(transaction)}>
          Edit
        </button>
        <button className="btn-link btn-danger" onClick={() => onDelete(transaction)}>
          Delete
        </button>
      </div>
    </div>
  );
}
