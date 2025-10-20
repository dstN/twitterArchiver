/**
 * Export Composable - Manages tweet export functionality (JSON, CSV)
 */

import { ref } from "vue";

export function useExport(
  data,
  filteredData,
  selectedTweets,
  selectionMode,
  threadView,
  threadTweets,
  filterType,
  user,
) {
  const showExportMenu = ref(false);

  /**
   * Export tweets as JSON file
   */
  function exportAsJSON() {
    let tweetsToExport;

    if (selectionMode.value && selectedTweets.value.size > 0) {
      // Export selected tweets
      tweetsToExport = filteredData.value.filter((t) =>
        selectedTweets.value.has(t.id),
      );
    } else if (threadView.value) {
      // Export current thread only
      tweetsToExport = threadTweets.value;
    } else {
      // Export all filtered tweets
      tweetsToExport = filteredData.value;
    }

    // Clean tweets: remove blob URLs from media
    const cleanedTweets = tweetsToExport.map((tweet) => {
      const cleanTweet = { ...tweet };

      // Remove blob URLs from entities.media
      if (cleanTweet.entities?.media) {
        cleanTweet.entities.media = cleanTweet.entities.media.map((media) => {
          const { blobUrl, ...cleanMedia } = media;
          return cleanMedia;
        });
      }

      // Remove blob URLs from extended_entities.media
      if (cleanTweet.extended_entities?.media) {
        cleanTweet.extended_entities.media =
          cleanTweet.extended_entities.media.map((media) => {
            const { blobUrl, ...cleanMedia } = media;
            return cleanMedia;
          });
      }

      return cleanTweet;
    });

    const dataToExport = {
      user: user.value,
      tweets: cleanedTweets,
      exported_at: new Date().toISOString(),
      filter: filterType.value,
      total_count: cleanedTweets.length,
      selection_mode: selectionMode.value,
      selected_count: selectionMode.value ? selectedTweets.value.size : null,
      thread_mode: threadView.value !== null,
      thread_origin: threadView.value ? threadView.value.originTweet.id : null,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    let suffix;
    if (selectionMode.value && selectedTweets.value.size > 0) {
      suffix = `selected-${selectedTweets.value.size}`;
    } else if (threadView.value) {
      suffix = `thread-${threadView.value.originTweet.id}`;
    } else {
      suffix = filterType.value;
    }
    a.download = `twitter-archive-${suffix}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportMenu.value = false;
  }

  /**
   * Export tweets as CSV file
   */
  function exportAsCSV() {
    let tweetsToExport;

    if (selectionMode.value && selectedTweets.value.size > 0) {
      // Export selected tweets
      tweetsToExport = filteredData.value.filter((t) =>
        selectedTweets.value.has(t.id),
      );
    } else if (threadView.value) {
      // Export current thread only
      tweetsToExport = threadTweets.value;
    } else {
      // Export all filtered tweets
      tweetsToExport = filteredData.value;
    }

    const headers = [
      "Date",
      "Type",
      "Text",
      "Likes",
      "Retweets",
      "Replies",
      "URL",
    ];
    const rows = tweetsToExport.map((tweet) => [
      new Date(tweet.created_at).toLocaleString(),
      tweet.retweeted
        ? "Retweet"
        : tweet.in_reply_to_user_id
          ? "Reply"
          : "Tweet",
      `"${tweet.full_text.replace(/"/g, '""')}"`,
      tweet.favorite_count || 0,
      tweet.retweet_count || 0,
      tweet.reply_count || 0,
      `https://twitter.com/i/status/${tweet.id}`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    let suffix;
    if (selectionMode.value && selectedTweets.value.size > 0) {
      suffix = `selected-${selectedTweets.value.size}`;
    } else if (threadView.value) {
      suffix = `thread-${threadView.value.originTweet.id}`;
    } else {
      suffix = filterType.value;
    }
    a.download = `twitter-archive-${suffix}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportMenu.value = false;
  }

  return {
    showExportMenu,
    exportAsJSON,
    exportAsCSV,
  };
}
