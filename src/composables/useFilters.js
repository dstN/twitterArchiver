/**
 * Filters Composable - Manages tweet filtering, search, and sorting
 *
 * Provides comprehensive filtering, search, and sorting capabilities for tweets.
 * Includes debounced search, type filtering (tweets/replies/threads), and sort options.
 *
 * @param {Ref<Object>} data - Reactive data object containing tweets array
 * @returns {Object} Filter state and actions
 * @returns {Ref<string>} searchTerm - Current search query
 * @returns {Ref<string>} filterType - Active filter ('all', 'tweets', 'replies', 'retweets', 'threads')
 * @returns {Ref<string>} sortBy - Sort field ('date', 'likes', 'retweets')
 * @returns {Ref<string>} sortDirection - Sort direction ('asc', 'desc')
 * @returns {Ref<Array>} filteredData - Filtered and sorted tweet array
 * @returns {Object} tweetCounts - Count of tweets per filter type
 * @returns {Function} updateSearchTerm - Update search query (debounced)
 * @returns {Function} setFilterType - Change active filter
 * @returns {Function} setSortBy - Change sort field
 * @returns {Function} setSortDirection - Change sort direction
 *
 * @example
 * const { searchTerm, filterType, filteredData, setFilterType } = useFilters(data);
 * setFilterType('threads'); // Show only threads
 */

import { ref, computed, nextTick } from "vue";
import { debounce } from "../util/debounce";
import { useSorting } from "../util/UseSorting";

// Constants
const SEARCH_DEBOUNCE_MS = 150;

export function useFilters(data) {
  const searchTerm = ref("");
  const filterType = ref("all"); // 'all', 'tweets', 'replies', 'retweets', 'threads'
  const sortBy = ref("date"); // 'date', 'likes', 'retweets'
  const sortDirection = ref("desc"); // 'asc' or 'desc'
  const filteredData = ref([...data.value.tweets]);
  const isFiltering = ref(false);

  function waitForPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  async function withFilterSpinner(task) {
    const alreadyFiltering = isFiltering.value;

    if (!alreadyFiltering) {
      isFiltering.value = true;
      await nextTick();
      await waitForPaint();
    }

    try {
      return await task();
    } finally {
      if (!alreadyFiltering) {
        await nextTick();
        await waitForPaint();
        isFiltering.value = false;
      }
    }
  }

  /**
   * Applies filters and search to tweet data
   */
  function applyFilters() {
    return withFilterSpinner(() => {
      let filtered = [...data.value.tweets];

      // Apply type filter
      switch (filterType.value) {
        case "tweets":
          // Only original tweets (not replies, not retweets)
          filtered = filtered.filter(
            (tweet) =>
              !tweet.in_reply_to_status_id &&
              !tweet.full_text.startsWith("RT @"),
          );
          break;
        case "replies":
          // Only replies (tweets that are replying to someone, but not retweets)
          filtered = filtered.filter(
            (tweet) =>
              tweet.in_reply_to_status_id &&
              !tweet.full_text.startsWith("RT @"),
          );
          break;
        case "retweets":
          // Only retweets (tweets that start with "RT @")
          filtered = filtered.filter((tweet) =>
            tweet.full_text.startsWith("RT @"),
          );
          break;
        case "threads":
          // Only threads (tweets that are marked as threads)
          filtered = filtered.filter((tweet) => tweet.is_thread);
          break;
        // 'all' - no filtering
      }

      // Apply search filter if search term exists
      if (searchTerm.value.length >= 3) {
        const insensitiveFilter = (tweet) => {
          return (
            tweet.full_text
              .toLowerCase()
              .includes(searchTerm.value.toLowerCase()) ||
            tweet.id === searchTerm.value
          );
        };
        filtered = filtered.filter(insensitiveFilter);
      }

      filteredData.value = filtered;
      runSort();
    });
  }

  /**
   * Debounced search handler
   */
  const onSearchTermChange = debounce(() => {
    applyFilters();
  }, SEARCH_DEBOUNCE_MS);

  /**
   * Sets filter type and reapplies filters
   * @param {string} type - Filter type ('all', 'tweets', 'replies', 'retweets', 'threads')
   */
  function setFilterType(type) {
    filterType.value = type;
    return applyFilters();
  }

  /**
   * Toggles sort type and direction
   * @param {string} type - Sort type ('date', 'likes', 'retweets')
   */
  function toggleSort(type) {
    return withFilterSpinner(() => {
      if (sortBy.value === type) {
        // Toggle direction if same type
        sortDirection.value =
          sortDirection.value === "desc" ? "asc" : "desc";
      } else {
        // New type, default to desc
        sortBy.value = type;
        sortDirection.value = "desc";
      }

      runSort();
    });
  }

  /**
   * Computed sorted tweets
   */
  const tweets = computed(() => {
    return filteredData.value;
  });

  function runSort() {
    const sortKey =
      sortBy.value + (sortDirection.value === "desc" ? "Desc" : "Asc");
    useSorting(sortKey, filteredData);
  }

  // Ensure initial dataset follows default sort
  runSort();

  /**
   * Computed tweet counts by type
   */
  const tweetCounts = computed(() => {
    const all = data.value.tweets;

    // Count different types
    const tweetsOnly = all.filter(
      (t) => !t.in_reply_to_status_id && !t.full_text.startsWith("RT @"),
    );
    const replies = all.filter(
      (t) => t.in_reply_to_status_id && !t.full_text.startsWith("RT @"),
    );
    const retweets = all.filter((t) => t.full_text.startsWith("RT @"));

    // Count threads: Find root tweets that start threads
    const threadRoots = all.filter((t) => {
      if (!t.is_thread) return false;
      // If it's replying to an own tweet, it's part of a thread, not the root
      const isReplyToOwnTweet =
        t.in_reply_to_user_id === data.value.user.account.accountId &&
        all.some((tweet) => tweet.id === t.in_reply_to_status_id);
      return !isReplyToOwnTweet;
    });

    return {
      all: all.length,
      tweets: tweetsOnly.length,
      replies: replies.length,
      retweets: retweets.length,
      threads: threadRoots.length,
    };
  });

  return {
    searchTerm,
    filterType,
    sortBy,
    sortDirection,
    filteredData,
    tweets,
    tweetCounts,
    applyFilters,
    onSearchTermChange,
    setFilterType,
    toggleSort,
    isFiltering,
  };
}
