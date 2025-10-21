import { onMounted, onUnmounted } from "vue";

/**
 * Composable for handling keyboard navigation
 * Provides keyboard event handling with lifecycle management
 *
 * @param {Object} handlers - Object containing keyboard event handlers
 * @param {Function} [handlers.onEscape] - Handler for Escape key
 * @param {Function} [handlers.onArrowLeft] - Handler for left arrow key
 * @param {Function} [handlers.onArrowRight] - Handler for right arrow key
 * @param {Function} [handlers.onArrowUp] - Handler for up arrow key
 * @param {Function} [handlers.onArrowDown] - Handler for down arrow key
 * @param {Function} [handlers.onSpace] - Handler for space key
 * @param {Function} [handlers.onEnter] - Handler for enter key
 * @param {Function|Ref} [enabled] - Function or ref that returns whether keyboard handling is active
 *
 * @returns {void}
 *
 * @example
 * // Basic usage with enable/disable
 * useKeyboardNavigation({
 *   onEscape: () => close(),
 *   onArrowLeft: () => prev(),
 *   onArrowRight: () => next(),
 *   enabled: () => props.show
 * });
 *
 * @example
 * // Always enabled
 * useKeyboardNavigation({
 *   onSpace: () => togglePlay(),
 *   onEscape: () => exitFullscreen()
 * });
 */
export function useKeyboardNavigation(handlers, enabled = () => true) {
  /**
   * Internal keydown handler that dispatches to user handlers
   * @param {KeyboardEvent} e - The keyboard event
   */
  function handleKeydown(e) {
    // Check if keyboard navigation is enabled
    const isEnabled = typeof enabled === "function" ? enabled() : enabled.value;
    if (!isEnabled) return;

    // Dispatch to appropriate handler based on key
    switch (e.key) {
      case "Escape":
        if (handlers.onEscape) {
          e.preventDefault();
          handlers.onEscape(e);
        }
        break;
      case "ArrowLeft":
        if (handlers.onArrowLeft) {
          e.preventDefault();
          handlers.onArrowLeft(e);
        }
        break;
      case "ArrowRight":
        if (handlers.onArrowRight) {
          e.preventDefault();
          handlers.onArrowRight(e);
        }
        break;
      case "ArrowUp":
        if (handlers.onArrowUp) {
          e.preventDefault();
          handlers.onArrowUp(e);
        }
        break;
      case "ArrowDown":
        if (handlers.onArrowDown) {
          e.preventDefault();
          handlers.onArrowDown(e);
        }
        break;
      case " ": // Space bar
        if (handlers.onSpace) {
          e.preventDefault();
          handlers.onSpace(e);
        }
        break;
      case "Enter":
        if (handlers.onEnter) {
          e.preventDefault();
          handlers.onEnter(e);
        }
        break;
    }
  }

  // Attach event listener on mount
  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  // Clean up event listener on unmount
  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
}
