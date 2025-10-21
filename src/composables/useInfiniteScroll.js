/**
 * Infinite Scroll Composable - Manages bidirectional infinite scrolling with windowing
 *
 * Implements efficient infinite scrolling in both directions with DOM windowing.
 * Loads content as user scrolls near top or bottom, while maintaining performance
 * by limiting the number of tweets in DOM.
 *
 * @param {Ref<Array>} tweets - Reactive array of all tweets
 * @param {Ref<string>} filterType - Current filter type (triggers reset on change)
 * @param {Ref<string>} searchTerm - Current search term (triggers reset on change)
 * @returns {Object} Scroll state and actions
 * @returns {ComputedRef<Array>} displayedTweets - Currently visible tweets in viewport
 * @returns {Ref<number>} displayedCount - Number of tweets currently displayed
 * @returns {Ref<number>} startIndex - Start index of displayed window
 * @returns {Ref<boolean>} isLoading - Loading state for scroll operations
 * @returns {ComputedRef<boolean>} hasMore - Whether more tweets available at bottom
 * @returns {Ref<boolean>} showScrollTop - Whether to show scroll-to-top button
 * @returns {Function} loadMore - Load more tweets at bottom
 * @returns {Function} loadPrevious - Load previous tweets at top
 * @returns {Function} handleScroll - Scroll event handler
 * @returns {Function} scrollToTop - Scroll to page top
 *
 * @example
 * const { displayedTweets, hasMore, loadMore, showScrollTop } = useInfiniteScroll(tweets, filterType, searchTerm);
 */

import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
  SCROLL_TOP_THRESHOLD,
  SCROLL_BOTTOM_THRESHOLD,
  INITIAL_TWEET_COUNT,
  TWEET_BATCH_SIZE,
  MAX_CACHED_TWEETS,
} from "../constants/scrollConfig";

export function useInfiniteScroll(tweets, filterType, searchTerm) {
  const displayedCount = ref(INITIAL_TWEET_COUNT);
  const startIndex = ref(0); // Track where visible items start
  const isLoading = ref(false); // Prevent multiple simultaneous loads
  const showScrollTop = ref(false);

  const loadMoreCount = TWEET_BATCH_SIZE;
  const itemsToKeepAbove = MAX_CACHED_TWEETS;

  /**
   * Computed: tweets currently displayed in the viewport
   */
  const displayedTweets = computed(() => {
    const end = startIndex.value + displayedCount.value;
    return tweets.value.slice(startIndex.value, end);
  });

  /**
   * Computed: whether there are more tweets to load at bottom
   */
  const hasMore = computed(() => {
    return startIndex.value + displayedCount.value < tweets.value.length;
  });

  /**
   * Load more tweets at the bottom (scroll down)
   */
  function loadMore() {
    if (hasMore.value && !isLoading.value) {
      isLoading.value = true;

      const maxWindow = itemsToKeepAbove; // e.g., 150

      // First, increase the displayed count
      displayedCount.value += loadMoreCount;

      // Then check if we exceeded the max window and need to slide
      if (displayedCount.value > maxWindow) {
        const excess = displayedCount.value - maxWindow;
        startIndex.value += excess;
        displayedCount.value = maxWindow;
      }

      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    }
  }

  /**
   * Load previous tweets at the top (scroll up)
   */
  function loadPrevious() {
    if (startIndex.value <= 0 || isLoading.value) return;

    isLoading.value = true;

    // Save current scroll position and the first visible tweet element
    const scrollY = window.scrollY;
    const firstTweet = document.querySelector("[data-tweet-id]");
    const firstTweetId = firstTweet?.getAttribute("data-tweet-id");
    const firstTweetOffset = firstTweet?.getBoundingClientRect().top || 0;

    const maxWindow = itemsToKeepAbove;
    const loadAmount = Math.min(loadMoreCount, startIndex.value);

    // Move the window up
    startIndex.value -= loadAmount;
    displayedCount.value += loadAmount;

    // Check if we exceeded the max window and need to slide
    if (displayedCount.value > maxWindow) {
      const excess = displayedCount.value - maxWindow;
      displayedCount.value = maxWindow;
    }

    // Use setTimeout to wait for DOM update
    setTimeout(() => {
      // Try to restore position using the reference tweet
      if (firstTweetId) {
        const newFirstTweet = document.querySelector(
          `[data-tweet-id="${firstTweetId}"]`,
        );
        if (newFirstTweet) {
          const newOffset = newFirstTweet.getBoundingClientRect().top;
          const scrollAdjustment = firstTweetOffset - newOffset;
          window.scrollTo({
            top: window.scrollY - scrollAdjustment,
            behavior: "instant",
          });
        }
      }

      isLoading.value = false;
    }, 100); // Reduced timeout for better responsiveness
  }

  /**
   * Handle scroll events for infinite scrolling
   */
  function handleScroll(e) {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    showScrollTop.value = scrollTop > SCROLL_TOP_THRESHOLD;

    // Check if we're near the bottom (within SCROLL_BOTTOM_THRESHOLD) - load more
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Check if we're near the top (within SCROLL_TOP_THRESHOLD) - load previous
    const distanceFromTop = scrollTop;

    // Load more at bottom
    if (
      distanceFromBottom < SCROLL_BOTTOM_THRESHOLD &&
      hasMore.value &&
      !isLoading.value
    ) {
      loadMore();
    }

    // Load previous at top
    if (
      distanceFromTop < SCROLL_TOP_THRESHOLD &&
      startIndex.value > 0 &&
      !isLoading.value
    ) {
      loadPrevious();
    }
  }

  /**
   * Scroll to top of page
   */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Watch for filter changes and reset scroll position
  watch([filterType, searchTerm], () => {
    displayedCount.value = INITIAL_TWEET_COUNT;
    startIndex.value = 0;
    isLoading.value = false;
  });

  // Add scroll listener on mount
  onMounted(() => {
    window.addEventListener("scroll", handleScroll);
  });

  // Remove scroll listener on unmount
  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });

  return {
    displayedTweets,
    displayedCount,
    startIndex,
    isLoading,
    hasMore,
    showScrollTop,
    loadMore,
    loadPrevious,
    handleScroll,
    scrollToTop,
  };
}
