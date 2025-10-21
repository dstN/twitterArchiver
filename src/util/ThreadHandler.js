/**
 * Thread Handler Utility - Constructs tweet threads from archive data
 *
 * Builds a thread structure by traversing replies both upwards (parent tweets)
 * and downwards (child replies) from an origin tweet.
 */

/**
 * Retrieves all tweets in a thread, starting from an origin tweet
 *
 * Traverses the reply chain in both directions:
 * - Upwards: Finds parent tweets that the origin is replying to
 * - Downwards: Finds replies to the origin and subsequent replies
 *
 * @param {string} accountId - User's account ID (to ensure we only follow own tweets)
 * @param {Array<Object>} tweets - All tweets from the archive
 * @param {string} originId - ID of the origin tweet to build thread around
 * @returns {Object} Thread structure with upwards and downwards arrays
 * @returns {Array<Object>} upwards - Parent tweets (from newest to oldest)
 * @returns {Array<Object>} downwards - Reply tweets (from oldest to newest)
 *
 * @example
 * const thread = GetThread(accountId, tweets, '1234567890');
 * // thread.upwards contains parent tweets
 * // thread.downwards contains replies
 */
export function GetThread(accountId, tweets, originId) {
  const thread = { upwards: [], downwards: [] };
  let nextId = originId;

  // downwards the origin
  while (nextId) {
    const tweet = tweets.find(
      (tweet) =>
        tweet.in_reply_to_user_id === accountId &&
        tweet.in_reply_to_status_id === nextId,
    );
    if (tweet) {
      nextId = tweet.id;
      thread.downwards.push(tweet);
    } else {
      nextId = undefined;
    }
  }

  // upwards the origin
  nextId = originId;
  do {
    const tweet = tweets.find((tweet) => tweet.id === nextId);
    if (tweet) {
      nextId = tweet.in_reply_to_status_id;
      if (nextId === originId) continue;
      thread.upwards.push(tweet);
    } else {
      nextId = undefined;
    }
  } while (nextId);

  return thread;
}
