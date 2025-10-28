# Step 02: Type Definitions & Interfaces

## Overview

Define all TypeScript types, interfaces, and enums that will be used throughout the application. This establishes type safety and provides clear contracts for data structures.

## What You'll Build

- Core data type interfaces
- Configuration type definitions
- Enum definitions for options
- Utility types for type safety
- Constants with proper typing

## Prerequisites

- Step 01 completed (project setup)
- TypeScript configured with strict mode

## Implementation Steps

### 1. Create Core Type Definitions

Create `src/types/index.ts`:

```typescript
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
```

### 2. Create Display Label Mappings

Create `src/constants/labels.ts`:

```typescript
import { DataType, Delimiter, QuoteChar, LineEnding, Encoding } from '@/types';

/**
 * Human-readable labels for data types
 */
export const DATA_TYPE_LABELS: Record<DataType, string> = {
  [DataType.Integer]: 'Integer',
  [DataType.Float]: 'Float',
  [DataType.Boolean]: 'Boolean',
  [DataType.String]: 'String',
  [DataType.Date]: 'Date',
  [DataType.DateTime]: 'DateTime',
  [DataType.Email]: 'Email',
  [DataType.Phone]: 'Phone',
  [DataType.UUID]: 'UUID',
};

/**
 * Descriptions for data types
 */
export const DATA_TYPE_DESCRIPTIONS: Record<DataType, string> = {
  [DataType.Integer]: 'Whole numbers (e.g., 42, 1337, 999)',
  [DataType.Float]: 'Decimal numbers (e.g., 3.14, 99.99, 0.01)',
  [DataType.Boolean]: 'True/false values',
  [DataType.String]: 'Text data (lorem ipsum based)',
  [DataType.Date]: 'Date values (YYYY-MM-DD format)',
  [DataType.DateTime]: 'Date and time values (ISO 8601 format)',
  [DataType.Email]: 'Valid email addresses',
  [DataType.Phone]: 'Phone numbers in various formats',
  [DataType.UUID]: 'Universally unique identifiers (v4)',
};

/**
 * Human-readable labels for delimiters
 */
export const DELIMITER_LABELS: Record<Delimiter, string> = {
  [Delimiter.Comma]: 'Comma (,)',
  [Delimiter.Semicolon]: 'Semicolon (;)',
  [Delimiter.Tab]: 'Tab',
  [Delimiter.Pipe]: 'Pipe (|)',
};

/**
 * Human-readable labels for quote characters
 */
export const QUOTE_CHAR_LABELS: Record<QuoteChar, string> = {
  [QuoteChar.DoubleQuote]: 'Double Quote (")',
  [QuoteChar.SingleQuote]: "Single Quote (')",
  [QuoteChar.None]: 'None',
};

/**
 * Human-readable labels for line endings
 */
export const LINE_ENDING_LABELS: Record<LineEnding, string> = {
  [LineEnding.LF]: 'LF (Unix)',
  [LineEnding.CRLF]: 'CRLF (Windows)',
  [LineEnding.CR]: 'CR (Old Mac)',
};

/**
 * Human-readable labels for encodings
 */
export const ENCODING_LABELS: Record<Encoding, string> = {
  [Encoding.UTF8]: 'UTF-8',
  [Encoding.UTF16]: 'UTF-16',
  [Encoding.ASCII]: 'ASCII',
  [Encoding.ISO88591]: 'ISO-8859-1 (Latin-1)',
};
```

### 3. Create Validation Messages

Create `src/constants/messages.ts`:

```typescript
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
```

### 4. Create Type Guards

Create `src/utils/typeGuards.ts`:

```typescript
import { DataType, Delimiter, QuoteChar, LineEnding, Encoding } from '@/types';

/**
 * Type guard to check if value is a valid DataType
 */
export function isDataType(value: unknown): value is DataType {
  return Object.values(DataType).includes(value as DataType);
}

/**
 * Type guard to check if value is a valid Delimiter
 */
export function isDelimiter(value: unknown): value is Delimiter {
  return Object.values(Delimiter).includes(value as Delimiter);
}

/**
 * Type guard to check if value is a valid QuoteChar
 */
export function isQuoteChar(value: unknown): value is QuoteChar {
  return Object.values(QuoteChar).includes(value as QuoteChar);
}

/**
 * Type guard to check if value is a valid LineEnding
 */
export function isLineEnding(value: unknown): value is LineEnding {
  return Object.values(LineEnding).includes(value as LineEnding);
}

/**
 * Type guard to check if value is a valid Encoding
 */
export function isEncoding(value: unknown): value is Encoding {
  return Object.values(Encoding).includes(value as Encoding);
}

/**
 * Type guard to check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Type guard to check if value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}
```

## Testing This Step

### 1. Type Check

Run TypeScript compiler:

```bash
pnpm type-check
```

Should complete with no errors.

### 2. Import Test

Create a test file `src/test-types.ts`:

```typescript
import {
  DataType,
  Delimiter,
  Column,
  FileConfig,
  FormatConfig,
  DEFAULT_FILE_CONFIG,
  DEFAULT_FORMAT_CONFIG,
  DEFAULT_COLUMNS,
} from '@/types';

// Test type usage
const testColumn: Column = {
  id: 1,
  name: 'test',
  dataType: DataType.String,
};

const testFileConfig: FileConfig = DEFAULT_FILE_CONFIG;
const testFormatConfig: FormatConfig = DEFAULT_FORMAT_CONFIG;
const testColumns: Column[] = DEFAULT_COLUMNS;

console.log('Types imported successfully');
```

Run:

```bash
pnpm type-check
```

Delete `src/test-types.ts` after verification.

### 3. Verify Enums

All enum values should be accessible and type-safe:

```typescript
// This should work
const delimiter: Delimiter = Delimiter.Comma;

// This should cause a TypeScript error
const invalid: Delimiter = 'invalid'; // ❌ Type error
```

## Common Issues & Solutions

### Issue: Cannot find module '@/types'

**Solution**: Ensure `tsconfig.json` has the correct path mapping and restart your IDE.

### Issue: Enum values not working

**Solution**: Make sure you're using the enum correctly:

```typescript
// ✅ Correct
const delimiter = Delimiter.Comma;

// ❌ Incorrect
const delimiter = 'Comma';
```

### Issue: Type errors in constants

**Solution**: Ensure all constant objects match their interface definitions exactly.

## File Checklist

After completing this step, you should have:

- ✅ `src/types/index.ts` with all type definitions
- ✅ `src/constants/labels.ts` with display labels
- ✅ `src/constants/messages.ts` with validation messages
- ✅ `src/utils/typeGuards.ts` with type guard functions
- ✅ All files pass `pnpm type-check`

## Next Steps

Proceed to **Step 03: Project Structure & Architecture** where you'll:

- Set up the component architecture
- Create utility function structure
- Establish coding patterns
- Set up hooks structure

## Additional Resources

- [TypeScript Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Const Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)

---

**Status**: ✅ Type system established, ready for architecture setup
