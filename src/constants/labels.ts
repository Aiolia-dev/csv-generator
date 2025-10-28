import { DataType, Delimiter, Encoding, LineEnding, QuoteChar } from '@/types';

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
