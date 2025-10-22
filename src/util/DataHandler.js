import Logger from "./Logger";
import { validateArchiveStructure } from "./ArchiveValidator";
import { getFileFromZip } from "./ZipFileReader";
import { getTweets } from "./TweetProcessor";

const LOGGER = new Logger("DataHandler");

/**
 * Main entry point for processing a Twitter archive ZIP file
 *
 * @param {import("./ZipArchive").ZipArchive} zipData - The loaded ZipArchive instance
 * @param {{lazyMedia?: boolean, onProgress?: Function}} [options]
 * @returns {Promise<{user: Object, tweets: Array}>} Processed user data and tweets
 * @throws {Error} If archive is invalid or processing fails
 */
export async function ProcessData(zipData, options = {}) {
  const { lazyMedia = false, onProgress } = options;

  try {
    const validation = validateArchiveStructure(zipData);

    if (!validation.isValid) {
      throw new Error(
        `Invalid Twitter archive: ${validation.errors.join(", ")}`,
      );
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) =>
        console.warn("Archive warning:", warning),
      );
    }

    onProgress?.({ stage: "validation", status: "complete" });

    const user = await getUser(zipData);
    const accountId = user.account?.accountId;

    onProgress?.({ stage: "profile", status: "loaded" });

    const tweets = await getTweets(zipData, accountId, {
      lazyMedia,
      onProgress,
    });

    return { user, tweets };
  } catch (error) {
    LOGGER.error("Failed to process ZIP data:", error);
    throw error;
  } finally {
    onProgress?.({ stage: "finalizing", status: "complete" });
  }
}

/**
 * Retrieves user account and profile data from the archive
 *
 * @returns {Promise<{account: Object, profile: Object}>} User data
 */
async function getUser(zipData) {
  const account = await getAccount(zipData);
  const profile = await getProfile(zipData, account.accountId);

  return {
    account,
    profile,
  };
}

/**
 * Retrieves account data from archive
 *
 * @returns {Promise<Object>} Account information
 */
async function getAccount(zipData) {
  return await getFileFromZip(zipData, "account.js");
}

/**
 * Retrieves and enriches profile data with avatar image
 *
 * @returns {Promise<Object>} Profile information with image URL
 */
async function getProfile(zipData, accountId) {
  const profile = await getFileFromZip(zipData, "profile.js");
  const avatarMediaUrl = profile?.avatarMediaUrl;

  if (typeof avatarMediaUrl !== "string" || avatarMediaUrl.trim() === "") {
    return profile;
  }

  const file = avatarMediaUrl.split("/").pop().split("#")[0].split("?")[0];
  const mimeType = determineAvatarMimeType(file);
  const image = await getFileFromZip(
    zipData,
    `profile_media/${accountId}-${file}`,
    mimeType,
    true,
  );

  if (image) {
    profile.Image = image;
  } else {
    LOGGER.warn("Avatar image not found in archive for account", accountId);
  }

  return profile;
}

function determineAvatarMimeType(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    default:
      return "image/png";
  }
}
