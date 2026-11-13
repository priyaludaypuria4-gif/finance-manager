
const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");
const authForm = document.getElementById("auth-form");
const transactionForm = document.getElementById("transaction-form");
const messageBox = document.getElementById("message");

let authMode = "login";
let currentUser = null;
let transactions = [];

function showMessage(message, isError = false) {
  messageBox.textContent = message;
  messageBox.classList.remove("hidden", "error");

  if (isError) {
    messageBox.classList.add("error");
  }

  setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 4000);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && url !== "/api/auth/login" &&
        url !== "/api/auth/register") {
      showAuth();
    }

    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function setAuthMode(mode) {
  authMode = mode;

  document.getElementById("login-tab").classList.toggle(
    "active", mode === "login"
  );

  document.getElementById("register-tab").classList.toggle(
    "active", mode === "register"
  );

  document.getElementById("name-group").classList.toggle(
    "hidden", mode === "login"
  );

  document.getElementById("auth-submit").textContent =
    mode === "login" ? "Login" : "Create account";

  document.getElementById("name").required = mode === "register";
}

function showAuth() {
  currentUser = null;
  authSection.classList.remove("hidden");
  dashboard.classList.add("hidden");
  document.getElementById("user-area").classList.add("hidden");
  setAuthMode("login");
}

function showDashboard(user) {
  currentUser = user;

  authSection.classList.add("hidden");
  dashboard.classList.remove("hidden");
  document.getElementById("user-area").classList.remove("hidden");

  document.getElementById("welcome-user").textContent =
    `Hello, ${user.name}`;

  loadDashboard();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount));
}

function formatDate(date) {
  const value = String(date).slice(0, 10);
  const parts = value.split("-");

  if (parts.length !== 3) return value;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Login and registration
document.getElementById("login-tab").addEventListener("click", () => {
  setAuthMode("login");
});

document.getElementById("register-tab").addEventListener("click", () => {
  setAuthMode("register");
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const payload = { email, password };

  if (authMode === "register") {
    payload.name = document.getElementById("name").value.trim();
  }

  try {
    const endpoint =
      authMode === "login"
        ? "/api/auth/login"
        : "/api/auth/register";

    const data = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    showMessage(data.message);
    authForm.reset();
    showDashboard(data.user);
  } catch (error) {
    showMessage(error.message, true);
  }
});

// Load financial summary and transactions
async function loadDashboard() {
  try {
    const [summaryData, transactionData] = await Promise.all([
      apiRequest("/api/transactions/summary"),
      apiRequest("/api/transactions")
    ]);

    document.getElementById("balance").textContent =
      formatCurrency(summaryData.balance);

    document.getElementById("income").textContent =
      formatCurrency(summaryData.income);

    document.getElementById("expenses").textContent =
      formatCurrency(summaryData.expenses);

    document.getElementById("transaction-count").textContent =
      summaryData.totalTransactions;

    transactions = transactionData.transactions;
    renderTransactions();
  } catch (error) {
    showMessage(error.message, true);
  }
}

// Display transactions in the table
function renderTransactions() {
  const list = document.getElementById("transaction-list");
  list.innerHTML = "";

  if (transactions.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.className = "empty-state";
    cell.textContent = "No transactions yet.";

    row.appendChild(cell);
    list.appendChild(row);
    return;
  }

  transactions.forEach((transaction) => {
    const row = document.createElement("tr");

    const values = [
      transaction.title,
      transaction.category,
      formatDate(transaction.transaction_date),
      transaction.type,
      formatCurrency(transaction.amount)
    ];

    values.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;

      if (index === 3 || index === 4) {
        cell.className =
          transaction.type === "income"
            ? "income-text"
            : "expense-text";
      }

      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const actionButtons = document.createElement("div");
    actionButtons.className = "action-buttons";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-btn";
    editButton.addEventListener("click", () => {
      editTransaction(transaction);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => {
      deleteTransaction(transaction.id);
    });

    actionButtons.append(editButton, deleteButton);
    actionCell.appendChild(actionButtons);
    row.appendChild(actionCell);

    list.appendChild(row);
  });
}

// Add or update a transaction
transactionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const transactionId =
    document.getElementById("transaction-id").value;

  const payload = {
    title: document.getElementById("title").value.trim(),
    amount: Number(document.getElementById("amount").value),
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    transaction_date:
      document.getElementById("transaction-date").value
  };

  try {
    const endpoint = transactionId
      ? `/api/transactions/${transactionId}`
      : "/api/transactions";

    const data = await apiRequest(endpoint, {
      method: transactionId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    showMessage(data.message);
    resetTransactionForm();
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  }
});

// Fill the form when editing
function editTransaction(transaction) {
  document.getElementById("transaction-id").value = transaction.id;
  document.getElementById("title").value = transaction.title;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("type").value = transaction.type;
  document.getElementById("category").value = transaction.category;
  document.getElementById("transaction-date").value =
    String(transaction.transaction_date).slice(0, 10);

  document.getElementById("form-heading").textContent =
    "Edit transaction";

  document.getElementById("save-btn").textContent = "Update transaction";
  document.getElementById("cancel-edit").classList.remove("hidden");

  document.getElementById("transaction-form").scrollIntoView({
    behavior: "smooth"
  });
}

// Delete a transaction
async function deleteTransaction(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this transaction?"
  );

  if (!confirmed) return;

  try {
    const data = await apiRequest(`/api/transactions/${id}`, {
      method: "DELETE"
    });

    showMessage(data.message);
    await loadDashboard();
  } catch (error) {
    showMessage(error.message, true);
  }
}

// Reset transaction form
function resetTransactionForm() {
  transactionForm.reset();

  document.getElementById("transaction-id").value = "";
  document.getElementById("form-heading").textContent =
    "Add a transaction";

  document.getElementById("save-btn").textContent =
    "Add transaction";

  document.getElementById("cancel-edit").classList.add("hidden");

  document.getElementById("transaction-date").value =
    new Date().toLocaleDateString("en-CA");
}

document.getElementById("cancel-edit").addEventListener(
  "click",
  resetTransactionForm
);

document.getElementById("refresh-btn").addEventListener(
  "click",
  loadDashboard
);

// Log out
document.getElementById("logout-btn").addEventListener(
  "click",
  async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST"
      });

      showAuth();
      showMessage("Logged out successfully.");
    } catch (error) {
      showMessage(error.message, true);
    }
  }
);

// Check whether a user is already logged in
async function checkSession() {
  try {
    const data = await apiRequest("/api/auth/me");
    showDashboard(data.user);
  } catch (error) {
    showAuth();
  }
}

resetTransactionForm();
checkSession();
