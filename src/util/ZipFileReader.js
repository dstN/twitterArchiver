import Logger from "./Logger";
import { fixJson } from "./JsonParser";
import { FileMissingError, ZipOperationError } from "./ArchiveErrors";

const LOGGER = new Logger("ZipFileReader");

const MEDIA_EXTENSIONS = ["jpg", "png", "gif", "jpeg", "jiff", "mp4"];

/**
 * Reads and processes a file from the Twitter archive ZIP
 *
 * @param {JSZip} zipData - The loaded JSZip instance
 * @param {string} fileName - Name of the file to read (relative to data/ folder)
 * @param {string} [mediaType] - MIME type for media files (e.g., 'image/png', 'video/mp4')
 * @param {boolean} [isOptional=false] - If true, returns null instead of throwing on missing files
 * @returns {Promise<string|Object|Array|null>} File content (URL for media, parsed object/array for JSON)
 * @throws {Error} If file not found and not optional, or if processing fails
 */
export async function getFileFromZip(
  zipData,
  fileName,
  mediaType,
  isOptional = false,
) {
  try {
    const fileLocation = `data/${fileName}`;
    const extension = fileName.split(".").pop();

    // Check if file exists in ZIP
    if (!zipData.files[fileLocation]) {
      if (isOptional) {
        LOGGER.warn(`Optional file not found in ZIP: ${fileLocation}`);
        return null;
      } else {
        throw new FileMissingError(
          `Required file not found in archive: ${fileLocation}`,
          fileLocation,
        );
      }
    }

    // Handle media files (images, videos)
    if (MEDIA_EXTENSIONS.includes(extension)) {
      const untypedBlob = await zipData.files[fileLocation].async("blob");
      const mediaBlob = new Blob([untypedBlob], { type: mediaType });
      return URL.createObjectURL(mediaBlob);
    }

    // Handle JSON files
    const rawData = await zipData.files[fileLocation].async("string");
    console.log("Processing file:", fileName, "Size:", rawData.length, "chars");
    return await fixJson(rawData, fileName);
  } catch (error) {
    LOGGER.error("Failed to get file from zip data", fileName, "Error", error);
    if (isOptional) {
      LOGGER.warn(`Skipping optional file due to error: ${fileName}`);
      return null;
    }
    // Re-throw custom errors, wrap generic errors
    if (error.name && error.name.includes("Error")) {
      throw error;
    }
    throw new ZipOperationError(
      `Failed to read file ${fileName}: ${error.message}`,
      "read",
    );
  }
}

/**
 * Checks if a specific file exists in the ZIP archive
 *
 * @param {JSZip} zipData - The loaded JSZip instance
 * @param {string} filePath - Full path of the file to check
 * @returns {boolean} True if file exists, false otherwise
 */
export function fileExistsInZip(zipData, filePath) {
  return zipData.file(filePath) !== null;
}

/**
 * Lists all files in the ZIP archive
 *
 * @param {JSZip} zipData - The loaded JSZip instance
 * @returns {string[]} Array of file paths in the archive
 */
export function listFilesInZip(zipData) {
  return Object.keys(zipData.files);
}
