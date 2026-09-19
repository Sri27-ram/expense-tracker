const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(requireAuth);

router.get('/', listTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/summary', getSummary);

module.exports = router;
