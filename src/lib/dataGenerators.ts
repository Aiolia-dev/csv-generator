import { faker } from '@faker-js/faker';

import { DataGeneratorMap, DataType } from '@/types';

/**
 * Generate random integer
 */
function generateInteger(): number {
  return faker.number.int({ min: 1, max: 10000 });
}

/**
 * Generate random float
 */
function generateFloat(): number {
  return faker.number.float({
    min: 0,
    max: 10000,
    fractionDigits: 2,
  });
}

/**
 * Generate random boolean
 */
function generateBoolean(): boolean {
  return faker.datatype.boolean();
}

/**
 * Generate random string (lorem ipsum sentence)
 */
function generateString(): string {
  return faker.lorem.sentence({ min: 3, max: 10 });
}

/**
 * Generate random date (YYYY-MM-DD format)
 */
function generateDate(): string {
  const date = faker.date.between({
    from: '2020-01-01',
    to: '2025-12-31',
  });
  return date.toISOString().split('T')[0];
}

/**
 * Generate random datetime (ISO 8601 format)
 */
function generateDateTime(): string {
  const date = faker.date.between({
    from: '2020-01-01',
    to: '2025-12-31',
  });
  return date.toISOString();
}

/**
 * Generate random email address
 */
function generateEmail(): string {
  return faker.internet.email();
}

/**
 * Generate random phone number
 */
function generatePhone(): string {
  return faker.phone.number();
}

/**
 * Generate random UUID (v4)
 */
function generateUUID(): string {
  return faker.string.uuid();
}

/**
 * Map of data types to generator functions
 */
export const dataGenerators: DataGeneratorMap = {
  [DataType.Integer]: generateInteger,
  [DataType.Float]: generateFloat,
  [DataType.Boolean]: generateBoolean,
  [DataType.String]: generateString,
  [DataType.Date]: generateDate,
  [DataType.DateTime]: generateDateTime,
  [DataType.Email]: generateEmail,
  [DataType.Phone]: generatePhone,
  [DataType.UUID]: generateUUID,
};

/**
 * Generate data for a specific data type
 * @param dataType - The data type to generate
 * @returns Generated value as string, number, or boolean
 */
export function generateDataForType(
  dataType: DataType
): string | number | boolean {
  const generator = dataGenerators[dataType];

  if (!generator) {
    throw new Error(`No generator found for data type: ${dataType}`);
  }

  try {
    return generator();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error generating data for type ${dataType}:`, error);
    return getFallbackValue(dataType);
  }
}

/**
 * Fallback values if Faker.js fails
 */
function getFallbackValue(dataType: DataType): string | number | boolean {
  switch (dataType) {
    case DataType.Integer:
      return Math.floor(Math.random() * 10000);
    case DataType.Float:
      return Math.round(Math.random() * 10000 * 100) / 100;
    case DataType.Boolean:
      return Math.random() > 0.5;
    case DataType.String:
      return 'Sample text';
    case DataType.Date:
      return new Date().toISOString().split('T')[0];
    case DataType.DateTime:
      return new Date().toISOString();
    case DataType.Email:
      return 'user@example.com';
    case DataType.Phone:
      return '+1-555-0100';
    case DataType.UUID:
      return '00000000-0000-0000-0000-000000000000';
    default:
      return '';
  }
}

/**
 * Generate a sample row of data
 * @param dataTypes - Array of data types for each column
 * @returns Array of generated values
 */
export function generateSampleRow(
  dataTypes: DataType[]
): (string | number | boolean)[] {
  return dataTypes.map((dataType) => generateDataForType(dataType));
}

/**
 * Generate multiple rows of data
 * @param dataTypes - Array of data types for each column
 * @param rowCount - Number of rows to generate
 * @returns 2D array of generated values
 */
export function generateMultipleRows(
  dataTypes: DataType[],
  rowCount: number
): (string | number | boolean)[][] {
  const rows: (string | number | boolean)[][] = [];

  for (let i = 0; i < rowCount; i++) {
    rows.push(generateSampleRow(dataTypes));
  }

  return rows;
}

/**
 * Set Faker.js seed for reproducible data
 * @param seed - Seed value
 */
export function setGeneratorSeed(seed: number): void {
  faker.seed(seed);
}

/**
 * Reset Faker.js seed to random
 */
export function resetGeneratorSeed(): void {
  faker.seed();
}

/**
 * Test if Faker.js is working correctly
 * @returns true if Faker.js is functional
 */
export function testGenerators(): boolean {
  try {
    // Test each generator
    for (const dataType of Object.values(DataType)) {
      const value = generateDataForType(dataType);
      if (value === null || value === undefined) {
        // eslint-disable-next-line no-console
        console.error(`Generator for ${dataType} returned null/undefined`);
        return false;
      }
    }
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Generator test failed:', error);
    return false;
  }
}
