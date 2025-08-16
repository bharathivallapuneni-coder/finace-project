let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let categoryChart = null;
let timeChart = null;

document.getElementById('expenseForm').addEventListener('submit', function(e) {
  e.preventDefault();
  addExpense();
});

document.getElementById('categoryFilter').addEventListener('change', filterExpenses);

function addExpense() {
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (description && !isNaN(amount) && category && date) {
    const expense = { id: Date.now(), description, amount, category, date };
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateUI();
    clearInputs();
  } else {
    alert('Please fill all fields correctly.');
  }
}

function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  updateUI();
}

function clearInputs() {
  document.getElementById('expenseForm').reset();
}

function updateUI() {
  updateFilterOptions();
  updateSummary();
  updateExpenseList();
  updateCharts();
}

function updateFilterOptions() {
  const filter = document.getElementById('categoryFilter');
  const categories = [...new Set(expenses.map(expense => expense.category))];
  filter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filter.appendChild(option);
  });
}

function filterExpenses() {
  const filterValue = document.getElementById('categoryFilter').value;
  const filteredExpenses = filterValue === 'all' 
    ? expenses 
    : expenses.filter(expense => expense.category === filterValue);
  updateExpenseList(filteredExpenses);
  updateSummary(filteredExpenses);
  updateCharts(filteredExpenses);
}

function updateSummary(filteredExpenses = expenses) {
  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const count = filteredExpenses.length;
  const average = count > 0 ? (total / count) : 0;

  document.getElementById('total').textContent = total.toFixed(2);
  document.getElementById('count').textContent = count;
  document.getElementById('average').textContent = average.toFixed(2);
}

function updateExpenseList(filteredExpenses = expenses) {
  const list = document.getElementById('expenseList');
  list.innerHTML = '';
  filteredExpenses.forEach(expense => {
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      <div class="expense-details">
        <strong>${expense.description}</strong> (${expense.category})<br>
        $${expense.amount.toFixed(2)} on ${expense.date}
      </div>
      <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
    `;
    list.appendChild(item);
  });
}

function updateCharts(filteredExpenses = expenses) {
  // Category Chart (Pie)
  const categories = {};
  filteredExpenses.forEach(expense => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Spending by Category' }
      }
    }
  });

  // Time Chart (Line)
  const dates = [...new Set(filteredExpenses.map(expense => expense.date))].sort();
  const amountsByDate = dates.map(date => {
    return filteredExpenses
      .filter(expense => expense.date === date)
      .reduce((sum, expense) => sum + expense.amount, 0);
  });

  if (timeChart) timeChart.destroy();

  timeChart = new Chart(document.getElementById('timeChart'), {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Spending Over Time',
        data: amountsByDate,
        borderColor: '#1a73e8',
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Spending Over Time' }
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Amount ($)' }, beginAtZero: true }
      }
    }
  });
}

window.onload = updateUI;
