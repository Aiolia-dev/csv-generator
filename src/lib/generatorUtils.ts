import { AVERAGE_DATA_LENGTHS, DataType } from '@/types';

/**
 * Get average data length for a data type
 * @param dataType - The data type
 * @returns Average length in characters
 */
export function getAverageDataLength(dataType: DataType): number {
  return AVERAGE_DATA_LENGTHS[dataType] || 20;
}

/**
 * Estimate total data length for a row
 * @param dataTypes - Array of data types in the row
 * @returns Estimated length in characters
 */
export function estimateRowLength(dataTypes: DataType[]): number {
  return dataTypes.reduce((total, dataType) => {
    return total + getAverageDataLength(dataType);
  }, 0);
}

/**
 * Format generated value to string
 * @param value - The value to format
 * @returns Formatted string
 */
export function formatGeneratedValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
}

/**
 * Validate generated value
 * @param value - The value to validate
 * @param dataType - Expected data type
 * @returns true if valid
 */
export function validateGeneratedValue(
  value: string | number | boolean,
  dataType: DataType
): boolean {
  switch (dataType) {
    case DataType.Integer:
      return typeof value === 'number' && Number.isInteger(value);

    case DataType.Float:
      return typeof value === 'number' && !Number.isNaN(value);

    case DataType.Boolean:
      return typeof value === 'boolean';

    case DataType.String:
      return typeof value === 'string' && value.length > 0;

    case DataType.Date:
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

    case DataType.DateTime:
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value);

    case DataType.Email:
      return typeof value === 'string' && value.includes('@');

    case DataType.Phone:
      return typeof value === 'string' && value.length > 0;

    case DataType.UUID:
      return (
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value
        )
      );

    default:
      return false;
  }
}
