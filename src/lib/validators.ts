import { estimateFileSize } from '@/lib/fileSizeCalculator';

import { VALIDATION_MESSAGES } from '@/constants/messages';

import {
  Column,
  CSVConfig,
  FileConfig,
  FormatConfig,
  PERFORMANCE_THRESHOLDS,
  VALIDATION_LIMITS,
  ValidationError,
  ValidationResult,
} from '@/types';

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
 * Validate columns array
 * @param columns - Array of columns
 * @returns Validation errors
 */
export function validateColumns(columns: Column[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check minimum columns
  if (columns.length < VALIDATION_LIMITS.MIN_COLUMNS) {
    errors.push({
      field: 'columns',
      message: VALIDATION_MESSAGES.MIN_COLUMNS_REQUIRED,
      severity: 'error',
    });
    return errors;
  }

  // Check maximum columns
  if (columns.length > VALIDATION_LIMITS.MAX_COLUMNS) {
    errors.push({
      field: 'columns',
      message: `Maximum ${VALIDATION_LIMITS.MAX_COLUMNS} columns allowed`,
      severity: 'error',
    });
  }

  // Check for duplicate names
  const names = columns.map((col) => col.name.toLowerCase());
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );

  if (duplicates.length > 0) {
    errors.push({
      field: 'columns',
      message: VALIDATION_MESSAGES.COLUMN_NAME_DUPLICATE,
      severity: 'error',
    });
  }

  // Validate each column name
  for (const column of columns) {
    const nameError = validateColumnName(column.name);
    if (nameError) {
      errors.push(nameError);
    }
  }

  return errors;
}

/**
 * Validate file configuration
 * @param fileConfig - File configuration
 * @returns Validation errors
 */
export function validateFileConfig(fileConfig: FileConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate based on mode
  if (fileConfig.useFileSize) {
    const fileSizeError = validateTargetFileSize(fileConfig.targetFileSize);
    if (fileSizeError) {
      errors.push(fileSizeError);
    }
  } else {
    const rowsError = validateTotalRows(fileConfig.totalRows);
    if (rowsError) {
      errors.push(rowsError);
    }
  }

  // Validate header lines
  const headerError = validateHeaderLines(fileConfig.headerLines);
  if (headerError) {
    errors.push(headerError);
  }

  // Validate footer lines
  const footerError = validateFooterLines(fileConfig.footerLines);
  if (footerError) {
    errors.push(footerError);
  }

  return errors;
}

/**
 * Validate format configuration
 * @param formatConfig - Format configuration
 * @returns Validation errors
 */
export function validateFormatConfig(
  formatConfig: FormatConfig
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate escape character
  const escapeError = validateEscapeChar(formatConfig.escapeChar);
  if (escapeError) {
    errors.push(escapeError);
  }

  return errors;
}

/**
 * Validate complete CSV configuration
 * @param config - Complete CSV configuration
 * @returns Validation result
 */
export function validateCSVConfig(config: CSVConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate file config
  errors.push(...validateFileConfig(config.file));

  // Validate format config
  errors.push(...validateFormatConfig(config.format));

  // Validate columns
  errors.push(...validateColumns(config.columns));

  // Validate estimated file size doesn't exceed maximum
  if (config.columns.length > 0) {
    const rowsToGenerate =
      config.file.useFileSize && config.file.targetFileSize > 0
        ? config.file.totalRows // Will be calculated later, but validate target size
        : config.file.totalRows;

    const estimatedSize = estimateFileSize(
      config.columns,
      rowsToGenerate,
      config.file.headerLines,
      config.file.footerLines,
      config.format
    );

    if (
      estimatedSize &&
      estimatedSize.megabytes > VALIDATION_LIMITS.MAX_FILE_SIZE
    ) {
      errors.push({
        field: config.file.useFileSize ? 'targetFileSize' : 'totalRows',
        message: `Estimated file size (${
          estimatedSize.formatted
        }) exceeds maximum allowed (${
          VALIDATION_LIMITS.MAX_FILE_SIZE
        } MB). Please reduce the ${
          config.file.useFileSize ? 'target file size' : 'number of rows'
        }.`,
        severity: 'error',
      });
    }
  }

  // Performance warnings
  if (config.file.totalRows > PERFORMANCE_THRESHOLDS.WARNING_ROWS) {
    warnings.push({
      field: 'totalRows',
      message: VALIDATION_MESSAGES.LARGE_ROWS_WARNING,
      severity: 'warning',
    });
  }

  // Separate errors and warnings
  const actualErrors = errors.filter((e) => e.severity === 'error');
  const actualWarnings = [
    ...warnings,
    ...errors.filter((e) => e.severity === 'warning'),
  ];

  return {
    isValid: actualErrors.length === 0,
    errors: actualErrors,
    warnings: actualWarnings,
  };
}

/**
 * Check if configuration is ready for generation
 * @param config - CSV configuration
 * @returns true if ready
 */
export function isConfigurationReady(config: CSVConfig): boolean {
  const validation = validateCSVConfig(config);
  return validation.isValid && config.columns.length > 0;
}
