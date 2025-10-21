/**
 * Export Composable - Manages tweet export functionality (JSON, CSV, Print)
 *
 * Provides export capabilities for tweets in multiple formats. Handles both
 * filtered data and selected tweets, with special handling for thread views.
 *
 * @param {Ref<Object>} data - Full dataset
 * @param {Ref<Array>} filteredData - Filtered tweet array
 * @param {Ref<Set>} selectedTweets - Set of selected tweet IDs
 * @param {Ref<boolean>} selectionMode - Whether selection mode is active
 * @param {Ref<Object|null>} threadView - Thread view state (null when inactive)
 * @param {Ref<Array>} threadTweets - Tweets in current thread
 * @param {Ref<string>} filterType - Active filter type
 * @param {Ref<Object>} user - User account data
 * @returns {Object} Export state and actions
 * @returns {Ref<boolean>} showExportMenu - Export menu visibility state
 * @returns {Function} toggleExportMenu - Toggle export menu
 * @returns {Function} exportJSON - Export tweets as JSON file
 * @returns {Function} exportCSV - Export tweets as CSV file
 * @returns {Function} printTweets - Print tweets to PDF/printer
 *
 * @example
 * const { exportJSON, exportCSV, printTweets } = useExport(...);
 * exportJSON(); // Downloads filtered tweets as JSON
 */

import { ref } from "vue";

// Lazy-load JSZip only when media export is requested to keep main bundle small
let _JSZip = null;
async function getJSZip() {
  if (_JSZip) return _JSZip;
  const mod = await import("jszip");
  _JSZip = mod?.default ?? mod;
  return _JSZip;
}

function getTweetsForExport(
  filteredData,
  selectedTweets,
  selectionMode,
  threadView,
  threadTweets,
) {
  if (selectionMode.value && selectedTweets.value.size > 0) {
    return filteredData.value.filter((t) => selectedTweets.value.has(t.id));
  }

  if (threadView.value) {
    return threadTweets.value;
  }

  return filteredData.value || [];
}

function toISODate(date) {
  if (!date) return null;

  if (date instanceof Date) {
    return date.toISOString();
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normaliseCount(value) {
  return Number.isFinite(value) ? value : null;
}

function stripHtml(html) {
  if (!html) return "";

  return html
    .replace(/<br\s*\/?>(\r?\n)?/gi, "\n")
    .replace(/<\/?p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .trim();
}

function determineTweetType(tweet) {
  if (!tweet) return "Tweet";

  if (typeof tweet.full_text === "string" && tweet.full_text.startsWith("RT @")) {
    return "Retweet";
  }

  if (tweet.in_reply_to_status_id) {
    return "Reply";
  }

  return "Tweet";
}

function sanitiseMedia(media) {
  if (!Array.isArray(media) || media.length === 0) {
    return [];
  }

  return media.map((item, index) => ({
    type: item?.type ?? "unknown",
    has_data: Boolean(item?.data),
    index,
  }));
}

function stripBlobUrls(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (typeof value === "string" && value.startsWith("blob:")) {
        return [key, null];
      }

      return [key, value];
    }),
  );
}

function sanitiseTweetForExport(tweet) {
  const htmlText = tweet.full_text || "";
  const plainText = stripHtml(htmlText);
  const media = sanitiseMedia(tweet.media);

  return {
    id: tweet.id,
    created_at: toISODate(tweet.created_at),
    type: determineTweetType(tweet),
    text: plainText,
    html: htmlText,
    likes: normaliseCount(tweet.likes),
    retweets: normaliseCount(tweet.retweets),
    has_link: Boolean(tweet.has_link),
    in_reply_to_status_id: tweet.in_reply_to_status_id ?? null,
    in_reply_to_user_id: tweet.in_reply_to_user_id ?? null,
    is_thread: Boolean(tweet.is_thread),
    media_count: media.length,
    media,
    permalink: `https://twitter.com/i/status/${tweet.id}`,
  };
}

// Infer a reasonable file extension by media/content type
function inferExtensionByType(type, blobType) {
  if (blobType && typeof blobType === "string") {
    if (blobType.includes("mp4")) return "mp4";
    if (blobType.includes("png")) return "png";
    if (blobType.includes("jpeg") || blobType.includes("jpg")) return "jpg";
    if (blobType.includes("gif")) return "gif";
  }
  if (type === "video" || type === "animated_gif") return "mp4";
  return "png";
}

async function addMediaToZip(zip, tweets) {
  const mediaFolder = zip.folder("media");
  if (!mediaFolder) return;

  for (const tweet of tweets) {
    const mediaItems = Array.isArray(tweet.media) ? tweet.media : [];
    for (let index = 0; index < mediaItems.length; index++) {
      const item = mediaItems[index];
      if (!item || !item.data) continue;

      try {
        const response = await fetch(item.data);
        const blob = await response.blob();
        const ext = inferExtensionByType(item.type, blob.type);
        const baseName = item.filename
          ? item.filename
          : `${tweet.id}-${index}.${ext}`;
        mediaFolder.file(baseName, blob);
      } catch (err) {
        // Skip problematic media rather than failing the whole export
        // eslint-disable-next-line no-console
        console.warn("Skipping media due to fetch error", err);
      }
    }
  }
}

function sanitiseUserForExport(user) {
  if (!user) return null;

  const profile = user.profile || null;
  let sanitisedProfile = null;

  if (profile) {
    const { Image, ...rest } = profile;
    sanitisedProfile = stripBlobUrls(rest);
  }

  return {
    account: user.account || null,
    profile: sanitisedProfile,
  };
}

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
  const includeMedia = ref(false);

  function toggleIncludeMedia() {
    includeMedia.value = !includeMedia.value;
  }

  /**
   * Export tweets as JSON file
   */
  async function exportAsJSON(withMedia = includeMedia.value) {
    const tweetsToExport = getTweetsForExport(
      filteredData,
      selectedTweets,
      selectionMode,
      threadView,
      threadTweets,
    );

    const cleanedTweets = tweetsToExport.map(sanitiseTweetForExport);
    const sanitisedUser = sanitiseUserForExport(user.value);

    const dataToExport = {
      user: sanitisedUser,
      tweets: cleanedTweets,
      exported_at: new Date().toISOString(),
      filter: filterType.value,
      total_count: cleanedTweets.length,
      selection_mode:
        selectionMode.value && selectedTweets.value.size > 0 ? true : false,
      selected_count:
        selectionMode.value && selectedTweets.value.size > 0
          ? selectedTweets.value.size
          : null,
      thread_mode: Boolean(threadView.value),
      thread_origin: threadView.value
        ? threadView.value.originTweet.id
        : null,
    };

    const jsonBlob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    let suffix;
    if (selectionMode.value && selectedTweets.value.size > 0) {
      suffix = `selected-${selectedTweets.value.size}`;
    } else if (threadView.value) {
      suffix = `thread-${threadView.value.originTweet.id}`;
    } else {
      suffix = filterType.value;
    }
    if (withMedia) {
      const JSZip = await getJSZip();
      const zip = new JSZip();
      zip.file(`tweets.json`, jsonBlob);
      await addMediaToZip(zip, tweetsToExport);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      a.href = url;
      a.download = `twitter-archive-${suffix}-${new Date()
        .toISOString()
        .split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showExportMenu.value = false;
      return;
    }

    const url = URL.createObjectURL(jsonBlob);
    a.href = url;
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
  async function exportAsCSV(withMedia = includeMedia.value) {
    const tweetsToExport = getTweetsForExport(
      filteredData,
      selectedTweets,
      selectionMode,
      threadView,
      threadTweets,
    );

    const sanitisedTweets = tweetsToExport.map(sanitiseTweetForExport);

    const headers = ["Date", "Type", "Text", "Likes", "Retweets", "URL"];
    const rows = sanitisedTweets.map((tweet) => [
      tweet.created_at ?? "",
      tweet.type,
      `"${(tweet.text || "").replace(/"/g, '""')}"`,
      tweet.likes ?? "",
      tweet.retweets ?? "",
      tweet.permalink,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    let suffix;
    if (selectionMode.value && selectedTweets.value.size > 0) {
      suffix = `selected-${selectedTweets.value.size}`;
    } else if (threadView.value) {
      suffix = `thread-${threadView.value.originTweet.id}`;
    } else {
      suffix = filterType.value;
    }
    if (withMedia) {
      const JSZip = await getJSZip();
      const zip = new JSZip();
      zip.file(`tweets.csv`, csvBlob);
      await addMediaToZip(zip, tweetsToExport);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      a.href = url;
      a.download = `twitter-archive-${suffix}-${new Date()
        .toISOString()
        .split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showExportMenu.value = false;
      return;
    }

    const url = URL.createObjectURL(csvBlob);
    a.href = url;
    a.download = `twitter-archive-${suffix}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportMenu.value = false;
  }

  /**
   * Print tweets (opens browser print dialog)
   */
  function printTweets() {
    showExportMenu.value = false;
    // Small delay to let the UI update before printing
    setTimeout(() => {
      window.print();
    }, 100);
  }

  return {
    showExportMenu,
    includeMedia,
    toggleIncludeMedia,
    exportAsJSON,
    exportAsCSV,
    printTweets,
  };
}
