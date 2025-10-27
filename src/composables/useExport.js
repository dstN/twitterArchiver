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
import { useI18n } from "vue-i18n";

// Lazy-load zip.js writers so we only pay the cost when a media export is requested.
let zipWriters = null;
async function getZipWriters() {
  if (zipWriters) return zipWriters;
  const mod = await import("@zip.js/zip.js");
  if (typeof mod.configure === "function") {
    mod.configure({ useWebWorkers: true });
  }
  zipWriters = {
    ZipWriter: mod.ZipWriter,
    BlobWriter: mod.BlobWriter,
    BlobReader: mod.BlobReader,
  };
  return zipWriters;
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

function determineTweetTypeKey(tweet) {
  if (!tweet) return "tweet";

  if (typeof tweet.full_text === "string" && tweet.full_text.startsWith("RT @")) {
    return "retweet";
  }

  if (tweet.in_reply_to_status_id) {
    return "reply";
  }

  return "tweet";
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

function sanitiseTweetForExport(tweet, translate) {
  const htmlText = tweet.full_text || "";
  const plainText = stripHtml(htmlText);
  const media = sanitiseMedia(tweet.media);
  const typeKey = determineTweetTypeKey(tweet);

  return {
    id: tweet.id,
    created_at: toISODate(tweet.created_at),
    type: translate(`export.types.${typeKey}`),
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

async function addMediaToZip(zipWriter, BlobReader, tweets) {
  for (const tweet of tweets) {
    const mediaItems = Array.isArray(tweet.media) ? tweet.media : [];
    for (let index = 0; index < mediaItems.length; index++) {
      const item = mediaItems[index];
      if (!item) continue;

      try {
        let blob = null;
        if (typeof item.getBlob === "function") {
          blob = await item.getBlob();
        } else if (item.data) {
          const response = await fetch(item.data);
          blob = await response.blob();
        }

        if (!blob) continue;

        const ext = item.filename
          ? item.filename.split(".").pop()
          : inferExtensionByType(item.type, blob.type);

        const baseName = item.filename
          ? item.filename
          : `${tweet.id}-${index}.${ext}`;
        await zipWriter.add(
          `media/${baseName}`,
          new BlobReader(blob),
          {
            // Preserve the original file's MIME type if we can.
            lastModDate: new Date(),
          },
        );
      } catch (err) {
        // Skip problematic media rather than failing the whole export
        // eslint-disable-next-line no-console
        console.warn("Skipping media due to fetch error", err);
      }
    }
  }
}

async function createZipWithMedia(primaryFileName, primaryBlob, tweets) {
  const { ZipWriter, BlobWriter, BlobReader } = await getZipWriters();
  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
  try {
    await zipWriter.add(primaryFileName, new BlobReader(primaryBlob), {
      lastModDate: new Date(),
    });
    await addMediaToZip(zipWriter, BlobReader, tweets);
    return await zipWriter.close();
  } catch (error) {
    try {
      await zipWriter.close();
    } catch (_) {
      // Ignore close errors so we can bubble the original failure
    }
    throw error;
  }
}

function determineExportSuffix(
  selectionMode,
  selectedTweets,
  threadView,
  filterType,
) {
  if (selectionMode.value && selectedTweets.value.size > 0) {
    return `selected-${selectedTweets.value.size}`;
  }
  if (threadView.value) {
    return `thread-${threadView.value.originTweet.id}`;
  }
  return filterType.value;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function ensureTweetsMediaLoaded(tweets) {
  const loadingTasks = [];

  for (const tweet of tweets) {
    const mediaItems = Array.isArray(tweet.media) ? tweet.media : [];
    for (const item of mediaItems) {
      if (!item) continue;
      if (item.data) continue;

      if (typeof item.ensureDataUrl === "function") {
        loadingTasks.push(
          item.ensureDataUrl().catch((error) => {
            console.warn("Skipping media data URL hydration", error);
          }),
        );
      } else if (typeof item.getBlob === "function") {
        loadingTasks.push(
          item
            .getBlob()
            .then((blob) => {
              if (!blob) return;
              const objectUrl = URL.createObjectURL(blob);
              item.data = objectUrl;
              if (typeof item.release !== "function") {
                item.release = () => {
                  URL.revokeObjectURL(objectUrl);
                  item.data = null;
                };
              }
            })
            .catch((error) => {
              console.warn("Skipping media due to blob extraction failure", error);
            }),
        );
      }
    }
  }

  if (loadingTasks.length === 0) return;
  await Promise.allSettled(loadingTasks);
}

function buildExportPayload(
  tweetsToExport,
  userRef,
  selectionMode,
  selectedTweets,
  threadView,
  filterType,
) {
  const cleanedTweets = tweetsToExport.map((tweet) =>
    sanitiseTweetForExport(tweet, t),
  );
  const sanitisedUser = sanitiseUserForExport(userRef.value);

  return {
    cleanedTweets,
    data: {
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
    },
  };
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

const { t } = useI18n();

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

    const payload = buildExportPayload(
      tweetsToExport,
      user,
      selectionMode,
      selectedTweets,
      threadView,
      filterType,
    );

    const jsonBlob = new Blob([JSON.stringify(payload.data, null, 2)], {
      type: "application/json",
    });
    const suffix = determineExportSuffix(
      selectionMode,
      selectedTweets,
      threadView,
      filterType,
    );
    const dateStamp = new Date().toISOString().split("T")[0];

    if (withMedia) {
      const zipBlob = await createZipWithMedia(
        "tweets.json",
        jsonBlob,
        tweetsToExport,
      );
      downloadBlob(
        zipBlob,
        `twitter-archive-${suffix}-${dateStamp}.zip`,
      );
      showExportMenu.value = false;
      return;
    }

    downloadBlob(
      jsonBlob,
      `twitter-archive-${suffix}-${dateStamp}.json`,
    );
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

    const payload = buildExportPayload(
      tweetsToExport,
      user,
      selectionMode,
      selectedTweets,
      threadView,
      filterType,
    );

    const headers = [
      t("export.headers.date"),
      t("export.headers.type"),
      t("export.headers.text"),
      t("export.headers.likes"),
      t("export.headers.retweets"),
      t("export.headers.url"),
    ];
    const rows = payload.cleanedTweets.map((tweet) => [
      tweet.created_at ?? "",
      tweet.type,
      `"${(tweet.text || "").replace(/"/g, '""')}"`,
      tweet.likes ?? "",
      tweet.retweets ?? "",
      tweet.permalink,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const suffix = determineExportSuffix(
      selectionMode,
      selectedTweets,
      threadView,
      filterType,
    );
    const dateStamp = new Date().toISOString().split("T")[0];

    if (withMedia) {
      const zipBlob = await createZipWithMedia(
        "tweets.csv",
        csvBlob,
        tweetsToExport,
      );
      downloadBlob(
        zipBlob,
        `twitter-archive-${suffix}-${dateStamp}.zip`,
      );
      showExportMenu.value = false;
      return;
    }

    downloadBlob(
      csvBlob,
      `twitter-archive-${suffix}-${dateStamp}.csv`,
    );
    showExportMenu.value = false;
  }

  /**
   * Print tweets (opens browser print dialog)
   */
  async function printTweets(withMedia = includeMedia.value) {
    const tweetsToExport = getTweetsForExport(
      filteredData,
      selectedTweets,
      selectionMode,
      threadView,
      threadTweets,
    );

    await ensureTweetsMediaLoaded(tweetsToExport);

    const suffix = determineExportSuffix(
      selectionMode,
      selectedTweets,
      threadView,
      filterType,
    );
    const dateStamp = new Date().toISOString().split("T")[0];

    let archivePromise = null;

    if (withMedia) {
      const payload = buildExportPayload(
        tweetsToExport,
        user,
        selectionMode,
        selectedTweets,
        threadView,
        filterType,
      );
      const manifestBlob = new Blob(
        [JSON.stringify(payload.data, null, 2)],
        { type: "application/json" },
      );

      archivePromise = (async () => {
        try {
          const zipBlob = await createZipWithMedia(
            "tweets.json",
            manifestBlob,
            tweetsToExport,
          );
          downloadBlob(
            zipBlob,
            `twitter-archive-${suffix}-${dateStamp}.zip`,
          );
        } catch (error) {
          console.error("Failed to bundle media archive", error);
        }
      })();
    }

    showExportMenu.value = false;
    setTimeout(() => {
      window.print();
    }, 100);

    if (archivePromise) {
      archivePromise.catch((error) =>
        console.error("Media archive download failed", error),
      );
    }
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
