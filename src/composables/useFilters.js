/**
 * Filters Composable - Manages tweet filtering, search, and sorting
 */

import { ref, computed } from "vue";
import { debounce } from "../util/debounce";
import { useSorting } from "../util/UseSorting";

// Constants
const SEARCH_DEBOUNCE_MS = 150;

export function useFilters(data) {
  const searchTerm = ref("");
  const filterType = ref("all"); // 'all', 'tweets', 'replies', 'retweets', 'threads'
  const sortBy = ref("date"); // 'date', 'likes', 'retweets'
  const sortDirection = ref("desc"); // 'asc' or 'desc'
  const filteredData = ref(data.value.tweets);

  /**
   * Applies filters and search to tweet data
   */
  function applyFilters() {
    let filtered = data.value.tweets;

    // Apply type filter
    switch (filterType.value) {
      case "tweets":
        // Only original tweets (not replies, not retweets)
        filtered = filtered.filter(
          (tweet) =>
            !tweet.in_reply_to_status_id && !tweet.full_text.startsWith("RT @"),
        );
        break;
      case "replies":
        // Only replies (tweets that are replying to someone, but not retweets)
        filtered = filtered.filter(
          (tweet) =>
            tweet.in_reply_to_status_id && !tweet.full_text.startsWith("RT @"),
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
    applyFilters();
  }

  /**
   * Toggles sort type and direction
   * @param {string} type - Sort type ('date', 'likes', 'retweets')
   */
  function toggleSort(type) {
    if (sortBy.value === type) {
      // Toggle direction if same type
      sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
    } else {
      // New type, default to desc
      sortBy.value = type;
      sortDirection.value = "desc";
    }
  }

  /**
   * Computed sorted tweets
   */
  const tweets = computed(() => {
    const sortKey =
      sortBy.value + (sortDirection.value === "desc" ? "Desc" : "Asc");

    useSorting(sortKey, filteredData);
    return filteredData.value;
  });

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
  };
}
