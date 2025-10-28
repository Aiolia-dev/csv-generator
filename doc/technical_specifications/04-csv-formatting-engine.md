# Step 04: CSV Formatting Engine

## Overview

Implement the core CSV formatting logic that handles quoting, escaping, delimiters, and line endings. This is the heart of the CSV generation system.

## What You'll Build

- CSV row formatting function
- Quoting logic (selective and all fields)
- Character escaping
- Delimiter handling
- Line ending conversion
- Header and footer generation
- Complete CSV generation pipeline

## Prerequisites

- Step 01 completed (project setup)
- Step 02 completed (type definitions)
- Step 03 completed (data generators)

## Implementation Steps

### 1. Create CSV Formatter Core

Create `src/lib/csvFormatter.ts`:

```typescript
import { FormatConfig, Column, LineEnding } from '@/types';

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
```

### 2. Create CSV Generation Pipeline

Create `src/lib/csvGenerator.ts`:

```typescript
import { CSVConfig, GenerationResult, Column } from '@/types';
import { generateDataForType } from './dataGenerators';
import {
  formatRow,
  generateHeaders,
  generateFooters,
  addLineEnding,
} from './csvFormatter';

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
  format: any
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
  format: any,
  chunkSize: number = 10000,
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
function calculateSize(content: string): {
  bytes: number;
  kilobytes: number;
  megabytes: number;
  formatted: string;
} {
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
export function generatePreview(
  config: CSVConfig,
  previewRows: number = 10
): string {
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
```

### 3. Create Formatting Utilities

Create `src/lib/formatUtils.ts`:

```typescript
import { Delimiter, QuoteChar, LineEnding, Encoding } from '@/types';

/**
 * Get display value for delimiter
 * @param delimiter - Delimiter enum value
 * @returns Display string
 */
export function getDelimiterDisplay(delimiter: Delimiter): string {
  switch (delimiter) {
    case Delimiter.Comma:
      return ',';
    case Delimiter.Semicolon:
      return ';';
    case Delimiter.Tab:
      return '\\t';
    case Delimiter.Pipe:
      return '|';
    default:
      return delimiter;
  }
}

/**
 * Get display value for quote character
 * @param quoteChar - Quote character enum value
 * @returns Display string
 */
export function getQuoteCharDisplay(quoteChar: QuoteChar): string {
  switch (quoteChar) {
    case QuoteChar.DoubleQuote:
      return '"';
    case QuoteChar.SingleQuote:
      return "'";
    case QuoteChar.None:
      return 'None';
    default:
      return quoteChar;
  }
}

/**
 * Get display value for line ending
 * @param lineEnding - Line ending enum value
 * @returns Display string
 */
export function getLineEndingDisplay(lineEnding: LineEnding): string {
  switch (lineEnding) {
    case LineEnding.LF:
      return 'LF (\\n)';
    case LineEnding.CRLF:
      return 'CRLF (\\r\\n)';
    case LineEnding.CR:
      return 'CR (\\r)';
    default:
      return lineEnding;
  }
}

/**
 * Count lines in CSV content
 * @param content - CSV content
 * @returns Number of lines
 */
export function countLines(content: string): number {
  if (!content) return 0;
  return content.split(/\r\n|\r|\n/).length;
}

/**
 * Truncate content for display
 * @param content - Content to truncate
 * @param maxLines - Maximum lines to show
 * @returns Truncated content
 */
export function truncateContent(content: string, maxLines: number): string {
  const lines = content.split(/\r\n|\r|\n/);

  if (lines.length <= maxLines) {
    return content;
  }

  return lines.slice(0, maxLines).join('\n') + '\n...';
}
```

## Testing This Step

### 1. Unit Tests

Create `src/lib/__tests__/csvFormatter.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  needsQuoting,
  escapeValue,
  formatField,
  formatRow,
} from '../csvFormatter';
import { Delimiter, QuoteChar, LineEnding, FormatConfig } from '@/types';

const defaultConfig: FormatConfig = {
  delimiter: Delimiter.Comma,
  quoteChar: QuoteChar.DoubleQuote,
  escapeChar: '\\',
  lineEnding: LineEnding.LF,
  encoding: 'UTF-8' as any,
  quoteAll: false,
};

describe('CSV Formatter', () => {
  describe('needsQuoting', () => {
    it('should quote values containing delimiter', () => {
      expect(needsQuoting('hello,world', defaultConfig)).toBe(true);
    });

    it('should quote values containing newlines', () => {
      expect(needsQuoting('hello\nworld', defaultConfig)).toBe(true);
    });

    it('should quote values containing quote character', () => {
      expect(needsQuoting('hello"world', defaultConfig)).toBe(true);
    });

    it('should not quote simple values', () => {
      expect(needsQuoting('hello', defaultConfig)).toBe(false);
    });

    it('should quote all fields when quoteAll is true', () => {
      const config = { ...defaultConfig, quoteAll: true };
      expect(needsQuoting('hello', config)).toBe(true);
    });
  });

  describe('escapeValue', () => {
    it('should escape quote characters', () => {
      const result = escapeValue('hello"world', defaultConfig);
      expect(result).toBe('hello\\"world');
    });

    it('should escape multiple quote characters', () => {
      const result = escapeValue('"hello""world"', defaultConfig);
      expect(result).toBe('\\"hello\\"\\"world\\"');
    });
  });

  describe('formatField', () => {
    it('should format simple string', () => {
      expect(formatField('hello', defaultConfig)).toBe('hello');
    });

    it('should format and quote string with comma', () => {
      expect(formatField('hello,world', defaultConfig)).toBe('"hello,world"');
    });

    it('should format number', () => {
      expect(formatField(123, defaultConfig)).toBe('123');
    });

    it('should format boolean', () => {
      expect(formatField(true, defaultConfig)).toBe('true');
    });
  });

  describe('formatRow', () => {
    it('should format row with multiple values', () => {
      const values = ['John', 'Doe', 'john@example.com'];
      const result = formatRow(values, defaultConfig);
      expect(result).toBe('John,Doe,john@example.com');
    });

    it('should handle values needing quotes', () => {
      const values = ['John', 'Doe, Jr.', 'john@example.com'];
      const result = formatRow(values, defaultConfig);
      expect(result).toBe('John,"Doe, Jr.",john@example.com');
    });
  });
});
```

### 2. Integration Test

Create a test page to verify formatting:

```typescript
// Add to src/app/page.tsx temporarily
'use client';

import { useState } from 'react';
import { generateCSV } from '@/lib/csvGenerator';
import {
  DEFAULT_FILE_CONFIG,
  DEFAULT_FORMAT_CONFIG,
  DEFAULT_COLUMNS,
} from '@/types';

export default function Home() {
  const [result, setResult] = useState<string>('');

  const handleGenerate = async () => {
    const config = {
      file: { ...DEFAULT_FILE_CONFIG, totalRows: 5 },
      format: DEFAULT_FORMAT_CONFIG,
      columns: DEFAULT_COLUMNS,
    };

    const result = await generateCSV(config);
    if (result.success) {
      setResult(result.content);
    }
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>
            CSV Formatter Test
          </h1>

          <button
            onClick={handleGenerate}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Generate Sample CSV
          </button>

          {result && (
            <pre className='mt-4 p-4 bg-gray-100 rounded overflow-x-auto text-sm'>
              {result}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
```

Run `pnpm dev` and test the generation.

## Common Issues & Solutions

### Issue: Quotes not properly escaped

**Solution**: Ensure `escapeValue` is called before wrapping with quotes.

### Issue: Line endings not correct

**Solution**: Verify `LineEnding` enum values match actual characters.

### Issue: Delimiter appearing in unquoted fields

**Solution**: Check `needsQuoting` logic includes delimiter check.

### Issue: Performance issues with large files

**Solution**: Use `generateDataRowsChunked` for files > 10MB.

## File Checklist

After completing this step, you should have:

- ✅ `src/lib/csvFormatter.ts` with formatting functions
- ✅ `src/lib/csvGenerator.ts` with generation pipeline
- ✅ `src/lib/formatUtils.ts` with utility functions
- ✅ All tests passing
- ✅ Sample CSV generation working

## Next Steps

Proceed to **Step 05: File Size Calculator** where you'll:

- Implement accurate file size estimation
- Calculate rows needed for target file size
- Add size formatting utilities
- Create size prediction algorithms

## Additional Resources

- [CSV Format Specification (RFC 4180)](https://tools.ietf.org/html/rfc4180)
- [Character Escaping](https://en.wikipedia.org/wiki/Escape_character)
- [Line Endings](https://en.wikipedia.org/wiki/Newline)

---

**Status**: ✅ CSV formatting engine complete, ready for size calculation
