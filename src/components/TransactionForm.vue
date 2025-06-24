<script setup>
import { ref, computed } from "vue";
import { useTransactionsStore } from "../stores/transactions";

const store = useTransactionsStore();
const transaction = ref({
  id: Date.now(),
  type: "Expense",
  category: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  description: "",
});

const customCategory = ref("");
const showCustomCategory = ref(false);

const categories = computed(() => {
  return store.categories[transaction.value.type];
});

function submitTransaction() {
  if (!transaction.value.category) {
    alert("Please select a category");
    return;
  }

  if (transaction.value.amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  store.addTransaction({
    ...transaction.value,
    id: Date.now(),
    amount: parseFloat(transaction.value.amount),
  });

  resetForm();
}

function addNewCategory() {
  if (customCategory.value.trim()) {
    store.addCategory(transaction.value.type, customCategory.value.trim());
    transaction.value.category = customCategory.value.trim();
    customCategory.value = "";
    showCustomCategory.value = false;
  }
}

function resetForm() {
  transaction.value = {
    id: Date.now(),
    type: "Expense",
    category: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  };
  customCategory.value = "";
  showCustomCategory.value = false;
}
</script>

<template>
    <form
        @submit.prevent="submitTransaction"
        class="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Type Selection -->
            <div>
                <label for="type" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Type</label>
                <select
                    id="type"
                    v-model="transaction.type"
                    @change="transaction.category = ''"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                </select>
            </div>

            <!-- Category Selection -->
            <div>
                <label for="category" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
                    >Category</label
                >
                <div class="flex space-x-2">
                    <select
                        id="category"
                        v-model="transaction.category"
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                        <option value="" disabled>Select a category</option>
                        <option
                            v-for="category in categories"
                            :key="category"
                            :value="category"
                        >
                            {{ category }}
                        </option>
                    </select>
                    <button
                        type="button"
                        @click="showCustomCategory = !showCustomCategory"
                        class="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        {{ showCustomCategory ? "×" : "+" }}
                    </button>
                </div>

                <!-- New Category Input -->
                <div v-if="showCustomCategory" class="mt-2 flex space-x-2">
                    <input
                        type="text"
                        v-model="customCategory"
                        placeholder="New category name"
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <button
                        type="button"
                        @click="addNewCategory"
                        class="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Add
                    </button>
                </div>
            </div>

            <!-- Amount -->
            <div>
                <label for="amount" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
                    >Amount ({{ store.currency }})</label
                >
                <input
                    id="amount"
                    type="number"
                    v-model.number="transaction.amount"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
            </div>

            <!-- Date -->
            <div>
                <label for="date" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">Date</label>
                <input
                    id="date"
                    type="date"
                    v-model="transaction.date"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
            </div>
        </div>

        <!-- Description -->
        <div>
            <label for="description" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200"
                >Description (Optional)</label
            >
            <textarea
                id="description"
                v-model="transaction.description"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
            <button
                type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                Add Transaction
            </button>
        </div>
    </form>
</template>
