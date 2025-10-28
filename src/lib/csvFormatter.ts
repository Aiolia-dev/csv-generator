import { Column, FormatConfig, LineEnding } from '@/types';

/**
 * Check if a value needs quoting based on format configuration
 * @param value - The value to check
 * @param config - Format configuration
 * @returns true if value needs quoting
 */
export function needsQuoting(value: string, config: FormatConfig): boolean {
  // Always quote if quoteAll is enabled
  if (config.quoteAll) {
    return true;
  }

  // No quoting if quote character is not set
  if (!config.quoteChar) {
    return false;
  }

  // Quote if value contains delimiter
  if (value.includes(config.delimiter)) {
    return true;
  }

  // Quote if value contains newline characters
  if (value.includes('\n') || value.includes('\r')) {
    return true;
  }

  // Quote if value contains the quote character itself
  if (value.includes(config.quoteChar)) {
    return true;
  }

  return false;
}

/**
 * Escape special characters in a value
 * @param value - The value to escape
 * @param config - Format configuration
 * @returns Escaped value
 */
export function escapeValue(value: string, config: FormatConfig): string {
  if (!config.quoteChar) {
    return value;
  }

  // Escape quote characters using the escape character
  const quoteRegex = new RegExp(config.quoteChar, 'g');
  return value.replace(quoteRegex, config.escapeChar + config.quoteChar);
}

/**
 * Format a single field value
 * @param value - The value to format
 * @param config - Format configuration
 * @returns Formatted field value
 */
export function formatField(
  value: string | number | boolean,
  config: FormatConfig
): string {
  // Convert to string
  const stringValue = String(value);

  // Check if quoting is needed
  const shouldQuote = needsQuoting(stringValue, config);

  if (shouldQuote && config.quoteChar) {
    // Escape the value first
    const escaped = escapeValue(stringValue, config);
    // Wrap with quote characters
    return config.quoteChar + escaped + config.quoteChar;
  }

  return stringValue;
}

/**
 * Format a row of values into a CSV line
 * @param values - Array of values for the row
 * @param config - Format configuration
 * @returns Formatted CSV line (without line ending)
 */
export function formatRow(
  values: (string | number | boolean)[],
  config: FormatConfig
): string {
  const formattedFields = values.map((value) => formatField(value, config));
  return formattedFields.join(config.delimiter);
}

/**
 * Add line ending to a CSV line
 * @param line - The CSV line
 * @param lineEnding - Line ending type
 * @returns Line with ending
 */
export function addLineEnding(line: string, lineEnding: LineEnding): string {
  return line + lineEnding;
}

/**
 * Format multiple rows into CSV content
 * @param rows - 2D array of row values
 * @param config - Format configuration
 * @returns Complete CSV content
 */
export function formatRows(
  rows: (string | number | boolean)[][],
  config: FormatConfig
): string {
  return rows
    .map((row) => formatRow(row, config))
    .map((line) => addLineEnding(line, config.lineEnding))
    .join('');
}

/**
 * Generate header lines
 * @param columns - Column definitions
 * @param headerLineCount - Number of header lines
 * @param config - Format configuration
 * @returns Header content
 */
export function generateHeaders(
  columns: Column[],
  headerLineCount: number,
  config: FormatConfig
): string {
  if (headerLineCount === 0) {
    return '';
  }

  let headerContent = '';

  // First header line: column names
  const columnNames = columns.map((col) => col.name);
  headerContent += addLineEnding(
    formatRow(columnNames, config),
    config.lineEnding
  );

  // Additional header lines: metadata
  for (let i = 1; i < headerLineCount; i++) {
    const metadataRow = generateHeaderMetadata(i, columns.length);
    headerContent += addLineEnding(
      formatRow(metadataRow, config),
      config.lineEnding
    );
  }

  return headerContent;
}

/**
 * Generate metadata for additional header lines
 * @param lineIndex - Index of the header line (0-based, excluding first header)
 * @param columnCount - Number of columns
 * @returns Array of metadata values
 */
function generateHeaderMetadata(
  lineIndex: number,
  columnCount: number
): string[] {
  // Generate generic metadata for additional header lines
  const metadata: string[] = [];

  for (let i = 0; i < columnCount; i++) {
    if (i === 0) {
      metadata.push(`# Metadata line ${lineIndex + 1}`);
    } else {
      metadata.push('');
    }
  }

  return metadata;
}

/**
 * Generate footer lines
 * @param footerLineCount - Number of footer lines
 * @param columnCount - Number of columns
 * @param totalRows - Total number of data rows
 * @param config - Format configuration
 * @returns Footer content
 */
export function generateFooters(
  footerLineCount: number,
  columnCount: number,
  totalRows: number,
  config: FormatConfig
): string {
  if (footerLineCount === 0) {
    return '';
  }

  let footerContent = '';

  for (let i = 0; i < footerLineCount; i++) {
    const footerRow = generateFooterData(i, columnCount, totalRows);
    footerContent += addLineEnding(
      formatRow(footerRow, config),
      config.lineEnding
    );
  }

  return footerContent;
}

/**
 * Generate data for footer lines
 * @param lineIndex - Index of the footer line (0-based)
 * @param columnCount - Number of columns
 * @param totalRows - Total number of data rows
 * @returns Array of footer values
 */
function generateFooterData(
  lineIndex: number,
  columnCount: number,
  totalRows: number
): string[] {
  const footer: string[] = [];

  for (let i = 0; i < columnCount; i++) {
    if (i === 0) {
      if (lineIndex === 0) {
        footer.push(`# Total rows: ${totalRows}`);
      } else {
        footer.push(`# End of file`);
      }
    } else {
      footer.push('');
    }
  }

  return footer;
}

/**
 * Convert line ending enum to actual string
 * @param lineEnding - Line ending enum value
 * @returns Actual line ending string
 */
export function getLineEndingString(lineEnding: LineEnding): string {
  return lineEnding;
}

/**
 * Normalize line endings in existing content
 * @param content - Content to normalize
 * @param targetLineEnding - Target line ending
 * @returns Content with normalized line endings
 */
export function normalizeLineEndings(
  content: string,
  targetLineEnding: LineEnding
): string {
  // First normalize all to \n
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Then convert to target
  if (targetLineEnding === LineEnding.CRLF) {
    return normalized.replace(/\n/g, '\r\n');
  } else if (targetLineEnding === LineEnding.CR) {
    return normalized.replace(/\n/g, '\r');
  }

  return normalized;
}
