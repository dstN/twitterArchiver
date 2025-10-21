import Logger from "./Logger";
import { validateArchiveStructure } from "./ArchiveValidator";
import { getFileFromZip } from "./ZipFileReader";
import { getTweets } from "./TweetProcessor";

/**
 * Main entry point for processing a Twitter archive ZIP file
 *
 * @param {JSZip} zipData - The loaded JSZip instance
 * @returns {Promise<{user: Object, tweets: Array}>} Processed user data and tweets
 * @throws {Error} If archive is invalid or processing fails
 */
export async function ProcessData(zipData) {
  try {
    ZIP_DATA = zipData;

    // Validate archive structure
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

    // Load user data and tweets
    return {
      user: await getUser(),
      tweets: await getTweets(zipData, ACCOUNT_ID),
    };
  } catch (error) {
    LOGGER.error("Failed to process ZIP data:", error);
    throw error;
  }
}

const LOGGER = new Logger("DataHandler");
let ZIP_DATA;
let ACCOUNT_ID;

/**
 * Retrieves user account and profile data from the archive
 *
 * @returns {Promise<{account: Object, profile: Object}>} User data
 */
async function getUser() {
  const account = await getAccount();
  ACCOUNT_ID = account.accountId;
  const profile = await getProfile();

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
async function getAccount() {
  return await getFileFromZip(ZIP_DATA, "account.js");
}

/**
 * Retrieves and enriches profile data with avatar image
 *
 * @returns {Promise<Object>} Profile information with image URL
 */
async function getProfile() {
  const profile = await getFileFromZip(ZIP_DATA, "profile.js");
  const file = profile.avatarMediaUrl
    .split("/")
    .pop()
    .split("#")[0]
    .split("?")[0];
  profile.Image = await getFileFromZip(
    ZIP_DATA,
    `profile_media/${ACCOUNT_ID}-${file}`,
    "image/png",
  );

  return profile;
}
