/**
 * Utility functions for validating and debugging ZIP files
 */

export class ZipValidator {
  static async validateZipStructure(arrayBuffer) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      fileSize: arrayBuffer.byteLength,
      hasValidHeader: false,
      hasValidFooter: false,
      estimatedFileCount: 0,
    };

    try {
      // Check minimum file size (empty ZIP is ~22 bytes)
      if (arrayBuffer.byteLength < 22) {
        validation.isValid = false;
        validation.errors.push("File too small to be a valid ZIP archive");
        return validation;
      }

      // Check ZIP file signature (first 4 bytes should be 0x504B0304 or 0x504B0506)
      const view = new DataView(arrayBuffer);
      const signature = view.getUint32(0, true); // little-endian

      if (signature === 0x04034b50) {
        validation.hasValidHeader = true;
      } else if (signature === 0x06054b50) {
        validation.warnings.push(
          "ZIP starts with central directory signature (unusual but valid)",
        );
      } else {
        validation.isValid = false;
        validation.errors.push(
          `Invalid ZIP signature: 0x${signature.toString(16).toUpperCase()}`,
        );
      }

      // Look for End of Central Directory signature at the end
      // EOCD is at least 22 bytes, scan last 65KB for the signature
      const scanStart = Math.max(0, arrayBuffer.byteLength - 65536);
      const scanLength = arrayBuffer.byteLength - scanStart;
      const scanView = new DataView(arrayBuffer, scanStart, scanLength);

      let eocdFound = false;
      for (let i = scanLength - 22; i >= 0; i--) {
        if (scanView.getUint32(i, true) === 0x06054b50) {
          validation.hasValidFooter = true;
          eocdFound = true;

          // Extract file count from EOCD
          const fileCount = scanView.getUint16(i + 10, true);
          validation.estimatedFileCount = fileCount;
          break;
        }
      }

      if (!eocdFound) {
        validation.isValid = false;
        validation.errors.push("End of Central Directory signature not found");
      }

      // Additional checks
      if (validation.estimatedFileCount === 0) {
        validation.warnings.push("ZIP appears to contain no files");
      }

      if (validation.estimatedFileCount > 10000) {
        validation.warnings.push(
          `Very large number of files detected: ${validation.estimatedFileCount}`,
        );
      }
    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Validation error: ${error.message}`);
    }

    return validation;
  }

  static formatValidationReport(validation) {
    let report = `ZIP Validation Report:\n`;
    report += `File size: ${(validation.fileSize / 1024 / 1024).toFixed(2)} MB\n`;
    report += `Valid header: ${validation.hasValidHeader}\n`;
    report += `Valid footer: ${validation.hasValidFooter}\n`;
    report += `Estimated file count: ${validation.estimatedFileCount}\n`;
    report += `Overall valid: ${validation.isValid}\n`;

    if (validation.errors.length > 0) {
      report += `\nErrors:\n${validation.errors.map((e) => `- ${e}`).join("\n")}\n`;
    }

    if (validation.warnings.length > 0) {
      report += `\nWarnings:\n${validation.warnings.map((w) => `- ${w}`).join("\n")}\n`;
    }

    return report;
  }
}
