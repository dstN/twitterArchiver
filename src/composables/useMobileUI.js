import { ref } from "vue";

/**
 * Composable for managing mobile UI interactions
 * Handles mobile menu, search functionality, and focus management
 *
 * @returns {Object} Mobile UI state and actions
 * @returns {Ref<Object|null>} mobileMenuRef - Template ref for mobile menu component
 * @returns {Ref<boolean>} showMobileSearch - Reactive state for mobile search visibility
 * @returns {Function} openMobileMenu - Opens the mobile menu
 * @returns {Function} toggleMobileSearch - Toggles mobile search with auto-focus
 *
 * @example
 * const { mobileMenuRef, showMobileSearch, openMobileMenu, toggleMobileSearch } = useMobileUI();
 *
 * // In template
 * <TheMobileMenu ref="mobileMenuRef" />
 * <button @click="openMobileMenu">Menu</button>
 * <button @click="toggleMobileSearch">Search</button>
 */
export function useMobileUI() {
  const mobileMenuRef = ref(null);
  const showMobileSearch = ref(false);

  /**
   * Opens the mobile menu by calling its open method
   * Requires the menu component to expose an `open()` method
   */
  function openMobileMenu() {
    mobileMenuRef.value?.open();
  }

  /**
   * Toggles mobile search visibility and focuses the search input
   * Uses a timeout to ensure transition completes before focusing
   *
   * @param {string} [inputId='mobile-search-input'] - ID of the search input element
   */
  function toggleMobileSearch(inputId = "mobile-search-input") {
    showMobileSearch.value = !showMobileSearch.value;

    if (showMobileSearch.value) {
      // Wait for transition to complete (300ms) plus buffer
      setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) {
          // Try multiple focus strategies for mobile compatibility
          input.focus({ preventScroll: false });

          // Trigger click to open keyboard on mobile
          setTimeout(() => {
            input.click();
            // Set cursor to end of input
            input.setSelectionRange(input.value.length, input.value.length);
          }, 50);
        }
      }, 350);
    }
  }

  return {
    mobileMenuRef,
    showMobileSearch,
    openMobileMenu,
    toggleMobileSearch,
  };
}
