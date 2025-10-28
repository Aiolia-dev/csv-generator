import { DataType, Delimiter, Encoding, LineEnding, QuoteChar } from '@/types';

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
