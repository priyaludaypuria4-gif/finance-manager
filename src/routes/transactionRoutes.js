
const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

// Get all transactions belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC, id DESC`,
      [req.user.id]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error("Fetch transactions error:", error);
    res.status(500).json({
      message: "Unable to fetch transactions."
    });
  }
});

// Get financial summary
router.get("/summary", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income'
          THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense'
          THEN amount ELSE 0 END), 0) AS expenses,
        COUNT(*) AS total_transactions
       FROM transactions
       WHERE user_id = $1`,
      [req.user.id]
    );

    const income = Number(result.rows[0].income);
    const expenses = Number(result.rows[0].expenses);

    res.json({
      income,
      expenses,
      balance: income - expenses,
      totalTransactions: Number(result.rows[0].total_transactions)
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({
      message: "Unable to calculate summary."
    });
  }
});

// Add a transaction
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category, transaction_date } = req.body;

    if (
      !title ||
      amount === undefined ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !["income", "expense"].includes(type) ||
      !category
    ) {
      return res.status(400).json({
        message: "Please provide valid transaction details."
      });
    }

    const result = await pool.query(
      `INSERT INTO transactions
       (user_id, title, amount, type, category, transaction_date)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE))
       RETURNING *`,
      [
        req.user.id,
        title.trim(),
        Number(amount),
        type,
        category.trim(),
        transaction_date || null
      ]
    );

    res.status(201).json({
      message: "Transaction added successfully.",
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({
      message: "Unable to add transaction."
    });
  }
});

// Update a transaction
router.put("/:id", async (req, res) => {
  try {
    const { title, amount, type, category, transaction_date } = req.body;

    if (
      !title ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !["income", "expense"].includes(type) ||
      !category
    ) {
      return res.status(400).json({
        message: "Please provide valid transaction details."
      });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET title = $1,
           amount = $2,
           type = $3,
           category = $4,
           transaction_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        title.trim(),
        Number(amount),
        type,
        category.trim(),
        transaction_date,
        req.params.id,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found."
      });
    }

    res.json({
      message: "Transaction updated successfully.",
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({
      message: "Unable to update transaction."
    });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM transactions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Transaction not found."
      });
    }

    res.json({ message: "Transaction deleted successfully." });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({
      message: "Unable to delete transaction."
    });
  }
});

module.exports = router;
