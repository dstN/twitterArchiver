import { ref, onMounted } from "vue";

// Shared reactive state (singleton pattern)
const isDarkMode = ref(false);

/**
 * Composable for managing dark mode state across the application.
 * Uses shared reactive state to sync dark mode across all components.
 *
 * @returns {Object} Dark mode state and toggle function
 */
export function useDarkMode() {
  onMounted(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem("theme");

    // Check system preference as fallback
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    // Set initial dark mode value
    isDarkMode.value = savedTheme === "dark" || (!savedTheme && prefersDark);

    // Apply theme to document
    updateTheme();
  });

  /**
   * Updates the document class and localStorage based on current dark mode state
   */
  function updateTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  /**
   * Toggles dark mode on/off and persists the preference
   */
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    updateTheme();
  }

  return {
    isDarkMode,
    toggleDarkMode,
  };
}
