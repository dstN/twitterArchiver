/**
 * Sorting Utility - Provides tweet sorting functionality
 *
 * Sorts tweets in-place by date, likes, or retweets in ascending/descending order.
 */

/**
 * Sorts an array of tweets based on the specified sort mode
 *
 * @param {string} sort - Sort mode ('dateDesc', 'dateAsc', 'likes', 'likesDesc', 'likesAsc', 'retweets', 'retweetsDesc', 'retweetsAsc')
 * @param {Ref<Array>} refArr - Reactive array of tweets to sort (sorted in-place)
 *
 * @example
 * useSorting('likesDesc', tweets); // Sort by likes, most liked first
 * useSorting('dateAsc', tweets);   // Sort by date, oldest first
 */
export function useSorting(sort, refArr) {
  switch (sort) {
    case "dateDesc":
      refArr.value.sort((a, b) => {
        return b.created_at - a.created_at;
      });
      break;
    case "dateAsc":
      refArr.value.sort((a, b) => {
        return a.created_at - b.created_at;
      });
      break;
    case "likes":
    case "likesDesc":
      refArr.value.sort((a, b) => {
        return b.likes - a.likes;
      });
      break;
    case "likesAsc":
      refArr.value.sort((a, b) => {
        return a.likes - b.likes;
      });
      break;
    case "retweets":
    case "retweetsDesc":
      refArr.value.sort((a, b) => {
        return b.retweets - a.retweets;
      });
      break;
    case "retweetsAsc":
      refArr.value.sort((a, b) => {
        return a.retweets - b.retweets;
      });
      break;
  }
}

/**
 * Returns available sort modes
 *
 * @returns {Array<string>} Array of available sort mode strings
 */
export function useSort() {
  return ["dateDesc", "dateAsc", "likes", "retweets"];
}
