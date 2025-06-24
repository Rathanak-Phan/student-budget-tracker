<template>
  <div @click="toggleTheme">
    <i
      :class="theme === 'light' ? 'fa-regular fa-moon' : 'fa-regular fa-sun'"
    ></i>
  </div>
</template>

<script>
export default {
  name: "ThemeMode",
  data() {
    return {
      theme: "light", // default
    };
  },
  mounted() {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      this.theme = "dark";
      document.documentElement.classList.add("dark");
    } else {
      this.theme = "light";
      document.documentElement.classList.remove("dark");
    }
  },
  watch: {
    theme(newTheme) {
      // Apply to DOM
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // Save to localStorage
      localStorage.setItem("theme", newTheme);
    },
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
    },
  },
};
</script>
