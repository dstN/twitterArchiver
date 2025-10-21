import Logger from "./Logger";
import { DataParseError } from "./ArchiveErrors";

const LOGGER = new Logger("JsonParser");

/**
 * Converts Twitter archive JSON format to standard JSON array
 *
 * Twitter archives use a non-standard format with a variable assignment.
 * This function strips the assignment and converts to proper JSON.
 *
 * @param {string} json - Raw JSON content from Twitter archive file
 * @param {string} [fileName='unknown'] - Name of the file being parsed (for error messages)
 * @returns {Array|Object} Parsed JSON data
 * @throws {DataParseError} If JSON is empty, invalid, or cannot be parsed
 */
export function fixJson(json, fileName = "unknown") {
  try {
    if (!json || json.trim().length === 0) {
      throw new Error("Empty JSON content");
    }

    let makeArr = json.split(/\r?\n|\r|\n/g);

    if (makeArr.length === 0) {
      throw new Error("No content found in file");
    }

    // Remove the assignment line and replace with opening bracket
    makeArr.shift();
    makeArr.unshift("[");

    const jsonContent = makeArr.join(" ");
    console.log("Parsing JSON content, length:", jsonContent.length);

    const makeObj = JSON.parse(jsonContent);

    if (!Array.isArray(makeObj) || makeObj.length === 0) {
      throw new Error("Parsed JSON is not a valid array or is empty");
    }

    // Extract the actual data from the wrapper object
    const getKey = Object.keys(makeObj[0])[0];
    makeArr = makeObj.map((item) => ({ ...item[`${getKey}`] }));

    return makeArr.length > 1 ? makeArr : makeArr[0];
  } catch (error) {
    LOGGER.error("Failed to parse JSON:", error);
    console.log(
      "Raw JSON content:",
      json ? json.substring(0, 500) + "..." : "null",
    );
    throw new DataParseError(
      `Failed to parse ${fileName}: ${error.message}`,
      fileName,
      error,
    );
  }
}
