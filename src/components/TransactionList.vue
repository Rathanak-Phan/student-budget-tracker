<script setup>
import { ref, computed } from "vue";
import { useTransactionsStore } from "../stores/transactions";

const store = useTransactionsStore();
const searchTerm = ref("");
const filterType = ref("All");
const filterCategory = ref("All");
const filterMonth = ref("All");
const editingId = ref(null);
const editForm = ref({});

// Filtered transactions
const filteredTransactions = computed(() => {
  let filtered = [...store.transactions];

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description?.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term)
    );
  }

  if (filterType.value !== "All") {
    filtered = filtered.filter((t) => t.type === filterType.value);
  }

  if (filterCategory.value !== "All") {
    filtered = filtered.filter((t) => t.category === filterCategory.value);
  }

  if (filterMonth.value !== "All") {
    filtered = filtered.filter((t) => {
      const date = new Date(t.date);
      return (
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}` === filterMonth.value
      );
    });
  }

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
});

// Available months for filtering
const months = computed(() => {
  const monthsSet = new Set();
  store.transactions.forEach((t) => {
    const date = new Date(t.date);
    monthsSet.add(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
  });
  return Array.from(monthsSet).sort().reverse();
});

// Available categories based on selected type
const availableCategories = computed(() => {
  const categories = store.categories || { Income: [], Expense: [] };
  if (filterType.value === "Income") return categories.Income || [];
  if (filterType.value === "Expense") return categories.Expense || [];
  return [...(categories.Income || []), ...(categories.Expense || [])];
});

// Edit functions
function startEdit(transaction) {
  editingId.value = transaction.id;
  editForm.value = { ...transaction };
}

function cancelEdit() {
  editingId.value = null;
  editForm.value = {};
}

function saveEdit() {
  store.updateTransaction(editingId.value, editForm.value);
  cancelEdit();
}

function confirmDelete(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    store.deleteTransaction(id);
  }
}

function confirmDeleteCategory(type, category) {
  if (
    confirm(
      `Delete category "${category}" and remove it from all ${type} transactions?`
    )
  ) {
    store.deleteCategory(type, category);
  }
}
</script>

<template>
    <div class="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Search</label>
                <input
                    v-model="searchTerm"
                    placeholder="Search transactions..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Type</label>
                <select
                    v-model="filterType"
                    @change="filterCategory = 'All'"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="All">All</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Category</label>
                <select
                    v-model="filterCategory"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="All">All</option>
                    <option
                        v-for="category in availableCategories"
                        :key="category"
                        :value="category"
                    >
                        {{ category }}
                    </option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">Month</label>
                <select
                    v-model="filterMonth"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="All">All</option>
                    <option v-for="month in months" :key="month" :value="month">
                        {{
                            new Date(month + "-01").toLocaleDateString(undefined, {
                                month: "long",
                                year: "numeric",
                            })
                        }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Category Management -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border rounded-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 class="font-medium text-green-600 dark:text-green-400 mb-2">Income Categories</h3>
                <div class="space-y-2">
                    <div
                        v-for="category in store.categories.Income"
                        :key="'income-' + category"
                        class="flex justify-between items-center"
                    >
                        <span>{{ category }}</span>
                        <button
                            @click="confirmDeleteCategory('Income', category)"
                            class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            <div class="border rounded-md p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <h3 class="font-medium text-red-600 dark:text-red-400 mb-2">Expense Categories</h3>
                <div class="space-y-2">
                    <div
                        v-for="category in store.categories.Expense"
                        :key="'expense-' + category"
                        class="flex justify-between items-center"
                    >
                        <span>{{ category }}</span>
                        <button
                            @click="confirmDeleteCategory('Expense', category)"
                            class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transactions Table -->
        <div
            v-if="filteredTransactions.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
        >
            No transactions found
        </div>

        <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Date
                        </th>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Type
                        </th>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Category
                        </th>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Amount
                        </th>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Description
                        </th>
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ new Date(transaction.date).toLocaleDateString() }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span
                                :class="
                                    transaction.type === 'Income'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                "
                                class="px-2 py-1 text-xs font-medium rounded-full"
                            >
                                {{ transaction.type }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ transaction.category }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap font-medium">
                            <span
                                :class="
                                    transaction.type === 'Income'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                "
                            >
                                {{ store.currency }}{{ transaction.amount.toFixed(2) }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            {{ transaction.description || "-" }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <button
                                    @click="startEdit(transaction)"
                                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    Edit
                                </button>
                                <button
                                    @click="confirmDelete(transaction.id)"
                                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Edit Modal -->
        <div
            v-if="editingId"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Transaction</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Type</label>
                        <select
                            v-model="editForm.type"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Category</label>
                        <select
                            v-model="editForm.category"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="" disabled>Select a category</option>
                            <option
                                v-for="category in store.categories[editForm.type]"
                                :key="category"
                                :value="category"
                            >
                                {{ category }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Amount</label>
                        <input
                            type="number"
                            v-model.number="editForm.amount"
                            step="0.01"
                            min="0"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            v-model="editForm.date"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            v-model="editForm.description"
                            rows="2"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        ></textarea>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button
                            @click="cancelEdit"
                            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            @click="saveEdit"
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
