<script setup>
import { ref, onMounted, watch } from "vue";
import { useTransactionsStore } from "./stores/transactions";
import TransactionForm from "./components/TransactionForm.vue";
import TransactionList from "./components/TransactionList.vue";
import SummaryDashboard from "./components/SummaryDashboard.vue";
import BudgetGoals from "./components/BudgetGoals.vue";

const store = useTransactionsStore();
const activeTab = ref("transactions");
const darkMode = ref(false);

// Initialize dark mode from localStorage or system preference
onMounted(() => {
  const savedMode = localStorage.getItem("darkMode");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  darkMode.value = savedMode ? savedMode === "true" : prefersDark;
  updateTheme();
});

// Watch changes to darkMode
watch(darkMode, updateTheme);

function updateTheme() {
  const html = document.documentElement;
  if (darkMode.value) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
  localStorage.setItem("darkMode", darkMode.value);
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value;
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
  >
    <header class="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Student Budget Tracker
        </h1>
        <button
          @click="toggleDarkMode"
          class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg
            v-if="darkMode"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
    </header>

    <main class="container mx-auto py-8 px-4">
      <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-1/3 space-y-6">
          <SummaryDashboard />
          <BudgetGoals />
        </div>
        <div class="md:w-2/3 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex border-b border-gray-200 dark:border-gray-700">
              <button
                @click="activeTab = 'transactions'"
                :class="{
                  'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400':
                    activeTab === 'transactions',
                }"
                class="px-4 py-2 font-medium"
              >
                Transactions
              </button>
              <button
                @click="activeTab = 'add'"
                :class="{
                  'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400':
                    activeTab === 'add',
                }"
                class="px-4 py-2 font-medium"
              >
                Add Transaction
              </button>
            </div>

            <div class="mt-4">
              <TransactionForm v-if="activeTab === 'add'" />
              <TransactionList v-else />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
