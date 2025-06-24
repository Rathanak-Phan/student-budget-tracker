<script setup>
import { ref, computed } from "vue";
import { useTransactionsStore } from "../stores/transactions";

const store = useTransactionsStore();
const editingBudget = ref(false);
const newBudgetGoal = ref(store.budgetGoal);
const editingCurrency = ref(false);
const newCurrency = ref(store.currency);

const budgetStatus = computed(() => {
  if (store.budgetGoal <= 0) return "not-set";

  const percentage = (store.totalExpenses / store.budgetGoal) * 100;
  if (percentage >= 100) return "exceeded";
  if (percentage >= 80) return "warning";
  return "safe";
});

function saveBudgetGoal() {
  store.setBudgetGoal(parseFloat(newBudgetGoal.value) || 0);
  editingBudget.value = false;
}

function saveCurrency() {
  store.setCurrency(newCurrency.value);
  editingCurrency.value = false;
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold mb-4">Budget Goals</h2>

    <div class="space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-medium">Monthly Budget</h3>
          <button
            @click="editingBudget = !editingBudget"
            class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {{ editingBudget ? "Cancel" : "Edit" }}
          </button>
        </div>

        <div v-if="editingBudget" class="flex items-center space-x-2">
          <input
            type="number"
            v-model.number="newBudgetGoal"
            step="0.01"
            min="0"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
          />
          <button
            @click="saveBudgetGoal"
            class="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
        <div v-else>
          <p class="text-2xl font-bold">
            {{ store.currency }}{{ (Number(store.budgetGoal) || 0).toFixed(2) }}
          </p>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-medium">Currency</h3>
          <button
            @click="editingCurrency = !editingCurrency"
            class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {{ editingCurrency ? "Cancel" : "Edit" }}
          </button>
        </div>

        <div v-if="editingCurrency" class="flex items-center space-x-2">
          <input
            type="text"
            v-model="newCurrency"
            maxlength="3"
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
          />
          <button
            @click="saveCurrency"
            class="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
        <div v-else>
          <p class="text-xl font-medium">
            {{ store.currency }}
          </p>
        </div>
      </div>

      <div v-if="store.budgetGoal > 0">
        <h3 class="font-medium mb-2">Budget Status</h3>
        <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div
            :class="{
              'bg-red-600': budgetStatus === 'exceeded',
              'bg-yellow-500': budgetStatus === 'warning',
              'bg-green-600': budgetStatus === 'safe',
            }"
            class="h-4 rounded-full"
            :style="`width: ${Math.min(
              100,
              (store.totalExpenses / store.budgetGoal) * 100
            )}%`"
          ></div>
        </div>
        <div class="flex justify-between text-sm">
          <span>
            Spent: {{ store.currency }}{{ (Number(store.totalExpenses) || 0).toFixed(2) }}
          </span>
          <span>
            Remaining: {{ store.currency
            }}{{
              Math.max(0, (Number(store.budgetGoal) || 0) - (Number(store.totalExpenses) || 0)).toFixed(2)
            }}
          </span>
        </div>

        <div
          v-if="budgetStatus !== 'not-set'"
          class="mt-3 p-3 rounded-md"
          :class="{
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
              budgetStatus === 'exceeded',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
              budgetStatus === 'warning',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
              budgetStatus === 'safe',
          }"
        >
          <p v-if="budgetStatus === 'exceeded'" class="font-medium">
            You've exceeded your monthly budget by {{ store.currency
            }}{{ ((Number(store.totalExpenses) || 0) - (Number(store.budgetGoal) || 0)).toFixed(2) }}!
          </p>
          <p v-else-if="budgetStatus === 'warning'" class="font-medium">
            You've used
            {{ Math.round((store.totalExpenses / store.budgetGoal) * 100) }}% of
            your budget. Be careful with your spending!
          </p>
          <p v-else class="font-medium">
            You're doing great! Only
            {{ Math.round((store.totalExpenses / store.budgetGoal) * 100) }}% of
            your budget used.
          </p>
        </div>
      </div>

      <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
        Set a monthly budget to track your spending.
      </div>
    </div>
  </div>
</template>
