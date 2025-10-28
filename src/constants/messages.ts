import { VALIDATION_LIMITS } from '@/types';

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  TOTAL_ROWS_REQUIRED: 'Total rows is required',
  TOTAL_ROWS_MIN: `Total rows must be at least ${VALIDATION_LIMITS.MIN_ROWS}`,
  TOTAL_ROWS_MAX: `Total rows must not exceed ${VALIDATION_LIMITS.MAX_ROWS.toLocaleString()}`,

  FILE_SIZE_REQUIRED: 'Target file size is required',
  FILE_SIZE_MIN: `File size must be at least ${VALIDATION_LIMITS.MIN_FILE_SIZE} MB`,
  FILE_SIZE_MAX: `File size must not exceed ${VALIDATION_LIMITS.MAX_FILE_SIZE} MB`,

  HEADER_LINES_MIN: `Header lines must be at least ${VALIDATION_LIMITS.MIN_HEADER_LINES}`,
  HEADER_LINES_MAX: `Header lines must not exceed ${VALIDATION_LIMITS.MAX_HEADER_LINES}`,

  FOOTER_LINES_MIN: `Footer lines must be at least ${VALIDATION_LIMITS.MIN_FOOTER_LINES}`,
  FOOTER_LINES_MAX: `Footer lines must not exceed ${VALIDATION_LIMITS.MAX_FOOTER_LINES}`,

  COLUMN_NAME_REQUIRED: 'Column name is required',
  COLUMN_NAME_DUPLICATE: 'Duplicate column name detected',
  COLUMN_NAME_INVALID:
    'Column name should contain only alphanumeric characters and underscores',

  ESCAPE_CHAR_LENGTH: `Escape character must be a single character or empty`,

  MIN_COLUMNS_REQUIRED: `At least ${VALIDATION_LIMITS.MIN_COLUMNS} column is required`,

  LARGE_FILE_WARNING:
    'Generating large files may take significant time and memory',
  LARGE_ROWS_WARNING: 'Generating many rows may impact browser performance',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CSV_GENERATED: 'CSV file generated successfully',
  PREVIEW_GENERATED: 'Preview generated successfully',
  COLUMN_ADDED: 'Column added',
  COLUMN_REMOVED: 'Column removed',
  CONFIG_RESET: 'Configuration reset to defaults',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  GENERATION_FAILED: 'Failed to generate CSV file',
  PREVIEW_FAILED: 'Failed to generate preview',
  DOWNLOAD_FAILED: 'Failed to download file',
  INVALID_CONFIG: 'Invalid configuration',
  BROWSER_NOT_SUPPORTED: 'Your browser does not support file downloads',
  MEMORY_ERROR: 'Insufficient memory to generate file',
} as const;
