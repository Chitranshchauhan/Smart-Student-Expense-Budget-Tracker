// ===================================
// SMART STUDENT EXPENSE & BUDGET TRACKER
// ===================================


// 1. GET HTML ELEMENTS

const addTransactionBtn = document.getElementById("addTransactionBtn");

const transactionModal = document.getElementById("transactionModal");

const closeModal = document.getElementById("closeModal");

const transactionForm = document.getElementById("transactionForm");

const transactionList = document.getElementById("transactionList");


// 2. LOAD DATA FROM LOCAL STORAGE

let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];


// 3. FORMAT AMOUNT IN RUPEES

function formatAmount(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);

}


// 4. OPEN TRANSACTION MODAL

addTransactionBtn.addEventListener("click", function () {

    transactionModal.style.display = "flex";

    document.getElementById("date").value =
        new Date().toISOString().split("T")[0];

});


// 5. CLOSE TRANSACTION MODAL

closeModal.addEventListener("click", function () {

    transactionModal.style.display = "none";

});


// Close modal by clicking outside

transactionModal.addEventListener("click", function (event) {

    if (event.target === transactionModal) {

        transactionModal.style.display = "none";

    }

});


// 6. ADD NEW TRANSACTION

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = document.getElementById("title").value.trim();

    const amount = Number(
        document.getElementById("amount").value
    );

    const type = document.getElementById("type").value;

    const category = document.getElementById("category").value;

    const date = document.getElementById("date").value;


    // Input Validation

    if (!title || !date || !Number.isFinite(amount) || amount <= 0) {

        alert("Please enter valid transaction details!");

        return;

    }


    // Create Transaction Object

    const transaction = {

        id: Date.now(),

        title: title,

        amount: amount,

        type: type,

        category: category,

        date: date

    };


    // Add Transaction

    transactions.push(transaction);


    // Save Data

    saveTransactions();


    // Update Dashboard

    updateDashboard();


    // Reset Form

    transactionForm.reset();

    transactionModal.style.display = "none";

    alert("Transaction Added Successfully!");

});


// 7. SAVE TRANSACTIONS IN LOCAL STORAGE

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


// 8. UPDATE DASHBOARD

function updateDashboard() {

    let totalIncome = 0;

    let totalExpenses = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        }

        else {

            totalExpenses += transaction.amount;

        }

    });


    const balance = totalIncome - totalExpenses;


    // Update Cards

    document.getElementById("totalBalance").textContent =
        formatAmount(balance);

    document.getElementById("totalIncome").textContent =
        formatAmount(totalIncome);

    document.getElementById("totalExpenses").textContent =
        formatAmount(totalExpenses);


    // Update Transaction History

    displayTransactions();

    updateBudgetPlanner();


    // Update Charts

    updateCharts();

}


// 9. DISPLAY TRANSACTIONS

function displayTransactions() {

    transactionList.innerHTML = "";


    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="5">No transactions yet.</td>
            </tr>
        `;

        return;

    }


    const recentTransactions = [...transactions].reverse();


    recentTransactions.forEach(function (transaction) {

        const row = document.createElement("tr");

        const typeColor =
            transaction.type === "income" ? "green" : "red";

        const sign =
            transaction.type === "income" ? "+" : "-";


        row.innerHTML = `

            <td>${escapeHTML(transaction.title)}</td>

            <td>${escapeHTML(transaction.category)}</td>

            <td>${escapeHTML(transaction.date)}</td>

            <td style="color:${typeColor}">
                ${transaction.type.toUpperCase()}
            </td>

            <td>
                <span style="color:${typeColor}">
                    ${sign}${formatAmount(transaction.amount)}
                </span>

                <button
                    class="delete-btn"
                    data-id="${transaction.id}"
                    style="margin-left:10px; cursor:pointer;">
                    Delete
                </button>
            </td>

        `;


        transactionList.appendChild(row);

    });

}


// Prevent HTML injection in transaction text

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];

    });

}


// 10. DELETE TRANSACTION

transactionList.addEventListener("click", function (event) {

    if (!event.target.classList.contains("delete-btn")) {

        return;

    }


    const id = Number(event.target.dataset.id);


    if (confirm("Are you sure you want to delete this transaction?")) {

        transactions = transactions.filter(function (transaction) {

            return transaction.id !== id;

        });


        saveTransactions();

        updateDashboard();

    }

});


// 11. EXPENSE PIE CHART

let expenseChart = null;

let monthlyChart = null;


function updateCharts() {

    const expenseData = {};

    transactions.forEach(function (transaction) {

        if (transaction.type === "expense") {

            expenseData[transaction.category] =
                (expenseData[transaction.category] || 0)
                + transaction.amount;

        }

    });


    const expenseCanvas = document.getElementById("expenseChart");

    if (expenseCanvas && window.Chart) {

        if (expenseChart) {

            expenseChart.destroy();

        }


        expenseChart = new Chart(expenseCanvas, {

            type: "doughnut",

            data: {

                labels: Object.keys(expenseData),

                datasets: [{

                    data: Object.values(expenseData),

                    backgroundColor: [
                        "#2563eb",
                        "#16a34a",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#06b6d4",
                        "#ec4899"
                    ]

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: true

            }

        });

    }


    // 12. MONTHLY SPENDING CHART

    const monthlyData = {};

    transactions.forEach(function (transaction) {

        if (transaction.type === "expense") {

            const month = transaction.date.substring(0, 7);

            monthlyData[month] =
                (monthlyData[month] || 0) + transaction.amount;

        }

    });


    const monthlyCanvas = document.getElementById("monthlyChart");

    if (monthlyCanvas && window.Chart) {

        if (monthlyChart) {

            monthlyChart.destroy();

        }


        monthlyChart = new Chart(monthlyCanvas, {

            type: "bar",

            data: {

                labels: Object.keys(monthlyData),

                datasets: [{

                    label: "Monthly Expenses (₹)",

                    data: Object.values(monthlyData),

                    backgroundColor: "#2563eb",

                    borderRadius: 6

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: true,

                scales: {

                    y: {

                        beginAtZero: true

                    }

                }

            }

        });

    }

}


// 13. INITIALIZE DASHBOARD


console.log("Smart Student Expense Tracker Started Successfully!");
// ===================================
// MONTHLY BUDGET PLANNER
// ===================================

// Get current month

function getCurrentMonth() {

    return new Date().toISOString().slice(0, 7);

}


// Load saved budget

let monthlyBudgetData = JSON.parse(
    localStorage.getItem("monthlyBudgetData")
) || {};


// Set Monthly Budget

document.getElementById("setBudgetBtn")
.addEventListener("click", function () {

    const budget = Number(
        document.getElementById("budgetInput").value
    );

    if (!Number.isFinite(budget) || budget <= 0) {

        alert("Please enter a valid budget!");

        return;

    }

    monthlyBudgetData[getCurrentMonth()] = budget;

    localStorage.setItem(
        "monthlyBudgetData",
        JSON.stringify(monthlyBudgetData)
    );

    document.getElementById("budgetInput").value = "";

    updateDashboard();

    alert("Monthly Budget Set Successfully!");

});


// Update Budget Details

function updateBudgetPlanner() {

    const currentMonth = getCurrentMonth();

    const budget = monthlyBudgetData[currentMonth] || 0;

    let spent = 0;


    transactions.forEach(function (transaction) {

        if (
            transaction.type === "expense" &&
            transaction.date.startsWith(currentMonth)
        ) {

            spent += transaction.amount;

        }

    });


    const remaining = budget - spent;

    const percentage = budget > 0
        ? (spent / budget) * 100
        : 0;


    document.getElementById("budgetTotal").textContent =
        formatAmount(budget);

    document.getElementById("budgetSpent").textContent =
        formatAmount(spent);

    document.getElementById("budgetRemaining").textContent =
        formatAmount(remaining);


    const progress = document.getElementById("budgetProgress");

    progress.style.width = Math.min(percentage, 100) + "%";


    if (budget === 0) {

        progress.style.background = "#94a3b8";

        document.getElementById("budgetMessage").textContent =
            "Please set your monthly budget.";

    }

    else if (percentage >= 100) {

        progress.style.background = "#dc2626";

        document.getElementById("budgetMessage").textContent =
            "⚠️ Budget exceeded! You have crossed your spending limit.";

    }

    else if (percentage >= 80) {

        progress.style.background = "#f59e0b";

        document.getElementById("budgetMessage").textContent =
            "⚠️ Warning! You have used " +
            percentage.toFixed(1) + "% of your budget.";

    }

    else {

        progress.style.background = "#16a34a";

        document.getElementById("budgetMessage").textContent =
            percentage.toFixed(1) +
            "% budget used. You are managing your budget well!";

    }

}
// ===================================
// 14. SEARCH & FILTER TRANSACTIONS
// ===================================

const searchInput = document.getElementById("searchTransaction");

const filterType = document.getElementById("filterType");


// Search and Filter Function

function filterTransactions() {

    const searchValue = searchInput.value.toLowerCase().trim();

    const selectedType = filterType.value;


    const filteredTransactions = [...transactions].reverse().filter(function (transaction) {

        const matchesSearch =
            transaction.title.toLowerCase().includes(searchValue) ||
            transaction.category.toLowerCase().includes(searchValue);

        const matchesType =
            selectedType === "all" ||
            transaction.type === selectedType;

        return matchesSearch && matchesType;

    });


    displayFilteredTransactions(filteredTransactions);

}


// Display Filtered Transactions

function displayFilteredTransactions(filteredTransactions) {

    transactionList.innerHTML = "";


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="5">No matching transactions found.</td>
            </tr>
        `;

        return;

    }


    filteredTransactions.forEach(function (transaction) {

        const row = document.createElement("tr");

        const typeColor =
            transaction.type === "income" ? "green" : "red";

        const sign =
            transaction.type === "income" ? "+" : "-";


        row.innerHTML = `

            <td>${escapeHTML(transaction.title)}</td>

            <td>${escapeHTML(transaction.category)}</td>

            <td>${escapeHTML(transaction.date)}</td>

            <td style="color:${typeColor}">
                ${transaction.type.toUpperCase()}
            </td>

            <td>
                <span style="color:${typeColor}">
                    ${sign}${formatAmount(transaction.amount)}
                </span>

                <button
                    class="delete-btn"
                    data-id="${transaction.id}"
                    style="margin-left:10px; cursor:pointer;">
                    Delete
                </button>
            </td>

        `;


        transactionList.appendChild(row);

    });

}


// Search Event

searchInput.addEventListener("input", filterTransactions);


// Filter Event

filterType.addEventListener("change", filterTransactions);
// ===================================
// 15. EXPORT TRANSACTIONS TO CSV
// ===================================

const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener("click", function () {

    if (transactions.length === 0) {

        alert("No transactions available to export!");

        return;

    }

    const headers = [
        "Title",
        "Amount",
        "Type",
        "Category",
        "Date"
    ];

    const rows = transactions.map(function (transaction) {

        return [
            transaction.title,
            transaction.amount,
            transaction.type,
            transaction.category,
            transaction.date
        ];

    });

    const csvContent = [headers, ...rows]
        .map(row => row.map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        ).join(","))
        .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Student_Expense_Report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert("CSV Report Downloaded Successfully!");

});
// ===================================
// 16. DARK MODE / LIGHT MODE
// ===================================

const themeToggle = document.getElementById("themeToggle");

// Load saved theme
let savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

// Toggle Theme
themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem("theme", "dark");

        themeToggle.textContent = "☀️ Light Mode";

    } else {

        localStorage.setItem("theme", "light");

        themeToggle.textContent = "🌙 Dark Mode";

    }

});
console.log("Dark Mode Button:", themeToggle);

// INITIALIZE DASHBOARD AFTER ALL VARIABLES LOAD

updateDashboard();