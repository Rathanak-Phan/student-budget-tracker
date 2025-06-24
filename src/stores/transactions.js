import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTransactionsStore = defineStore("transactions", () => {
  // Load from localStorage or use defaults
  const transactions = ref(
    JSON.parse(localStorage.getItem("transactions")) || []
  );
  const categories = ref(
    JSON.parse(localStorage.getItem("categories")) || {
      Income: ["Salary", "Bonus", "Freelance", "Investment", "Gift"],
      Expense: ["Food", "Transport", "Rent", "Utilities", "Entertainment"],
    }
  );
  const currency = ref(JSON.parse(localStorage.getItem("currency")) || "$");

  // Save to localStorage
  function saveToLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions.value));
    localStorage.setItem("categories", JSON.stringify(categories.value));
    localStorage.setItem("currency", JSON.stringify(currency.value));
  }

  // Transaction methods
  function addTransaction(transaction) {
    transactions.value.push({
      ...transaction,
      id: Date.now(),
      amount: parseFloat(transaction.amount),
    });
    saveToLocalStorage();
  }

  function updateTransaction(id, updatedTransaction) {
    const index = transactions.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions.value[index] = updatedTransaction;
      saveToLocalStorage();
    }
  }

  function deleteTransaction(id) {
    transactions.value = transactions.value.filter((t) => t.id !== id);
    saveToLocalStorage();
  }

  // Category methods
  function addCategory(type, newCategory) {
      if (!categories.value[type]) {
        categories.value[type] = [];
      }
      if (!categories.value[type].includes(newCategory)) {
        categories.value[type].push(newCategory);
        saveToLocalStorage();
      }
    }

  function deleteCategory(type, category) {
    categories.value[type] = categories.value[type].filter(
      (c) => c !== category
    );

    // Also remove this category from any transactions
    transactions.value = transactions.value.map((t) => {
      if (t.type === type && t.category === category) {
        return { ...t, category: "" };
      }
      return t;
    });

    saveToLocalStorage();
  }

  // Currency method
  function setCurrency(newCurrency) {
    currency.value = newCurrency;
    saveToLocalStorage();
  }

  // Computed properties
  const totalIncome = computed(() => {
    return transactions.value
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const totalExpenses = computed(() => {
    return transactions.value
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const balance = computed(() => totalIncome.value - totalExpenses.value);

  return {
    transactions,
    categories,
    currency,
    totalIncome,
    totalExpenses,
    balance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    setCurrency,
  };
});
