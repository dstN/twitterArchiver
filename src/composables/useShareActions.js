import { ref } from "vue";

/**
 * Composable for sharing and copying tweet content
 * Provides functionality to copy text, format threads, and share to social platforms
 *
 * @returns {Object} Share actions and state
 * @returns {Ref<boolean>} showCopiedFeedback - Reactive state for copy feedback
 * @returns {Function} copyToClipboard - Copy text to clipboard with feedback
 * @returns {Function} copyTweetText - Copy single tweet text
 * @returns {Function} copyThreadText - Copy entire thread formatted
 * @returns {Function} shareToBluesky - Open Bluesky share dialog
 * @returns {Function} shareToThreads - Open Threads share dialog
 * @returns {Function} shareToMastodon - Copy text with Mastodon instructions
 * @returns {Function} shareToLinkedIn - Copy text and open LinkedIn
 *
 * @example
 * const { copyToClipboard, shareToBluesky, showCopiedFeedback } = useShareActions();
 *
 * // Copy text with visual feedback
 * copyToClipboard("Hello world");
 *
 * // Share to platform
 * shareToBluesky("My tweet text", () => closeMenu());
 */
export function useShareActions() {
  const showCopiedFeedback = ref(false);

  /**
   * Copies text to clipboard and shows visual feedback
   *
   * @param {string} text - Text to copy to clipboard
   * @returns {Promise<void>}
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showCopiedFeedback.value = true;
      setTimeout(() => {
        showCopiedFeedback.value = false;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }

  /**
   * Copies a single tweet text to clipboard
   *
   * @param {string} tweetText - The tweet text to copy
   * @returns {Promise<void>}
   */
  async function copyTweetText(tweetText) {
    await copyToClipboard(tweetText);
  }

  /**
   * Copies an entire thread with formatting
   *
   * @param {Array<Object>} threadTweets - Array of tweet objects with full_text property
   * @returns {Promise<void>}
   */
  async function copyThreadText(threadTweets) {
    if (!threadTweets || threadTweets.length === 0) return;

    const threadText = threadTweets
      .map(
        (tweet, index) =>
          `${index + 1}/${threadTweets.length}\n\n${tweet.full_text}`,
      )
      .join("\n\n---\n\n");

    await copyToClipboard(threadText);
  }

  /**
   * Opens Bluesky composer with pre-filled text
   *
   * @param {string} text - Text to share
   * @param {Function} [onComplete] - Optional callback after opening share dialog
   */
  function shareToBluesky(text, onComplete) {
    const encodedText = encodeURIComponent(text);
    window.open(
      `https://bsky.app/intent/compose?text=${encodedText}`,
      "_blank",
    );
    if (onComplete) onComplete();
  }

  /**
   * Opens Threads composer with pre-filled text
   *
   * @param {string} text - Text to share
   * @param {Function} [onComplete] - Optional callback after opening share dialog
   */
  function shareToThreads(text, onComplete) {
    const encodedText = encodeURIComponent(text);
    window.open(
      `https://threads.net/intent/post?text=${encodedText}`,
      "_blank",
    );
    if (onComplete) onComplete();
  }

  /**
   * Copies text and shows Mastodon instructions
   * (Mastodon doesn't have universal share URLs)
   *
   * @param {string} text - Text to share
   * @param {Function} [onComplete] - Optional callback after copying
   */
  async function shareToMastodon(text, onComplete) {
    await copyToClipboard(text);
    alert("Text copied! Paste it into your Mastodon instance.");
    if (onComplete) onComplete();
  }

  /**
   * Copies text and opens LinkedIn homepage
   * (LinkedIn doesn't support text-only sharing via URL)
   *
   * @param {string} text - Text to share
   * @param {Function} [onComplete] - Optional callback after delay
   */
  async function shareToLinkedIn(text, onComplete) {
    await copyToClipboard(text);
    window.open("https://www.linkedin.com/", "_blank");

    // Show feedback and delay completion
    showCopiedFeedback.value = true;
    setTimeout(() => {
      showCopiedFeedback.value = false;
      if (onComplete) onComplete();
    }, 2000);
  }

  return {
    showCopiedFeedback,
    copyToClipboard,
    copyTweetText,
    copyThreadText,
    shareToBluesky,
    shareToThreads,
    shareToMastodon,
    shareToLinkedIn,
  };
}
