import Logger from "./Logger";
import { getFileFromZip } from "./ZipFileReader";

const LOGGER = new Logger("MediaHandler");

/**
 * Resolves media links from tweet entities and loads media files from archive
 *
 * @param {JSZip} zipData - The loaded JSZip instance
 * @param {string} tweetId - ID of the tweet
 * @param {Array} mediaEntities - Media entities from tweet.extended_entities.media
 * @param {string} fileName - Base filename for media folder (e.g., 'tweet' or 'tweets')
 * @returns {Promise<Array>} Array of resolved media objects with type and data URL
 */
export async function resolveMediaLinks(
  zipData,
  tweetId,
  mediaEntities,
  fileName,
) {
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

    // Mark media files as optional - if they don't exist, skip them instead of crashing
    const mediaData = await getFileFromZip(
      zipData,
      `${fileName}_media/${tweetId}-${mediaName}`,
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
      });
    } else {
      LOGGER.warn(`Skipping missing media for tweet ${tweetId}: ${mediaName}`);
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
