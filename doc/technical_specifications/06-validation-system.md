# Step 06: Validation System

## Overview

Implement comprehensive input validation for all configuration options. This ensures data integrity and provides helpful error messages to users.

## What You'll Build

- Input validation functions
- Configuration validation
- Real-time validation
- Error message generation
- Validation state management

## Prerequisites

- Step 01 completed (project setup)
- Step 02 completed (type definitions)
- Step 03 completed (data generators)
- Step 04 completed (CSV formatting engine)
- Step 05 completed (file size calculator)

## Implementation Steps

### 1. Create Core Validators

Create `src/lib/validators.ts`:

```typescript
import {
  Column,
  FileConfig,
  FormatConfig,
  ValidationError,
  ValidationResult,
  VALIDATION_LIMITS,
} from '@/types';
import { VALIDATION_MESSAGES } from '@/constants/messages';

/**
 * Validate total rows input
 * @param totalRows - Number of rows
 * @returns Validation error or null
 */
export function validateTotalRows(totalRows: number): ValidationError | null {
  if (isNaN(totalRows) || totalRows === null || totalRows === undefined) {
    return {
      field: 'totalRows',
      message: VALIDATION_MESSAGES.TOTAL_ROWS_REQUIRED,
      severity: 'error',
    };
  }

  if (totalRows < VALIDATION_LIMITS.MIN_ROWS) {
    return {
      field: 'totalRows',
      message: VALIDATION_MESSAGES.TOTAL_ROWS_MIN,
      severity: 'error',
    };
  }

  if (totalRows > VALIDATION_LIMITS.MAX_ROWS) {
    return {
      field: 'totalRows',
      message: VALIDATION_MESSAGES.TOTAL_ROWS_MAX,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Validate target file size input
 * @param fileSize - File size in MB
 * @returns Validation error or null
 */
export function validateTargetFileSize(
  fileSize: number
): ValidationError | null {
  if (isNaN(fileSize) || fileSize === null || fileSize === undefined) {
    return {
      field: 'targetFileSize',
      message: VALIDATION_MESSAGES.FILE_SIZE_REQUIRED,
      severity: 'error',
    };
  }

  if (fileSize < VALIDATION_LIMITS.MIN_FILE_SIZE) {
    return {
      field: 'targetFileSize',
      message: VALIDATION_MESSAGES.FILE_SIZE_MIN,
      severity: 'error',
    };
  }

  if (fileSize > VALIDATION_LIMITS.MAX_FILE_SIZE) {
    return {
      field: 'targetFileSize',
      message: VALIDATION_MESSAGES.FILE_SIZE_MAX,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Validate header lines input
 * @param headerLines - Number of header lines
 * @returns Validation error or null
 */
export function validateHeaderLines(
  headerLines: number
): ValidationError | null {
  if (isNaN(headerLines) || headerLines === null || headerLines === undefined) {
    return {
      field: 'headerLines',
      message: 'Header lines is required',
      severity: 'error',
    };
  }

  if (headerLines < VALIDATION_LIMITS.MIN_HEADER_LINES) {
    return {
      field: 'headerLines',
      message: VALIDATION_MESSAGES.HEADER_LINES_MIN,
      severity: 'error',
    };
  }

  if (headerLines > VALIDATION_LIMITS.MAX_HEADER_LINES) {
    return {
      field: 'headerLines',
      message: VALIDATION_MESSAGES.HEADER_LINES_MAX,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Validate footer lines input
 * @param footerLines - Number of footer lines
 * @returns Validation error or null
 */
export function validateFooterLines(
  footerLines: number
): ValidationError | null {
  if (isNaN(footerLines) || footerLines === null || footerLines === undefined) {
    return {
      field: 'footerLines',
      message: 'Footer lines is required',
      severity: 'error',
    };
  }

  if (footerLines < VALIDATION_LIMITS.MIN_FOOTER_LINES) {
    return {
      field: 'footerLines',
      message: VALIDATION_MESSAGES.FOOTER_LINES_MIN,
      severity: 'error',
    };
  }

  if (footerLines > VALIDATION_LIMITS.MAX_FOOTER_LINES) {
    return {
      field: 'footerLines',
      message: VALIDATION_MESSAGES.FOOTER_LINES_MAX,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Validate escape character input
 * @param escapeChar - Escape character
 * @returns Validation error or null
 */
export function validateEscapeChar(escapeChar: string): ValidationError | null {
  if (escapeChar.length > VALIDATION_LIMITS.MAX_ESCAPE_CHAR_LENGTH) {
    return {
      field: 'escapeChar',
      message: VALIDATION_MESSAGES.ESCAPE_CHAR_LENGTH,
      severity: 'error',
    };
  }

  return null;
}

/**
 * Validate column name
 * @param name - Column name
 * @returns Validation error or null
 */
export function validateColumnName(name: string): ValidationError | null {
  if (!name || name.trim() === '') {
    return {
      field: 'columnName',
      message: VALIDATION_MESSAGES.COLUMN_NAME_REQUIRED,
      severity: 'error',
    };
  }

  // Check for alphanumeric and underscores only (warning, not error)
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return {
      field: 'columnName',
      message: VALIDATION_MESSAGES.COLUMN_NAME_INVALID,
      severity: 'warning',
    };
  }

  return null;
}

/**
 * Check for duplicate column names
 * @param columns - Array of columns
 * @returns Array of validation errors for duplicates
 */
export function validateDuplicateColumns(columns: Column[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const nameCount = new Map<string, number>();

  // Count occurrences of each name
  columns.forEach((col) => {
    const count = nameCount.get(col.name) || 0;
    nameCount.set(col.name, count + 1);
  });

  // Find duplicates
  nameCount.forEach((count, name) => {
    if (count > 1) {
      errors.push({
        field: 'columns',
        message: `${VALIDATION_MESSAGES.COLUMN_NAME_DUPLICATE}: "${name}"`,
        severity: 'warning',
      });
    }
  });

  return errors;
}

/**
 * Validate file configuration
 * @param config - File configuration
 * @returns Validation result
 */
export function validateFileConfig(config: FileConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate total rows (if not using file size mode)
  if (!config.useFileSize) {
    const rowsError = validateTotalRows(config.totalRows);
    if (rowsError) {
      if (rowsError.severity === 'error') {
        errors.push(rowsError);
      } else {
        warnings.push(rowsError);
      }
    }

    // Warning for large row counts
    if (config.totalRows > VALIDATION_LIMITS.WARNING_ROWS) {
      warnings.push({
        field: 'totalRows',
        message: VALIDATION_MESSAGES.LARGE_ROWS_WARNING,
        severity: 'warning',
      });
    }
  }

  // Validate target file size (if using file size mode)
  if (config.useFileSize) {
    const sizeError = validateTargetFileSize(config.targetFileSize);
    if (sizeError) {
      if (sizeError.severity === 'error') {
        errors.push(sizeError);
      } else {
        warnings.push(sizeError);
      }
    }

    // Warning for large file sizes
    if (config.targetFileSize > 500) {
      warnings.push({
        field: 'targetFileSize',
        message: VALIDATION_MESSAGES.LARGE_FILE_WARNING,
        severity: 'warning',
      });
    }
  }

  // Validate header lines
  const headerError = validateHeaderLines(config.headerLines);
  if (headerError) {
    if (headerError.severity === 'error') {
      errors.push(headerError);
    } else {
      warnings.push(headerError);
    }
  }

  // Validate footer lines
  const footerError = validateFooterLines(config.footerLines);
  if (footerError) {
    if (footerError.severity === 'error') {
      errors.push(footerError);
    } else {
      warnings.push(footerError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate format configuration
 * @param config - Format configuration
 * @returns Validation result
 */
export function validateFormatConfig(config: FormatConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate escape character
  const escapeError = validateEscapeChar(config.escapeChar);
  if (escapeError) {
    if (escapeError.severity === 'error') {
      errors.push(escapeError);
    } else {
      warnings.push(escapeError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate columns configuration
 * @param columns - Array of columns
 * @returns Validation result
 */
export function validateColumns(columns: Column[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check minimum columns
  if (columns.length < VALIDATION_LIMITS.MIN_COLUMNS) {
    errors.push({
      field: 'columns',
      message: VALIDATION_MESSAGES.MIN_COLUMNS_REQUIRED,
      severity: 'error',
    });
  }

  // Validate each column name
  columns.forEach((col, index) => {
    const nameError = validateColumnName(col.name);
    if (nameError) {
      const error = {
        ...nameError,
        field: `column-${index}-name`,
      };

      if (error.severity === 'error') {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    }
  });

  // Check for duplicates
  const duplicateErrors = validateDuplicateColumns(columns);
  warnings.push(...duplicateErrors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate complete CSV configuration
 * @param fileConfig - File configuration
 * @param formatConfig - Format configuration
 * @param columns - Columns configuration
 * @returns Validation result
 */
export function validateCSVConfig(
  fileConfig: FileConfig,
  formatConfig: FormatConfig,
  columns: Column[]
): ValidationResult {
  const fileValidation = validateFileConfig(fileConfig);
  const formatValidation = validateFormatConfig(formatConfig);
  const columnsValidation = validateColumns(columns);

  const allErrors = [
    ...fileValidation.errors,
    ...formatValidation.errors,
    ...columnsValidation.errors,
  ];

  const allWarnings = [
    ...fileValidation.warnings,
    ...formatValidation.warnings,
    ...columnsValidation.warnings,
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
```

### 2. Create Validation Helpers

Create `src/lib/validationHelpers.ts`:

```typescript
import { ValidationError, ValidationResult } from '@/types';

/**
 * Check if validation result has errors
 * @param result - Validation result
 * @returns true if has errors
 */
export function hasErrors(result: ValidationResult): boolean {
  return result.errors.length > 0;
}

/**
 * Check if validation result has warnings
 * @param result - Validation result
 * @returns true if has warnings
 */
export function hasWarnings(result: ValidationResult): boolean {
  return result.warnings.length > 0;
}

/**
 * Get error message for a specific field
 * @param result - Validation result
 * @param field - Field name
 * @returns Error message or null
 */
export function getFieldError(
  result: ValidationResult,
  field: string
): string | null {
  const error = result.errors.find((e) => e.field === field);
  return error ? error.message : null;
}

/**
 * Get warning message for a specific field
 * @param result - Validation result
 * @param field - Field name
 * @returns Warning message or null
 */
export function getFieldWarning(
  result: ValidationResult,
  field: string
): string | null {
  const warning = result.warnings.find((w) => w.field === field);
  return warning ? warning.message : null;
}

/**
 * Check if a specific field has errors
 * @param result - Validation result
 * @param field - Field name
 * @returns true if field has errors
 */
export function hasFieldError(
  result: ValidationResult,
  field: string
): boolean {
  return result.errors.some((e) => e.field === field);
}

/**
 * Get all error messages as array
 * @param result - Validation result
 * @returns Array of error messages
 */
export function getErrorMessages(result: ValidationResult): string[] {
  return result.errors.map((e) => e.message);
}

/**
 * Get all warning messages as array
 * @param result - Validation result
 * @returns Array of warning messages
 */
export function getWarningMessages(result: ValidationResult): string[] {
  return result.warnings.map((w) => w.message);
}

/**
 * Merge multiple validation results
 * @param results - Array of validation results
 * @returns Merged validation result
 */
export function mergeValidationResults(
  results: ValidationResult[]
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  results.forEach((result) => {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Format validation errors for display
 * @param errors - Array of validation errors
 * @returns Formatted string
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  return errors.map((error) => `• ${error.message}`).join('\n');
}

/**
 * Create validation error object
 * @param field - Field name
 * @param message - Error message
 * @param severity - Error severity
 * @returns Validation error
 */
export function createValidationError(
  field: string,
  message: string,
  severity: 'error' | 'warning' = 'error'
): ValidationError {
  return { field, message, severity };
}
```

### 3. Create Input Sanitizers

Create `src/lib/sanitizers.ts`:

```typescript
/**
 * Sanitize numeric input
 * @param value - Input value
 * @param defaultValue - Default value if invalid
 * @returns Sanitized number
 */
export function sanitizeNumber(
  value: string | number,
  defaultValue: number = 0
): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
}

/**
 * Sanitize integer input
 * @param value - Input value
 * @param defaultValue - Default value if invalid
 * @returns Sanitized integer
 */
export function sanitizeInteger(
  value: string | number,
  defaultValue: number = 0
): number {
  const num = sanitizeNumber(value, defaultValue);
  return Math.floor(num);
}

/**
 * Clamp number between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sanitize column name
 * @param name - Column name
 * @returns Sanitized name
 */
export function sanitizeColumnName(name: string): string {
  // Trim whitespace
  let sanitized = name.trim();

  // Replace spaces with underscores
  sanitized = sanitized.replace(/\s+/g, '_');

  // Remove non-alphanumeric characters except underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');

  // Ensure it starts with a letter or underscore
  if (!/^[a-zA-Z_]/.test(sanitized)) {
    sanitized = '_' + sanitized;
  }

  return sanitized || 'column';
}

/**
 * Sanitize escape character
 * @param char - Escape character
 * @returns Sanitized character (single char or empty)
 */
export function sanitizeEscapeChar(char: string): string {
  if (!char) return '';
  return char.charAt(0);
}

/**
 * Ensure positive number
 * @param value - Input value
 * @param defaultValue - Default value if not positive
 * @returns Positive number
 */
export function ensurePositive(
  value: number,
  defaultValue: number = 1
): number {
  return value > 0 ? value : defaultValue;
}

/**
 * Ensure non-negative number
 * @param value - Input value
 * @param defaultValue - Default value if negative
 * @returns Non-negative number
 */
export function ensureNonNegative(
  value: number,
  defaultValue: number = 0
): number {
  return value >= 0 ? value : defaultValue;
}
```

## Testing This Step

### 1. Unit Tests

Create `src/lib/__tests__/validators.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  validateTotalRows,
  validateTargetFileSize,
  validateColumnName,
  validateDuplicateColumns,
  validateCSVConfig,
} from '../validators';
import {
  DEFAULT_FILE_CONFIG,
  DEFAULT_FORMAT_CONFIG,
  Column,
  DataType,
} from '@/types';

describe('Validators', () => {
  describe('validateTotalRows', () => {
    it('should pass for valid row count', () => {
      expect(validateTotalRows(100)).toBeNull();
    });

    it('should fail for zero rows', () => {
      const error = validateTotalRows(0);
      expect(error).not.toBeNull();
      expect(error?.severity).toBe('error');
    });

    it('should fail for negative rows', () => {
      const error = validateTotalRows(-10);
      expect(error).not.toBeNull();
    });

    it('should fail for too many rows', () => {
      const error = validateTotalRows(2000000);
      expect(error).not.toBeNull();
    });
  });

  describe('validateColumnName', () => {
    it('should pass for valid name', () => {
      expect(validateColumnName('column_name')).toBeNull();
    });

    it('should fail for empty name', () => {
      const error = validateColumnName('');
      expect(error).not.toBeNull();
      expect(error?.severity).toBe('error');
    });

    it('should warn for invalid characters', () => {
      const error = validateColumnName('column-name!');
      expect(error).not.toBeNull();
      expect(error?.severity).toBe('warning');
    });
  });

  describe('validateDuplicateColumns', () => {
    it('should detect duplicate names', () => {
      const columns: Column[] = [
        { id: 1, name: 'id', dataType: DataType.Integer },
        { id: 2, name: 'name', dataType: DataType.String },
        { id: 3, name: 'id', dataType: DataType.Integer },
      ];

      const errors = validateDuplicateColumns(columns);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass for unique names', () => {
      const columns: Column[] = [
        { id: 1, name: 'id', dataType: DataType.Integer },
        { id: 2, name: 'name', dataType: DataType.String },
        { id: 3, name: 'email', dataType: DataType.Email },
      ];

      const errors = validateDuplicateColumns(columns);
      expect(errors.length).toBe(0);
    });
  });
});
```

### 2. Integration Test

Test validation in the UI (add to `src/app/page.tsx`):

```typescript
'use client';

import { useState } from 'react';
import { validateTotalRows, validateColumnName } from '@/lib/validators';

export default function Home() {
  const [rows, setRows] = useState('100');
  const [columnName, setColumnName] = useState('');

  const rowsError = validateTotalRows(parseInt(rows));
  const nameError = validateColumnName(columnName);

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-4'>
            Validation Test
          </h1>

          <div className='space-y-4'>
            <div>
              <label className='block mb-2'>Total Rows</label>
              <input
                type='number'
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                className='border px-3 py-2 rounded'
              />
              {rowsError && (
                <p className='text-red-600 text-sm mt-1'>{rowsError.message}</p>
              )}
            </div>

            <div>
              <label className='block mb-2'>Column Name</label>
              <input
                type='text'
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className='border px-3 py-2 rounded'
              />
              {nameError && (
                <p
                  className={`text-sm mt-1 ${
                    nameError.severity === 'error'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {nameError.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

## Common Issues & Solutions

### Issue: Validation too strict

**Solution**: Use warnings instead of errors for non-critical issues.

### Issue: Validation messages not clear

**Solution**: Update messages in `constants/messages.ts` to be more descriptive.

### Issue: Performance with real-time validation

**Solution**: Debounce validation calls for text inputs.

## File Checklist

After completing this step, you should have:

- ✅ `src/lib/validators.ts` with validation functions
- ✅ `src/lib/validationHelpers.ts` with helper utilities
- ✅ `src/lib/sanitizers.ts` with input sanitizers
- ✅ All tests passing
- ✅ Validation working in UI

## Next Steps

Proceed to **Step 07: Download Helper** where you'll:

- Implement file download functionality
- Handle different browsers
- Add filename generation
- Create download error handling

---

**Status**: ✅ Validation system complete, ready for download helper
