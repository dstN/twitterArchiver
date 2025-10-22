import {
  configure,
  ZipReader,
  BlobReader,
  TextWriter,
  BlobWriter,
} from "@zip.js/zip.js";

// Enable web workers when available so large archives stream efficiently.
configure({ useWebWorkers: true });

/**
 * Thin wrapper around zip.js that exposes a JSZip-like API tailored to
 * the rest of the application. Entries are streamed on demand which
 * allows processing archives much larger than the ArrayBuffer limit.
 */
export class ZipArchive {
  /**
   * @param {ZipReader} reader
   * @param {Map<string, import("@zip.js/zip.js").Entry>} entries
   */
  constructor(reader, entries) {
    this._reader = reader;
    this._entries = entries;
  }

  /**
   * Build a ZipArchive from a Blob/File without loading it fully in memory.
   * @param {Blob} blob
   * @returns {Promise<ZipArchive>}
   */
  static async fromBlob(blob, options = {}) {
    const { onProgress } = options;
    const reader = new ZipReader(new BlobReader(blob), {
      onprogress(progress, total, entry) {
        if (typeof onProgress === "function") {
          onProgress(progress, total, entry);
        }
      },
    });
    const entries = await reader.getEntries({
      onprogress(progress, total, entry) {
        if (typeof onProgress === "function") {
          onProgress(progress, total, entry);
        }
      },
    });
    const entryMap = new Map();

    for (const entry of entries) {
      if (entry.directory) continue;
      entryMap.set(entry.filename, entry);
    }

    return new ZipArchive(reader, entryMap);
  }

  /**
   * Returns the list of file paths contained in the archive.
   * @returns {string[]}
   */
  listFiles() {
    return Array.from(this._entries.keys());
  }

  /**
   * Check whether the archive contains a given path.
   * @param {string} filePath
   * @returns {boolean}
   */
  has(filePath) {
    return this._entries.has(filePath);
  }

  /**
   * Fetch raw entry instance or null.
   * @param {string} filePath
   * @returns {import("@zip.js/zip.js").Entry | null}
   */
  getEntry(filePath) {
    return this._entries.get(filePath) ?? null;
  }

  /**
   * Read the file as text (UTF-8).
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  async readText(filePath) {
    const entry = this.getEntry(filePath);
    if (!entry) {
      throw new Error(`File not found in archive: ${filePath}`);
    }

    return entry.getData(new TextWriter());
  }

  /**
   * Read the file as a Blob with optional MIME type override.
   * @param {string} filePath
   * @param {string} [mimeType]
   * @returns {Promise<Blob>}
   */
  async readBlob(filePath, mimeType) {
    const entry = this.getEntry(filePath);
    if (!entry) {
      throw new Error(`File not found in archive: ${filePath}`);
    }

    return entry.getData(new BlobWriter(mimeType));
  }

  /**
   * Close the underlying reader to release resources.
   * Call once all entries have been consumed.
   * @returns {Promise<void>}
   */
  async close() {
    if (this._reader) {
      await this._reader.close();
      this._reader = null;
    }
  }
}
