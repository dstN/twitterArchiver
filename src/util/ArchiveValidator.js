import Logger from "./Logger";
import { ArchiveValidationError } from "./ArchiveErrors";

const LOGGER = new Logger("ArchiveValidator");

/**
 * Validates the structure of a Twitter archive ZIP file
 *
 * @param {JSZip} zipData - The loaded JSZip instance
 * @returns {{isValid: boolean, errors: string[], warnings: string[]}} Validation result
 */
export function validateArchiveStructure(zipData) {
  const errors = [];
  const warnings = [];

  // Basic structure validation
  if (!zipData || !zipData.files) {
    errors.push("Invalid ZIP data structure");
    return { isValid: false, errors, warnings };
  }

  const fileList = Object.keys(zipData.files);

  // Check for data directory
  const dataFiles = fileList.filter((f) => f.startsWith("data/"));
  if (dataFiles.length === 0) {
    errors.push(
      "No data directory found in ZIP archive. This may not be a valid Twitter archive.",
    );
    return { isValid: false, errors, warnings };
  }

  // Check for tweet files
  const hasTweetFile = fileList.some(
    (f) => f === "data/tweet.js" || f === "data/tweets.js",
  );

  if (!hasTweetFile) {
    errors.push(
      "No tweet data file found. Expected 'data/tweet.js' or 'data/tweets.js'.",
    );
  }

  // Check for optional but recommended files
  const requiredFiles = ["data/account.js", "data/profile.js"];
  const missingRequired = requiredFiles.filter(
    (file) => !fileList.includes(file),
  );

  if (missingRequired.length > 0) {
    warnings.push(`Missing some expected files: ${missingRequired.join(", ")}`);
    console.warn("Missing some expected files:", missingRequired);
  }

  const isValid = errors.length === 0;
  return { isValid, errors, warnings };
}

/**
 * Throws an error if archive validation fails
 *
 * @param {JSZip} zipData - The loaded JSZip instance
 * @throws {ArchiveValidationError} If archive structure is invalid
 */
export function assertValidArchive(zipData) {
  const validation = validateArchiveStructure(zipData);

  if (!validation.isValid) {
    const errorMessage = validation.errors.join("; ");
    LOGGER.error("Archive validation failed:", errorMessage);
    throw new ArchiveValidationError(
      `Invalid Twitter archive: ${errorMessage}`,
      validation.errors,
      validation.warnings,
    );
  }

  // Log warnings but don't throw
  validation.warnings.forEach((warning) => {
    LOGGER.warn(warning);
  });
}
