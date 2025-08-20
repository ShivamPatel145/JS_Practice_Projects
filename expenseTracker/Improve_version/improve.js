// Variables to store our data
let transactions = [];
let currentBalance = 0;

// Get all the HTML elements we need
const form = document.getElementById('expense-form');
const nameInput = document.getElementById('expense-name');
const amountInput = document.getElementById('expense-amount');
const typeSelect = document.getElementById('transaction-type');
const balanceDisplay = document.getElementById('total-amount');
const transactionList = document.getElementById('expense-list');
const emptyState = document.getElementById('empty-state');
const clearAllBtn = document.getElementById('clear-all');

// Load saved data when page loads
function loadSavedData() {
  const savedData = localStorage.getItem('expense-tracker-data');
  if (savedData) {
    transactions = JSON.parse(savedData);
    updateEverything();
  }
}

// Save data to browser storage
function saveData() {
  localStorage.setItem('expense-tracker-data', JSON.stringify(transactions));
}

// Calculate the total balance
function calculateBalance() {
  currentBalance = 0;
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      currentBalance += transaction.amount;
    } else {
      currentBalance -= transaction.amount;
    }
  });
}

// Update the balance display
function updateBalanceDisplay() {
  calculateBalance();
  balanceDisplay.textContent = `$${currentBalance.toFixed(2)}`;
  
  // Change color based on balance
  balanceDisplay.className = 'balance-amount';
  if (currentBalance > 0) {
    balanceDisplay.classList.add('positive');
  } else if (currentBalance < 0) {
    balanceDisplay.classList.add('negative');
  }
}

// Make dates look nice
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

// Create HTML for one transaction
function createTransactionHTML(transaction) {
  const isIncome = transaction.type === 'income';
  const sign = isIncome ? '+' : '-';
  const colorClass = isIncome ? 'positive' : 'negative';
  
  return `
    <div class="transaction-item">
      <div class="transaction-info">
        <div class="transaction-name">${transaction.name}</div>
        <div class="transaction-date">${formatDate(transaction.date)}</div>
      </div>
      <div class="transaction-amount ${colorClass}">
        ${sign}$${transaction.amount.toFixed(2)}
      </div>
      <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;
}

// Show all transactions on screen
function displayTransactions() {
  // Remove old transaction items
  const oldItems = transactionList.querySelectorAll('.transaction-item');
  oldItems.forEach(item => item.remove());
  
  // If no transactions, show empty message
  if (transactions.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  
  // Hide empty message
  emptyState.style.display = 'none';
  
  // Sort transactions (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Add each transaction to the list
  sortedTransactions.forEach(transaction => {
    const transactionHTML = createTransactionHTML(transaction);
    transactionList.insertAdjacentHTML('beforeend', transactionHTML);
  });
}

// Update both balance and transaction list
function updateEverything() {
  updateBalanceDisplay();
  displayTransactions();
}

// Add a new transaction
function addNewTransaction(name, amount, type) {
  const newTransaction = {
    id: Date.now(), // Use timestamp as unique ID
    name: name,
    amount: parseFloat(amount),
    type: type,
    date: new Date().toISOString()
  };
  
  transactions.push(newTransaction);
  saveData();
  updateEverything();
  showSuccessMessage('Transaction added!');
}

// Delete a transaction
function deleteTransaction(id) {
  // Find and remove the transaction
  transactions = transactions.filter(transaction => transaction.id !== id);
  saveData();
  updateEverything();
  showSuccessMessage('Transaction deleted!');
}

// Clear all transactions
function clearAllTransactions() {
  if (transactions.length === 0) return;
  
  // Ask user to confirm
  if (confirm('Delete all transactions? This cannot be undone.')) {
    transactions = [];
    saveData();
    updateEverything();
    showSuccessMessage('All transactions cleared!');
  }
}

// Show success/error messages
function showSuccessMessage(message) {
  // Remove old message if exists
  const oldMessage = document.querySelector('.message');
  if (oldMessage) {
    oldMessage.remove();
  }
  
  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message success';
  messageDiv.textContent = message;
  
  // Add message before the form
  const formContainer = document.querySelector('.transaction-form');
  formContainer.parentNode.insertBefore(messageDiv, formContainer);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 3000);
}

function showErrorMessage(message) {
  // Remove old message if exists
  const oldMessage = document.querySelector('.message');
  if (oldMessage) {
    oldMessage.remove();
  }
  
  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message error';
  messageDiv.textContent = message;
  
  // Add message before the form
  const formContainer = document.querySelector('.transaction-form');
  formContainer.parentNode.insertBefore(messageDiv, formContainer);
  
  // Remove message after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 3000);
}

// Clear the form inputs
function clearForm() {
  nameInput.value = '';
  amountInput.value = '';
  typeSelect.value = 'expense';
}

// Check if form inputs are valid
function validateForm(name, amount) {
  if (!name.trim()) {
    showErrorMessage('Please enter a description!');
    return false;
  }
  
  if (!amount || amount <= 0) {
    showErrorMessage('Please enter a valid amount greater than 0!');
    return false;
  }
  
  return true;
}

// Handle form submission
function handleFormSubmit(event) {
  event.preventDefault(); // Don't refresh the page
  
  // Get form values
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;
  
  // Check if inputs are valid
  if (validateForm(name, amount)) {
    addNewTransaction(name, amount, type);
    clearForm();
  }
}

// Set up event listeners
function setupEventListeners() {
  // Form submission
  form.addEventListener('submit', handleFormSubmit);
  
  // Clear all button
  clearAllBtn.addEventListener('click', clearAllTransactions);
}

// Initialize the app
function initializeApp() {
  loadSavedData();
  setupEventListeners();
  updateEverything();
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);