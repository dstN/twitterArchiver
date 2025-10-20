/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} Returns the new debounced function
 * 
 * @example
 * const debouncedSearch = debounce(() => {
 *   console.log('Search executed');
 * }, 300);
 * 
 * debouncedSearch(); // Will execute after 300ms of inactivity
 */
export function debounce(func, wait) {
  let timeoutId;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeoutId);
      func(...args);
    };

    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
  };
}
