import client from './client';

export function getTransactions({ month, category, type, page = 0, size = 50 } = {}) {
  return client
    .get('/api/transactions', { params: { month, category, type, page, size } })
    .then((res) => res.data);
}

export function getSummary(month) {
  return client.get('/api/transactions/summary', { params: { month } }).then((res) => res.data);
}

export function createTransaction(transaction) {
  return client.post('/api/transactions', transaction).then((res) => res.data);
}

export function updateTransaction(id, transaction) {
  return client.put(`/api/transactions/${id}`, transaction).then((res) => res.data);
}

export function deleteTransaction(id) {
  return client.delete(`/api/transactions/${id}`);
}
