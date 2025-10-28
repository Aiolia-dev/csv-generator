import {
  addLineEnding,
  formatRow,
  generateFooters,
  generateHeaders,
} from './csvFormatter';
import { generateDataForType } from './dataGenerators';

import {
  Column,
  CSVConfig,
  FileSizeEstimate,
  FormatConfig,
  GenerationResult,
} from '@/types';

/**
 * Generate complete CSV content
 * @param config - Complete CSV configuration
 * @returns Generation result with CSV content
 */
export async function generateCSV(
  config: CSVConfig
): Promise<GenerationResult> {
  const startTime = performance.now();

  try {
    let csvContent = '';

    // 1. Generate headers
    if (config.file.headerLines > 0) {
      csvContent += generateHeaders(
        config.columns,
        config.file.headerLines,
        config.format
      );
    }

    // 2. Generate data rows
    const dataRows = generateDataRows(
      config.columns,
      config.file.totalRows,
      config.format
    );
    csvContent += dataRows;

    // 3. Generate footers
    if (config.file.footerLines > 0) {
      csvContent += generateFooters(
        config.file.footerLines,
        config.columns.length,
        config.file.totalRows,
        config.format
      );
    }

    // Calculate metrics
    const endTime = performance.now();
    const generationTime = endTime - startTime;
    const size = calculateSize(csvContent);

    return {
      content: csvContent,
      size,
      rowCount: config.file.totalRows,
      generationTime,
      success: true,
    };
  } catch (error) {
    const endTime = performance.now();
    const generationTime = endTime - startTime;

    return {
      content: '',
      size: { bytes: 0, kilobytes: 0, megabytes: 0, formatted: '0 B' },
      rowCount: 0,
      generationTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate data rows
 * @param columns - Column definitions
 * @param rowCount - Number of rows to generate
 * @param format - Format configuration
 * @returns CSV data rows as string
 */
function generateDataRows(
  columns: Column[],
  rowCount: number,
  format: FormatConfig
): string {
  let dataContent = '';

  for (let i = 0; i < rowCount; i++) {
    const rowData = columns.map((col) => generateDataForType(col.dataType));
    const formattedRow = formatRow(rowData, format);
    dataContent += addLineEnding(formattedRow, format.lineEnding);
  }

  return dataContent;
}

/**
 * Generate data rows in chunks (for large files)
 * @param columns - Column definitions
 * @param rowCount - Number of rows to generate
 * @param format - Format configuration
 * @param chunkSize - Rows per chunk
 * @param onProgress - Progress callback
 * @returns CSV data rows as string
 */
export async function generateDataRowsChunked(
  columns: Column[],
  rowCount: number,
  format: FormatConfig,
  chunkSize = 10000,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  let dataContent = '';

  for (let i = 0; i < rowCount; i += chunkSize) {
    const currentChunkSize = Math.min(chunkSize, rowCount - i);

    for (let j = 0; j < currentChunkSize; j++) {
      const rowData = columns.map((col) => generateDataForType(col.dataType));
      const formattedRow = formatRow(rowData, format);
      dataContent += addLineEnding(formattedRow, format.lineEnding);
    }

    // Report progress
    if (onProgress) {
      onProgress(i + currentChunkSize, rowCount);
    }

    // Yield to browser to prevent blocking
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return dataContent;
}

/**
 * Calculate file size from content
 * @param content - CSV content
 * @returns File size estimate
 */
function calculateSize(content: string): FileSizeEstimate {
  const bytes = new Blob([content]).size;
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
 * Generate CSV preview (first N rows)
 * @param config - CSV configuration
 * @param previewRows - Number of rows to preview
 * @returns Preview content
 */
export function generatePreview(config: CSVConfig, previewRows = 10): string {
  let previewContent = '';

  // Headers
  if (config.file.headerLines > 0) {
    previewContent += generateHeaders(
      config.columns,
      config.file.headerLines,
      config.format
    );
  }

  // Data rows (limited)
  const limitedRows = Math.min(previewRows, config.file.totalRows);
  previewContent += generateDataRows(
    config.columns,
    limitedRows,
    config.format
  );

  // Add indicator if truncated
  if (config.file.totalRows > previewRows) {
    const indicator = `... (${config.file.totalRows - previewRows} more rows)`;
    previewContent += addLineEnding(indicator, config.format.lineEnding);
  }

  return previewContent;
}
