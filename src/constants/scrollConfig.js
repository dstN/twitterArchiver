/**
 * Scroll Configuration Constants
 *
 * Central configuration for infinite scroll behavior and performance tuning.
 * These values control when content loads, batch sizes, and windowing limits.
 */

/**
 * Distance from top of page (in pixels) to trigger scroll-to-top button
 * @type {number}
 */
export const SCROLL_TOP_THRESHOLD = 500;

/**
 * Distance from bottom of page (in pixels) to trigger loading more content
 * @type {number}
 */
export const SCROLL_BOTTOM_THRESHOLD = 1000;

/**
 * Number of tweets to display on initial page load
 * @type {number}
 */
export const INITIAL_TWEET_COUNT = 25;

/**
 * Number of tweets to load in each batch when scrolling
 * @type {number}
 */
export const TWEET_BATCH_SIZE = 25;

/**
 * Maximum number of tweets to keep in the DOM window at once
 * Older tweets are removed to maintain performance with large datasets
 * @type {number}
 */
export const MAX_CACHED_TWEETS = 150;
