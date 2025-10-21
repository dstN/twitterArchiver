/**
 * Custom Error Classes for Twitter Archive Processing
 *
 * Provides typed error classes for better error handling and debugging.
 * Each error type represents a specific failure category in archive processing.
 */

/**
 * Base class for all archive-related errors
 * @extends Error
 */
export class ArchiveError extends Error {
  constructor(message) {
    super(message);
    this.name = "ArchiveError";
  }
}

/**
 * Thrown when archive structure validation fails
 * Used when ZIP doesn't contain expected files or directory structure
 *
 * @extends ArchiveError
 * @property {Array<string>} errors - List of validation errors
 * @property {Array<string>} warnings - List of validation warnings
 *
 * @example
 * throw new ArchiveValidationError(
 *   "Invalid archive structure",
 *   ["Missing data/tweets.js"],
 *   ["Missing data/profile.js"]
 * );
 */
export class ArchiveValidationError extends ArchiveError {
  constructor(message, errors = [], warnings = []) {
    super(message);
    this.name = "ArchiveValidationError";
    this.errors = errors;
    this.warnings = warnings;
  }
}

/**
 * Thrown when media file loading fails
 * Used when images/videos can't be loaded from archive
 *
 * @extends ArchiveError
 * @property {string} mediaPath - Path to the media file that failed
 * @property {string} tweetId - ID of the tweet containing the media
 *
 * @example
 * throw new MediaLoadError(
 *   "Failed to load media file",
 *   "tweet_media/123456-image.jpg",
 *   "123456"
 * );
 */
export class MediaLoadError extends ArchiveError {
  constructor(message, mediaPath, tweetId) {
    super(message);
    this.name = "MediaLoadError";
    this.mediaPath = mediaPath;
    this.tweetId = tweetId;
  }
}

/**
 * Thrown when JSON parsing fails
 * Used when tweet/account/profile JSON can't be parsed
 *
 * @extends ArchiveError
 * @property {string} fileName - Name of the file that failed to parse
 * @property {Error} originalError - Original parsing error
 *
 * @example
 * throw new DataParseError(
 *   "Failed to parse tweets.js",
 *   "tweets.js",
 *   originalError
 * );
 */
export class DataParseError extends ArchiveError {
  constructor(message, fileName, originalError) {
    super(message);
    this.name = "DataParseError";
    this.fileName = fileName;
    this.originalError = originalError;
  }
}

/**
 * Thrown when a required file is missing from the archive
 *
 * @extends ArchiveError
 * @property {string} fileName - Name of the missing file
 *
 * @example
 * throw new FileMissingError("Required file not found", "data/account.js");
 */
export class FileMissingError extends ArchiveError {
  constructor(message, fileName) {
    super(message);
    this.name = "FileMissingError";
    this.fileName = fileName;
  }
}

/**
 * Thrown when ZIP file operations fail
 *
 * @extends ArchiveError
 * @property {string} operation - The operation that failed (e.g., "read", "extract")
 *
 * @example
 * throw new ZipOperationError("Failed to extract file", "extract");
 */
export class ZipOperationError extends ArchiveError {
  constructor(message, operation) {
    super(message);
    this.name = "ZipOperationError";
    this.operation = operation;
  }
}
