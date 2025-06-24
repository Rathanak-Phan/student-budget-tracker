<script setup>
import { useTransactionsStore } from "../stores/transactions";
import { ref, computed } from "vue";

const store = useTransactionsStore();
const timeRange = ref("month"); // month, week, or day

// Get current date components
const now = new Date();
const currentDay = now.toISOString().split("T")[0];
const currentWeek = getWeekNumber(now);
const currentMonth = `${now.getFullYear()}-${String(
  now.getMonth() + 1
).padStart(2, "0")}`;

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return `${d.getFullYear()}-W${Math.round(((d - week1) / 86400000 + 1) / 7)}`;
}

// Filter transactions based on time range
const filteredTransactions = computed(() => {
  return store.transactions.filter((t) => {
    const date = new Date(t.date);
    if (timeRange.value === "day") {
      return t.date === currentDay;
    } else if (timeRange.value === "week") {
      return getWeekNumber(date) === currentWeek;
    } else {
      // month
      return (
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}` === currentMonth
      );
    }
  });
});

// Calculate summary values
const summary = computed(() => {
  const income = filteredTransactions.value
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions.value
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  return { income, expenses, balance };
});

// Get top categories for pie chart
const topCategories = computed(() => {
  const categoryMap = {};

  filteredTransactions.value
    .filter((t) => t.type === "Expense")
    .forEach((t) => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += t.amount;
    });

  return Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
});

// Calculate percentage for pie chart
function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Generate pie chart segments
function getPieChartSegments() {
  const totalExpenses = summary.value.expenses;
  if (totalExpenses === 0) return [];

  let cumulativePercent = 0;
  return topCategories.value.map(([category, amount]) => {
    const percent = calculatePercentage(amount, totalExpenses);
    const segment = {
      category,
      amount,
      percent,
      start: cumulativePercent,
      end: cumulativePercent + percent,
    };
    cumulativePercent += percent;
    return segment;
  });
}

const pieSegments = computed(getPieChartSegments);

function getCategoryColor(index) {
  const colors = [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
  ];
  return colors[index % colors.length];
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold mb-4">Summary Dashboard</h2>

    <div class="flex space-x-2 mb-6">
      <button
        @click="timeRange = 'day'"
        :class="{
          'bg-indigo-600 text-white': timeRange === 'day',
          'bg-gray-200 dark:bg-gray-700': timeRange !== 'day',
        }"
        class="px-3 py-1 rounded-md text-sm"
      >
        Today
      </button>
      <button
        @click="timeRange = 'week'"
        :class="{
          'bg-indigo-600 text-white': timeRange === 'week',
          'bg-gray-200 dark:bg-gray-700': timeRange !== 'week',
        }"
        class="px-3 py-1 rounded-md text-sm"
      >
        This Week
      </button>
      <button
        @click="timeRange = 'month'"
        :class="{
          'bg-indigo-600 text-white': timeRange === 'month',
          'bg-gray-200 dark:bg-gray-700': timeRange !== 'month',
        }"
        class="px-3 py-1 rounded-md text-sm"
      >
        This Month
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
          Income
        </h3>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ store.currency }}{{ summary.income.toFixed(2) }}
        </p>
      </div>

      <div class="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
          Expenses
        </h3>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">
          {{ store.currency }}{{ summary.expenses.toFixed(2) }}
        </p>
      </div>

      <div
        :class="{
          'bg-blue-50 dark:bg-blue-900': summary.balance >= 0,
          'bg-purple-50 dark:bg-purple-900': summary.balance < 0,
        }"
        class="p-4 rounded-lg"
      >
        <h3
          :class="{
            'text-blue-800 dark:text-blue-200': summary.balance >= 0,
            'text-purple-800 dark:text-purple-200': summary.balance < 0,
          }"
          class="text-sm font-medium"
        >
          Balance
        </h3>
        <p
          :class="{
            'text-blue-600 dark:text-blue-400': summary.balance >= 0,
            'text-purple-600 dark:text-purple-400': summary.balance < 0,
          }"
          class="text-2xl font-bold"
        >
          {{ store.currency }}{{ summary.balance.toFixed(2) }}
        </p>
      </div>
    </div>

    <div v-if="summary.expenses > 0" class="mb-6">
      <h3 class="text-lg font-medium mb-3">Expense Categories</h3>
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Pie Chart -->
        <div class="w-40 h-40 relative">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="10"
              class="dark:stroke-gray-600"
            />
            <template v-for="(segment, index) in pieSegments" :key="index">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                :stroke="getCategoryColor(index)"
                stroke-width="10"
                :stroke-dasharray="`${segment.percent} ${
                  100 - segment.percent
                }`"
                stroke-dashoffset="25"
                :transform="`rotate(${
                  -90 + (segment.start / 100) * 360
                } 50 50)`"
              />
            </template>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-lg font-medium">
              {{
                Math.round((summary.expenses / (summary.income || 1)) * 100)
              }}%
            </span>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex-1">
          <div
            v-for="(segment, index) in pieSegments"
            :key="index"
            class="flex items-center mb-2"
          >
            <div
              class="w-4 h-4 rounded-full mr-2"
              :style="`background-color: ${getCategoryColor(index)}`"
            ></div>
            <span class="text-sm flex-1">{{
              segment.category || "Uncategorized"
            }}</span>
            <span class="text-sm font-medium">
              {{ store.currency }}{{ segment.amount.toFixed(2) }} ({{
                Math.round(segment.percent)
              }}%)
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
      No expense data available for the selected time range.
    </div>
  </div>
</template>
