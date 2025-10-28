# Step 05: File Size Calculator

## Overview

Implement accurate file size estimation and calculation logic. This allows users to see estimated file sizes before generation and enables the "target file size" feature.

## What You'll Build

- File size estimation algorithm
- Row count calculator for target file size
- Size formatting utilities
- Real-time size updates
- Performance predictions

## Prerequisites

- Step 01 completed (project setup)
- Step 02 completed (type definitions)
- Step 03 completed (data generators)
- Step 04 completed (CSV formatting engine)

## Implementation Steps

### 1. Create File Size Calculator

Create `src/lib/fileSizeCalculator.ts`:

```typescript
import {
  Column,
  FormatConfig,
  FileSizeEstimate,
  AVERAGE_DATA_LENGTHS,
} from '@/types';
import { generateDataForType } from './dataGenerators';
import { formatRow, addLineEnding } from './csvFormatter';

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
  sampleSize: number = 100
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

  // Calculate header and footer sizes
  const headerSize =
    headerLines > 0 ? estimateHeaderSize(columns, headerLines, format) : 0;
  const footerSize =
    footerLines > 0
      ? estimateFooterSize(columns.length, footerLines, format)
      : 0;

  // Convert target size to bytes
  const targetBytes = targetSizeMB * 1024 * 1024;

  // Calculate available bytes for data
  const availableBytes = targetBytes - headerSize - footerSize;

  // Calculate number of rows
  const rowCount = Math.floor(availableBytes / avgRowSize);

  // Ensure at least 1 row
  return Math.max(1, rowCount);
}

/**
 * Format file size into human-readable string
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

  return {
    bytes,
    kilobytes,
    megabytes,
    formatted,
  };
}

/**
 * Get size category for performance optimization
 * @param sizeMB - File size in megabytes
 * @returns Size category
 */
export function getSizeCategory(
  sizeMB: number
): 'small' | 'medium' | 'large' | 'xlarge' {
  if (sizeMB < 10) return 'small';
  if (sizeMB < 100) return 'medium';
  if (sizeMB < 500) return 'large';
  return 'xlarge';
}

/**
 * Estimate generation time based on file size
 * @param sizeMB - File size in megabytes
 * @returns Estimated time in seconds
 */
export function estimateGenerationTime(sizeMB: number): number {
  const category = getSizeCategory(sizeMB);

  switch (category) {
    case 'small':
      return 1; // < 1 second
    case 'medium':
      return sizeMB * 0.5; // ~0.5 seconds per MB
    case 'large':
      return sizeMB * 0.3; // ~0.3 seconds per MB
    case 'xlarge':
      return sizeMB * 0.2; // ~0.2 seconds per MB
    default:
      return 1;
  }
}

/**
 * Check if file size is within safe limits
 * @param sizeMB - File size in megabytes
 * @returns Validation result
 */
export function validateFileSize(sizeMB: number): {
  isValid: boolean;
  warning?: string;
  error?: string;
} {
  if (sizeMB > 1000) {
    return {
      isValid: false,
      error: 'File size exceeds maximum limit of 1000 MB',
    };
  }

  if (sizeMB > 500) {
    return {
      isValid: true,
      warning:
        'Large file size may take significant time and memory to generate',
    };
  }

  if (sizeMB > 100) {
    return {
      isValid: true,
      warning: 'File generation may take several seconds',
    };
  }

  return { isValid: true };
}
```

### 2. Create Size Formatting Utilities

Create `src/lib/sizeUtils.ts`:

```typescript
/**
 * Convert bytes to megabytes
 * @param bytes - Size in bytes
 * @returns Size in megabytes
 */
export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Convert megabytes to bytes
 * @param mb - Size in megabytes
 * @returns Size in bytes
 */
export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

/**
 * Convert bytes to kilobytes
 * @param bytes - Size in bytes
 * @returns Size in kilobytes
 */
export function bytesToKB(bytes: number): number {
  return bytes / 1024;
}

/**
 * Convert kilobytes to bytes
 * @param kb - Size in kilobytes
 * @returns Size in bytes
 */
export function kbToBytes(kb: number): number {
  return kb * 1024;
}

/**
 * Format bytes with appropriate unit
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Parse size string to bytes
 * @param sizeString - Size string (e.g., "10 MB", "500 KB")
 * @returns Size in bytes
 */
export function parseSizeString(sizeString: string): number {
  const match = sizeString.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);

  if (!match) {
    throw new Error('Invalid size string format');
  }

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  switch (unit) {
    case 'B':
      return value;
    case 'KB':
      return kbToBytes(value);
    case 'MB':
      return mbToBytes(value);
    case 'GB':
      return value * 1024 * 1024 * 1024;
    case 'TB':
      return value * 1024 * 1024 * 1024 * 1024;
    default:
      throw new Error('Unknown size unit');
  }
}

/**
 * Compare two file sizes
 * @param size1 - First size in bytes
 * @param size2 - Second size in bytes
 * @returns -1 if size1 < size2, 0 if equal, 1 if size1 > size2
 */
export function compareSizes(size1: number, size2: number): -1 | 0 | 1 {
  if (size1 < size2) return -1;
  if (size1 > size2) return 1;
  return 0;
}

/**
 * Calculate percentage of target size
 * @param currentSize - Current size in bytes
 * @param targetSize - Target size in bytes
 * @returns Percentage (0-100)
 */
export function calculateSizePercentage(
  currentSize: number,
  targetSize: number
): number {
  if (targetSize === 0) return 0;
  return Math.min(100, (currentSize / targetSize) * 100);
}
```

### 3. Create Performance Estimator

Create `src/lib/performanceEstimator.ts`:

```typescript
import { Column, FormatConfig } from '@/types';
import { estimateFileSize, getSizeCategory } from './fileSizeCalculator';

/**
 * Performance metrics for file generation
 */
export interface PerformanceMetrics {
  /** Estimated generation time in seconds */
  estimatedTime: number;
  /** Estimated memory usage in MB */
  estimatedMemory: number;
  /** Recommended chunk size for generation */
  chunkSize: number;
  /** Whether to use Web Workers */
  useWebWorkers: boolean;
  /** Performance category */
  category: 'fast' | 'normal' | 'slow' | 'very-slow';
}

/**
 * Estimate performance metrics for CSV generation
 * @param columns - Column definitions
 * @param totalRows - Number of rows
 * @param headerLines - Number of header lines
 * @param footerLines - Number of footer lines
 * @param format - Format configuration
 * @returns Performance metrics
 */
export function estimatePerformance(
  columns: Column[],
  totalRows: number,
  headerLines: number,
  footerLines: number,
  format: FormatConfig
): PerformanceMetrics {
  // Estimate file size
  const sizeEstimate = estimateFileSize(
    columns,
    totalRows,
    headerLines,
    footerLines,
    format
  );

  const sizeMB = sizeEstimate.megabytes;
  const sizeCategory = getSizeCategory(sizeMB);

  // Calculate metrics based on size
  let estimatedTime: number;
  let estimatedMemory: number;
  let chunkSize: number;
  let useWebWorkers: boolean;
  let category: PerformanceMetrics['category'];

  if (sizeCategory === 'small') {
    // < 10 MB
    estimatedTime = 1;
    estimatedMemory = sizeMB * 2;
    chunkSize = totalRows; // No chunking needed
    useWebWorkers = false;
    category = 'fast';
  } else if (sizeCategory === 'medium') {
    // 10-100 MB
    estimatedTime = sizeMB * 0.5;
    estimatedMemory = sizeMB * 1.5;
    chunkSize = 10000;
    useWebWorkers = false;
    category = 'normal';
  } else if (sizeCategory === 'large') {
    // 100-500 MB
    estimatedTime = sizeMB * 0.3;
    estimatedMemory = sizeMB * 1.2;
    chunkSize = 5000;
    useWebWorkers = true;
    category = 'slow';
  } else {
    // > 500 MB
    estimatedTime = sizeMB * 0.2;
    estimatedMemory = sizeMB;
    chunkSize = 2000;
    useWebWorkers = true;
    category = 'very-slow';
  }

  return {
    estimatedTime: Math.ceil(estimatedTime),
    estimatedMemory: Math.ceil(estimatedMemory),
    chunkSize,
    useWebWorkers,
    category,
  };
}

/**
 * Get performance warning message
 * @param metrics - Performance metrics
 * @returns Warning message or null
 */
export function getPerformanceWarning(
  metrics: PerformanceMetrics
): string | null {
  if (metrics.category === 'very-slow') {
    return `This file will take approximately ${metrics.estimatedTime} seconds to generate and use ~${metrics.estimatedMemory} MB of memory. Consider reducing the file size.`;
  }

  if (metrics.category === 'slow') {
    return `This file will take approximately ${metrics.estimatedTime} seconds to generate. Please be patient.`;
  }

  if (metrics.estimatedMemory > 500) {
    return 'This file requires significant memory. Close other tabs if you experience issues.';
  }

  return null;
}

/**
 * Check if browser can handle the file size
 * @param sizeMB - File size in megabytes
 * @returns Whether browser can handle it
 */
export function canBrowserHandle(sizeMB: number): boolean {
  // Check if Blob API is supported
  if (typeof Blob === 'undefined') {
    return false;
  }

  // Check available memory (rough estimate)
  // Most browsers can handle up to 500MB comfortably
  return sizeMB <= 500;
}
```

## Testing This Step

### 1. Unit Tests

Create `src/lib/__tests__/fileSizeCalculator.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  estimateFileSize,
  calculateRowsForFileSize,
  formatFileSize,
  getSizeCategory,
} from '../fileSizeCalculator';
import { DEFAULT_FORMAT_CONFIG, DEFAULT_COLUMNS } from '@/types';

describe('File Size Calculator', () => {
  it('should estimate file size', () => {
    const estimate = estimateFileSize(
      DEFAULT_COLUMNS,
      100,
      1,
      0,
      DEFAULT_FORMAT_CONFIG
    );

    expect(estimate.bytes).toBeGreaterThan(0);
    expect(estimate.formatted).toBeDefined();
  });

  it('should calculate rows for target file size', () => {
    const rows = calculateRowsForFileSize(
      1, // 1 MB
      DEFAULT_COLUMNS,
      1,
      0,
      DEFAULT_FORMAT_CONFIG
    );

    expect(rows).toBeGreaterThan(0);
  });

  it('should format file size correctly', () => {
    const size1 = formatFileSize(500);
    expect(size1.formatted).toBe('500 B');

    const size2 = formatFileSize(5000);
    expect(size2.formatted).toContain('KB');

    const size3 = formatFileSize(5000000);
    expect(size3.formatted).toContain('MB');
  });

  it('should categorize file sizes', () => {
    expect(getSizeCategory(5)).toBe('small');
    expect(getSizeCategory(50)).toBe('medium');
    expect(getSizeCategory(200)).toBe('large');
    expect(getSizeCategory(600)).toBe('xlarge');
  });
});
```

### 2. Integration Test

Add to `src/app/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { estimateFileSize } from '@/lib/fileSizeCalculator';
import {
  DEFAULT_FILE_CONFIG,
  DEFAULT_FORMAT_CONFIG,
  DEFAULT_COLUMNS,
} from '@/types';

export default function Home() {
  const [estimate, setEstimate] = useState<any>(null);

  useEffect(() => {
    const result = estimateFileSize(
      DEFAULT_COLUMNS,
      DEFAULT_FILE_CONFIG.totalRows,
      DEFAULT_FILE_CONFIG.headerLines,
      DEFAULT_FILE_CONFIG.footerLines,
      DEFAULT_FORMAT_CONFIG
    );
    setEstimate(result);
  }, []);

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>
            File Size Calculator Test
          </h1>

          {estimate && (
            <div className='space-y-2'>
              <p>
                Estimated Size: <strong>{estimate.formatted}</strong>
              </p>
              <p>Bytes: {estimate.bytes}</p>
              <p>Kilobytes: {estimate.kilobytes.toFixed(2)}</p>
              <p>Megabytes: {estimate.megabytes.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

## Common Issues & Solutions

### Issue: Size estimates inaccurate

**Solution**: Use `calculatePreciseRowSize` with larger sample size (200+).

### Issue: Target file size calculation off

**Solution**: Account for header/footer sizes in available bytes calculation.

### Issue: Performance issues with large samples

**Solution**: Limit sample size to 100 rows for estimation.

## File Checklist

After completing this step, you should have:

- ✅ `src/lib/fileSizeCalculator.ts` with size calculation
- ✅ `src/lib/sizeUtils.ts` with formatting utilities
- ✅ `src/lib/performanceEstimator.ts` with performance metrics
- ✅ All tests passing
- ✅ Accurate size estimates

## Next Steps

Proceed to **Step 06: Validation System** where you'll:

- Implement input validation functions
- Create validation error handling
- Add real-time validation
- Build validation UI feedback

## Additional Resources

- [Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [File Size Calculations](https://en.wikipedia.org/wiki/File_size)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---

**Status**: ✅ File size calculator complete, ready for validation system
