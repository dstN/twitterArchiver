/**
 * Thread View Composable - Manages thread view state and navigation
 *
 * Handles entering/exiting thread view mode, which displays a single tweet
 * and all its replies/connected tweets in a focused view.
 *
 * @param {Ref<Object>} data - Reactive data object containing tweets and user info
 * @returns {Object} Thread view state and actions
 * @returns {Ref<Object|null>} threadView - Current thread view state (null when not in thread view)
 * @returns {ComputedRef<Array>} threadTweets - Tweets in the current thread
 * @returns {Function} getThread - Enter thread view for a specific tweet
 * @returns {Function} exitThread - Exit thread view and restore scroll position
 *
 * @example
 * const { threadView, threadTweets, getThread, exitThread } = useThreadView(data);
 * getThread('1234567890'); // View thread for tweet ID
 * exitThread(); // Return to main view
 */

import { ref, computed } from "vue";
import * as ThreadHandler from "../util/ThreadHandler";

export function useThreadView(data) {
  const threadView = ref(null); // Will hold { originTweet, thread, scrollPosition } when viewing a thread

  /**
   * Enter thread view for a specific tweet
   * @param {string} tweetId - The ID of the tweet to view as a thread
   */
  function getThread(tweetId) {
    const tweet = data.value.tweets.find((tweet) => tweet.id === tweetId);
    const thread = ThreadHandler.GetThread(
      data.value.user.account.accountId,
      data.value.tweets,
      tweetId,
    );

    // Save current scroll position
    const scrollPosition = window.scrollY;

    // Set thread view mode
    threadView.value = {
      originTweet: tweet,
      thread: thread,
      scrollPosition: scrollPosition,
    };

    // Scroll to top when entering thread view
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Exit thread view and return to main timeline
   */
  function exitThreadView() {
    const savedScrollPosition = threadView.value?.scrollPosition || 0;
    threadView.value = null;

    // Restore scroll position after DOM update
    setTimeout(() => {
      window.scrollTo({ top: savedScrollPosition, behavior: "smooth" });
    }, 100);
  }

  /**
   * Computed: Thread tweets in correct chronological order (top to bottom)
   * Returns: [oldest parent, ..., origin tweet, ..., newest reply]
   */
  const threadTweets = computed(() => {
    if (!threadView.value) return [];

    const { originTweet, thread } = threadView.value;

    // upwards contains: origin tweet + all tweets it replies to
    // downwards contains: all replies to the origin tweet
    // upwards is in order: [origin, parent1, parent2, ...oldest]
    // We need: [oldest, ..., parent2, parent1, origin, child1, child2, ...newest]

    const upwardsReversed = [...thread.upwards].reverse();

    // Check if origin is already in upwards (it should be)
    const originInUpwards = upwardsReversed.some(
      (t) => t.id === originTweet.id,
    );

    if (originInUpwards) {
      // Origin is already in the correct position in upwards
      return [...upwardsReversed, ...thread.downwards];
    } else {
      // Fallback: manually insert origin between upwards and downwards
      return [...upwardsReversed, originTweet, ...thread.downwards];
    }
  });

  return {
    threadView,
    threadTweets,
    getThread,
    exitThreadView,
  };
}
