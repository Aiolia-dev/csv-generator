import { addLineEnding, formatRow } from './csvFormatter';
import { generateDataForType } from './dataGenerators';

import {
  AVERAGE_DATA_LENGTHS,
  Column,
  FileSizeEstimate,
  FormatConfig,
} from '@/types';

/**
 * Estimate file size based on configuration
 * @param columns - Column definitions
 * @param totalRows - Number of data rows
 * @param headerLines - Number of header lines
 * @param footerLines - Number of footer lines
 * @param format - Format configuration
 * @returns Estimated file size
 */
export function estimateFileSize(
  columns: Column[],
  totalRows: number,
  headerLines: number,
  footerLines: number,
  format: FormatConfig
): FileSizeEstimate {
  // Calculate average row size
  const avgRowSize = estimateAverageRowSize(columns, format);

  // Calculate header size
  const headerSize =
    headerLines > 0 ? estimateHeaderSize(columns, headerLines, format) : 0;

  // Calculate footer size
  const footerSize =
    footerLines > 0
      ? estimateFooterSize(columns.length, footerLines, format)
      : 0;

  // Calculate data size
  const dataSize = avgRowSize * totalRows;

  // Total size in bytes
  const totalBytes = headerSize + dataSize + footerSize;

  return formatFileSize(totalBytes);
}

/**
 * Estimate average row size in bytes
 * @param columns - Column definitions
 * @param format - Format configuration
 * @returns Average row size in bytes
 */
export function estimateAverageRowSize(
  columns: Column[],
  format: FormatConfig
): number {
  // Sum of average data lengths for each column
  let totalLength = 0;

  for (const column of columns) {
    const avgDataLength = AVERAGE_DATA_LENGTHS[column.dataType];

    // Add data length
    totalLength += avgDataLength;

    // Add quote characters if quoting all fields
    if (format.quoteAll && format.quoteChar) {
      totalLength += 2; // Opening and closing quotes
    } else {
      // Estimate 50% of fields will need quoting
      totalLength += 1; // Average of 0 or 2 quotes
    }
  }

  // Add delimiters (n-1 delimiters for n columns)
  totalLength += (columns.length - 1) * format.delimiter.length;

  // Add line ending
  totalLength += format.lineEnding.length;

  // Convert to bytes (UTF-8 encoding, most chars are 1 byte)
  // Add 10% buffer for special characters
  return Math.ceil(totalLength * 1.1);
}

/**
 * Estimate header size in bytes
 * @param columns - Column definitions
 * @param headerLines - Number of header lines
 * @param format - Format configuration
 * @returns Header size in bytes
 */
function estimateHeaderSize(
  columns: Column[],
  headerLines: number,
  format: FormatConfig
): number {
  // First header line: column names
  let headerSize = 0;

  for (const column of columns) {
    headerSize += column.name.length;
    if (format.quoteAll && format.quoteChar) {
      headerSize += 2;
    }
  }

  // Add delimiters and line ending
  headerSize += (columns.length - 1) * format.delimiter.length;
  headerSize += format.lineEnding.length;

  // Additional header lines (metadata)
  // Estimate 50 characters per additional line
  if (headerLines > 1) {
    const additionalLines = headerLines - 1;
    headerSize += additionalLines * (50 + format.lineEnding.length);
  }

  return headerSize;
}

/**
 * Estimate footer size in bytes
 * @param columnCount - Number of columns
 * @param footerLines - Number of footer lines
 * @param format - Format configuration
 * @returns Footer size in bytes
 */
function estimateFooterSize(
  columnCount: number,
  footerLines: number,
  format: FormatConfig
): number {
  // Estimate 50 characters per footer line
  return footerLines * (50 + format.lineEnding.length);
}

/**
 * Calculate precise file size using sample data
 * @param columns - Column definitions
 * @param format - Format configuration
 * @param sampleSize - Number of sample rows to generate
 * @returns Precise average row size in bytes
 */
export function calculatePreciseRowSize(
  columns: Column[],
  format: FormatConfig,
  sampleSize = 100
): number {
  let totalBytes = 0;

  for (let i = 0; i < sampleSize; i++) {
    // Generate sample row
    const rowData = columns.map((col) => generateDataForType(col.dataType));
    const formattedRow = formatRow(rowData, format);
    const rowWithEnding = addLineEnding(formattedRow, format.lineEnding);

    // Calculate byte size
    totalBytes += new Blob([rowWithEnding]).size;
  }

  return totalBytes / sampleSize;
}

/**
 * Calculate number of rows needed for target file size
 * @param targetSizeMB - Target file size in megabytes
 * @param columns - Column definitions
 * @param headerLines - Number of header lines
 * @param footerLines - Number of footer lines
 * @param format - Format configuration
 * @returns Number of rows needed
 */
export function calculateRowsForFileSize(
  targetSizeMB: number,
  columns: Column[],
  headerLines: number,
  footerLines: number,
  format: FormatConfig
): number {
  // Use precise calculation for better accuracy
  const avgRowSize = calculatePreciseRowSize(columns, format, 100);

  // Convert target size to bytes
  const targetBytes = targetSizeMB * 1024 * 1024;

  // Calculate overhead
  const headerSize =
    headerLines > 0 ? estimateHeaderSize(columns, headerLines, format) : 0;
  const footerSize =
    footerLines > 0
      ? estimateFooterSize(columns.length, footerLines, format)
      : 0;
  const overhead = headerSize + footerSize;

  // Calculate available bytes for data
  const availableBytes = targetBytes - overhead;

  // Calculate number of rows
  const rows = Math.floor(availableBytes / avgRowSize);

  return Math.max(1, rows); // At least 1 row
}

/**
 * Format file size from bytes
 * @param bytes - Size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): FileSizeEstimate {
  const kilobytes = bytes / 1024;
  const megabytes = kilobytes / 1024;

  let formatted: string;
  if (megabytes >= 1) {
    formatted = `${megabytes.toFixed(2)} MB`;
  } else if (kilobytes >= 1) {
    formatted = `${kilobytes.toFixed(2)} KB`;
  } else {
    formatted = `${bytes} B`;
  }

  return { bytes, kilobytes, megabytes, formatted };
}

/**
 * Estimate generation time based on row count
 * @param rowCount - Number of rows
 * @returns Estimated time in milliseconds
 */
export function estimateGenerationTime(rowCount: number): number {
  // Rough estimate: 10,000 rows per second
  const rowsPerSecond = 10000;
  const seconds = rowCount / rowsPerSecond;
  return seconds * 1000;
}

/**
 * Format generation time
 * @param milliseconds - Time in milliseconds
 * @returns Formatted time string
 */
export function formatGenerationTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(0)}ms`;
  }

  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}
