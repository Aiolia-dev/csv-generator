/**
 * Core Type Definitions for CSV Generator
 */

// ============================================================================
// Data Types
// ============================================================================

/**
 * Supported data types for CSV column generation
 */
export enum DataType {
  Integer = 'Integer',
  Float = 'Float',
  Boolean = 'Boolean',
  String = 'String',
  Date = 'Date',
  DateTime = 'DateTime',
  Email = 'Email',
  Phone = 'Phone',
  UUID = 'UUID',
}

/**
 * Array of all data types for iteration
 */
export const DATA_TYPES = Object.values(DataType);

// ============================================================================
// CSV Format Options
// ============================================================================

/**
 * Delimiter options for CSV fields
 */
export enum Delimiter {
  Comma = ',',
  Semicolon = ';',
  Tab = '\t',
  Pipe = '|',
}

/**
 * Quote character options
 */
export enum QuoteChar {
  DoubleQuote = '"',
  SingleQuote = "'",
  None = '',
}

/**
 * Line ending options
 */
export enum LineEnding {
  LF = '\n', // Unix
  CRLF = '\r\n', // Windows
  CR = '\r', // Old Mac
}

/**
 * File encoding options
 */
export enum Encoding {
  UTF8 = 'UTF-8',
  UTF16 = 'UTF-16',
  ASCII = 'ASCII',
  ISO88591 = 'ISO-8859-1',
}

// ============================================================================
// Column Configuration
// ============================================================================

/**
 * Column definition interface
 */
export interface Column {
  /** Unique identifier for the column */
  id: number;
  /** Column name (used as header) */
  name: string;
  /** Data type for this column */
  dataType: DataType;
}

/**
 * Column input validation result
 */
export interface ColumnValidation {
  /** Whether the column is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Warning message (non-blocking) */
  warning?: string;
}

// ============================================================================
// File Configuration
// ============================================================================

/**
 * File structure configuration
 */
export interface FileConfig {
  /** Number of data rows to generate */
  totalRows: number;
  /** Number of header lines */
  headerLines: number;
  /** Number of footer lines */
  footerLines: number;
  /** Target file size in MB (optional) */
  targetFileSize: number;
  /** Whether to use file size mode */
  useFileSize: boolean;
}

/**
 * CSV format configuration
 */
export interface FormatConfig {
  /** Field delimiter */
  delimiter: Delimiter;
  /** Quote character */
  quoteChar: QuoteChar;
  /** Escape character */
  escapeChar: string;
  /** Line ending style */
  lineEnding: LineEnding;
  /** File encoding */
  encoding: Encoding;
  /** Whether to quote all fields */
  quoteAll: boolean;
}

/**
 * Complete CSV generation configuration
 */
export interface CSVConfig {
  /** File structure settings */
  file: FileConfig;
  /** Format settings */
  format: FormatConfig;
  /** Column definitions */
  columns: Column[];
}

// ============================================================================
// Generation & Output
// ============================================================================

/**
 * File size estimation result
 */
export interface FileSizeEstimate {
  /** Estimated size in bytes */
  bytes: number;
  /** Estimated size in KB */
  kilobytes: number;
  /** Estimated size in MB */
  megabytes: number;
  /** Human-readable size string */
  formatted: string;
}

/**
 * CSV generation progress
 */
export interface GenerationProgress {
  /** Current row being generated */
  currentRow: number;
  /** Total rows to generate */
  totalRows: number;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Whether generation is complete */
  isComplete: boolean;
  /** Error if generation failed */
  error?: string;
}

/**
 * CSV generation result
 */
export interface GenerationResult {
  /** Generated CSV content */
  content: string;
  /** Actual file size */
  size: FileSizeEstimate;
  /** Number of rows generated */
  rowCount: number;
  /** Generation time in milliseconds */
  generationTime: number;
  /** Whether generation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation error
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Error severity */
  severity: 'error' | 'warning';
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  /** Whether configuration is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
  /** List of warnings (non-blocking) */
  warnings: ValidationError[];
}

// ============================================================================
// Preview
// ============================================================================

/**
 * Preview configuration
 */
export interface PreviewConfig {
  /** Number of rows to preview */
  rowCount: number;
  /** Whether to include header */
  includeHeader: boolean;
  /** Whether to include footer */
  includeFooter: boolean;
}

/**
 * Preview result
 */
export interface PreviewResult {
  /** Preview CSV content */
  content: string;
  /** Number of rows in preview */
  rowCount: number;
  /** Whether preview generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// UI State
// ============================================================================

/**
 * Application state
 */
export interface AppState {
  /** File configuration */
  fileConfig: FileConfig;
  /** Format configuration */
  formatConfig: FormatConfig;
  /** Column definitions */
  columns: Column[];
  /** Next column ID */
  nextColumnId: number;
  /** Whether preview modal is open */
  isPreviewOpen: boolean;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Generation progress */
  progress: GenerationProgress | null;
  /** Validation errors */
  validationErrors: ValidationError[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract keys from enum
 */
export type EnumKeys<T> = keyof T;

/**
 * Extract values from enum
 */
export type EnumValues<T> = T[keyof T];

/**
 * Function type for data generators
 */
export type DataGenerator = () => string | number | boolean;

/**
 * Map of data types to generator functions
 */
export type DataGeneratorMap = {
  [key in DataType]: DataGenerator;
};

// ============================================================================
// Constants
// ============================================================================

/**
 * Default file configuration
 */
export const DEFAULT_FILE_CONFIG: FileConfig = {
  totalRows: 100,
  headerLines: 1,
  footerLines: 0,
  targetFileSize: 0,
  useFileSize: false,
};

/**
 * Default format configuration
 */
export const DEFAULT_FORMAT_CONFIG: FormatConfig = {
  delimiter: Delimiter.Comma,
  quoteChar: QuoteChar.DoubleQuote,
  escapeChar: '\\',
  lineEnding: LineEnding.LF,
  encoding: Encoding.UTF8,
  quoteAll: false,
};

/**
 * Default columns
 */
export const DEFAULT_COLUMNS: Column[] = [
  { id: 1, name: 'id', dataType: DataType.Integer },
  { id: 2, name: 'name', dataType: DataType.String },
  { id: 3, name: 'email', dataType: DataType.Email },
];

/**
 * Validation limits
 */
export const VALIDATION_LIMITS = {
  MIN_ROWS: 1,
  MAX_ROWS: 1_000_000,
  MIN_FILE_SIZE: 0.01,
  MAX_FILE_SIZE: 1000,
  MIN_HEADER_LINES: 0,
  MAX_HEADER_LINES: 100,
  MIN_FOOTER_LINES: 0,
  MAX_FOOTER_LINES: 100,
  MAX_ESCAPE_CHAR_LENGTH: 1,
  MIN_COLUMNS: 1,
  MAX_COLUMNS: 1000,
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  SMALL_FILE_MB: 10,
  MEDIUM_FILE_MB: 100,
  LARGE_FILE_MB: 500,
  CHUNK_SIZE: 10_000,
  WARNING_ROWS: 500_000,
  WARNING_FILE_SIZE_MB: 500,
} as const;

/**
 * Average data lengths for size estimation (in characters)
 */
export const AVERAGE_DATA_LENGTHS: Record<DataType, number> = {
  [DataType.Integer]: 6,
  [DataType.Float]: 8,
  [DataType.Boolean]: 5,
  [DataType.String]: 30,
  [DataType.Date]: 10,
  [DataType.DateTime]: 24,
  [DataType.Email]: 25,
  [DataType.Phone]: 15,
  [DataType.UUID]: 36,
};
