/**
 * Selection Composable - Manages tweet selection state and operations
 */

import { ref } from 'vue';

export function useSelection() {
  const selectedTweets = ref(new Set());
  const selectionMode = ref(false);

  /**
   * Toggles selection mode on/off
   * Clears selection when disabled
   */
  function toggleSelectionMode() {
    selectionMode.value = !selectionMode.value;
    if (!selectionMode.value) {
      selectedTweets.value.clear();
    }
  }

  /**
   * Toggles selection state of a single tweet
   * @param {string} tweetId - ID of tweet to toggle
   */
  function toggleTweetSelection(tweetId) {
    if (selectedTweets.value.has(tweetId)) {
      selectedTweets.value.delete(tweetId);
    } else {
      selectedTweets.value.add(tweetId);
    }
    // Force reactivity by creating new Set
    selectedTweets.value = new Set(selectedTweets.value);
  }

  /**
   * Selects all tweets from provided array
   * @param {Array} tweets - Tweets to select
   */
  function selectAllTweets(tweets) {
    tweets.forEach((tweet) => {
      selectedTweets.value.add(tweet.id);
    });
    selectedTweets.value = new Set(selectedTweets.value);
  }

  /**
   * Clears all selected tweets
   */
  function deselectAllTweets() {
    selectedTweets.value.clear();
    selectedTweets.value = new Set(selectedTweets.value);
  }

  /**
   * Checks if a tweet is selected
   * @param {string} tweetId - ID of tweet to check
   * @returns {boolean} True if tweet is selected
   */
  function isSelected(tweetId) {
    return selectedTweets.value.has(tweetId);
  }

  return {
    selectedTweets,
    selectionMode,
    toggleSelectionMode,
    toggleTweetSelection,
    selectAllTweets,
    deselectAllTweets,
    isSelected,
  };
}
