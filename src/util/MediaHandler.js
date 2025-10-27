import Logger from "./Logger";
import { getFileFromZip } from "./ZipFileReader";

const LOGGER = new Logger("MediaHandler");

/**
 * Resolves media links from tweet entities and loads media files from archive
 *
 * @param {import("./ZipArchive").ZipArchive} zipData - The loaded ZipArchive instance
 * @param {string} tweetId - ID of the tweet
 * @param {Array} mediaEntities - Media entities from tweet.extended_entities.media
 * @param {string} fileName - Base filename for media folder (e.g., 'tweet' or 'tweets')
 * @param {{lazy?: boolean, onMediaProcessed?: Function}} [options]
 * @returns {Promise<Array>} Array of resolved media objects with type and data URL or lazy loaders
 */
export async function resolveMediaLinks(
  zipData,
  tweetId,
  mediaEntities,
  fileName,
  options = {},
) {
  const { lazy = false, onMediaProcessed } = options;
  const resolvedMedia = [];

  for await (const entity of mediaEntities) {
    let mediaName = "";
    let mediaType = "";
    let exportFileName = "";

    switch (entity.type) {
      case "animated_gif":
      case "video":
        mediaName = entity.video_info.variants[0].url
          .split("/")
          .pop()
          .split("?")[0];
        mediaType = "video/mp4";
        exportFileName = `${tweetId}-${mediaName}`;
        break;
      case "photo":
      default:
        mediaName = entity.media_url.split("/").pop();
        mediaType = "image/png";
        exportFileName = `${tweetId}-${mediaName}`;
        break;
    }

    const mediaSubPath = `${fileName}_media/${tweetId}-${mediaName}`;
    const archivePath = `data/${mediaSubPath}`;

    if (lazy) {
      const lazyEntry = createLazyMediaEntry(
        zipData,
        archivePath,
        mediaType,
        exportFileName,
        entity.type,
      );
      if (lazyEntry) {
        resolvedMedia.push(lazyEntry);
        if (typeof onMediaProcessed === "function") {
          onMediaProcessed();
        }
      }
    } else {
      // Mark media files as optional - if they don't exist, skip them instead of crashing
      const mediaData = await getFileFromZip(
        zipData,
        mediaSubPath,
        mediaType,
        true, // Mark as optional
      );

      // Only add media if it was successfully loaded
      if (mediaData) {
        resolvedMedia.push({
          type: entity.type,
          data: mediaData,
          // Basename to use when exporting media in ZIP
          filename: exportFileName,
          mimeType: mediaType,
          archivePath,
        });
        if (typeof onMediaProcessed === "function") {
          onMediaProcessed();
        }
      } else {
        LOGGER.warn(
          `Skipping missing media for tweet ${tweetId}: ${mediaName}`,
        );
      }
    }
  }

  return resolvedMedia;
}

/**
 * Resolves shortened links in tweet text to full expanded URLs
 *
 * @param {string} text - Original tweet text with t.co links
 * @param {Array} urlEntities - URL entities from tweet.entities.urls
 * @returns {string} Text with t.co links replaced by full URLs
 */
export function resolveShortendLinks(text, urlEntities) {
  urlEntities.forEach((entity) => {
    text = text.replaceAll(
      entity.url,
      entity
        ? `<a class="text-orange-600" href="${entity.expanded_url}">${entity.expanded_url}</a>`
        : "<!BROKEN LINK!>",
    );
  });

  return text;
}

function createLazyMediaEntry(
  zipData,
  archivePath,
  mimeType,
  exportFileName,
  entityType,
) {
  if (!zipData.has(archivePath)) {
    LOGGER.warn(`Skipping missing media asset at ${archivePath}`);
    return null;
  }

  let cachedBlob = null;
  let objectUrl = null;
  let loadingPromise = null;

  const loadBlob = async () => {
    if (cachedBlob) return cachedBlob;
    if (!loadingPromise) {
      loadingPromise = zipData.readBlob(archivePath, mimeType).then(
        (blob) => {
          cachedBlob = blob;
          return blob;
        },
        (error) => {
          loadingPromise = null;
          throw error;
        },
      );
    }
    return loadingPromise;
  };

  const entry = {
    type: entityType,
    data: null,
    filename: exportFileName,
    mimeType,
    archivePath,
    async ensureDataUrl() {
      if (objectUrl) return objectUrl;
      try {
        const blob = await loadBlob();
        objectUrl = URL.createObjectURL(blob);
        entry.data = objectUrl;
        return objectUrl;
      } catch (error) {
        LOGGER.error(`Failed to load media ${archivePath}`, error);
        throw error;
      }
    },
    async getBlob() {
      try {
        return await loadBlob();
      } catch (error) {
        LOGGER.error(`Failed to read media blob ${archivePath}`, error);
        throw error;
      }
    },
    release() {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
        entry.data = null;
      }
    },
  };

  return entry;
}
