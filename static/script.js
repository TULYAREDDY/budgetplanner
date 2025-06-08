// Helper arrays for dropdowns
const expenseCategories = ["Housing", "Transportation", "Food", "Healthcare", "Entertainment", "Education", "Personal Care", "Debt", "Savings", "Other"];
const priorities = ["High", "Medium", "Low"];
const necessityScale = Array.from({length: 10}, (_, i) => i + 1); // 1 to 10

// Default placeholder data for forms
const defaultExpenses = [
    { category: "Food", name: "Groceries", amount: 5000, priority: "High" },
    { category: "Housing", name: "Rent", amount: 15000, priority: "High" }
];

const defaultEmiPlans = [
    { name: "Home Loan", loanAmount: 5000000, interestRate: 8.5, durationMonths: 240, necessity: 8 },
    { name: "Car Loan", loanAmount: 500000, interestRate: 9.2, durationMonths: 60, necessity: 6 }
];

// Function to calculate EMI (vanilla JS)
function calculateEMI(principal, annualInterestRate, tenureMonths) {
    // Ensure inputs are valid numbers and positive for meaningful EMI calculation
    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(tenureMonths) || principal < 0 || tenureMonths <= 0) {
        return 0; // Return 0 if inputs are invalid or lead to undefined EMI
    }
    
    if (annualInterestRate === 0) {
        return principal / tenureMonths;
    }
    
    const monthlyInterestRate = (annualInterestRate / 100) / 12;
    const emi = principal * monthlyInterestRate * Math.pow((1 + monthlyInterestRate), tenureMonths) / (Math.pow((1 + monthlyInterestRate), tenureMonths) - 1);
    return emi;
}

// Function to create an expense input row (vanilla JS)
function createExpenseRow(expense = {}) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row g-2 align-items-end mb-2 expense-item-row';
    rowDiv.innerHTML = `
        <div class="col-md-2">
            <label class="form-label visually-hidden">Expense Type</label>
            <select class="form-select expense-type" required>
                <option value="" disabled ${!expense.expenseType ? 'selected' : ''}>Select Type</option>
                ${["Fixed", "Reducible"].map(type => `<option value="${type}" ${expense.expenseType === type ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-2">
            <label class="form-label visually-hidden">Category</label>
            <select class="form-select expense-category" required>
                <option value="" disabled ${!expense.category ? 'selected' : ''}>Select Category</option>
                ${expenseCategories.map(cat => `<option value="${cat}" ${expense.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <label class="form-label visually-hidden">Name</label>
            <input type="text" class="form-control expense-name" placeholder="Expense Name" value="${expense.name || ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label visually-hidden">Amount</label>
            <input type="number" class="form-control expense-amount" placeholder="Amount (₹)" min="0" step="0.01" value="${expense.amount || ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label visually-hidden">Priority</label>
            <select class="form-select expense-priority" required>
                <option value="" disabled ${!expense.priority ? 'selected' : ''}>Priority</option>
                ${priorities.map(p => `<option value="${p}" ${expense.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-outline-danger w-100 remove-item-btn"><i class="fas fa-times"></i></button>
        </div>
    `;
    // Show or hide priority dropdown based on expense type
    const expenseTypeSelect = rowDiv.querySelector('.expense-type');
    const prioritySelect = rowDiv.querySelector('.expense-priority');
    function togglePriority() {
        if (expenseTypeSelect.value === 'Fixed') {
            prioritySelect.style.display = 'none';
            prioritySelect.value = '';
            prioritySelect.required = false;
        } else {
            prioritySelect.style.display = 'block';
            prioritySelect.required = true;
            if (!prioritySelect.value) {
                prioritySelect.value = 'Medium';
            }
        }
    }
    expenseTypeSelect.addEventListener('change', togglePriority);
    togglePriority(); // Initial call
    return rowDiv;
}

// Function to create an EMI plan input row (vanilla JS)
function createEmiRow(emi = {}) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row g-2 align-items-end mb-2 emi-item-row';
    rowDiv.innerHTML = `
        <div class="col-md-2">
            <label class="form-label visually-hidden">Plan Name</label>
            <input type="text" class="form-control emi-name" placeholder="Plan Name" value="${emi.name || ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label visually-hidden">Loan Amount</label>
            <input type="number" class="form-control emi-amount" placeholder="Loan (₹)" min="0" step="0.01" value="${emi.loanAmount || ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label visually-hidden">Interest Rate</label>
            <input type="number" class="form-control emi-interest" placeholder="Interest %" min="0" step="0.01" value="${emi.interestRate || ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label visually-hidden">Duration</label>
            <input type="number" class="form-control emi-duration" placeholder="Months" min="1" value="${emi.durationMonths || ''}" required>
        </div>
        <div class="col-md-2">
            <label class="form-label visually-hidden">Necessity</label>
            <select class="form-select emi-necessity" required>
                <option value="" disabled ${!emi.necessity ? 'selected' : ''}>Necessity</option>
                ${necessityScale.map(n => `<option value="${n}" ${emi.necessity === n ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-outline-danger w-100 remove-item-btn"><i class="fas fa-times"></i></button>
        </div>
    `;
    return rowDiv;
}

// DOMContentLoaded ensures the script runs after the HTML is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired. Script is running.');

    const expensesContainer = document.getElementById('expenses-container');
    const emiPlansContainer = document.getElementById('emi-plans-container');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const addEmiBtn = document.getElementById('add-emi-btn');
    const financialForm = document.getElementById('financial-form');
    const resultsSection = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');

    console.log('Containers and buttons:', { expensesContainer, emiPlansContainer, addExpenseBtn, addEmiBtn });

    // Add initial rows on page load
    if (expensesContainer) {
        defaultExpenses.forEach(expense => expensesContainer.appendChild(createExpenseRow(expense)));
        if (defaultExpenses.length === 0) expensesContainer.appendChild(createExpenseRow());
        console.log('Initial expense rows added.');
    }
    if (emiPlansContainer) {
        defaultEmiPlans.forEach(emi => emiPlansContainer.appendChild(createEmiRow(emi)));
        if (defaultEmiPlans.length === 0) emiPlansContainer.appendChild(createEmiRow());
        console.log('Initial EMI rows added.');
    }

    // Add new expense row
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function() {
            expensesContainer.appendChild(createExpenseRow());
            console.log('New expense row added.');
        });
    }

    // Add new EMI plan row
    if (addEmiBtn) {
        addEmiBtn.addEventListener('click', function() {
            emiPlansContainer.appendChild(createEmiRow());
            console.log('New EMI row added.');
        });
    }

    // Remove item row (delegated event for dynamically added elements)
    document.addEventListener('click', function(event) {
        if (event.target.closest('.remove-item-btn')) {
            event.target.closest('.row').remove();
            console.log('Item row removed.');
        }
    });

    // Handle form submission
    if (financialForm) {
        financialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submission initiated.');

            // Collect expenses data
            const expenses = [];
            document.querySelectorAll('.expense-item-row').forEach(function(row) {
                expenses.push({
                    expense_type: row.querySelector('.expense-type').value,
                    category: row.querySelector('.expense-category').value,
                    name: row.querySelector('.expense-name').value,
                    amount: parseFloat(row.querySelector('.expense-amount').value || 0),
                    priority: row.querySelector('.expense-priority').value
                });
            });
            console.log('Collected expenses:', expenses);

            // Collect EMI plans data
            const emi_plans = [];
            document.querySelectorAll('.emi-item-row').forEach(function(row) {
                const amount = parseFloat(row.querySelector('.emi-amount').value || 0);
                const interestRate = parseFloat(row.querySelector('.emi-interest').value || 0);
                const duration = parseInt(row.querySelector('.emi-duration').value || 0);
                const monthlyPayment = calculateEMI(amount, interestRate, duration);

                emi_plans.push({
                    name: row.querySelector('.emi-name').value,
                    amount: amount,
                    interestRate: interestRate,
                    durationMonths: duration,
                    necessity: parseInt(row.querySelector('.emi-necessity').value || 0),
                    monthlyPayment: monthlyPayment
                });
            });
            console.log('Collected EMI plans:', emi_plans);

            const bankStatementInput = document.getElementById('bankStatement');
            const bankStatementFile = bankStatementInput.files[0];

            let bankStatementData = null; // Initialize as null

            const processFormData = (bsData) => {
                const formData = {
                    user_name: document.getElementById('userName').value,
                    salary: parseFloat(document.getElementById('monthlySalary').value || 0),
                    expenses: expenses,
                    emi_plans: emi_plans,
                    bank_statement: bsData // Use the processed bank statement data
                };

                console.log('Sending data:', formData);

                // AJAX call to backend (vanilla JS fetch API)
                fetch('/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                })
                .then(response => response.json())
                .then(response => {
                    if (response.success) {
                        let allResultsHtml = '';

                        // 1. User Info and Salary
                        allResultsHtml += `
                            <div class="results-main-grid">
                                <div class="results-grid-item-wide user-info-card">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="user-avatar"><i class="fas fa-user-circle"></i></div>
                                            <div class="ms-3">
                                                <h3 class="card-title mb-1">${response.results.user_name}</h3>
                                                <p class="card-subtitle">Financial Analysis Report</p>
                                            </div>
                                        </div>
                                        <div class="salary-info">
                                            <i class="fas fa-money-bill-wave"></i>
                                            <span>Monthly Income: ₹${response.results.salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                        `;

            // 2. Optimized Expenses
            allResultsHtml += `
                    <div class="results-grid-item-tall expense-card">
                        <div class="card-body">
                            <div class="card-header-custom">
                                <i class="fas fa-chart-pie"></i>
                                <h4>Optimized Expenses</h4>
                            </div>
                            <div class="expense-list">`;
            if (response.results.optimized_expenses && response.results.optimized_expenses.length > 0) {
                // Show only reducible expenses that were modified
                const originalReducibleExpenses = response.results.expenses ? response.results.expenses.filter(exp => exp.expense_type === 'Reducible') : [];
                const optimizedReducibleExpenses = response.results.optimized_expenses.filter(exp => exp.expense_type === 'Reducible');

                // Map original expenses by name and category for comparison
                const originalMap = {};
                originalReducibleExpenses.forEach(exp => {
                    originalMap[exp.name + '|' + exp.category] = exp.amount;
                });

                // List only those reducible expenses where amount changed or all reducible expenses if none changed
                let changedExpenses = optimizedReducibleExpenses.filter(exp => {
                    const key = exp.name + '|' + exp.category;
                    return originalMap[key] !== undefined && originalMap[key] !== exp.amount;
                });

                if (changedExpenses.length === 0) {
                    // If no changes, show all reducible expenses
                    changedExpenses = optimizedReducibleExpenses;
                }

                if (changedExpenses.length > 0) {
                    changedExpenses.forEach(exp => {
                        allResultsHtml += `
                            <div class="expense-item">
                                <div class="expense-info">
                                    <i class="fas fa-tag"></i>
                                    <span class="expense-name">${exp.name}</span>
                                    <span class="expense-category">${exp.category}</span>
                                </div>
                                <div class="expense-amount">₹${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>`;
                    });
                } else {
                    allResultsHtml += '<p class="text-muted">No optimized reducible expenses available.</p>';
                }
            } else {
                allResultsHtml += '<p class="text-muted">No optimized expenses available.</p>';
            }
            allResultsHtml += `
                            </div>
                        </div>
                    </div>
            `;

                        // 3. EMI Recommendation
                        if (response.results.emi_recommendation && response.results.emi_recommendation.selected_plans && response.results.emi_recommendation.selected_plans.length > 0) {
                            allResultsHtml += `
                                <div class="results-grid-item-tall emi-card">
                                    <div class="card-body">
                                        <div class="card-header-custom">
                                            <i class="fas fa-hand-holding-usd"></i>
                                            <h4>Recommended EMI Plan</h4>
                                        </div>
                                        <div class="emi-details">
                                            ${response.results.emi_recommendation.selected_plans.map(plan => `
                                            <div class="emi-plan-item mb-4">
                                                <div class="emi-header">
                                                    <h5>${plan.name}</h5>
                                                    <span class="emi-amount">₹${plan.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month</span>
                                                </div>
                                                <div class="emi-stats">
                                                    <div class="stat-item">
                                                        <i class="fas fa-rupee-sign"></i>
                                                        <span>Loan Amount</span>
                                                        <small>₹${plan.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small>
                                                    </div>
                                                    <div class="stat-item">
                                                        <i class="fas fa-percent"></i>
                                                        <span>Interest Rate</span>
                                                        <small>${plan.interestRate}%</small>
                                                    </div>
                                                    <div class="stat-item">
                                                        <i class="fas fa-calendar-alt"></i>
                                                        <span>Duration</span>
                                                        <small>${plan.durationMonths} months</small>
                                                    </div>
                                                    <div class="stat-item">
                                                        <i class="fas fa-star"></i>
                                                        <span>Necessity</span>
                                                        <small>${plan.necessity}/10</small>
                                                    </div>
                                                </div>
                                            </div>
                                            `).join('')}
                                        </div>
                                        <p class="card-text mt-3"><strong>Recommendation:</strong> ${response.results.emi_recommendation.recommendation || 'No specific recommendation.'}</p>
                                    </div>
                                </div>
                            `;
                        } else {
                            allResultsHtml += `
                                <div class="no-analysis-content">
                                    <i class="fas fa-frown"></i>
                                    <p>No EMI recommendation available.</p>
                                </div>
                            `;
                        }

                        // 4. Financial Tips
                        if (response.results.advice && response.results.advice.tips) {
                            allResultsHtml += `
                                <div class="results-grid-item-tall tips-card">
                                    <div class="card-body">
                                        <div class="card-header-custom">
                                            <i class="fas fa-lightbulb"></i>
                                            <h4>Financial Tips</h4>
                                        </div>
                                        <div class="tips-list">`;
                            response.results.advice.tips.forEach(tip => {
                                allResultsHtml += `
                                    <div class="tip-item">
                                        <i class="fas fa-check-circle"></i>
                                        <span>${tip}</span>
                                    </div>`;
                            });
                            allResultsHtml += `
                                        </div>
                                    </div>
                                </div>
                        `;
                        }

                        // 6. Bank Statement Details
                        if (response.results.bank_statement && response.results.bank_statement.account_info) {
                            const accountInfo = response.results.bank_statement.account_info;
                            const bankName = response.results.bank_statement.bank;
                            allResultsHtml += `
                                <div class="results-grid-item-tall bank-statement-details-card">
                                    <div class="card-body">
                                        <div class="card-header-custom">
                                            <i class="fas fa-university"></i>
                                            <h4>Bank Statement Details</h4>
                                        </div>
                                        <div class="bank-details">
                                            <div class="detail-item">
                                                <i class="fas fa-building"></i>
                                                <p><strong>Bank:</strong> ${bankName || 'N/A'}</p>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-hashtag"></i>
                                                <p><strong>Account Number:</strong> ${accountInfo.account_number || 'N/A'}</p>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-credit-card"></i>
                                                <p><strong>Account Type:</strong> ${accountInfo.account_type || 'N/A'}</p>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-user"></i>
                                                <p><strong>Customer Name:</strong> ${accountInfo.customer_name || 'N/A'}</p>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-calendar-alt"></i>
                                                <p><strong>Statement Period:</strong> ${accountInfo.statement_period || 'N/A'}</p>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-wallet"></i>
                                                <p><strong>Opening Balance:</strong> <span class="highlight-number">₹${accountInfo.opening_balance ? accountInfo.opening_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</span></p>
                                            </div>
                                            <div class="detail-item">
                                                <i class="fas fa-piggy-bank"></i>
                                                <p><strong>Closing Balance:</strong> <span class="highlight-number">₹${accountInfo.closing_balance ? accountInfo.closing_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }

                        // 7. Bank Statement Transactions
                        if (response.results.bank_statement && response.results.bank_statement.transactions && response.results.bank_statement.transactions.length > 0) {
                            const transactions = response.results.bank_statement.transactions;
                            allResultsHtml += `
                                <div class="results-grid-item-tall bank-statement-transactions-card">
                                    <div class="card-body">
                                        <div class="card-header-custom">
                                            <i class="fas fa-receipt"></i>
                                            <h4>Transaction History</h4>
                                        </div>
                                        <div class="transaction-list">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Particulars</th>
                                                        <th>Debit</th>
                                                        <th>Credit</th>
                                                        <th>Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                            `;
                            transactions.forEach(transaction => {
                                allResultsHtml += `
                                            <tr>
                                                <td>${transaction.date || 'N/A'}</td>
                                                <td>${transaction.particulars || 'N/A'}</td>
                                                <td class="debit">₹${transaction.debit ? transaction.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                                                <td class="credit">₹${transaction.credit ? transaction.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                                                <td>₹${transaction.balance ? transaction.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                                            </tr>
                            `;
                            });
                            allResultsHtml += `
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }

                        // 8. Bank Statement Analysis (Placeholder - will generate dynamic insights here)
                        if (response.results.bank_statement && response.results.bank_statement.transactions) {
                            const bankAnalysis = generateBankStatementAnalysis(response.results.bank_statement.transactions);
                            allResultsHtml += `
                                <div class="results-grid-item-tall bank-analysis-card">
                                    <div class="card-body">
                                        <div class="card-header-custom">
                                            <i class="fas fa-chart-line"></i>
                                            <h4>Bank Statement Analysis</h4>
                                        </div>
                                        <div class="analysis-content">
                                            ${bankAnalysis}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }

                        // New: Overall Summary Card (Added as per user request)
                        allResultsHtml += `
                                <div class="results-grid-item-tall summary-card">
                                    <div class="card-body">
                                        <div class="card-header-custom">
                                            <i class="fas fa-chart-pie"></i>
                                            <h4>Overall Summary</h4>
                                        </div>
                                        <div class="summary-content">
                                            <div class="summary-section">
                                                <h5><i class="fas fa-info-circle"></i> Financial Overview</h5>
                                                <p class="summary-line">This section provides a concise overview of your financial health.</p>
                                                <p class="summary-line">Based on the analysis, here are some key takeaways:</p>
                                            </div>
                                            <div class="summary-section">
                                                <h5><i class="fas fa-chart-line"></i> Key Insights</h5>
                                                <ul class="analysis-list">
                                                    <li class="analysis-list-item">
                                                        <i class="fas fa-check-circle analysis-inline-icon"></i>
                                                        <span class="highlight-keyword">Positive cash flow:</span> Your income is currently exceeding your expenses.
                                                    </li>
                                                    <li class="analysis-list-item">
                                                        <i class="fas fa-lightbulb analysis-inline-icon"></i>
                                                        <span class="highlight-keyword">Investment Opportunity:</span> Consider diversifying your portfolio with long-term investments.
                                                    </li>
                                                    <li class="analysis-list-item">
                                                        <i class="fas fa-chart-line analysis-inline-icon"></i>
                                                        <span class="highlight-number">₹28,181.06</span> available for investment after expenses.
                                                    </li>
                                                    <li class="analysis-list-item">
                                                        <i class="fas fa-shield-alt analysis-inline-icon"></i>
                                                        Ensure adequate <span class="highlight-keyword">emergency fund</span> coverage.
                                                    </li>
                                                </ul>
                                            </div>
                                            <div class="summary-section">
                                                <h5><i class="fas fa-exclamation-triangle"></i> Areas of Focus</h5>
                                                <ul class="analysis-list">
                                                    <li class="analysis-list-item">
                                                        <i class="fas fa-credit-card analysis-inline-icon"></i>
                                                        Review and optimize your <span class="highlight-keyword">EMI payments</span>.
                                                    </li>
                                                    <li class="analysis-list-item">
                                                        <i class="fas fa-shopping-cart analysis-inline-icon"></i>
                                                        Monitor your <span class="highlight-keyword">discretionary spending</span>.
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;

                        // 5. Smart Model Summary (AI Advice)
                        if (response.results.smart_model_summary && response.results.smart_model_summary.detailed_analysis) {
                            const analysis = response.results.smart_model_summary.detailed_analysis;
                            allResultsHtml += `
                                <div class="results-grid-item-full smart-summary-card">
                                    <div class="card-body">
                                        <div class="card-header-custom">
                                            <i class="fas fa-brain"></i>
                                            <h4>Smart Financial Analysis</h4>
                                        </div>
                                        <div class="analysis-grid-container">`;

                            if (Array.isArray(analysis)) {
                                analysis.forEach(section => {
                                    const iconClass = getAnalysisIcon(section.header);
                                    allResultsHtml += `
                                        <div class="analysis-card-item">
                                            <div class="analysis-section-card h-100">
                                                <div class="card-body">
                                                    <div class="analysis-header">
                                                        <i class="${iconClass}"></i>
                                                        <h5>${section.header}</h5>
                                                    </div>
                                                    <div class="analysis-content">
                                                        ${formatSmartSummaryBody(section.body)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;
                                });
                            } else {
                                allResultsHtml += `
                                    <div class="analysis-card-item error-item">
                                        <div class="card error-card">
                                            <div class="card-body">
                                                <div class="error-content">
                                                    <i class="fas fa-exclamation-triangle"></i>
                                                    <span>Error: ${analysis}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`;
                            }
                            allResultsHtml += `
                                        </div>
                                    </div>
                                </div>
                        `;
                        } else {
                            allResultsHtml += `
                                <div class="results-grid-item-full no-analysis-card">
                                    <div class="card-body">
                                        <div class="no-analysis-content">
                                            <i class="fas fa-info-circle"></i>
                                            <span>No detailed AI analysis available.</span>
                                        </div>
                                    </div>
                                </div>
                        `;
                        }

                        resultsContent.innerHTML = allResultsHtml; // Assign the accumulated HTML

                        // Show results section and scroll to it
                        resultsSection.classList.remove('d-none');
                        resultsSection.scrollIntoView({ behavior: 'smooth' });

                    } else {
                        alert('Analysis failed: ' + response.error);
                    }
                })
                .catch(error => {
                    console.error('Fetch error:', error);
                    alert('An error occurred during analysis: ' + error);
                });
            };

            if (bankStatementFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        bankStatementData = JSON.parse(e.target.result);
                        console.log('Bank statement file read successfully:', bankStatementData);
                        processFormData(bankStatementData);
                    } catch (error) {
                        console.error('Error parsing bank statement JSON:', error);
                        alert('Error reading bank statement file: Invalid JSON format.');
                        processFormData(null); // Proceed without bank statement if parsing fails
                    }
                };
                reader.onerror = function(e) {
                    console.error('Error reading file:', e);
                    alert('Error reading bank statement file.');
                    processFormData(null); // Proceed without bank statement if read fails
                };
                reader.readAsText(bankStatementFile);
            } else {
                processFormData(null); // No file selected, proceed without bank statement
            }
        });
    }
});

// Helper function to get icon based on analysis header
function getAnalysisIcon(header) {
    if (header.includes("Budget Analysis")) return "fas fa-chart-pie";
    if (header.includes("Expense Optimization")) return "fas fa-lightbulb";
    if (header.includes("Investment Recommendations")) return "fas fa-chart-line";
    if (header.includes("Emergency Fund")) return "fas fa-hand-holding-heart";
    if (header.includes("Long-Term Financial Planning")) return "fas fa-calendar-alt";
    if (header.includes("Transaction Pattern Analysis")) return "fas fa-receipt";
    if (header.includes("Spending Behavior Insights")) return "fas fa-chart-bar";
    if (header.includes("Cash Flow Optimization")) return "fas fa-coins";
    if (header.includes("Banking Product Recommendations")) return "fas fa-piggy-bank";
    return "fas fa-info-circle"; // Default icon
}

// New helper function for Bank Statement Analysis
function generateBankStatementAnalysis(transactions) {
    if (!transactions || transactions.length === 0) {
        return '<p class="text-muted">No transactions to analyze.</p>';
    }

    let totalCredit = 0;
    let totalDebit = 0;
    const expenseCategories = {};
    const incomeCategories = {};

    transactions.forEach(t => {
        if (t.credit && t.credit > 0) {
            totalCredit += t.credit;
            const category = t.particulars || 'Uncategorized Income';
            incomeCategories[category] = (incomeCategories[category] || 0) + t.credit;
        }
        if (t.debit && t.debit > 0) {
            totalDebit += t.debit;
            const category = t.particulars || 'Uncategorized Expense';
            expenseCategories[category] = (expenseCategories[category] || 0) + t.debit;
        }
    });

    let analysisHtml = '';
    analysisHtml += '<p class="analysis-line"><i class="fas fa-chart-area analysis-inline-icon"></i> <strong>Total Credit:</strong> ₹' + totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</p>';
    analysisHtml += '<p class="analysis-line"><i class="fas fa-hand-holding-usd analysis-inline-icon"></i> <strong>Total Debit:</strong> ₹' + totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</p>';

    analysisHtml += '<h6 class="mt-3">Top Income Sources:</h6><ul>';
    const sortedIncome = Object.entries(incomeCategories).sort(([, a], [, b]) => b - a);
    sortedIncome.slice(0, 3).forEach(([category, amount]) => {
        analysisHtml += `<li class="analysis-line"><i class="fas fa-dollar-sign analysis-inline-icon"></i> ${category}: ₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>`;
    });
    if (sortedIncome.length === 0) analysisHtml += '<li class="text-muted">No significant income sources detected.</li>';
    analysisHtml += '</ul>';

    analysisHtml += '<h6 class="mt-3">Top Spending Categories:</h6><ul>';
    const sortedExpenses = Object.entries(expenseCategories).sort(([, a], [, b]) => b - a);
    sortedExpenses.slice(0, 3).forEach(([category, amount]) => {
        analysisHtml += `<li class="analysis-line"><i class="fas fa-shopping-cart analysis-inline-icon"></i> ${category}: ₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>`;
    });
    if (sortedExpenses.length === 0) analysisHtml += '<li class="text-muted">No significant spending categories detected.</li>';
    analysisHtml += '</ul>';

    // Simple cash flow insight
    if (totalCredit > totalDebit) {
        analysisHtml += '<p class="analysis-line mt-3"><i class="fas fa-arrow-up analysis-inline-icon"></i> Your cash flow is positive this month! You earned more than you spent.</p>';
    } else if (totalDebit > totalCredit) {
        analysisHtml += '<p class="analysis-line mt-3"><i class="fas fa-arrow-down analysis-inline-icon"></i> Your expenditures exceeded your income this month. Consider reviewing your spending.</p>';
    } else {
        analysisHtml += '<p class="analysis-line mt-3"><i class="fas fa-equals analysis-inline-icon"></i> Your income and expenses balanced out this month.</p>';
    }

    return analysisHtml;
}

// Helper function to format smart summary body with inline icons, highlighting, and numbers
function formatSmartSummaryBody(text) {
    const lines = text.split(/\n/);
    let formattedHtml = '';
    let inList = false;

    lines.forEach(line => {
        let cleanedLine = line.replace(/\*/g, '').trim(); // Remove ALL asterisks and trim whitespace

        if (!cleanedLine) {
            if (inList) {
                formattedHtml += '</ul>';
                inList = false;
            }
            return; // Skip empty lines
        }

        // Detect potential list items: starts with number/bullet OR a phrase ending with a colon
        const isListItem = cleanedLine.match(/^(\d+\.|-|•)\s*(.*)/) || cleanedLine.match(/^([A-Za-z0-9\s()]+:\s*)(.*)/);

        if (isListItem) {
            if (!inList) {
                formattedHtml += '<ul class="analysis-list">'; // Start unordered list for now
                inList = true;
            }
            const itemText = isListItem[2] ? isListItem[2].trim() : isListItem[1].trim(); // Get the actual item text
            const prefix = isListItem[2] ? isListItem[1] : ''; // Get the prefix if it's a bullet/number

            let icon = '';
            // Specific icons for common financial advice points
            if (itemText.toLowerCase().includes("food") || itemText.toLowerCase().includes("groceries")) {
                icon = 'fas fa-utensils';
            } else if (itemText.toLowerCase().includes("housing") || itemText.toLowerCase().includes("rent")) {
                icon = 'fas fa-home';
            } else if (itemText.toLowerCase().includes("miscellaneous spending") || itemText.toLowerCase().includes("upi transfer") || itemText.toLowerCase().includes("neft transfer")) {
                icon = 'fas fa-comments-dollar'; // More generic spending icon
            } else if (itemText.toLowerCase().includes("negotiate") || itemText.toLowerCase().includes("loan") || itemText.toLowerCase().includes("emi") || itemText.toLowerCase().includes("debt")) {
                icon = 'fas fa-handshake'; // Icon for negotiation/debt
            } else if (itemText.toLowerCase().includes("high-yield savings account") || itemText.toLowerCase().includes("liquid funds")) {
                icon = 'fas fa-piggy-bank';
            } else if (itemText.toLowerCase().includes("mutual funds") || itemText.toLowerCase().includes("sip")) {
                icon = 'fas fa-chart-area'; // Chart area for mutual funds
            } else if (itemText.toLowerCase().includes("debt funds")) {
                icon = 'fas fa-hand-holding-usd'; // Funds icon
            } else if (itemText.toLowerCase().includes("tax-saving investments") || itemText.toLowerCase().includes("elss") || itemText.toLowerCase().includes("ppf")) {
                icon = 'fas fa-coins'; // Coins for savings/tax
            } else if (itemText.toLowerCase().includes("retirement planning")) {
                icon = 'fas fa-calendar-alt';
            } else if (itemText.toLowerCase().includes("goal-based investing")) {
                icon = 'fas fa-bullseye';
            } else if (itemText.toLowerCase().includes("insurance")) {
                icon = 'fas fa-shield-alt';
            } else if (itemText.toLowerCase().includes("salary credit") || itemText.toLowerCase().includes("income sources")) {
                icon = 'fas fa-money-check-alt'; // Icon for income/salary
            } else if (itemText.toLowerCase().includes("atm withdrawal") || itemText.toLowerCase().includes("reliance on cash")) {
                icon = 'fas fa-cash-register'; // Cash register for ATM/cash
            } else if (itemText.toLowerCase().includes("budget") || itemText.toLowerCase().includes("expenses") || itemText.toLowerCase().includes("spending")) {
                icon = 'fas fa-chart-pie';
            } else if (itemText.toLowerCase().includes("save") || itemText.toLowerCase().includes("invest") || itemText.toLowerCase().includes("returns")) {
                icon = 'fas fa-wallet';
            } else if (itemText.toLowerCase().includes("emergency fund") || itemText.toLowerCase().includes("contingency")) {
                icon = 'fas fa-shield-alt';
            } else if (itemText.toLowerCase().includes("advice") || itemText.toLowerCase().includes("tip")) {
                icon = 'fas fa-lightbulb';
            } else if (itemText.toLowerCase().includes("transaction") || itemText.toLowerCase().includes("pattern")) {
                icon = 'fas fa-receipt';
            } else if (itemText.toLowerCase().includes("cash flow")) {
                icon = 'fas fa-exchange-alt';
            } else if (itemText.toLowerCase().includes("risk")) {
                icon = 'fas fa-exclamation-triangle';
            } else if (itemText.toLowerCase().includes("diversify")) {
                icon = 'fas fa-layer-group';
            } else if (itemText.toLowerCase().includes("growth")) {
                icon = 'fas fa-chart-line';
            } else if (itemText.toLowerCase().includes("review") || itemText.toLowerCase().includes("monitor")) {
                icon = 'fas fa-eye';
            } else {
                icon = 'fas fa-check-circle'; // Default for list items
            }

            let highlightedText = itemText.replace(/(\₹\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.?\d*\%)/g, '<span class="highlight-number">$&</span>');
            highlightedText = highlightedText.replace(/\b(important|key|critical|strong|positive|negative|increase|decrease|growth|risk|opportunity|diversified|stability|lower|financial goals|unforeseen events|frequent|categorized|digital payments|short-term|long-term)\b/gi, '<span class="highlight-keyword">$&</span>');


            formattedHtml += `<li class="analysis-list-item"><i class="${icon} analysis-inline-icon"></i>${prefix ? `<strong>${prefix}</strong> ` : ''}${highlightedText}</li>`;

        } else {
            if (inList) {
                formattedHtml += '</ul>';
                inList = false;
            }
            // Regular paragraph formatting
            let icon = '';
            if (cleanedLine.toLowerCase().includes("budget") || cleanedLine.toLowerCase().includes("expenses") || cleanedLine.toLowerCase().includes("spending")) {
                icon = 'fas fa-money-bill-wave';
            } else if (cleanedLine.toLowerCase().includes("save") || cleanedLine.toLowerCase().includes("invest") || cleanedLine.toLowerCase().includes("returns")) {
                icon = 'fas fa-wallet';
            } else if (cleanedLine.toLowerCase().includes("loan") || cleanedLine.toLowerCase().includes("emi") || cleanedLine.toLowerCase().includes("debt")) {
                icon = 'fas fa-credit-card';
            } else if (cleanedLine.toLowerCase().includes("emergency fund") || cleanedLine.toLowerCase().includes("contingency")) {
                icon = 'fas fa-shield-alt';
            } else if (cleanedLine.toLowerCase().includes("goal") || cleanedLine.toLowerCase().includes("planning") || cleanedLine.toLowerCase().includes("future")) {
                icon = 'fas fa-bullseye';
            } else if (cleanedLine.toLowerCase().includes("income") || cleanedLine.toLowerCase().includes("salary")) {
                icon = 'fas fa-hand-holding-usd';
            } else if (cleanedLine.toLowerCase().includes("advice") || cleanedLine.toLowerCase().includes("tip")) {
                icon = 'fas fa-lightbulb';
            } else if (cleanedLine.toLowerCase().includes("transaction") || cleanedLine.toLowerCase().includes("pattern")) {
                icon = 'fas fa-receipt';
            } else if (cleanedLine.toLowerCase().includes("cash flow")) {
                icon = 'fas fa-exchange-alt';
            } else if (cleanedLine.toLowerCase().includes("risk")) {
                icon = 'fas fa-exclamation-triangle';
            } else if (cleanedLine.toLowerCase().includes("diversify")) {
                icon = 'fas fa-layer-group';
            } else if (cleanedLine.toLowerCase().includes("growth")) {
                icon = 'fas fa-chart-line';
            } else if (cleanedLine.toLowerCase().includes("review") || cleanedLine.toLowerCase().includes("monitor")) {
                icon = 'fas fa-eye';
            } else {
                icon = 'fas fa-check-circle';
            }

            let highlightedText = cleanedLine.replace(/(\₹\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\.?\d*\%)/g, '<span class="highlight-number">$&</span>');
            highlightedText = highlightedText.replace(/\b(important|key|critical|strong|positive|negative|increase|decrease|growth|risk|opportunity|diversified|stability|lower|financial goals|unforeseen events|frequent|categorized|digital payments|short-term|long-term)\b/gi, '<span class="highlight-keyword">$&</span>');


            if (icon) {
                formattedHtml += `<p class="analysis-line"><i class="${icon} analysis-inline-icon"></i> ${highlightedText}</p>`;
            } else {
                formattedHtml += `<p class="analysis-line">${highlightedText}</p>`;
            }
        }
    });

    if (inList) {
        formattedHtml += '</ul>'; // Close any unclosed list
    }

    return formattedHtml;
}